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
