// De-para das listas: unifica nomes de fornecedores e clientes escritos de jeitos diferentes
// (ex.: "ELVA SERRUDA OUTUBRO" e "ELVA SERRUDA NOVEMBRO" viram "ELVA SERRUDA").
// gerarDePara() cria (ou refaz) uma planilha separada no Drive, para o financeiro revisar sem mexer na base do app.
// Rode pelo editor do Apps Script (Executar). O link sai no registro de execução.
var MESES_DP = ['JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
var CAB_DP = ['Lista', 'Categoria', 'Nome atual', 'Subcategorias', 'Contas a pagar', 'Lançamentos DRE', 'Valor total', 'Último uso', 'Sugestão', 'Nome correto', 'Observação'];

var DePara = {
  semAcento: function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase(); },
  // Tira do nome o que muda a cada lançamento: mês, NF, referência, parcela, datas soltas.
  limpar: function (nome) {
    var s = String(nome || '').toUpperCase().replace(/\s+/g, ' ').trim();
    var t = s;
    t = t.replace(/\b(NF|NFE|NOTA)\.?\s*(N[ºO°]\.?\s*)?[\d\/.-]+/g, ' ');
    t = t.replace(/\b(REF|REFERENTE|PARC|PARCELA)\.?\s*[\w]*\s*\d+\s*\/\s*\d+/g, ' ');
    t = t.replace(/\b\d{1,2}\s*\/\s*\d{2,4}\b/g, ' ');
    // mês solto sai; mês depois de número fica (ex.: "23 MAIO" é nome de rua)
    var ws = t.split(' ').filter(function (w) { return w; });
    var palavras = ws.filter(function (w, i) {
      var x = DePara.semAcento(w).replace(/[^A-Z0-9]/g, '');
      return MESES_DP.indexOf(x) < 0 || (i > 0 && /^\d+$/.test(ws[i - 1]));
    });
    t = palavras.join(' ').replace(/[\s\-–·\/.,]+$/, '').replace(/^[\s\-–·\/.,]+/, '').replace(/\s+/g, ' ').trim();
    return t || s;
  },
  // Junta tudo que o app usa: contas, despesas e fornecedores (por categoria) e clientes das entradas.
  levantar: function () {
    var mapa = {};
    function add(lista, cat, nome, sub, tipo, valor, data) {
      nome = String(nome || '').trim();
      if (!nome) return;
      var k = lista + '|' + cat + '|' + nome;
      var r = mapa[k] || (mapa[k] = { lista: lista, cat: cat, nome: nome, subs: {}, contas: 0, dre: 0, valor: 0, ultimo: '' });
      if (sub) r.subs[sub] = true;
      if (tipo === 'conta') r.contas++;
      if (tipo === 'dre') r.dre++;
      r.valor += +valor || 0;
      if (data && String(data) > r.ultimo) r.ultimo = String(data).slice(0, 10);
    }
    Db.todos('Contas').forEach(function (c) { if (!c.dreId) add('Fornecedores', c.cat || '', c.forn, c.sub, 'conta', c.valor, c.data); });
    Db.todos('Despesas').forEach(function (d) { add('Fornecedores', d.cat || '', d.forn, d.sub, 'dre', d.valor, d.data); });
    Db.todos('Fornecedores').forEach(function (f) { add('Fornecedores', f.cat || '', f.nome, f.sub, '', 0, ''); });
    Db.todos('Entradas').forEach(function (e) { add('Clientes', e.cat || '', e.cli, '', 'dre', e.valor, e.data); });
    var linhas = Object.keys(mapa).map(function (k) { return mapa[k]; });
    // Sugestão: nome limpo; nomes que ficam iguais (sem acento) na mesma categoria usam a grafia mais usada.
    var grupos = {};
    linhas.forEach(function (r) {
      r.sug = DePara.limpar(r.nome);
      var g = r.lista + '|' + r.cat + '|' + DePara.semAcento(r.sug).replace(/[^A-Z0-9]/g, '');
      (grupos[g] = grupos[g] || []).push(r);
    });
    Object.keys(grupos).forEach(function (g) {
      var rs = grupos[g], uso = {};
      rs.forEach(function (r) { uso[r.sug] = (uso[r.sug] || 0) + r.contas + r.dre + 1; });
      var melhor = Object.keys(uso).sort(function (a, b) { return uso[b] - uso[a] || a.length - b.length; })[0];
      rs.forEach(function (r) { r.sug = melhor; });
    });
    linhas.sort(function (a, b) {
      return a.lista.localeCompare(b.lista) || a.cat.localeCompare(b.cat) || a.sug.localeCompare(b.sug) || a.nome.localeCompare(b.nome);
    });
    return linhas;
  }
};

function gerarDePara() {
  var linhas = DePara.levantar();
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('DEPARA_ID'), ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) { ss = SpreadsheetApp.create('De-para das listas · MRBL Financeiro'); props.setProperty('DEPARA_ID', ss.getId()); }
  var sh = ss.getSheets()[0];
  sh.setName('De-para');
  sh.clear();
  var dados = [CAB_DP].concat(linhas.map(function (r) {
    return [r.lista, r.cat || '(sem categoria)', r.nome, Object.keys(r.subs).sort().join(' · '), r.contas, r.dre, Math.round(r.valor * 100) / 100, r.ultimo, r.sug, r.sug, ''];
  }));
  sh.getRange(1, 1, dados.length, CAB_DP.length).setValues(dados);
  sh.getRange(1, 1, 1, CAB_DP.length).setFontWeight('bold').setBackground('#1f2a5a').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  if (dados.length > 1) {
    sh.getRange(2, 7, dados.length - 1, 1).setNumberFormat('#,##0.00');
    sh.getRange(2, 10, dados.length - 1, 1).setBackground('#fff8dc');
    // destaca as linhas em que o nome vai mudar
    linhas.forEach(function (r, i) { if (r.sug !== r.nome) sh.getRange(i + 2, 3, 1, 1).setBackground('#fde2e2'); });
  }
  var guia = ss.getSheetByName('Como preencher') || ss.insertSheet('Como preencher');
  guia.clear();
  guia.getRange(1, 1, 7, 1).setValues([
    ['Como preencher o de-para'],
    ['1. Cada linha é um nome que aparece hoje no sistema (contas a pagar, lançamentos da DRE, lista de fornecedores e clientes das entradas).'],
    ['2. A coluna "Nome correto" já vem com a sugestão. O que estiver nela é o que vale: ajuste quando a sugestão não estiver certa.'],
    ['3. Para juntar nomes, escreva exatamente o mesmo "Nome correto" nas linhas que são a mesma oficina/fornecedor (ex.: ELVA SERRUDA).'],
    ['4. Linhas com o nome em vermelho são as que vão mudar. Se não quiser mudar, deixe o "Nome correto" igual ao "Nome atual".'],
    ['5. Não apague linhas nem mude as colunas Lista, Categoria e Nome atual: são elas que ligam ao sistema.'],
    ['6. Quando terminar, avise: o sistema corrige o passado e passa a usar só os nomes corretos daqui para frente.']
  ]);
  guia.getRange(1, 1).setFontWeight('bold');
  var muda = linhas.filter(function (r) { return r.sug !== r.nome; }).length;
  var url = ss.getUrl();
  Logger.log(linhas.length + ' nomes levantados; ' + muda + ' com sugestão de mudança.');
  Logger.log('Planilha de de-para: ' + url);
  return { linhas: linhas.length, muda: muda, url: url };
}
