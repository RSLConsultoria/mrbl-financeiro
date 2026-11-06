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
  function paraCelula_(v, col) {
    if (v === null || v === undefined) return '';
    if (COLUNAS_JSON.indexOf(col) >= 0) return typeof v === 'string' ? v : JSON.stringify(v);
    return v;
  }
  function obj_(cols, linha) {
    var o = {};
    cols.forEach(function (c, i) {
      var v = deCelula_(linha[i]);
      if (v !== null && COLUNAS_JSON.indexOf(c) >= 0 && typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { /* deixa como texto */ } }
      o[c] = v;
    });
    return o;
  }
  function linha_(cols, o) { return cols.map(function (c) { return paraCelula_(o[c], c); }); }

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
  // A planilha não deixa escrever além do número de linhas da aba: cria as que faltam.
  function garantirLinhas_(sh, ultima) {
    var max = sh.getMaxRows();
    if (ultima > max) sh.insertRowsAfter(max, ultima - max + 100);
  }
  // Grava várias mudanças numa aba de uma vez: lê a aba uma vez só e escreve em bloco.
  // ups: objetos completos (insere ou substitui pela chave). dels: chaves a apagar.
  function gravarLote(nome, ups, dels) {
    var k = chaveDe_(nome), cols = SCHEMA[nome], sh = aba_(nome), n = sh.getLastRow();
    var linhas = n < 2 ? [] : sh.getRange(2, 1, n - 1, cols.length).getValues();
    var ki = cols.indexOf(k), pos = {};
    linhas.forEach(function (l, i) { pos[String(l[ki])] = i; });
    var novos = [], mudou = {};
    (ups || []).forEach(function (o) {
      var id = String(o[k]), i = pos[id];
      if (i === undefined) {
        novos.push(linha_(cols, o));
        pos[id] = -1;
        if (diario) diario.push({ aba: nome, id: o[k], antes: null, depois: o });
      } else if (i >= 0) {
        var antes = obj_(cols, linhas[i]);
        linhas[i] = linha_(cols, o);
        mudou[i] = true;
        if (diario) diario.push({ aba: nome, id: o[k], antes: antes, depois: o });
      }
    });
    var idx = Object.keys(mudou).map(Number);
    if (idx.length > 20) { if (linhas.length) sh.getRange(2, 1, linhas.length, cols.length).setValues(linhas); }
    else idx.forEach(function (i) { sh.getRange(i + 2, 1, 1, cols.length).setValues([linhas[i]]); });
    if (novos.length) garantirLinhas_(sh, sh.getLastRow() + novos.length);
    if (novos.length) sh.getRange(sh.getLastRow() + 1, 1, novos.length, cols.length).setValues(novos);
    var apagar = [];
    (dels || []).forEach(function (id) { var i = pos[String(id)]; if (i >= 0) apagar.push(i); });
    apagar.sort(function (a, b) { return b - a; }).forEach(function (i) {
      if (diario) diario.push({ aba: nome, id: linhas[i][ki], antes: obj_(cols, linhas[i]), depois: null });
      sh.deleteRow(i + 2);
    });
    return { inseridos: novos.length, alterados: idx.length, apagados: apagar.length };
  }
  // Troca todo o conteúdo de uma aba (carga inicial). Não entra no diário.
  function substituir(nome, objs) {
    var cols = SCHEMA[nome], sh = aba_(nome), n = sh.getLastRow();
    if (n > 1) sh.getRange(2, 1, n - 1, cols.length).clearContent();
    garantirLinhas_(sh, objs.length + 1);
    if (objs.length) sh.getRange(2, 1, objs.length, cols.length).setValues(objs.map(function (o) { return linha_(cols, o); }));
    return objs.length;
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
  return { todos: todos, pegar: pegar, inserir: inserir, atualizar: atualizar, remover: remover, gravarLote: gravarLote, substituir: substituir, iniciarDiario: iniciarDiario, fecharDiario: fecharDiario, reverter: reverter };
})();
