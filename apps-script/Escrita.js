// Toda escrita passa por aqui: trava a planilha, grava o diário para o Desfazer e registra o log.
// fn devolve { msg, ...resultado }. msg vira a linha do log.
function mutar_(sess, tela, fn) {
  var trava = LockService.getScriptLock();
  trava.waitLock(20000);
  try {
    Db.iniciarDiario();
    var r = fn() || {};
    var diario = Db.fecharDiario();
    if (r.msg) Logs.registrar(sess.usuario, tela, r.msg);
    var desfazer = null;
    if (diario.length) {
      desfazer = Utilities.getUuid();
      try { CacheService.getScriptCache().put('desfazer:' + desfazer, JSON.stringify({ usuario: sess.usuario, msg: r.msg, diario: diario }), 600); }
      catch (e) { desfazer = null; } // mudança grande demais para guardar o Desfazer no cache
    }
    r.desfazer = desfazer;
    return r;
  } catch (err) {
    Db.reverter(Db.fecharDiario());
    throw err;
  } finally {
    trava.releaseLock();
  }
}

// ---- ações de escrita e consulta de logs ----
acao_('logs.listar', function (d) { return Logs.listar(d); });

acao_('config.definir', function (d, s) {
  return mutar_(s, 'cfg', function () {
    var atual = Db.pegar('Config', d.chave);
    if (atual) Db.atualizar('Config', d.chave, { valor: d.valor }); else Db.inserir('Config', { chave: d.chave, valor: d.valor });
    return { msg: 'Configuração ' + d.chave + ' alterada para ' + d.valor };
  });
});

acao_('acao.desfazer', function (d, s) {
  var c = CacheService.getScriptCache(), k = 'desfazer:' + d.id, raw = c.get(k);
  if (!raw) throw Auth.erro('desfazer_expirado', 'Não dá mais para desfazer essa ação (passou de 10 minutos).');
  var reg = JSON.parse(raw);
  if (reg.usuario !== s.usuario) throw Auth.erro('desfazer_outro', 'Só quem fez a ação pode desfazer.');
  var trava = LockService.getScriptLock();
  trava.waitLock(20000);
  try { Db.reverter(reg.diario); c.remove(k); Logs.registrar(s.usuario, 'desfazer', 'Desfez: ' + reg.msg); }
  finally { trava.releaseLock(); }
  return { msg: 'Desfeito: ' + reg.msg };
});
