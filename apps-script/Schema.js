// Abas da planilha "Financeiro MRBL" e suas colunas. A ordem aqui é a ordem das abas; Logs fica sempre por último.
// Colunas "extra" guardam, em JSON, campos do app que não têm coluna própria.
var SCHEMA = {
  Usuarios: ['nome', 'convite', 'salt', 'hash', 'ativo', 'criadoEm'],
  Sessoes: ['token', 'usuario', 'expira'],
  Contas: ['id', 'data', 'orig', 'forn', 'cat', 'sub', 'valor', 'estim', 'pago', 'pagoEm', 'dreId', 'dreSkip', 'entrega', 'recebidoEm', 'payManual', 'hist', 'histEnt', 'log', 'extra', 'criadoEm', 'criadoPor'],
  Despesas: ['id', 'data', 'cat', 'sub', 'emp', 'valor', 'forn', 'resp', 'obs', 'contaId', 'extra', 'criadoEm'],
  Entradas: ['id', 'data', 'cat', 'cli', 'nf', 'valor', 'resp', 'obs', 'extra', 'criadoEm'],
  DreHistorico: ['mes', 'tipo', 'cat', 'sub', 'valor'],
  Previsoes: ['id', 'mes', 'nome', 'cat', 'subs', 'valor'],
  Fornecedores: ['id', 'nome', 'cat', 'sub'],
  Parcelamentos: ['id', 'nome', 'emp', 'cat', 'sub', 'valorParcela', 'qtd', 'valorTotal', 'pagasAntes', 'log', 'extra', 'criadoEm'],
  Cheques: ['id', 'data', 'numero', 'desc', 'cat', 'sub', 'valor', 'aPagar', 'grupo', 'contaId', 'log', 'extra', 'criadoEm'],
  Clientes: ['nome'],
  Config: ['chave', 'valor'],
  Logs: ['em', 'por', 'tela', 'txt']
};

// Abas de versões anteriores do esquema. São apagadas pelo setupPlanilha só se estiverem vazias.
var ABAS_OBSOLETAS = ['ContasHist', 'PrevRevisao', 'Listas', 'Página1', 'Sheet1'];

// Coluna-chave de cada aba (null = aba sem chave, só leitura em bloco).
var CHAVES = { Usuarios: 'nome', Sessoes: 'token', Clientes: 'nome', Config: 'chave', DreHistorico: null, Logs: null };
function chaveDe_(aba) { return Object.prototype.hasOwnProperty.call(CHAVES, aba) ? CHAVES[aba] : 'id'; }

// Colunas guardadas como texto (datas aaaa-mm-dd e ids), para a planilha não converter.
var COLUNAS_TEXTO = ['id', 'data', 'orig', 'pagoEm', 'dreId', 'entrega', 'recebidoEm', 'criadoEm', 'contaId', 'em', 'mes', 'token', 'nf', 'convite', 'forn', 'nome', 'cli', 'obs', 'chave', 'numero'];
// Colunas com listas ou objetos, guardadas como JSON.
var COLUNAS_JSON = ['hist', 'histEnt', 'log', 'subs', 'extra'];

// Cria as abas que faltam com o cabeçalho, sem apagar dado nenhum. Rode pelo editor do Apps Script.
function setupPlanilha() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(SCHEMA).forEach(function (aba) {
    var cols = SCHEMA[aba];
    var sh = ss.getSheetByName(aba) || ss.insertSheet(aba);
    if (sh.getLastRow() === 0) sh.appendRow(cols);
    var largura = Math.max(cols.length, sh.getLastColumn());
    var atual = sh.getRange(1, 1, 1, largura).getValues()[0].filter(function (x) { return x !== ''; });
    if (atual.join('|') !== cols.join('|')) {
      // Sem dados ainda: troca o cabeçalho. Com dados: não mexe e avisa.
      if (sh.getLastRow() > 1) throw new Error('Cabeçalho diferente na aba ' + aba + ': ' + atual.join(', '));
      sh.getRange(1, 1, 1, largura).clearContent();
      sh.getRange(1, 1, 1, cols.length).setValues([cols]);
    }
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    cols.forEach(function (c, i) { if (COLUNAS_TEXTO.indexOf(c) >= 0 || COLUNAS_JSON.indexOf(c) >= 0) sh.getRange(1, i + 1, sh.getMaxRows(), 1).setNumberFormat('@'); });
  });
  ABAS_OBSOLETAS.forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (sh && sh.getLastRow() <= 1 && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });
  var logs = ss.getSheetByName('Logs');
  ss.setActiveSheet(logs);
  ss.moveActiveSheet(ss.getSheets().length);
  if (!Db.pegar('Config', 'prazoOficinas')) Db.inserir('Config', { chave: 'prazoOficinas', valor: 15 });
}
