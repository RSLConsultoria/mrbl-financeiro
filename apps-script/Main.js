// Porta de entrada do Web App. O navegador manda POST text/plain com { acao, token, dados }.
var ACOES = {};
function acao_(nome, fn, publica) { ACOES[nome] = { fn: fn, publica: !!publica }; }

function doGet() { return json_({ ok: true, app: 'mrbl-financeiro' }); }

function doPost(e) {
  var res;
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var a = ACOES[req.acao];
    if (!a) throw Auth.erro('acao_desconhecida', 'Ação desconhecida: ' + req.acao);
    var sess = null;
    if (!a.publica) {
      sess = Auth.sessao(req.token);
      if (!sess) throw Auth.erro('sessao_expirada', 'Sua sessão expirou. Entre de novo.');
    }
    res = { ok: true, dados: a.fn(req.dados || {}, sess) };
  } catch (err) {
    res = { ok: false, codigo: err.codigo || 'erro', erro: err.codigo ? err.message : 'Erro no servidor: ' + err.message };
  }
  return json_(res);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ---- ações públicas (sem sessão) ----
acao_('auth.usuarios', function () { return Auth.usuarios(); }, true);
acao_('auth.entrar', function (d) { return Auth.entrar(d); }, true);
acao_('auth.criarSenha', function (d) { return Auth.criarSenha(d); }, true);

// ---- ações com sessão ----
acao_('auth.sair', function (d, s) { Auth.sair(s.token); return true; });
// dados.carregar e as demais ações das telas ficam em Sync.js.
