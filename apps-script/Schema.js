// Abas da planilha "Financeiro MRBL" e suas colunas. A ordem aqui é a ordem das abas; Logs fica sempre por último.
var SCHEMA = {
  Usuarios: ['nome', 'convite', 'salt', 'hash', 'ativo', 'criadoEm'],
  Sessoes: ['token', 'usuario', 'expira'],
  Contas: ['id', 'data', 'orig', 'forn', 'cat', 'sub', 'valor', 'estim', 'pago', 'pagoEm', 'dreId', 'dreSkip', 'entrega', 'recebidoEm', 'payManual', 'criadoEm', 'criadoPor'],
  ContasHist: ['id', 'contaId', 'em', 'por', 'tipo', 'de', 'para', 'txt'],
  Despesas: ['id', 'data', 'cat', 'sub', 'emp', 'valor', 'forn', 'resp', 'obs', 'contaId', 'criadoEm'],
  Entradas: ['id', 'data', 'cat', 'cli', 'nf', 'valor', 'resp', 'obs', 'criadoEm'],
  DreHistorico: ['mes', 'tipo', 'cat', 'sub', 'valor'],
  Previsoes: ['id', 'mes', 'nome', 'cat', 'subs', 'valor'],
  PrevRevisao: ['mes', 'chave', 'decisao', 'em', 'por'],
  Fornecedores: ['id', 'nome', 'cat', 'sub'],
  Listas: ['tipo', 'cat', 'sub'],
  Clientes: ['nome'],
  Config: ['chave', 'valor'],
  Logs: ['em', 'por', 'tela', 'txt']
};

// Coluna-chave de cada aba (null = aba sem chave, só leitura em bloco).
var CHAVES = { Usuarios: 'nome', Sessoes: 'token', Clientes: 'nome', Config: 'chave', DreHistorico: null, PrevRevisao: null, Listas: null, Logs: null };
function chaveDe_(aba) { return Object.prototype.hasOwnProperty.call(CHAVES, aba) ? CHAVES[aba] : 'id'; }

// Colunas guardadas como texto (datas aaaa-mm-dd e ids), para a planilha não converter.
var COLUNAS_TEXTO = ['id', 'data', 'orig', 'pagoEm', 'dreId', 'entrega', 'recebidoEm', 'criadoEm', 'contaId', 'em', 'mes', 'token', 'nf', 'de', 'para'];

// Cria as abas que faltam com o cabeçalho, sem apagar nada. Rode uma vez pelo editor do Apps Script.
function setupPlanilha() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(SCHEMA).forEach(function (aba) {
    var cols = SCHEMA[aba];
    var sh = ss.getSheetByName(aba) || ss.insertSheet(aba);
    if (sh.getLastRow() === 0) sh.appendRow(cols);
    var atual = sh.getRange(1, 1, 1, cols.length).getValues()[0];
    if (atual.join('|') !== cols.join('|')) throw new Error('Cabeçalho diferente na aba ' + aba + ': ' + atual.join(', '));
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    cols.forEach(function (c, i) { if (COLUNAS_TEXTO.indexOf(c) >= 0) sh.getRange(1, i + 1, sh.getMaxRows(), 1).setNumberFormat('@'); });
  });
  var logs = ss.getSheetByName('Logs');
  ss.setActiveSheet(logs);
  ss.moveActiveSheet(ss.getSheets().length);
  if (!Db.pegar('Config', 'prazoOficinas')) Db.inserir('Config', { chave: 'prazoOficinas', valor: 15 });
}
