// Leitura e escrita das abas como listas de objetos. Guarda um diário das mudanças para o "Desfazer".
var Db = (function () {
  var diario = null;
  function aba_(nome) {
    var sh = SpreadsheetApp.getActive().getSheetByName(nome);
    if (!sh) throw new Error('Aba não existe: ' + nome + '. Rode setupPlanilha().');
    return sh;
  }
  // Célula vazia vira null; data que a planilha converteu por conta própria volta a ser texto aaaa-mm-dd.
  function deCelula_(v) {
    if (v === '') return null;
    if (Object.prototype.toString.call(v) === '[object Date]') return Utilities.formatDate(v, 'America/Sao_Paulo', 'yyyy-MM-dd');
    return v;
  }
  function paraCelula_(v) { return v === null || v === undefined ? '' : v; }
  function obj_(cols, linha) { var o = {}; cols.forEach(function (c, i) { o[c] = deCelula_(linha[i]); }); return o; }
  function linha_(cols, o) { return cols.map(function (c) { return paraCelula_(o[c]); }); }

  function todos(nome) {
    var sh = aba_(nome), n = sh.getLastRow(), cols = SCHEMA[nome];
    if (n < 2) return [];
    return sh.getRange(2, 1, n - 1, cols.length).getValues().map(function (r) { return obj_(cols, r); });
  }
  function linhaDe_(nome, id) {
    var k = chaveDe_(nome);
    if (!k) throw new Error('A aba ' + nome + ' não tem chave.');
    var sh = aba_(nome), n = sh.getLastRow();
    if (n < 2) return -1;
    var col = SCHEMA[nome].indexOf(k) + 1;
    var vals = sh.getRange(2, col, n - 1, 1).getValues();
    for (var i = 0; i < vals.length; i++) if (String(vals[i][0]) === String(id)) return i + 2;
    return -1;
  }
  function pegar(nome, id) {
    var r = linhaDe_(nome, id);
    if (r < 0) return null;
    var cols = SCHEMA[nome];
    return obj_(cols, aba_(nome).getRange(r, 1, 1, cols.length).getValues()[0]);
  }
  function inserir(nome, o) {
    aba_(nome).appendRow(linha_(SCHEMA[nome], o));
    var k = chaveDe_(nome);
    if (diario && k) diario.push({ aba: nome, id: o[k], antes: null, depois: o });
    return o;
  }
  function atualizar(nome, id, patch) {
    var r = linhaDe_(nome, id);
    if (r < 0) throw new Error('Registro não encontrado: ' + nome + ' ' + id);
    var cols = SCHEMA[nome], rg = aba_(nome).getRange(r, 1, 1, cols.length);
    var antes = obj_(cols, rg.getValues()[0]);
    var depois = Object.assign({}, antes, patch);
    rg.setValues([linha_(cols, depois)]);
    if (diario) diario.push({ aba: nome, id: id, antes: antes, depois: depois });
    return depois;
  }
  function remover(nome, id) {
    var r = linhaDe_(nome, id);
    if (r < 0) return null;
    var antes = pegar(nome, id);
    aba_(nome).deleteRow(r);
    if (diario) diario.push({ aba: nome, id: id, antes: antes, depois: null });
    return antes;
  }
  function iniciarDiario() { diario = []; }
  function fecharDiario() { var d = diario || []; diario = null; return d; }
  // Desfaz um diário na ordem inversa.
  function reverter(d) {
    for (var i = d.length - 1; i >= 0; i--) {
      var e = d[i];
      if (e.antes === null) remover(e.aba, e.id);
      else if (e.depois === null) inserir(e.aba, e.antes);
      else atualizar(e.aba, e.id, e.antes);
    }
  }
  return { todos: todos, pegar: pegar, inserir: inserir, atualizar: atualizar, remover: remover, iniciarDiario: iniciarDiario, fecharDiario: fecharDiario, reverter: reverter };
})();
