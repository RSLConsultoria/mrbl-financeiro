// Carga inicial. Os dados reais nunca entram neste repositório (que é público): eles vão para um arquivo
// temporário no editor do Apps Script que define a variável CARGA, rodamos rodarCarga() e o arquivo é apagado.
var Carga = {
  importar: function (c, por) {
    var r = {};
    Object.keys(ABAS_APP).forEach(function (aba) {
      var lista = c[ABAS_APP[aba]];
      if (!lista) return;
      r[aba] = Db.substituir(aba, lista.map(function (o) {
        var l = Sync.paraLinha(aba, o);
        if (SCHEMA[aba].indexOf('criadoEm') >= 0) l.criadoEm = 'carga inicial';
        return l;
      }));
    });
    if (c.dreHistorico) r.DreHistorico = Db.substituir('DreHistorico', c.dreHistorico);
    if (c.config) Object.keys(c.config).forEach(function (k) {
      var v = c.config[k];
      Db.gravarLote('Config', [{ chave: k, valor: v !== null && typeof v === 'object' ? JSON.stringify(v) : v }], []);
    });
    Logs.registrar(por || 'sistema', 'carga', 'Carga inicial: ' + Object.keys(r).map(function (k) { return k + ' ' + r[k]; }).join(', '));
    return r;
  }
};

function rodarCarga() {
  if (typeof CARGA === 'undefined') throw new Error('Crie o arquivo temporário com a variável CARGA antes de rodar.');
  var trava = LockService.getScriptLock();
  trava.waitLock(30000);
  try { Logger.log(JSON.stringify(Carga.importar(CARGA, 'Claude (carga)'))); }
  finally { trava.releaseLock(); }
}

// Importação pelo app: só administrador, e só com a planilha vazia (a não ser que confirme substituir).
acao_('carga.importar', function (d, s) {
  Usuarios.exigirAdmin_(s);
  var c = d.carga || {};
  if (!c.contas && !c.saidas && !c.entradas) throw Auth.erro('carga_vazia', 'O arquivo não tem contas, despesas nem entradas.');
  var temDados = ['Contas', 'Despesas', 'Entradas'].some(function (a) { return SpreadsheetApp.getActive().getSheetByName(a).getLastRow() > 1; });
  if (temDados && !d.substituir) throw Auth.erro('planilha_com_dados', 'A planilha já tem dados. A carga inicial só entra com ela vazia.');
  var trava = LockService.getScriptLock();
  trava.waitLock(30000);
  try { return Carga.importar(c, s.usuario); }
  finally { trava.releaseLock(); }
});

// Apaga todos os dados do app para uma nova carga. Mantém usuários, sessões e configurações.
// Só pelo editor do Apps Script (Executar), nunca pelo app.
var ABAS_DADOS = ['Contas', 'Despesas', 'Entradas', 'DreHistorico', 'Previsoes', 'Fornecedores', 'Clientes', 'Parcelamentos', 'Cheques', 'Logs'];
function apagarDados() {
  var ss = SpreadsheetApp.getActive(), trava = LockService.getScriptLock();
  trava.waitLock(30000);
  try {
    ABAS_DADOS.forEach(function (aba) {
      var sh = ss.getSheetByName(aba), n = sh ? sh.getLastRow() : 0;
      if (n > 1) sh.deleteRows(2, n - 1);
      Logger.log(aba + ': ' + Math.max(0, n - 1) + ' linha(s) apagada(s)');
    });
  } finally { trava.releaseLock(); }
}
