// Atualização automática do servidor, sem clasp e sem token que expira.
// O GitHub (workflow Publicar) chama a ação deploy.publicar com a senha de publicação e o commit.
// O Apps Script baixa os arquivos desse commit do repositório (que é público), troca o próprio código,
// cria uma versão e aponta a implantação do Web App para ela. A URL do Web App não muda.
var REPO_RAW = 'https://raw.githubusercontent.com/RSLConsultoria/mrbl-financeiro/';
var API_SCRIPT = 'https://script.googleapis.com/v1/projects/';

var Deploy = {
  baixar_: function (sha, caminho) {
    var r = UrlFetchApp.fetch(REPO_RAW + sha + '/' + caminho, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) throw Auth.erro('deploy_arquivo', 'Não consegui baixar ' + caminho + ' do commit ' + sha.slice(0, 7) + ' (HTTP ' + r.getResponseCode() + ').');
    return r.getContentText();
  },
  api_: function (metodo, caminho, corpo) {
    var r = UrlFetchApp.fetch(API_SCRIPT + ScriptApp.getScriptId() + caminho, {
      method: metodo, contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      payload: corpo ? JSON.stringify(corpo) : undefined
    });
    var txt = r.getContentText();
    if (r.getResponseCode() >= 300) throw Auth.erro('deploy_api', 'Apps Script API respondeu ' + r.getResponseCode() + ' em ' + caminho + ': ' + txt.slice(0, 300));
    return txt ? JSON.parse(txt) : {};
  },
  // Compara a senha sem parar no primeiro caractere diferente.
  senhaOk_: function (s) {
    var certa = PropertiesService.getScriptProperties().getProperty('DEPLOY_SENHA');
    if (!certa || certa.length < 20 || typeof s !== 'string' || s.length !== certa.length) return false;
    var dif = 0;
    for (var i = 0; i < certa.length; i++) dif |= certa.charCodeAt(i) ^ s.charCodeAt(i);
    return dif === 0;
  },
  publicar: function (d) {
    if (!Deploy.senhaOk_(d.senha)) throw Auth.erro('sem_permissao', 'Senha de publicação inválida.');
    var sha = String(d.sha || '');
    if (!/^[0-9a-f]{40}$/.test(sha)) throw Auth.erro('deploy_sha', 'Commit inválido.');
    var implantacao = PropertiesService.getScriptProperties().getProperty('DEPLOY_ID');
    if (!implantacao) throw Auth.erro('deploy_id', 'Falta a propriedade DEPLOY_ID (ID da implantação do Web App).');
    var ordem = JSON.parse(Deploy.baixar_(sha, '.clasp.json')).filePushOrder;
    var files = ordem.map(function (p) {
      return { name: p.replace(/^apps-script\//, '').replace(/\.js$/, ''), type: 'SERVER_JS', source: Deploy.baixar_(sha, p) };
    });
    files.push({ name: 'appsscript', type: 'JSON', source: Deploy.baixar_(sha, 'apps-script/appsscript.json') });
    var trava = LockService.getScriptLock();
    trava.waitLock(30000);
    try {
      Deploy.api_('put', '/content', { files: files });
      var v = Deploy.api_('post', '/versions', { description: sha.slice(0, 7) });
      Deploy.api_('put', '/deployments/' + implantacao, { deploymentConfig: { scriptId: ScriptApp.getScriptId(), versionNumber: v.versionNumber, manifestFileName: 'appsscript', description: sha.slice(0, 7) } });
      Logs.registrar('GitHub', 'deploy', 'Servidor atualizado para o commit ' + sha.slice(0, 7) + ' (versão ' + v.versionNumber + ')');
      return { versao: v.versionNumber, arquivos: files.length };
    } finally { trava.releaseLock(); }
  }
};
acao_('deploy.publicar', function (d) { return Deploy.publicar(d); }, true);

// Rode pelo editor (Executar) para autorizar as permissões novas (baixar do GitHub e atualizar o próprio projeto).
// O registro de execução mostra as permissões que o Google concedeu e se a Apps Script API respondeu.
function autorizarPublicacao() {
  UrlFetchApp.fetch(REPO_RAW + 'main/README.md', { muteHttpExceptions: true });
  var tok = ScriptApp.getOAuthToken();
  var info = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?access_token=' + tok, { muteHttpExceptions: true }).getContentText();
  var escopos = (JSON.parse(info).scope || '').split(' ').filter(function (x) { return /script|spreadsheets/.test(x); });
  var api = UrlFetchApp.fetch(API_SCRIPT + ScriptApp.getScriptId() + '/deployments', { headers: { Authorization: 'Bearer ' + tok }, muteHttpExceptions: true });
  Logger.log('Permissões: ' + escopos.join(', '));
  Logger.log('Apps Script API: HTTP ' + api.getResponseCode() + (api.getResponseCode() === 200 ? ' (ok)' : ' ' + api.getContentText().slice(0, 300)));
}
