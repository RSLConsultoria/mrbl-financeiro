// Telas do app, portadas do protótipo aprovado (artefato "MRBL A Pagar", versão 57; cópia em reference/mock.html).
// O estado vem do servidor (dados.carregar) e cada ação grava na planilha só o que mudou (ver sync.js).
/* eslint-disable */
const LISTAS = {"DESPESAS COM FUNCIONARIOS": ["SALARIOS", "SALARIOS PJ", "PLANO DE SAUDE", "CONVENIOS FARMACIA / LOJA", "PREMIO", "REEMBOLSO", "RESCISÃO", "ACORDO TRABALHISTA", "UNIFORME/SAPATOS/EPI", "FERIAS", "VALE ALIMETAÇÃO/ VALE REFEIÇÃO", "SEGURO DE VIDA", "PENSÃO", "EMPRESTIMOS", "HORAS EXTRAS", "VALE TRANSPORTE", "CURSOS/ TREINAMENTOS", "OUTRAS DIVERSAS RH (ALIMENTAÇÃO)", "ATESTADO MEDICO ADMIS / DEMISSIONAL /EXAME MEDICO", "13 SALARIO"], "ENCARGOS SOCIAIS": ["INSS / GPS", "IRRF", "IRRF ( PARCELAMENTO)", "DARF", "GRRF", "SINDICATO / ISS", "FGTS (PARCELAMENTO)", "FGTS"], "DESPESAS COM UTILITARIOS E SERVIÇOS": ["AGUA E ESGOTO", "ENERGIA ELETRICA", "TELEFONE FIXO", "TELEFONE CELULAR", "INTERNET", "OUTROS / DIVERSOS"], "DESPESAS TRIBUTARIAS FEDERAIS": ["PIS", "COFINS", "IRPJ", "CSSLL", "DAS", "IPI", "DAE", "ICMS", "PARCELAMENTO ICMS"], "DESPESAS TRIBUTARIAS MUNICIPAIS": ["IPTU (OUTRAS TAXAS EM GERAL)"], "DESPESAS COM VENDAS E MKT": ["PATROCINIO", "PROPAGANDA/MARKETING", "VEICULOS DE COMUNICAÇÃO", "BONIFICAÇÃO PARA PARCEIROS", "CONSULTAS DE CREDITO (SERASA)", "COMISSOES/GRATIFICAÇÕES", "ASSOCIAÇÕES E SINDICATOS", "OUTRAS"], "DESPESAS ADMINISTRATIVA": ["MATERIAL DE ESCRITORIO", "CARTÃO DE CREDITO", "CORREIO", "MOTOTAXI / ENTREGAS RAPIDAS", "CONSULTORIA/ADVOGADOS", "CONTABILIDADE", "CAIXA INTERNO", "COMPRA EQUIPAMENTOS / MOVÉIS E UTENSÍLIOS", "MANUTENÇÃO DE MÁQUINAS", "MATERIAL USO CONSUMO", "MATERIAL DE EMBALAGENS", "INFORMATICA/SISTEMA", "RECRUTAMENTO ( PUPLICAÇÃO VAGA EMPREGO)", "DESPESA DE VIAGEM / HOSPEDAGEM / CONDOMINIO", "SEM PARAR", "SEGURO EMPRESA", "TAXAS DIVERSAS (CARTORIO)", "ALARME MONITORADO/SEGURANÇA", "LIMPEZA EM GERAL", "TAXAS DIVERSAS"], "ACESSORIAS": ["ACESSORIAS EM GERAL (OF)", "ACESSORIAS EM GERAL (OF) SN", "TERCEIRIZADOS (PJ)", "PASSIVOS DIVERSOS (CO/ST)"], "MANUTENCAO PREDIAL": ["MATERIAIS P/ CONSTRUÇÃO E FERRAMENTAS", "COLETA DE RESIDUOS", "ELEVADOR"], "PREJUIZOS": ["USO E CONSUMO", "PERDAS EM GERAL"], "DESPESAS FINANCEIRAS": ["CAPITALIZAÇÃO E SEGUROS", "TARIFA DIVERSAS + JUROS", "AMORTIZAÇÃO CONTA GARANTIA", "DEVOLUÇÕES DUPLICIDADE TÍTULOS", "ESTORNO", "TAXA DE ANTECIPAÇÃO DE RECEBIVEIS", "PROFINANCE ( EMPRESTIMO)", "TRANSFERENCIA"], "FINANCIAMENTOS": ["FINANCIAMENTO BNDES / PRONAMPE", "CONSÓRCIO / EMPRÉSTIMOS", "VEICULOS E OUTROS"], "PRÓ-LABORE": ["DIRETORIA", "INVESTIMENTOS PESSOAIS"], "AQUISIÇÕES / INVESTIMENTOS": ["COMPRA DE MAQUINAS", "ANIMALE ( EMPRESTIMO SEDA )", "CONSTRUÇÃO EM ANDAMENTO"], "MANUTENÇAO VEICULAR": ["TRIBUTOS (IPVA / LICENCIAMENTO / OUTROS / MULTAS )", "SEGURO CARRO", "COMBUSTÍVEL", "MANUTENÇÃO / PEÇAS DE VEÍCULOS"], "PROVISAO": ["FESTA FINAL DE ANO", "13º SALARIO", "FÉRIAS"], "ALUGUEL": ["ALUGUEL"], "FORNECEDORES (CMV)": ["FORNECEDORES"], "FRETE": ["FRETE"]};
const EMPS = ["MRBL", "STOFFA"];
const ECATS = ["RECEBIMENTO DE CLIENTE", "DEVOLUÇÃO", "RECEBIMENTO MRBL", "RECEBIMENTO STOFFA", "EMPRÉSTIMO PROFINANCE", "ANTECIPAÇÃO"];

export function iniciarTelas({ dados, api, sync, aoSair }) {
  const CLIENTES = (dados.clientes || []).map((c) => c.nome).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
  const RESPS = [dados.usuario];
  const KEY = 'mrbl-apagar-mock-v5';
  const pad = (n) => String(n).padStart(2,'0');
  const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  const parse = (s) => { if (!s) return new Date(NaN); const [y,m,d] = String(s).slice(0,10).split('-').map(Number); return new Date(y, m-1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  // início da semana: sábado (semana de sábado a sexta, como o relatório semanal)
  const monday = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay()+1)%7)); };
  const dm = (s) => { if (!s) return '—'; const d = parse(s); return pad(d.getDate()) + '/' + pad(d.getMonth()+1); };
  const dmy = (s) => { if (!s) return '—'; const d = parse(s); return pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear(); };
  const DIAS = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const money = (n) => 'R$ ' + n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const num = (n) => n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const short = (n) => n >= 1e6 ? (n/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2}) + ' mi' : n >= 1000 ? (n/1000).toLocaleString('pt-BR',{maximumFractionDigits:1}) + ' mil' : num(n);
  const parseVal = (s) => { const t = String(s).replace(/R\$|\s/g,'').replace(/\./g,'').replace(',','.'); const v = parseFloat(t); return isNaN(v) ? NaN : Math.round(v*100)/100; };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const CATS = Object.keys(LISTAS);

  const TODAY = new Date(); TODAY.setHours(0,0,0,0);
  const HOJE = iso(TODAY);

  // ids aleatórios: duas pessoas lançando ao mesmo tempo não colidem
  const novoId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const F = 'DESPESAS COM FUNCIONARIOS', AD = 'DESPESAS ADMINISTRATIVA', AC = 'ACESSORIAS', FO = 'FORNECEDORES (CMV)', FI = 'FINANCIAMENTOS', UT = 'DESPESAS COM UTILITARIOS E SERVIÇOS', EN = 'ENCARGOS SOCIAIS', AQ = 'AQUISIÇÕES / INVESTIMENTOS';
  const OF = 'ACESSORIAS EM GERAL (OF)', OFSN = 'ACESSORIAS EM GERAL (OF) SN';
  const CFG = dados.config || {};
  let S = {
    contas: dados.contas || [], saidas: dados.saidas || [], entradas: dados.entradas || [], previsoes: dados.previsoes || [],
    fornecedores: dados.fornecedores || [], parcelamentos: dados.parcelamentos || [], cheques: dados.cheques || [], prazoOf: CFG.prazoOficinas == null ? 15 : +CFG.prazoOficinas,
    ofFixas: Array.isArray(CFG.oficinasFixas) ? CFG.oficinasFixas : ['RAUL CALDERON'],
    prevReview: CFG.prevRevisao && typeof CFG.prevRevisao === 'object' ? CFG.prevRevisao : {},
    usuarios: (dados.usuarios || []).map((u) => u.nome), senhas: Object.fromEntries((dados.usuarios || []).map((u) => [u.nome, !!u.temSenha])),
    convites: Object.fromEntries((dados.usuarios || []).filter((u) => u.convite).map((u) => [u.nome, u.convite])),
    user: dados.usuario, logs: dados.logs || []
  };
  S.previsoes.forEach((p) => { if (!Array.isArray(p.subs)) p.subs = p.subs ? String(p.subs).split(';').map((x) => x.trim()).filter(Boolean) : []; });
  S.contas.forEach((c) => { if (!c.hist) c.hist = c.orig && c.orig !== c.data ? [{ de: c.orig, para: c.data, em: null }] : []; });
  const OFSUBS = [OF, OFSN];
  // Oficinas com pagamento fixo (ex.: Raul Calderon): não dependem de entrega; a conta fica na data do pagamento.
  const nomeKey = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
  const isFixo = (nome) => (S.ofFixas || []).includes(nomeKey(nome));
  const isOf = (c) => c.cat === AC && OFSUBS.includes(c.sub) && !isFixo(c.forn);
  const payFrom = (d) => { let x = addDays(parse(d), S.prazoOf); const w = x.getDay(); if (w === 6) x = addDays(x, 2); if (w === 0) x = addDays(x, 1); return iso(x); };
  function normalize(){
    if (S.prazoOf == null) S.prazoOf = 15;
    S.contas = (S.contas || []).filter((c) => c && typeof c === 'object');
    S.contas.forEach((c) => {
      if (!c.hist) c.hist = [];
      if (c.forn == null) c.forn = '';
      if (c.cat == null) c.cat = '';
      if (c.sub == null) c.sub = '';
      c.valor = +c.valor || 0;
      if (!c.data) c.data = c.entrega ? payFrom(c.recebidoEm || c.entrega) : HOJE;
      if (isOf(c) && !c.entrega) c.entrega = c.recebidoEm || c.data;
      if (c.pago && !c.pagoEm) c.pagoEm = c.data;
      if (isOf(c) && !c.entrega && !c.payManual) { c.entrega = c.data; c.histEnt = []; if (!c.pago) c.data = payFrom(c.entrega); }
      else if (isOf(c) && !c.pago && !c.payManual && c.data === c.entrega) { c.data = payFrom(c.recebidoEm || c.entrega); }
    });
  }
  try { normalize(); } catch (e) { console.error(e); }
  const ADMIN = !!dados.admin;
  // grava na planilha só o que mudou desde a última gravação
  let msgPendente = null;
  sync.base(S);
  // De-para das listas (Config.depara): nome antigo → nome único. Aplicado a cada gravação, então um nome antigo
  // digitado ou vindo de planilha vira o nome certo antes de chegar na base.
  const DEPARA = CFG.depara && typeof CFG.depara === 'object' ? CFG.depara : {};
  const semAc = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const dpKey = (lista, cat, nome) => lista + '|' + semAc(cat).trim() + '|' + semAc(nome).replace(/\s+/g, ' ').trim();
  function aplicarDePara(){
    if (!Object.keys(DEPARA).length) return;
    const troca = (lista, cat, nome) => { const a = DEPARA[dpKey(lista, cat || '', nome || '')]; return a && a !== nome ? a : null; };
    S.contas.forEach((c) => { if (c.parcId || c.chqId) return; const a = troca('Fornecedores', c.cat, c.forn); if (a) c.forn = a; });
    S.saidas.forEach((d) => { const a = troca('Fornecedores', d.cat, d.forn); if (a) d.forn = a; });
    S.entradas.forEach((e) => { const a = troca('Clientes', e.cat, e.cli); if (a) e.cli = a; });
    const vistos = new Set();
    S.fornecedores = (S.fornecedores || []).filter((f) => { const a = troca('Fornecedores', f.cat, f.nome); if (a) f.nome = a; const k = dpKey(f.cat + '|' + (f.sub || ''), '', f.nome); if (vistos.has(k)) return false; vistos.add(k); return true; });
  }
  const save = () => { aplicarDePara(); const msg = msgPendente; msgPendente = null; sync.salvar(S, msg, view.tela); };
  const logar = (txt, tela) => { S.logs.unshift({ em: agora(), por: S.user, txt, tela }); api.chamar('logs.registrar', { txt, tela }).catch(() => {}); };
    // oficina que passou a ser fixa: a conta volta para a data da entrega (que era a data do pagamento) e sai do controle de entrega
  function converterFixos(){
    let n = 0;
    (S.contas || []).forEach((c) => {
      if (!c || c.cat !== AC || !OFSUBS.includes(c.sub) || !isFixo(c.forn) || !c.entrega) return;
      if (!c.pago && !c.payManual && c.entrega !== c.data) { (c.log = c.log || []).push({ txt: 'Oficina com pagamento fixo: pagamento em ' + dmy(c.entrega) + ', sem controle de entrega', em: (() => { const d = new Date(); return iso(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); })(), por: S.user }); c.data = c.entrega; }
      n++; delete c.entrega; delete c.histEnt; delete c.recebidoEm;
    });
    return n;
  }

  const blankD = () => ({ data: HOJE, cat: '', sub: '', emp: 'MRBL', valor: '', forn: '', resp: RESPS[RESPS.length-1] || '', obs: '', contaId: null });
  const blankE = () => ({ data: HOJE, cat: ECATS[0], cli: '', nf: '', valor: '', resp: RESPS[RESPS.length-1] || '', obs: '' });
  const view = { cfgTab: 'listas', cfgQ: '', pvYear: 0, cfgCat: AC, newSub: '', modal: null, dForm: blankD(), eForm: blankE(), dStatus: '', eStatus: '', drelTab: 'sai', dreProj: false, dreOpen: {}, drelMes: iso(TODAY).slice(0,7), relVis: 'semana', relMes: iso(TODAY).slice(0,7), relVal: 'all', relOpen: {}, prMes: (() => { const d = new Date(TODAY.getFullYear(), TODAY.getMonth()-1, 1); return d.getFullYear() + '-' + pad(d.getMonth()+1); })(), tela: 'pagar', ofWeek: iso(monday(TODAY)), receiving: null, week: iso(monday(TODAY)), addErr: '', paying: null, removing: null, proring: null, histOpen: null, newCat: CATS[0], pCat: AC };
  if (converterFixos()) { msgPendente = 'Oficinas com pagamento fixo: contas ajustadas para a data do pagamento.'; save(); }
  let undoSnap = null, toastTimer = null;
  const snap = () => JSON.stringify(S);
  function toast(msg, canUndo){
    const host = document.getElementById('toastHost');
    host.innerHTML = '<div class="toast" role="status"><span>' + esc(msg) + '</span>' + (canUndo ? '<button type="button" id="undo">Desfazer</button>' : '') + '</div>';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { host.innerHTML = ''; }, 6000);
    const b = document.getElementById('undo');
    if (b) b.onclick = () => { if (undoSnap) { const lg = S.logs && S.logs[0]; S = JSON.parse(undoSnap); undoSnap = null; if (lg) (S.logs = S.logs || []).unshift({ em: agora(), por: S.user, txt: 'Desfez: ' + lg.txt, tela: view.tela }); msgPendente = 'Desfez: ' + (lg ? lg.txt : ''); save(); render(); } host.innerHTML = ''; };
  }
  const act = (msg, fn) => { undoSnap = snap(); fn(); msgPendente = msg; (S.logs = S.logs || []).unshift({ em: agora(), por: S.user, txt: msg, tela: view.tela }); if (S.logs.length > 1000) S.logs.length = 1000; view.paying = null; view.removing = null; view.proring = null; save(); render(); toast(msg, true); };

  // ---------- regras ----------
  const isLate = (c) => !c.pago && c.data < HOJE;
  const isPror = (c) => !!c.orig && c.data > c.orig;
  const isAnt = (c) => !!c.orig && c.data < c.orig;
  const agora = () => { const d = new Date(); return iso(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const quando = (em) => em ? dm(em.slice(0,10)) + (em.length > 10 ? ' ' + em.slice(11,16) : '') : '';
  function logC(c, txt){ (c.log = c.log || []).push({ txt, em: agora(), por: S.user }); }
  const tipoMud = (c, para) => { const o = c.orig || c.data; return para > o ? 'Prorrogada' : para < o ? 'Antecipada' : 'Voltou ao vencimento original'; };
  function pagar(c, d){ const o = origOf(c); c.pago = true; c.pagoEm = d; logC(c, d < o ? 'Paga antecipada em ' + dmy(d) + ' (vencimento original ' + dm(o) + ')' : d > o ? 'Paga depois do vencimento original, em ' + dmy(d) + ' (vencia ' + dm(o) + ')' : 'Paga em ' + dmy(d) + ', no vencimento original'); }
  function despagar(c){ c.pago = false; c.pagoEm = null; logC(c, 'Pagamento desfeito'); }
  function syncOf(c){
    if (!isOf(c) || c.pago || c.payManual) return;
    c.data = payFrom(c.recebidoEm || c.entrega);
  }
  function setDate(c, novo){
    if (!novo || novo === c.data) return;
    if (isOf(c)) c.payManual = true;
    if (!c.hist) c.hist = [];
    const base = c.orig || c.data;
    const tp = tipoMud({ orig: base, data: c.data }, novo);
    c.hist.push({ de: c.data, para: novo, em: agora(), por: S.user });
    logC(c, (tp === 'Voltou ao vencimento original' ? 'Voltou ao vencimento original, ' + dmy(novo) : tp + ' de ' + dm(c.data) + ' para ' + dmy(novo)));
    c.orig = base;
    c.data = novo;
  }
  const histText = (c) => {
    const h = c.hist || [];
    if (!h.length) return 'Vence ' + dmy(c.data) + '. Nenhuma mudança de data.';
    return 'Vencimento original ' + dmy(c.orig || h[0].de) + h.map((x) => ' → ' + dm(x.para) + (x.em ? ' (mudada em ' + dm(x.em) + ')' : '')).join('');
  };
  const nPror = (c) => (c.hist || []).length;
  const weekOf = (s) => iso(monday(parse(s)));
  const weekLabel = (w) => { const a = parse(w), b = addDays(a, 6); return pad(a.getDate()) + '/' + pad(a.getMonth()+1) + ' a ' + pad(b.getDate()) + '/' + pad(b.getMonth()+1); };
  const monthOfWeek = (w) => { const t = addDays(parse(w), 3); return t.getFullYear() + '-' + pad(t.getMonth()+1); };
  const weeksOfMonth = (mk) => { const [y,m] = mk.split('-').map(Number); let w = monday(new Date(y, m-1, 1)); const out = []; for (let i = 0; i < 7; i++) { const wi = iso(w); if (monthOfWeek(wi) === mk) out.push(wi); w = addDays(w, 7); } return out; };
  const inWeek = (c, w) => c.data >= w && c.data < iso(addDays(parse(w), 7));
  const sum = (arr) => arr.reduce((a, c) => a + c.valor, 0);
  const matchPrev = (p, c) => c.cat === p.cat && (!p.subs.length || p.subs.includes(c.sub));
  const prevsOf = (mk) => S.previsoes.filter((p) => p.mes === mk);
  const prevSaldo = (mk) => prevsOf(mk).reduce((a, p) => { const l = sum(S.contas.filter((c) => c.data.slice(0,7) === mk && matchPrev(p, c))); return a + Math.max(0, p.valor - l); }, 0);
  const CUR = HOJE.slice(0,7);
  const mAdd = (mk, n) => { const d = new Date(+mk.slice(0,4), +mk.slice(5,7) - 1 + n, 1); return d.getFullYear() + '-' + pad(d.getMonth()+1); };
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  const mesNome = (mk) => MESES[+mk.slice(5,7) - 1];
  const pKey = (p) => p.cat + '|' + p.subs.slice().sort().join(',');
  const histMonths = () => [...new Set(S.saidas.map((x) => x.data.slice(0,7)))].filter((m) => m < CUR).sort().slice(-12);
  const avgPrev = (p) => { const ms = histMonths(); if (!ms.length) return null; return Math.round(S.saidas.filter((x) => ms.includes(x.data.slice(0,7)) && matchPrev(p, x)).reduce((a, x) => a + x.valor, 0) / ms.length); };
  const reviewRows = () => {
    const by = {};
    S.previsoes.filter((p) => p.mes >= CUR).sort((a,b) => a.mes.localeCompare(b.mes)).forEach((p) => { const k = pKey(p); (by[k] = by[k] || { k, base: p, fut: [] }); if (p.mes > CUR) by[k].fut.push(p); });
    return Object.values(by).map((r) => Object.assign(r, { avg: avgPrev(r.base) })).filter((r) => r.avg != null);
  };
  const closedMk = mAdd(CUR, -1);
  function applyReview(keys, useAvg){
    const rows = reviewRows().filter((r) => keys.includes(r.k));
    const rv = S.prevReview[closedMk] = S.prevReview[closedMk] || {};
    rows.forEach((r) => {
      rv[r.k] = useAvg ? 'media' : 'manter';
      if (!useAvg) return;
      if (r.fut.length) r.fut.forEach((p) => { p.valor = r.avg; });
      else S.previsoes.push({ id: novoId('p'), mes: mAdd(CUR, 1), nome: r.base.nome, cat: r.base.cat, subs: r.base.subs.slice(), valor: r.avg });
    });
  }
  const subOpts = (cat, sel, withAll) => (withAll ? '<option value="">Todas as subcategorias</option>' : (cat ? '' : '<option value="">—</option>')) + (LISTAS[cat] || []).map((s) => '<option' + (s === sel ? ' selected' : '') + '>' + esc(s) + '</option>').join('');
  const fornBase = (nome) => (nome || '').split(' · ')[0].trim();
  const fornExiste = (nome, cat, sub) => { const n = fornBase(nome).toUpperCase(); return !n || !cat || (S.fornecedores || []).some((f) => f.cat === cat && f.nome.toUpperCase() === n && (!f.sub || !sub || f.sub === sub)); };
  // cadastra o fornecedor na lista da categoria quando ele ainda não está lá (chamado dentro do act, então o Desfazer também tira)
  const ensureForn = (nome, cat, sub) => { if (fornExiste(nome, cat, sub)) return false; S.fornecedores = S.fornecedores || []; S.fornecedores.push({ id: novoId('f'), nome: fornBase(nome), cat, sub: sub || '' }); return true; };
  const novoTxt = (nome, cat, sub) => fornExiste(nome, cat, sub) ? '' : ' ' + fornBase(nome) + ' entrou na lista de fornecedores.';
  const fornOpts = (cat, sub) => (S.fornecedores || []).filter((f) => f.cat === cat && (!f.sub || !sub || f.sub === sub)).map((f) => '<option value="' + esc(f.nome) + '">').join('');
  const catOpts = (sel) => '<option value=""' + (sel ? '' : ' selected') + '>Sem categoria</option>' + CATS.map((k) => '<option' + (k === sel ? ' selected' : '') + '>' + esc(k) + '</option>').join('');

  // ---------- render ----------
  // mantém a tela parada: o elemento que você mexeu fica no mesmo lugar depois de redesenhar
  let anchorSel = null;
  const selFor = (el) => {
    if (!el || !el.closest) return null;
    const er = el.closest('[data-eid]'); if (er) return 'tr[data-eid="' + er.dataset.eid + '"]';
    const row = el.closest('[data-id]'); if (row) return (row.classList.contains('venc-row') ? '.venc-row' : 'tr') + '[data-id="' + row.dataset.id + '"]';
    const pid = el.closest('[data-pid]'); if (pid) return '[data-pid="' + pid.dataset.pid + '"]';
    const t = el.closest('[id],[data-wnav],[data-mnav],[data-onav],[data-week],[data-prbar],[data-tela]'); if (!t) return null;
    if (t.id) return '#' + t.id;
    for (const k of ['wnav','mnav','onav','week','prbar','tela']) if (t.dataset[k] != null) return '[data-' + k + '="' + t.dataset[k] + '"]';
    return null;
  };
  ['pointerdown','focusin','keydown'].forEach((ev) => document.addEventListener(ev, (e) => { const k = selFor(e.target); if (k) anchorSel = k; }, true));
  function modalHTML(){
    if (!view.modal) return '';
    if (view.modal === 'pvimp') return pvImpHTML();
    if (view.modal === 'lanc') return lancModalHTML();
    if (view.modal === 'parcnew' || view.modal === 'parcedit') return parcModalHTML();
    if (view.modal === 'chqnew' || view.modal === 'chqedit') return chqModalHTML();
    const fld = (lab, ctl) => '<label class="ff"><span>' + lab + '</span>' + ctl + '</label>';
    if (view.modal === 'ofedit') {
      const c = byId(view.editId); if (!c) { view.modal = null; return ''; }
      const ed = view.oed, st = ofSt(c);
      const ev = [{ t: 'Entrega prevista original · ' + dmy((c.histEnt && c.histEnt.length) ? c.histEnt[0].de : c.entrega), k: 'o' }];
      const kind = (t) => /antecipada/i.test(t) ? 'a' : /adiada/i.test(t) ? 'p' : /^Paga|^Chegou|Lançada/.test(t) ? 'g' : /desfeit|apagada|removido/.test(t) ? 'x' : 'e';
      if (c.log && c.log.length) { c.log.forEach((x) => { if (/^(Criada|Lançada com)/.test(x.txt)) ev[0].sub = x; else ev.push({ t: x.txt, em: x.em, por: x.por, k: kind(x.txt) }); });
        if (c.recebidoEm && !c.log.some((x) => /^Chegou/.test(x.txt))) ev.splice(1, 0, { t: 'Chegou em ' + dmy(c.recebidoEm), k: 'g' });
        if (c.pago && !c.log.some((x) => /^Paga/.test(x.txt))) ev.push({ t: 'Paga em ' + dmy(c.pagoEm || c.data), k: 'g' }); }
      else {
        (c.histEnt || []).forEach((x) => ev.push({ t: (x.para > ev[0].t ? '' : '') + 'Entrega mudou de ' + dm(x.de) + ' para ' + dmy(x.para), em: x.em, por: x.por, k: 'p' }));
        if (c.recebidoEm) ev.push({ t: 'Chegou em ' + dmy(c.recebidoEm), k: 'g' });
        if (c.pago) ev.push({ t: 'Paga em ' + dmy(c.pagoEm || c.data), k: 'g' });
      }
      if (!c.pago) ev.push({ t: 'Pagamento previsto · ' + dmy(c.data) + (c.recebidoEm ? '' : ' (se chegar na data)'), k: 'f' });
      const tl = '<ol class="tl">' + ev.map((x, i) => '<li class="' + (/^Obs: /.test(x.t) ? 'n' : x.k) + (i === ev.length - 1 ? ' last' : '') + '">' + (/^Obs: /.test(x.t) ? '<span class="tln">' + esc(x.t.slice(5)) + '</span>' : '<b>' + esc(x.t) + '</b>') + (x.sub ? '<small>lançada em ' + quando(x.sub.em) + (x.sub.por ? ' por <span class="who">' + esc(x.sub.por) + '</span>' : '') + '</small>' : '') + (x.em ? '<small>' + quando(x.em) + (x.por ? ' por <span class="who">' + esc(x.por) + '</span>' : '') + '</small>' : '') + '</li>').join('') + '</ol>';
      const chip = ofChip(c).replace(/<small[^>]*>.*?<\/small>/, '');
      const big = st === 'pago' ? '<p class="enote" style="color:var(--muted);margin:0">Já foi paga em ' + dm(c.pagoEm || c.data) + '. Para desfazer, use Contas a pagar.</p>' : st === 'chegou' ? '<button type="button" class="btn big" id="oeUnrec">Desfazer chegada</button>' : '<button type="button" class="btn pri big" id="oeRecBtn">Marcar chegada</button>';
      return '<div class="modal-bg" data-modal-bg><div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="mt" id="ofRow"><div class="mh"><h2 id="mt">' + esc(c.forn) + '</h2>' + chip + '<button type="button" class="mx" data-modal-close aria-label="Fechar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="ebody"><div class="egrid"><div class="fbody">' +
        fld('Entrega prevista', '<input type="date" id="oeEnt" value="' + ed.entrega + '"' + (c.pago ? ' disabled' : '') + '>') +
        fld('Chegou em', '<div style="display:flex;gap:6px;align-items:center"><input type="date" id="oeRec" value="' + (ed.rec || '') + '"' + (c.pago ? ' disabled' : '') + ' style="flex:1">' + (ed.rec && !c.pago ? '<button type="button" class="lnk" id="oeRecClr">limpar</button>' : '') + '</div>') +
        fld('Subcategoria', '<select id="oeSub">' + OFSUBS.map((x) => '<option' + (x === ed.sub ? ' selected' : '') + '>' + esc(x) + '</option>').join('') + '</select>') +
        fld('Oficina', '<input id="oeForn" data-cbx="oeFornList" data-novo="1" value="' + esc(ed.forn) + '" autocomplete="off"><datalist id="oeFornList">' + fornOpts(AC, OF) + fornOpts(AC, OFSN) + '</datalist>') +
        fld('Valor', '<input id="oeVal" class="val" value="' + num(ed.valor) + '" inputmode="decimal">') +
        fld('Observação', '<textarea id="oeObs" rows="3" placeholder="Escreva uma observação. Ao salvar, ela entra na linha do tempo com seu nome.">' + esc(ed.obs || '') + '</textarea>') +
        (ed.entrega !== c.entrega && !c.pago ? '<p class="enote">A entrega muda de ' + dmy(c.entrega) + ' para ' + dmy(ed.entrega) + '. Fica registrado na linha do tempo.</p>' : '') +
        '<div class="paylink"><div><span>' + (c.pago ? 'Pago em' : 'Pagamento previsto') + '</span><b class="num">' + dmy(c.pago ? (c.pagoEm || c.data) : c.data) + '</b><small>' + (c.pago ? 'em Contas a pagar' : c.payManual ? 'data ajustada em Contas a pagar' : S.prazoOf + ' dias depois da ' + (c.recebidoEm ? 'chegada' : 'entrega prevista')) + '</small></div><button type="button" class="btn sm" data-gopay="' + c.id + '">Ver em Contas a pagar ›</button></div>' +
        '</div><div class="tlbox"><h3>Linha do tempo</h3><div class="tlscroll">' + tl + '</div>' + big + '</div></div></div>' +
        '<div class="efoot"><span id="modalErr" class="err" role="alert"></span><div class="fact">' +
        (view.edDel ? '<span style="font-size:13px;color:var(--danger-ink)">Excluir de vez?</span><button type="button" class="btn del" id="eDelOk">Sim, excluir</button><button type="button" class="btn" id="eDelNo">Não</button>' : '<button type="button" class="btn del ghost" id="eDel"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>Excluir</button>') +
        '<span class="grow"></span><button type="button" class="btn y" id="oeSave">Salvar</button></div></div></div></div>';
    }
    if (view.modal === 'edit') {
      const c = byId(view.editId); if (!c) { view.modal = null; return ''; }
      const ed = view.ed;
      const st = c.pago ? '<span class="chip c-paid">✓ Pago' + (c.pagoEm && c.pagoEm < origOf(c) ? ' antecipado' : '') + ' ' + dm(c.pagoEm || c.data) + '</span>' : isLate(c) ? '<span class="chip c-late">Vencida</span>' : isPror(c) ? '<span class="chip c-pror">Prorrogada</span>' : isAnt(c) ? '<span class="chip c-ant">Antecipada</span>' : '<span class="chip c-open">A pagar</span>';
      const ev = [{ t: 'Vencimento original · ' + dmy(origOf(c)), k: 'o' }];
      const kind = (t) => /^Antecipada|antecipada/.test(t) ? 'a' : /^Prorrogada/.test(t) ? 'p' : /^Paga|Lançada/.test(t) ? 'g' : /desfeito|removido/.test(t) ? 'x' : 'e';
      if (c.log && c.log.length) {
        const hasDateLog = c.log.some((x) => /^(Prorrogada|Antecipada|Voltou)/.test(x.txt));
        if (!hasDateLog) (c.hist || []).forEach((x, i) => ev.push({ t: tipoMud({ orig: c.orig, data: x.de }, x.para) + ' de ' + dm(x.de) + ' para ' + dmy(x.para), em: x.em, por: x.por, k: 'p' }));
        c.log.forEach((x) => { if (/^Criada/.test(x.txt)) ev[0].sub = x; else ev.push({ t: x.txt, em: x.em, por: x.por, k: kind(x.txt) }); });
        if (c.pago && !c.log.some((x) => /^Paga/.test(x.txt))) ev.splice(1, 0, { t: 'Paga em ' + dmy(c.pagoEm || c.data), k: 'g' });
        if (c.dreId && !c.log.some((x) => /^Lançada/.test(x.txt))) ev.push({ t: 'Lançada na DRE', k: 'g' });
      } else {
        (c.hist || []).forEach((x) => { const t = tipoMud({ orig: c.orig, data: x.de }, x.para); ev.push({ t: (t === 'Voltou ao vencimento original' ? t + ', ' + dmy(x.para) : t + ' de ' + dm(x.de) + ' para ' + dmy(x.para)), em: x.em, por: x.por, k: kind(t) }); });
        if (c.pago) ev.push({ t: 'Paga em ' + dmy(c.pagoEm || c.data), k: 'g' });
        if (c.dreId) ev.push({ t: 'Lançada na DRE', k: 'g' });
      }
      ev.forEach((x) => { if (x.k === 'g' && /antecipada/.test(x.t)) x.k = 'a'; });
      const tl = '<ol class="tl">' + ev.map((x, i) => '<li class="' + (/^Obs: /.test(x.t) ? 'n' : x.k) + (i === ev.length - 1 ? ' last' : '') + '">' + (/^Obs: /.test(x.t) ? '<span class="tln">' + esc(x.t.slice(5)) + '</span>' : '<b>' + esc(x.t) + '</b>') + (x.sub ? '<small>criada em ' + quando(x.sub.em) + (x.sub.por ? ' por <span class="who">' + esc(x.sub.por) + '</span>' : '') + '</small>' : '') + (x.em ? '<small>' + quando(x.em) + (x.por ? ' por <span class="who">' + esc(x.por) + '</span>' : '') + '</small>' : '') + '</li>').join('') + '</ol>';
      return '<div class="modal-bg" data-modal-bg><div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="mt" id="editRow"><div class="mh"><h2 id="mt">' + esc(c.forn) + '</h2>' + st + '<button type="button" class="mx" data-modal-close aria-label="Fechar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="ebody"><div class="egrid"><div class="fbody">' +
        fld('Data de pagamento', '<input type="date" id="kData" value="' + ed.data + '"' + (c.pago ? ' disabled' : '') + '>') +
        fld('Categoria', '<select id="kCat">' + catOpts(ed.cat) + '</select>') +
        fld('Subcategoria', '<select id="kSub">' + subOpts(ed.cat, ed.sub) + '</select>') +
        fld('Fornecedor', '<input id="kForn" data-cbx="kFornList" data-novo="1" value="' + esc(ed.forn) + '" autocomplete="off"><datalist id="kFornList">' + fornOpts(ed.cat, ed.sub) + '</datalist>') +
        fld('Valor', '<input id="kVal" class="val" value="' + num(ed.valor) + '" inputmode="decimal">') +
        (c.parcId && pById(c.parcId) ? '<p class="enote">Parcela ' + c.parcN + '/' + pById(c.parcId).qtd + ' do parcelamento <b>' + esc(pById(c.parcId).nome) + '</b>. <button type="button" class="lnk" data-goparc="' + c.parcId + '">Ver em Parcelamentos ›</button></p>' : '') +
        fld('Observação', '<textarea id="kObs" rows="3" placeholder="Escreva uma observação. Ao salvar, ela entra na linha do tempo com seu nome.">' + esc(ed.obs || '') + '</textarea>') +
        (ed.data !== c.data && !c.pago ? '<p class="enote">A data muda de ' + dmy(c.data) + ' para ' + dmy(ed.data) + (ed.data > c.data ? ' e entra no histórico como prorrogação.' : '.') + '</p>' : '') +
        '</div><div class="tlbox"><h3>Linha do tempo</h3><div class="tlscroll">' + tl + '</div>' +
        (c.pago ? '<button type="button" class="btn big" id="eUnpay">Desfazer pagamento</button>' : '<button type="button" class="btn pri big" id="ePay">Pagar</button>') +
        '</div></div></div>' +
        '<div class="efoot"><span id="modalErr" class="err" role="alert"></span><div class="fact">' +
        (view.edDel ? '<span style="font-size:13px;color:var(--danger-ink)">Excluir de vez?</span><button type="button" class="btn del" id="eDelOk">Sim, excluir</button><button type="button" class="btn" id="eDelNo">Não</button>' : '<button type="button" class="btn del ghost" id="eDel"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>Excluir</button>') +
        '<span class="grow"></span><button type="button" class="btn y" id="eSave">Salvar</button></div></div></div></div>';
    }
    if (view.modal === 'conta') {
      const wEnd = iso(addDays(parse(view.week), 6));
      const def = HOJE >= view.week && HOJE <= wEnd ? HOJE : view.week;
      return '<div class="modal-bg" data-modal-bg><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" id="addRow"><div class="mh"><h2 id="mt">Nova conta</h2><button type="button" class="mx" data-modal-close aria-label="Fechar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="fbody">' +
        fld('Data de pagamento', '<input type="date" id="nData" value="' + def + '">') +
        fld('Categoria', '<select id="nCat">' + catOpts(view.newCat) + '</select>') +
        fld('Subcategoria', '<select id="nSub">' + subOpts(view.newCat, view.newSub) + '</select>') +
        fld('Fornecedor', '<input id="nForn" data-cbx="fornList" data-novo="1" placeholder="Escolha ou digite" autocomplete="off"><datalist id="fornList">' + fornOpts(view.newCat, view.newSub || (LISTAS[view.newCat] || [''])[0]) + '</datalist>') +
        fld('Valor', '<input id="nVal" class="val" placeholder="0,00" inputmode="decimal">') +
        fld('Observação', '<textarea id="nObs" rows="3" placeholder="Opcional. Fica na linha do tempo da conta."></textarea>') +
        '<span id="modalErr" class="err" role="alert"></span><div class="fact"><span class="grow"></span><button type="button" class="btn y" id="btnAdd">Adicionar</button></div></div></div></div>';
    }
    const wk = view.ofWeek, wEnd = iso(addDays(parse(wk), 7));
    const def = HOJE >= wk && HOJE < wEnd ? HOJE : wk;
    return '<div class="modal-bg" data-modal-bg><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" id="addOf"><div class="mh"><h2 id="mt">Nova entrega de oficina</h2><button type="button" class="mx" data-modal-close aria-label="Fechar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="fbody">' +
      fld('Entrega prevista', '<input type="date" id="oData" value="' + def + '">') +
      fld('Subcategoria', '<select id="oSub">' + OFSUBS.map((x) => '<option>' + esc(x) + '</option>').join('') + '</select>') +
      fld('Oficina', '<input id="oForn" data-cbx="ofList" data-novo="1" placeholder="Escolha ou digite" autocomplete="off"><datalist id="ofList">' + fornOpts(AC, OF) + fornOpts(AC, OFSN) + '</datalist>') +
      fld('Valor a pagar', '<input id="oVal" class="val" placeholder="0,00" inputmode="decimal">') +
      fld('Observação', '<textarea id="oObs" rows="3" placeholder="Opcional. Fica na linha do tempo da conta."></textarea>') +
      '<p style="margin:0;color:var(--muted);font-size:13px">O pagamento entra em Contas a pagar ' + S.prazoOf + ' dias depois da chegada.</p><div class="fact"><span class="grow"></span><button type="button" class="btn y" id="btnAddOf">Adicionar entrega</button></div></div></div></div>';
  }
  // ---------- parcelamentos ----------
  // Um parcelamento gera (ou liga) uma conta em Contas a pagar para cada parcela que falta.
  // O que está pago, em aberto e o saldo saem sempre dessas contas: pagar a parcela lá já desconta aqui.
  const EMPS_P = ['MRBL', 'STOFFA'];
  const novoIdP = novoId;
  const C = (data, forn, cat, sub, valor, extra) => Object.assign({ id: novoId('c'), data, orig: null, forn, cat, sub, valor, pago: false, pagoEm: null, hist: [] }, extra || {});
  const addMes = (s, k) => { const [y, m, d] = String(s).split('-').map(Number); const ult = new Date(y, m - 1 + k + 1, 0).getDate(); return iso(new Date(y, m - 1 + k, Math.min(d, ult))); };
  const pById = (id) => (S.parcelamentos || []).find((p) => p.id === id);
  const parcForn = (p, n) => p.nome + ' · ' + n + '/' + p.qtd;
  function parcContas(p){ return S.contas.filter((c) => c.parcId === p.id).sort((a, b) => (a.parcN - b.parcN) || a.data.localeCompare(b.data)); }
  function parcInfo(p){
    const cs = parcContas(p);
    const pagasSis = cs.filter((c) => c.pago), abertas = cs.filter((c) => !c.pago).sort((a, b) => a.data.localeCompare(b.data));
    const pagas = (p.pagasAntes || 0) + pagasSis.length;
    const saldo = abertas.reduce((a, c) => a + c.valor, 0);
    const pago = (p.pagasAntes || 0) * p.valorParcela + pagasSis.reduce((a, c) => a + c.valor, 0);
    const fim = cs.reduce((a, c) => (c.data > a ? c.data : a), '');
    return { cs, pagas, abertas, saldo, pago, prox: abertas[0] || null, venc: abertas.filter((c) => c.data < HOJE), fim: fim || null, quitado: !abertas.length };
  }
  // Conta que já está em Contas a pagar e é esta parcela: mesma subcategoria, até 12 dias e valor até 12% diferente
  // (parcelamento de imposto muda um pouco de valor todo mês por causa da correção).
  function acharParcela(p, data, usadas){
    let best = null;
    S.contas.forEach((c) => {
      if (c.parcId || usadas.has(c.id) || !p.cat || c.cat !== p.cat || (p.sub && c.sub !== p.sub)) return;
      const dd = Math.abs(parse(c.data) - parse(data)) / 864e5, dv = Math.abs(c.valor - p.valorParcela) / Math.max(1, p.valorParcela);
      if (dd > 12 || dv > 0.12) return;
      const nota = dv * 10 + dd / 12;
      if (!best || nota < best[0]) best = [nota, c];
    });
    return best ? best[1] : null;
  }
  function gerarParcelas(p, primeiro, deN){
    let ligadas = 0, criadas = 0; const usadas = new Set();
    for (let n = deN, k = 0; n <= p.qtd; n++, k++) {
      const data = addMes(primeiro, k);
      const ja = acharParcela(p, data, usadas);
      if (ja) { usadas.add(ja.id); ja.parcId = p.id; ja.parcN = n; logC(ja, 'Ligada ao parcelamento ' + p.nome + ' como parcela ' + n + '/' + p.qtd); ligadas++; continue; }
      const c = C(data, parcForn(p, n), p.cat, p.sub, p.valorParcela, { id: novoIdP('c'), hist: [], parcId: p.id, parcN: n });
      logC(c, 'Criada pelo parcelamento ' + p.nome + ' (parcela ' + n + '/' + p.qtd + ')');
      S.contas.push(c); criadas++;
    }
    return { ligadas, criadas };
  }
  function logP(p, txt){ (p.log = p.log || []).push({ txt, em: agora(), por: S.user }); }
  function blankPF(){ return { nome: '', emp: 'MRBL', cat: '', sub: '', valor: '', qtd: '', total: '', pagasAntes: '0', primeiro: addMes(HOJE.slice(0, 8) + '10', 1), obs: '' }; }
  function openParc(p){ view.modal = 'parcedit'; view.pid = p.id; view.pcDel = false; view.pTab = 'parcelas'; view.pf = { nome: p.nome, emp: p.emp || 'MRBL', cat: p.cat || '', sub: p.sub || '', valor: num(p.valorParcela), qtd: String(p.qtd), total: num(p.valorTotal || p.valorParcela * p.qtd), obs: '' }; if (cal) closeCal(); render(); }
  // Lê o formulário (novo ou edição). Devolve { erro } ou os valores já convertidos.
  function lerPF(novo){
    const g = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const f = { nome: g('pcNome').trim(), emp: g('pcEmp'), cat: g('pcCat'), sub: g('pcSub'), valor: parseVal(g('pcVal')), qtd: parseInt(g('pcQtd'), 10), total: parseVal(g('pcTot')), obs: g('pcObs').trim() };
    if (novo) { f.pagasAntes = parseInt(g('pcPagas') || '0', 10); f.primeiro = g('pcPrim'); }
    if (!f.nome) return { erro: 'Dê um nome ao parcelamento.' };
    if (!(f.valor > 0)) return { erro: 'Informe o valor da parcela.' };
    if (!(f.qtd >= 1)) return { erro: 'Informe a quantidade de parcelas.' };
    if (!(f.total > 0)) f.total = Math.round(f.valor * f.qtd * 100) / 100;
    if (novo) {
      if (!(f.pagasAntes >= 0) || f.pagasAntes >= f.qtd) return { erro: 'Parcelas já pagas tem que ser menor que a quantidade de parcelas.' };
      if (!f.primeiro) return { erro: 'Escolha o vencimento da próxima parcela.' };
    }
    return f;
  }
  function salvarNovoParc(){
    const f = lerPF(true), err = document.getElementById('modalErr');
    if (f.erro) { if (err) err.textContent = f.erro; return; }
    const p = { id: novoIdP('pc'), nome: f.nome, emp: f.emp, cat: f.cat, sub: f.sub, valorParcela: f.valor, qtd: f.qtd, valorTotal: f.total, pagasAntes: f.pagasAntes, log: [] };
    let r;
    act('Parcelamento ' + p.nome + ' criado: ' + (p.qtd - p.pagasAntes) + ' parcelas de ' + money(p.valorParcela) + ' em Contas a pagar.', () => {
      logP(p, 'Criado com ' + p.qtd + ' parcelas de ' + money(p.valorParcela) + (p.pagasAntes ? ' (' + p.pagasAntes + ' já pagas antes)' : '') + ', próxima em ' + dmy(f.primeiro));
      if (f.obs) logP(p, 'Obs: ' + f.obs);
      (S.parcelamentos = S.parcelamentos || []).push(p);
      r = gerarParcelas(p, f.primeiro, p.pagasAntes + 1);
      if (r.ligadas) logP(p, r.ligadas + ' parcela(s) que já estavam em Contas a pagar foram ligadas a este parcelamento');
    });
    view.modal = null; render();
    if (r && r.ligadas) toast(r.ligadas + ' parcela(s) já estavam em Contas a pagar e foram ligadas; ' + r.criadas + ' nova(s) criada(s).', true);
  }
  function salvarParc(p){
    const f = lerPF(false), err = document.getElementById('modalErr');
    if (f.erro) { if (err) err.textContent = f.erro; return; }
    const info = parcInfo(p), maxPaga = info.cs.filter((c) => c.pago).reduce((a, c) => Math.max(a, c.parcN || 0), p.pagasAntes || 0);
    if (f.qtd < maxPaga) { if (err) err.textContent = 'Já existe parcela paga de número ' + maxPaga + '. A quantidade não pode ser menor.'; return; }
    // valor total que era só parcela × quantidade acompanha a mudança, se a pessoa não mexeu nele
    if (Math.abs(f.total - p.valorTotal) < 0.01 && Math.abs(p.valorTotal - p.valorParcela * p.qtd) < 0.01) f.total = Math.round(f.valor * f.qtd * 100) / 100;
    const mud = [];
    if (f.nome !== p.nome) mud.push('nome');
    if (f.emp !== p.emp) mud.push('empresa');
    if (f.cat !== p.cat || f.sub !== p.sub) mud.push('categoria');
    if (f.valor !== p.valorParcela) mud.push('valor da parcela de ' + money(p.valorParcela) + ' para ' + money(f.valor));
    if (f.qtd !== p.qtd) mud.push('parcelas de ' + p.qtd + ' para ' + f.qtd);
    if (f.total !== p.valorTotal) mud.push('valor total para ' + money(f.total));
    if (!mud.length && !f.obs) { view.modal = null; render(); return; }
    act(mud.length ? 'Parcelamento ' + f.nome + ' alterado: ' + mud.join(', ') + '.' : 'Observação no parcelamento ' + p.nome + '.', () => {
      const valorMudou = f.valor !== p.valorParcela, qtdAntes = p.qtd;
      Object.assign(p, { nome: f.nome, emp: f.emp, cat: f.cat, sub: f.sub, valorParcela: f.valor, qtd: f.qtd, valorTotal: f.total });
      if (mud.length) logP(p, 'Alterado: ' + mud.join(', '));
      if (f.obs) logP(p, 'Obs: ' + f.obs);
      // parcelas em aberto acompanham o parcelamento; as pagas ficam como foram pagas
      parcContas(p).filter((c) => !c.pago).forEach((c) => {
        if (c.parcN > p.qtd) { S.contas = S.contas.filter((x) => x.id !== c.id); return; }
        const forn = parcForn(p, c.parcN);
        if (c.forn !== forn && /· \d+\/\d+$/.test(c.forn)) c.forn = forn;
        c.cat = p.cat; c.sub = p.sub;
        if (valorMudou && c.valor !== p.valorParcela) { logC(c, 'Valor mudou de ' + money(c.valor) + ' para ' + money(p.valorParcela) + ' (parcelamento alterado)'); c.valor = p.valorParcela; }
      });
      if (p.qtd > qtdAntes) {
        const ult = parcContas(p).reduce((a, c) => (c.data > a ? c.data : a), '') || HOJE;
        gerarParcelas(p, addMes(ult, 1), qtdAntes + 1);
      }
    });
    view.modal = null; render();
  }
  function excluirParc(p){
    const info = parcInfo(p);
    act('Parcelamento ' + p.nome + ' excluído. ' + info.abertas.length + ' parcela(s) em aberto saíram de Contas a pagar.', () => {
      const abertas = new Set(info.abertas.map((c) => c.id));
      S.contas = S.contas.filter((c) => !abertas.has(c.id));
      S.contas.forEach((c) => { if (c.parcId === p.id) { delete c.parcId; delete c.parcN; } });
      S.parcelamentos = S.parcelamentos.filter((x) => x.id !== p.id);
    });
    view.modal = null; render();
  }
  // Carga inicial (admin, só com Parcelamentos e Cheques vazios): arquivo .json com
  // { parcelamentos: [[nome, empresa, categoria, subcategoria, parcela, quantidade, já pagas, próximo vencimento?]], cheques: [[data, nº, descrição, valor, a pagar no ano, grupo]] }
  function importarParc(j){
    const P = Array.isArray(j.parcelamentos) ? j.parcelamentos : [], Q = Array.isArray(j.cheques) ? j.cheques : [];
    if (!P.length && !Q.length) { toast('O arquivo não tem parcelamentos nem cheques.', false); return; }
    let ligadas = 0, criadas = 0;
    act('Carga inicial: ' + P.length + ' parcelamentos e ' + Q.length + ' cheques.', () => {
      S.parcelamentos = S.parcelamentos || [];
      P.forEach(([nome, emp, cat, sub, valor, qtd, pagas, prox]) => {
        valor = +valor; qtd = +qtd; pagas = +pagas || 0;
        if (!nome || !(valor > 0) || !(qtd >= 1)) return;
        const p = { id: novoIdP('pc'), nome, emp: emp || 'MRBL', cat: cat || '', sub: sub || '', valorParcela: valor, qtd, valorTotal: Math.round(valor * qtd * 100) / 100, pagasAntes: pagas, log: [] };
        // próxima parcela: a primeira conta parecida a partir de meados de outubro; senão a data do arquivo; senão dia 10 do mês que vem
        const cand = S.contas.filter((c) => !c.parcId && c.sub === p.sub && c.data >= '2026-10-15' && Math.abs(c.valor - valor) / valor <= 0.12).sort((a, b) => a.data.localeCompare(b.data))[0];
        const primeiro = cand ? cand.data : prox || addMes(HOJE.slice(0, 8) + '10', 1);
        logP(p, 'Cadastrado a partir da planilha PARCELAMENTOS E FINANCIAMENTOS (' + qtd + ' parcelas de ' + money(valor) + ', ' + pagas + ' já pagas)' + (cand || prox ? '' : '. Vencimento estimado: confira'));
        S.parcelamentos.push(p);
        if (pagas < qtd) { const r = gerarParcelas(p, primeiro, pagas + 1); ligadas += r.ligadas; criadas += r.criadas; if (r.ligadas) logP(p, r.ligadas + ' parcela(s) que já estavam em Contas a pagar foram ligadas a este parcelamento'); }
      });
      S.cheques = S.cheques || [];
      Q.forEach(([data, numero, desc, valor, aPagar, grupo]) => {
        if (!data || !desc || !(+valor > 0)) return;
        const [cat, sub] = chqCatDe(desc);
        const q = { id: novoIdP('cq'), data, numero: String(numero || ''), desc, valor: +valor, aPagar: +aPagar || 0, grupo: grupo || 'Outros', cat, sub, contaId: null, log: [] };
        logQ(q, 'Cadastrado a partir da planilha PARCELAMENTOS E FINANCIAMENTOS');
        S.cheques.push(q);
      });
    });
    render();
    toast('Carga feita: ' + criadas + ' parcela(s) novas em Contas a pagar e ' + ligadas + ' ligada(s) a contas que já existiam.', true);
  }
  document.addEventListener('change', (e) => {
    if (e.target.id !== 'parcImp' || !e.target.files || !e.target.files[0]) return;
    e.target.files[0].text().then((t) => importarParc(JSON.parse(t))).catch((err) => toast('Não consegui ler o arquivo: ' + err.message, false));
  });

  function renderParc(){
    const app = document.getElementById('app');
    if (!view.parcEmp) view.parcEmp = 'todas';
    if (!view.parcSit) view.parcSit = 'ativos';
    const todos = (S.parcelamentos || []).map((p) => ({ p, i: parcInfo(p) }));
    const vis = todos.filter((x) => (view.parcEmp === 'todas' || x.p.emp === view.parcEmp) && (view.parcSit === 'todos' || (view.parcSit === 'ativos' ? !x.i.quitado : x.i.quitado)));
    const ativos = todos.filter((x) => !x.i.quitado && (view.parcEmp === 'todas' || x.p.emp === view.parcEmp));
    const saldo = ativos.reduce((a, x) => a + x.i.saldo, 0);
    const doMes = ativos.flatMap((x) => x.i.cs).filter((c) => c.data.slice(0, 7) === CUR);
    const mesTot = doMes.reduce((a, c) => a + c.valor, 0), mesPago = doMes.filter((c) => c.pago).reduce((a, c) => a + c.valor, 0);
    const venc = ativos.flatMap((x) => x.i.venc), vencTot = venc.reduce((a, c) => a + c.valor, 0);
    const chip = (k, v, lab) => '<button type="button" class="chipf" data-pf="' + k + ':' + v + '" aria-pressed="' + (view[k] === v) + '">' + lab + '</button>';
    let h = '<div class="today"><h1>Parcelamentos</h1><span class="sub">Tudo que se paga em parcelas mensais. Cada parcela já está em Contas a pagar; quando ela é paga lá, sai do saldo aqui.</span></div>';
    h += '<div class="kpis">' +
      '<div class="kpi"><span>Saldo a pagar</span><b class="num">' + money(saldo) + '</b><small>' + ativos.length + ' parcelamento' + (ativos.length === 1 ? '' : 's') + ' em andamento</small></div>' +
      '<div class="kpi g"><span>Parcelas de ' + mesNome(CUR) + '</span><b class="num">' + money(mesTot) + '</b><small>' + money(mesPago) + ' já pago · ' + doMes.filter((c) => c.pago).length + ' de ' + doMes.length + '</small></div>' +
      '<div class="kpi' + (venc.length ? ' kd' : '') + '"><span>Parcelas vencidas</span><b class="num">' + money(vencTot) + '</b><small>' + (venc.length ? venc.length + ' parcela' + (venc.length === 1 ? '' : 's') + ' sem pagamento' : 'Nenhuma vencida') + '</small></div>' +
      (() => { const ab = (S.cheques || []).filter((q) => ['aberto', 'enviado'].includes(chqSit(q).k)), tot = ab.reduce((x, q) => x + chqValor(q), 0), fora = ab.filter((q) => chqSit(q).k === 'aberto').length;
        return '<div class="kpi"><span>Cheques em aberto</span><b class="num">' + money(tot) + '</b><small>' + ab.length + ' cheque' + (ab.length === 1 ? '' : 's') + (fora ? ' · ' + fora + ' fora de Contas a pagar' : '') + '</small></div></div>'; })();
    h += '<section class="panel"><div class="ph"><h2>Parcelamentos</h2><div class="pfil">' +
      chip('parcEmp', 'todas', 'Todas') + EMPS_P.map((e) => chip('parcEmp', e, e)).join('') + '<span class="sep"></span>' +
      chip('parcSit', 'ativos', 'Em andamento') + chip('parcSit', 'quitados', 'Quitados') + chip('parcSit', 'todos', 'Todos') + '</div></div>';
    if (!vis.length) h += '<p class="pempty">' + (todos.length ? 'Nenhum parcelamento neste filtro.' : 'Nenhum parcelamento ainda. Use + Novo parcelamento.') + '</p>' + (!todos.length && !(S.cheques || []).length && ADMIN ? '<p class="pempty"><label class="btn sm">Carga inicial (.json)<input type="file" id="parcImp" accept=".json,application/json" hidden></label></p>' : '');
    else {
      h += '<div class="pscroll"><table class="ptab"><thead><tr><th>Parcelamento</th><th class="r">Parcela</th><th>Pagas</th><th class="r">Saldo</th><th>Próxima</th><th>Termina</th><th class="r"></th></tr></thead><tbody>';
      EMPS_P.forEach((emp) => {
        const g = vis.filter((x) => (x.p.emp || 'MRBL') === emp).sort((a, b) => b.i.saldo - a.i.saldo);
        if (!g.length) return;
        h += '<tr class="pgh"><td colspan="3">' + emp + '</td><td class="r num">' + money(g.reduce((a, x) => a + x.i.saldo, 0)) + '</td><td colspan="3"><small>' + money(g.filter((x) => !x.i.quitado).reduce((a, x) => a + x.p.valorParcela, 0)) + ' por mês em parcelas</small></td></tr>';
        g.forEach(({ p, i }) => {
          const pct = Math.min(100, Math.round(i.pagas / p.qtd * 100));
          const prox = i.prox ? '<span class="num">' + dmy(i.prox.data) + '</span>' + (i.prox.data < HOJE ? ' <span class="chip c-late">Vencida</span>' : '') + (i.venc.length > 1 ? '<small> +' + (i.venc.length - 1) + ' vencida' + (i.venc.length > 2 ? 's' : '') + '</small>' : '') + '<small>parcela ' + i.prox.parcN + '/' + p.qtd + (Math.abs(i.prox.valor - p.valorParcela) > 0.009 ? ' · ' + money(i.prox.valor) : '') + '</small>' : '<span class="chip c-paid">✓ Quitado</span>';
          h += '<tr data-pid="' + p.id + '"><td><b>' + esc(p.nome) + '</b>' + '<small>' + esc(p.cat || 'Sem categoria') + (p.sub ? ' · ' + esc(p.sub) : '') + '</small></td>' +
            '<td class="r num">' + money(p.valorParcela) + '</td>' +
            '<td><div class="pbar" role="img" aria-label="' + i.pagas + ' de ' + p.qtd + ' parcelas pagas"><i style="width:' + pct + '%"></i></div><small class="num">' + i.pagas + ' de ' + p.qtd + '</small></td>' +
            '<td class="r num"><b>' + money(i.saldo) + '</b><small>de ' + money(p.valorTotal || p.valorParcela * p.qtd) + '</small></td>' +
            '<td>' + prox + '</td>' +
            '<td class="num">' + (i.fim ? cap(MES3[+i.fim.slice(5, 7) - 1]) + '/' + i.fim.slice(2, 4) : '—') + '</td>' +
            '<td class="r">' + (i.prox ? '<button type="button" class="btn sm pri" data-gopay="' + i.prox.id + '">Pagar</button>' : '') + '</td></tr>';
        });
      });
      h += '</tbody></table></div>';
    }
    h += '</section>';
    // Quanto falta por ano (como na planilha de parcelamentos)
    const anos = [...new Set(ativos.flatMap((x) => x.i.abertas.map((c) => c.data.slice(0, 4))))].sort();
    if (anos.length) {
      const porAno = (cs) => anos.map((a) => cs.filter((c) => c.data.slice(0, 4) === a).reduce((s, c) => s + c.valor, 0));
      // valores em milhares de reais (57,4 = R$ 57,4 mil) para os anos caberem na largura da tela; o valor exato fica no title
      const mil = (v) => (v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      const cel = (v) => '<td class="r num"' + (v ? ' title="' + money(v) + '">' + mil(v) : '><span class="z">—</span>') + '</td>';
      h += '<section class="panel"><div class="ph"><h2>Quanto falta pagar por ano</h2><span style="color:var(--muted);font-size:14px">Em R$ mil: soma das parcelas em aberto em Contas a pagar. Passe o mouse no valor para ver o exato.</span></div><div class="pscroll"><table class="ptab pano"><colgroup><col class="pn">' + anos.map(() => '<col>').join('') + '<col class="pt"></colgroup><thead><tr><th>Parcelamento</th>' + anos.map((a) => '<th class="r">' + a + '</th>').join('') + '<th class="r">Total</th></tr></thead><tbody>';
      let geral = anos.map(() => 0);
      EMPS_P.forEach((emp) => {
        const g = ativos.filter((x) => (x.p.emp || 'MRBL') === emp);
        if (!g.length) return;
        const sub = anos.map(() => 0);
        g.forEach(({ p, i }) => { const v = porAno(i.abertas); v.forEach((x, k) => { sub[k] += x; }); h += '<tr data-pid="' + p.id + '"><td>' + esc(p.nome) + '</td>' + v.map(cel).join('') + cel(i.saldo) + '</tr>'; });
        geral = geral.map((x, k) => x + sub[k]);
        h += '<tr class="pst"><td>Total ' + emp + '</td>' + sub.map(cel).join('') + cel(sub.reduce((a, b) => a + b, 0)) + '</tr>';
      });
      h += '<tr class="pst ptotg"><td>Total geral</td>' + geral.map(cel).join('') + cel(geral.reduce((a, b) => a + b, 0)) + '</tr></tbody></table></div></section>';
    }
    h += chequesHTML();
    app.innerHTML = h;
  }

  function parcModalHTML(){
    const fld = (lab, ctl) => '<label class="ff"><span>' + lab + '</span>' + ctl + '</label>';
    const xBtn = '<button type="button" class="mx" data-modal-close aria-label="Fechar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    const f = view.pf, novo = view.modal === 'parcnew';
    const campos = fld('Nome', '<input id="pcNome" value="' + esc(f.nome) + '" placeholder="Ex.: ICMS parcelamento 36x" autocomplete="off">') +
      fld('Empresa', '<select id="pcEmp">' + EMPS_P.map((e) => '<option' + (e === f.emp ? ' selected' : '') + '>' + e + '</option>').join('') + '</select>') +
      fld('Categoria', '<select id="pcCat">' + catOpts(f.cat) + '</select>') +
      fld('Subcategoria', '<select id="pcSub">' + subOpts(f.cat, f.sub) + '</select>') +
      fld('Valor da parcela', '<input id="pcVal" class="val" value="' + esc(f.valor) + '" inputmode="decimal" placeholder="0,00">') +
      fld('Quantidade de parcelas', '<input id="pcQtd" class="val" value="' + esc(f.qtd) + '" inputmode="numeric" placeholder="Ex.: 36">') +
      fld('Valor total', '<input id="pcTot" class="val" value="' + esc(f.total) + '" inputmode="decimal" placeholder="parcela × quantidade">') +
      (novo ? fld('Parcelas já pagas', '<input id="pcPagas" class="val" value="' + esc(f.pagasAntes) + '" inputmode="numeric">') +
        fld('Vencimento da próxima parcela', '<input type="date" id="pcPrim" value="' + esc(f.primeiro) + '">') : '') +
      fld('Observação', '<textarea id="pcObs" rows="3" placeholder="Escreva uma observação. Ao salvar, ela entra na linha do tempo com seu nome.">' + esc(f.obs || '') + '</textarea>') +
      '<p class="enote" id="pcResumo">' + resumoPF() + '</p>';
    if (novo) {
      return '<div class="modal-bg" data-modal-bg><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" style="width:min(680px,100%)"><div class="mh"><h2 id="mt">Novo parcelamento</h2>' + xBtn + '</div><div class="ebody"><div class="fbody">' + campos + '</div></div>' +
        '<div class="efoot"><span id="modalErr" class="err" role="alert"></span><div class="fact"><span class="grow"></span><button type="button" class="btn y" id="pcAdd">Criar parcelas</button></div></div></div></div>';
    }
    const p = pById(view.pid); if (!p) { view.modal = null; return ''; }
    const i = parcInfo(p);
    const st = i.quitado ? '<span class="chip c-paid">✓ Quitado</span>' : i.venc.length ? '<span class="chip c-late">' + i.venc.length + ' vencida' + (i.venc.length > 1 ? 's' : '') + '</span>' : '';
    const linhas = [];
    const pa = p.pagasAntes || 0;
    if (pa) linhas.push('<li class="pq old"><span class="n num">' + (pa > 1 ? '1–' + pa : '1') + '</span><span class="d">antes do sistema</span><span class="v num">' + num(pa * p.valorParcela) + '</span><span class="s"><span class="chip c-paid">' + (pa > 1 ? pa + ' pagas' : 'Paga') + '</span></span><span class="a"></span></li>');
    i.cs.forEach((c) => linhas.push('<li class="pq' + (c.pago ? ' ok' : c.data < HOJE ? ' late' : '') + '"><span class="n num">' + (c.parcN || '?') + '</span><span class="d num">' + dmy(c.data) + (c.orig && c.orig !== c.data ? '<small>venc. ' + dm(c.orig) + '</small>' : '') + '</span><span class="v num">' + num(c.valor) + '</span><span class="s">' +
      (c.pago ? '<span class="chip c-paid">Paga ' + dm(c.pagoEm || c.data) + '</span>' : c.data < HOJE ? '<span class="chip c-late">Vencida</span>' : '<span class="chip">A pagar</span>') +
      '</span><span class="a"><button type="button" class="lnk" data-gopay="' + c.id + '" title="Ver em Contas a pagar">Ver ›</button></span></li>'));
    const tl = '<ol class="tl">' + (p.log || []).slice().reverse().map((x, k, arr) => '<li class="' + (/^Obs: /.test(x.txt) ? 'n' : /^Criado|^Cadastrado/.test(x.txt) ? 'o' : 'e') + (k === arr.length - 1 ? ' last' : '') + '">' + (/^Obs: /.test(x.txt) ? '<span class="tln">' + esc(x.txt.slice(5)) + '</span>' : '<b>' + esc(x.txt) + '</b>') + '<small>' + quando(x.em) + (x.por ? ' por <span class="who">' + esc(x.por) + '</span>' : '') + '</small></li>').join('') + '</ol>';
    const tab = (k, lab) => '<button type="button" class="ptb" data-ptab="' + k + '" aria-pressed="' + (view.pTab === k) + '">' + lab + '</button>';
    return '<div class="modal-bg" data-modal-bg><div class="modal wide xwide" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="mh"><h2 id="mt">' + esc(p.nome) + '</h2>' + st + xBtn + '</div><div class="ebody"><div class="egrid"><div class="fbody">' + campos +
      '<div class="paylink"><div><span>Pagas</span><b class="num">' + i.pagas + ' de ' + p.qtd + '</b><small>' + money(i.pago) + '</small></div><div><span>Saldo</span><b class="num">' + money(i.saldo) + '</b><small>' + i.abertas.length + ' em aberto</small></div></div>' +
      '</div><div class="tlbox"><div class="ptabs">' + tab('parcelas', 'Parcelas') + tab('tl', 'Linha do tempo') + '</div><div class="tlscroll">' + (view.pTab === 'tl' ? tl : '<ol class="plist">' + linhas.join('') + '</ol>') + '</div>' +
      (i.prox ? '<button type="button" class="btn pri big" data-gopay="' + i.prox.id + '">Pagar parcela ' + i.prox.parcN + '/' + p.qtd + ' · ' + dm(i.prox.data) + '</button>' : '') + '</div></div></div>' +
      '<div class="efoot"><span id="modalErr" class="err" role="alert"></span><div class="fact">' +
      (view.pcDel ? '<span style="font-size:13px;color:var(--danger-ink)">Excluir de vez? As ' + i.abertas.length + ' parcelas em aberto saem de Contas a pagar; as pagas ficam.</span><button type="button" class="btn del" id="pcDelOk">Sim, excluir</button><button type="button" class="btn" id="pcDelNo">Não</button>' : '<button type="button" class="btn del ghost" id="pcDel"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>Excluir</button>') +
      '<span class="grow"></span><button type="button" class="btn y" id="pcSave">Salvar</button></div></div></div></div>';
  }
  // Frase de conferência embaixo do formulário: parcela × quantidade e o que vai para Contas a pagar.
  function resumoPF(){
    const f = view.pf || {}, v = parseVal(f.valor), q = parseInt(f.qtd, 10), t = parseVal(f.total);
    if (!(v > 0) || !(q >= 1)) return 'Preencha o valor da parcela e a quantidade.';
    const conta = Math.round(v * q * 100) / 100;
    let s = q + ' × ' + money(v) + ' = ' + money(conta) + '.';
    if (t > 0 && Math.abs(t - conta) > 0.009) s += ' O valor total informado é ' + money(t) + ' (' + (t > conta ? 'mais ' : 'menos ') + money(Math.abs(t - conta)) + ').';
    if (view.modal === 'parcnew') { const pg = parseInt(f.pagasAntes || '0', 10) || 0; if (q - pg > 0 && f.primeiro) s += ' Vão para Contas a pagar ' + (q - pg) + ' parcelas, de ' + dmy(f.primeiro) + ' a ' + dmy(addMes(f.primeiro, q - pg - 1)) + '.'; }
    return s;
  }
  // Mantém view.pf igual ao formulário enquanto a pessoa digita (o render redesenha o modal).
  document.addEventListener('input', (e) => {
    if (!/^(parcnew|parcedit)$/.test(view.modal || '') || !view.pf) return;
    const map = { pcNome: 'nome', pcVal: 'valor', pcQtd: 'qtd', pcTot: 'total', pcPagas: 'pagasAntes', pcObs: 'obs' };
    if (map[e.target.id]) { view.pf[map[e.target.id]] = e.target.value; const r = document.getElementById('pcResumo'); if (r) r.textContent = resumoPF(); }
  });
  document.addEventListener('change', (e) => {
    if (!/^(parcnew|parcedit)$/.test(view.modal || '') || !view.pf) return;
    const id = e.target.id;
    if (id === 'pcEmp') view.pf.emp = e.target.value;
    if (id === 'pcSub') view.pf.sub = e.target.value;
    if (id === 'pcPrim') { view.pf.primeiro = e.target.value; const r = document.getElementById('pcResumo'); if (r) r.textContent = resumoPF(); }
    if (id === 'pcCat') { view.pf.cat = e.target.value; view.pf.sub = (LISTAS[view.pf.cat] || [])[0] || ''; render(); }
  });
  document.addEventListener('click', (e) => {
    const t = e.target;
    const pf = t.closest('[data-pf]'); if (pf) { const [k, v] = pf.dataset.pf.split(':'); view[k] = v; render(); return; }
    const pt = t.closest('[data-ptab]'); if (pt) { view.pTab = pt.dataset.ptab; render(); return; }
    const gp = t.closest('[data-goparc]'); if (gp) { const p = pById(gp.dataset.goparc); if (p) { view.tela = 'parc'; openParc(p); } return; }
    if (t.closest('button, a, input, select, textarea, label')) {
      if (t.id === 'pcAdd') salvarNovoParc();
      else if (t.id === 'pcSave') { const p = pById(view.pid); if (p) salvarParc(p); }
      else if (t.id === 'pcDel') { view.pcDel = true; render(); }
      else if (t.id === 'pcDelNo') { view.pcDel = false; render(); }
      else if (t.id === 'pcDelOk') { const p = pById(view.pid); if (p) excluirParc(p); }
      return;
    }
    const row = t.closest('#app tr[data-pid]'); if (row) { const p = pById(row.dataset.pid); if (p) openParc(p); }
  });

  // ---------- cheques (parte de baixo da tela de Parcelamentos) ----------
  // A tabela segue a planilha: data, nº do cheque, descrição, valor total a pagar e quanto falta em 2026.
  // "Enviar para Contas a pagar" pede a data e cria a conta nesse dia; dali em diante ela é paga em Contas a pagar.
  const qById = (id) => (S.cheques || []).find((q) => q.id === id);
  const chqCatDe = (desc) => /ICMS/i.test(desc) ? ['DESPESAS TRIBUTARIAS FEDERAIS', 'ICMS'] : /GPS|INSS/i.test(desc) ? ['ENCARGOS SOCIAIS', 'INSS / GPS'] : ['', ''];
  function chqSit(q){
    const c = q.contaId ? byId(q.contaId) : null;
    if (c) return c.pago ? { k: 'pago', c } : { k: 'enviado', c };
    return { k: 'aberto' };   // a coluna do ano zerada não quer dizer que compensou: só sai daqui pago em Contas a pagar
  }
  const chqValorBase = (q) => (q.aPagar > 0 ? q.aPagar : q.valor);
  const chqValor = (q) => { const s = chqSit(q); return s.c ? s.c.valor : chqValorBase(q); };
  function logQ(q, txt){ (q.log = q.log || []).push({ txt, em: agora(), por: S.user }); }
  function ensureCheques(){
    if (S.cheques) return;
    S.cheques = CHQ_SEED.map(([data, numero, desc, valor, aPagar, grupo], i) => { const [cat, sub] = chqCatDe(desc); return { id: 'cq' + (i + 1), data, numero, desc, valor, aPagar, grupo, cat, sub, contaId: null, log: [{ txt: 'Cadastrado a partir da planilha PARCELAMENTOS E FINANCIAMENTOS', em: agora(), por: 'Planilha' }] }; });
  }
  function enviarCheque(q, anchor){
    const sit = chqSit(q); if (sit.k !== 'aberto') return;
    openCal(anchor, { commit: true, value: q.data >= HOJE ? q.data : HOJE, onPick: (d) => act('Cheque ' + (q.numero ? 'nº ' + q.numero + ' ' : '') + '(' + q.desc + ') enviado para Contas a pagar em ' + dm(d) + '.', () => {
      const c = C(d, 'Cheque ' + (q.numero ? 'nº ' + q.numero + ' · ' : '') + q.desc, q.cat, q.sub, chqValorBase(q), { id: novoIdP('c'), hist: [], chqId: q.id });
      logC(c, 'Criada a partir do cheque ' + (q.numero ? 'nº ' + q.numero : '') + ' (Parcelamentos › Cheques)');
      S.contas.push(c); q.contaId = c.id; logQ(q, 'Enviado para Contas a pagar em ' + dmy(d));
    }) });
  }
  function chequesHTML(){
    const L = S.cheques || [];
    let h = '<section class="panel" id="chqSec"><div class="ph"><h2>Cheques</h2><span style="color:var(--muted);font-size:14px;flex:1">Cheques emitidos. Envie para Contas a pagar escolhendo o dia em que ele vai compensar; quando for pago lá, aparece como pago aqui.</span><button type="button" class="btn sm y" id="cqNew">+ Novo cheque</button></div>';
    if (!L.length) return h + '<p class="pempty">Nenhum cheque cadastrado.</p></section>';
    h += '<div class="pscroll"><table class="ptab pchq"><thead><tr><th>Data</th><th>Cheque</th><th>Descrição</th><th class="r">Valor total a pagar</th><th class="r">' + HOJE.slice(0, 4) + '</th><th>Situação</th></tr></thead><tbody>';
    const grupos = [...new Set(L.map((q) => q.grupo || 'Outros'))];
    let tv = 0, ta = 0;
    grupos.forEach((g) => {
      const gs = L.filter((q) => (q.grupo || 'Outros') === g);
      gs.forEach((q) => {
        const s = chqSit(q);
        const sit = s.k === 'aberto' ? '<button type="button" class="btn sm pri" data-chqenv="' + q.id + '">Enviar para Contas a pagar</button>'
          : s.k === 'enviado' ? '<span class="chip c-sent">Em Contas a pagar · ' + dm(s.c.data) + '</span> <button type="button" class="lnk" data-gopay="' + s.c.id + '">Ver ›</button>'
          : s.k === 'pago' ? '<span class="chip c-paid">✓ Pago ' + dm(s.c.pagoEm || s.c.data) + '</span> <button type="button" class="lnk" data-gopay="' + s.c.id + '">Ver ›</button>'
          : '<span class="chip c-paid">✓ Compensado</span>';
        h += '<tr data-qid="' + q.id + '"><td class="num">' + dmy(q.data) + '</td><td class="num">' + esc(q.numero || '—') + '</td><td>' + esc(q.desc) + '</td><td class="r num">' + num(q.valor) + '</td><td class="r num">' + (q.aPagar ? num(q.aPagar) : '<span class="z">0,00</span>') + '</td><td>' + sit + '</td></tr>';
      });
      const sv = gs.reduce((a, q) => a + q.valor, 0), sa = gs.reduce((a, q) => a + (q.aPagar || 0), 0); tv += sv; ta += sa;
      h += '<tr class="pst"><td colspan="3">' + esc(g) + '</td><td class="r num">' + num(sv) + '</td><td class="r num">' + num(sa) + '</td><td></td></tr>';
    });
    return h + '<tr class="pst ptotg"><td colspan="3">Total de cheques</td><td class="r num">' + num(tv) + '</td><td class="r num">' + num(ta) + '</td><td></td></tr></tbody></table></div></section>';
  }
  function chqModalHTML(){
    const fld = (lab, ctl) => '<label class="ff"><span>' + lab + '</span>' + ctl + '</label>';
    const f = view.qf, novo = view.modal === 'chqnew', q = novo ? null : qById(view.qid);
    if (!novo && !q) { view.modal = null; return ''; }
    const s = q ? chqSit(q) : { k: 'aberto' };
    const grupos = [...new Set((S.cheques || []).map((x) => x.grupo).filter(Boolean))];
    const tl = q ? '<ol class="tl">' + (q.log || []).slice().reverse().map((x, k, arr) => '<li class="' + (/^Obs: /.test(x.txt) ? 'n' : /^Enviado/.test(x.txt) ? 'g' : 'e') + (k === arr.length - 1 ? ' last' : '') + '">' + (/^Obs: /.test(x.txt) ? '<span class="tln">' + esc(x.txt.slice(5)) + '</span>' : '<b>' + esc(x.txt) + '</b>') + '<small>' + quando(x.em) + (x.por ? ' por <span class="who">' + esc(x.por) + '</span>' : '') + '</small></li>').join('') + '</ol>' : '';
    const campos = fld('Data', '<input type="date" id="cqData" value="' + esc(f.data) + '">') +
      fld('Cheque nº', '<input id="cqNum" value="' + esc(f.numero) + '" inputmode="numeric" autocomplete="off">') +
      fld('Descrição', '<input id="cqDesc" value="' + esc(f.desc) + '" placeholder="Ex.: ICMS, GPS FEVEREIRO" autocomplete="off">') +
      fld('Categoria', '<select id="cqCat">' + catOpts(f.cat) + '</select>') +
      fld('Subcategoria', '<select id="cqSub">' + subOpts(f.cat, f.sub) + '</select>') +
      fld('Valor total a pagar', '<input id="cqVal" class="val" value="' + esc(f.valor) + '" inputmode="decimal">') +
      fld('A pagar em ' + HOJE.slice(0, 4), '<input id="cqAp" class="val" value="' + esc(f.aPagar) + '" inputmode="decimal" placeholder="0,00">') +
      fld('Grupo', '<input id="cqGrp" data-cbx="cqGrpList" data-novo="1" value="' + esc(f.grupo) + '" autocomplete="off"><datalist id="cqGrpList">' + grupos.map((g) => '<option value="' + esc(g) + '">').join('') + '</datalist>') +
      fld('Observação', '<textarea id="cqObs" rows="3" placeholder="Escreva uma observação. Ao salvar, ela entra na linha do tempo com seu nome.">' + esc(f.obs || '') + '</textarea>') +
      (s.c ? '<p class="enote">Este cheque está em Contas a pagar em ' + dmy(s.c.data) + (s.c.pago ? ', pago em ' + dmy(s.c.pagoEm || s.c.data) : '') + '. Mudanças aqui não alteram a conta. <button type="button" class="lnk" data-gopay="' + s.c.id + '">Ver em Contas a pagar ›</button></p>' : '');
    const xBtn = '<button type="button" class="mx" data-modal-close aria-label="Fechar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    return '<div class="modal-bg" data-modal-bg><div class="modal' + (novo ? '' : ' wide') + '" role="dialog" aria-modal="true" aria-labelledby="mt"' + (novo ? ' style="width:min(620px,100%)"' : '') + '><div class="mh"><h2 id="mt">' + (novo ? 'Novo cheque' : 'Cheque ' + esc(q.numero ? 'nº ' + q.numero : '') + ' · ' + esc(q.desc)) + '</h2>' + xBtn + '</div><div class="ebody">' +
      (novo ? '<div class="fbody">' + campos + '</div>' : '<div class="egrid"><div class="fbody">' + campos + '</div><div class="tlbox"><h3>Linha do tempo</h3><div class="tlscroll">' + tl + '</div>' + (s.k === 'aberto' ? '<button type="button" class="btn pri big" data-chqenv="' + q.id + '">Enviar para Contas a pagar</button>' : '') + '</div></div>') + '</div>' +
      '<div class="efoot"><span id="modalErr" class="err" role="alert"></span><div class="fact">' +
      (novo ? '' : view.cqDel ? '<span style="font-size:13px;color:var(--danger-ink)">Excluir de vez?' + (s.k === 'enviado' ? ' A conta em Contas a pagar também sai.' : '') + '</span><button type="button" class="btn del" id="cqDelOk">Sim, excluir</button><button type="button" class="btn" id="cqDelNo">Não</button>' : '<button type="button" class="btn del ghost" id="cqDel"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>Excluir</button>') +
      '<span class="grow"></span><button type="button" class="btn y" id="cqSave">' + (novo ? 'Adicionar' : 'Salvar') + '</button></div></div></div></div>';
  }
  function lerQF(){
    const g = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    return { data: g('cqData'), numero: g('cqNum').trim(), desc: g('cqDesc').trim(), cat: g('cqCat'), sub: g('cqSub'), valor: g('cqVal'), aPagar: g('cqAp'), grupo: g('cqGrp').trim(), obs: g('cqObs').trim() };
  }
  function salvarCheque(){
    const f = lerQF(), err = document.getElementById('modalErr'), v = parseVal(f.valor), ap = f.aPagar === '' ? 0 : parseVal(f.aPagar);
    if (!f.data) { err.textContent = 'Escolha a data do cheque.'; return; }
    if (!f.desc) { err.textContent = 'Escreva a descrição.'; return; }
    if (!(v > 0)) { err.textContent = 'Informe o valor do cheque.'; return; }
    if (isNaN(ap) || ap < 0) { err.textContent = 'O valor a pagar não está certo.'; return; }
    const dados = { data: f.data, numero: f.numero, desc: f.desc, cat: f.cat, sub: f.sub, valor: v, aPagar: ap, grupo: f.grupo || 'Outros' };
    if (view.modal === 'chqnew') {
      act('Cheque ' + (f.numero ? 'nº ' + f.numero + ' ' : '') + '(' + f.desc + ') cadastrado.', () => { const q = Object.assign({ id: novoIdP('cq'), contaId: null, log: [] }, dados); logQ(q, 'Cadastrado'); if (f.obs) logQ(q, 'Obs: ' + f.obs); (S.cheques = S.cheques || []).push(q); });
    } else {
      const q = qById(view.qid); if (!q) return;
      const mud = Object.keys(dados).filter((k) => String(dados[k]) !== String(q[k] == null ? '' : q[k]));
      if (!mud.length && !f.obs) { view.modal = null; render(); return; }
      act('Cheque ' + (f.numero ? 'nº ' + f.numero + ' ' : '') + 'atualizado.', () => { Object.assign(q, dados); if (mud.length) logQ(q, 'Alterado: ' + mud.map((k) => ({ data: 'data', numero: 'nº', desc: 'descrição', cat: 'categoria', sub: 'subcategoria', valor: 'valor', aPagar: 'a pagar', grupo: 'grupo' }[k])).join(', ')); if (f.obs) logQ(q, 'Obs: ' + f.obs); });
    }
    view.modal = null; render();
  }
  function openCheque(q){ view.modal = 'chqedit'; view.qid = q.id; view.cqDel = false; view.qf = { data: q.data, numero: q.numero || '', desc: q.desc, cat: q.cat || '', sub: q.sub || '', valor: num(q.valor), aPagar: num(q.aPagar || 0), grupo: q.grupo || '', obs: '' }; if (cal) closeCal(); render(); }
  document.addEventListener('change', (e) => {
    if (!/^chq(new|edit)$/.test(view.modal || '')) return;
    if (e.target.id === 'cqCat') { const keep = lerQF(); view.qf = Object.assign(keep, { cat: e.target.value, sub: (LISTAS[e.target.value] || [])[0] || '' }); render(); }
  });
  document.addEventListener('click', (e) => {
    const t = e.target;
    const env = t.closest('[data-chqenv]'); if (env) { const q = qById(env.dataset.chqenv); if (q) { if (view.modal) { view.modal = null; render(); const b = document.querySelector('#app [data-chqenv="' + q.id + '"]'); enviarCheque(q, b || env); } else enviarCheque(q, env); } return; }
    if (t.id === 'cqNew') { view.modal = 'chqnew'; view.cqDel = false; view.qf = { data: HOJE, numero: '', desc: '', cat: '', sub: '', valor: '', aPagar: '', grupo: 'Cheques de ' + mesNome(CUR), obs: '' }; render(); const f = document.getElementById('cqNum'); if (f) f.focus(); return; }
    if (t.id === 'cqSave') { salvarCheque(); return; }
    if (t.id === 'cqDel') { view.cqDel = true; render(); return; }
    if (t.id === 'cqDelNo') { view.cqDel = false; render(); return; }
    if (t.id === 'cqDelOk') { const q = qById(view.qid); if (q) { const s = chqSit(q); act('Cheque ' + (q.numero ? 'nº ' + q.numero + ' ' : '') + 'excluído.', () => { if (s.k === 'enviado') S.contas = S.contas.filter((c) => c.id !== s.c.id); S.cheques = S.cheques.filter((x) => x.id !== q.id); }); view.modal = null; render(); } return; }
    if (t.closest('button, a, input, select, textarea, label')) return;
    const row = t.closest('#app tr[data-qid]'); if (row) { const q = qById(row.dataset.qid); if (q) openCheque(q); }
  });


  // ---------- DRE lançamentos: editar e excluir ----------
  // Clique num lançamento abre o formulário. Salvar registra o que mudou (de → para) na linha do tempo do lançamento
  // e no log; Excluir pede confirmação. Despesa ligada a uma conta paga: ao excluir, a conta volta para "Pagos em
  // Contas a pagar" (falta lançar na DRE).
  const lancById = (k, id) => (k === 'sai' ? S.saidas : S.entradas).find((x) => x.id === id);
  const LANC_CAMPOS = { sai: [['data', 'data'], ['cat', 'categoria'], ['sub', 'subcategoria'], ['emp', 'empresa'], ['valor', 'valor'], ['forn', 'fornecedor'], ['obs', 'observação']],
    ent: [['data', 'data'], ['cat', 'categoria'], ['cli', 'cliente'], ['nf', 'NF'], ['valor', 'valor'], ['obs', 'observação']] };
  function openLanc(k, id){ const x = lancById(k, id); if (!x) return; view.modal = 'lanc'; view.lk = k; view.lid = id; view.lDel = false; view.lf = Object.assign({}, x, { valor: num(x.valor) }); if (cal) closeCal(); render(); }
  function lancModalHTML(){
    const k = view.lk, x = lancById(k, view.lid); if (!x) { view.modal = null; return ''; }
    const f = view.lf, fld = (lab, ctl) => '<label class="ff"><span>' + lab + '</span>' + ctl + '</label>';
    const opt = (arr, v) => arr.map((o) => '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>').join('');
    const campos = k === 'sai'
      ? fld('Data', '<input type="date" id="lData" value="' + esc(f.data) + '">') +
        fld('Categoria', '<select id="lCat">' + catOpts(f.cat) + '</select>') +
        fld('Subcategoria', '<select id="lSub">' + subOpts(f.cat, f.sub) + '</select>') +
        fld('Empresa', '<select id="lEmp">' + opt(['MRBL/STOFFA', 'MRBL', 'STOFFA'], f.emp || 'MRBL') + '</select>') +
        fld('Valor', '<input id="lVal" class="val" value="' + esc(f.valor) + '" inputmode="decimal">') +
        fld('Fornecedor / descrição', '<input id="lForn" value="' + esc(f.forn || '') + '" autocomplete="off">') +
        fld('Observação', '<textarea id="lObs" rows="3">' + esc(f.obs || '') + '</textarea>')
      : fld('Data', '<input type="date" id="lData" value="' + esc(f.data) + '">') +
        fld('Categoria', '<select id="lCat">' + opt(ECATS, f.cat) + '</select>') +
        fld('Cliente', '<input id="lCli" data-cbx="cliList2" value="' + esc(f.cli || '') + '" autocomplete="off"><datalist id="cliList2">' + CLIENTES.map((c) => '<option value="' + esc(c) + '">').join('') + '</datalist>') +
        fld('NF', '<input id="lNf" value="' + esc(f.nf || '') + '">') +
        fld('Valor', '<input id="lVal" class="val" value="' + esc(f.valor) + '" inputmode="decimal">') +
        fld('Observação', '<textarea id="lObs" rows="3">' + esc(f.obs || '') + '</textarea>');
    const c = k === 'sai' && x.contaId ? byId(x.contaId) : null;
    const nota = c ? '<p class="enote">Ligada à conta <b>' + esc(c.forn) + '</b> (' + money(c.valor) + (c.pago ? ', paga ' + dm(c.pagoEm || c.data) : '') + '). Editar aqui não muda a conta. <button type="button" class="lnk" data-gopay="' + c.id + '">Ver em Contas a pagar ›</button></p>' : '';
    const log = (x.log || []).slice().reverse();
    const tl = '<ol class="tl">' + (log.length ? log.map((l, i) => '<li class="e' + (i === log.length - 1 ? ' last' : '') + '"><b>' + esc(l.txt) + '</b><small>' + quando(l.em) + (l.por ? ' por <span class="who">' + esc(l.por) + '</span>' : '') + '</small></li>').join('') : '<li class="o last"><b>Lançado' + (x.resp ? ' por ' + esc(x.resp) : '') + '</b><small>' + (x.criadoEm ? quando(x.criadoEm) : 'sem alterações desde então') + '</small></li>') + '</ol>';
    const xBtn = '<button type="button" class="mx" data-modal-close aria-label="Fechar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    return '<div class="modal-bg" data-modal-bg><div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="mh"><h2 id="mt">' + (k === 'sai' ? 'Despesa' : 'Entrada') + ' · ' + esc(k === 'sai' ? (x.forn || x.sub || x.cat) : (x.cli || x.cat)) + ' · ' + money(x.valor) + '</h2>' + xBtn + '</div>' +
      '<div class="ebody"><div class="egrid"><div class="fbody">' + campos + nota + '</div><div class="tlbox"><h3>Linha do tempo</h3><div class="tlscroll">' + tl + '</div></div></div></div>' +
      '<div class="efoot"><span id="modalErr" class="err" role="alert"></span><div class="fact">' +
      (view.lDel ? '<span style="font-size:13px;color:var(--danger-ink)">Deseja mesmo excluir este lançamento de ' + money(x.valor) + '? Ele sai da DRE.' + (c ? ' A conta volta para "Pagos em Contas a pagar".' : '') + '</span><button type="button" class="btn del" id="lDelOk">Sim, excluir</button><button type="button" class="btn" id="lDelNo">Não</button>'
        : '<button type="button" class="btn del ghost" id="lDel"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>Excluir</button>') +
      '<span class="grow"></span><button type="button" class="btn y" id="lSave">Salvar</button></div></div></div></div>';
  }
  const LMAP = { lData: 'data', lCat: 'cat', lSub: 'sub', lEmp: 'emp', lVal: 'valor', lForn: 'forn', lCli: 'cli', lNf: 'nf', lObs: 'obs' };
  document.addEventListener('input', (e) => { if (view.modal === 'lanc' && LMAP[e.target.id]) view.lf[LMAP[e.target.id]] = e.target.value; });
  document.addEventListener('change', (e) => {
    if (view.modal !== 'lanc' || !LMAP[e.target.id]) return;
    view.lf[LMAP[e.target.id]] = e.target.value;
    if (e.target.id === 'lCat' && view.lk === 'sai') { view.lf.sub = (LISTAS[e.target.value] || [''])[0] || ''; render(); }
  });
  function salvarLanc(){
    const k = view.lk, x = lancById(k, view.lid), f = view.lf, err = document.getElementById('modalErr'); if (!x) return;
    const v = parseVal(f.valor);
    if (!f.data) { err.textContent = 'Escolha a data.'; return; }
    if (isNaN(v) || v <= 0) { err.textContent = 'Valor inválido. Use o formato 1.234,56.'; return; }
    const novo = Object.assign({}, f, { valor: v, forn: (f.forn || '').trim(), cli: (f.cli || '').trim(), nf: (f.nf || '').trim(), obs: (f.obs || '').trim() });
    const fmt = (c, val) => c === 'valor' ? money(+val || 0) : c === 'data' ? dmy(val) : (val || '—');
    const mud = LANC_CAMPOS[k].filter(([c]) => String(x[c] == null ? '' : x[c]) !== String(novo[c] == null ? '' : novo[c])).map(([c, nome]) => [c, nome + ': ' + fmt(c, x[c]) + ' → ' + fmt(c, novo[c])]);
    if (!mud.length) { view.modal = null; render(); return; }
    const quem = k === 'sai' ? (x.forn || x.sub || x.cat) : (x.cli || x.cat);
    act((k === 'sai' ? 'Despesa' : 'Entrada') + ' ' + quem + ' de ' + dm(x.data) + ' alterada: ' + mud.map((m) => m[1]).join('; ') + '.', () => {
      mud.forEach(([c]) => { x[c] = novo[c]; });
      (x.log = x.log || []).push({ txt: 'Alterado: ' + mud.map((m) => m[1]).join('; '), em: agora(), por: S.user });
    });
    view.modal = null; render();
  }
  function excluirLanc(){
    const k = view.lk, x = lancById(k, view.lid); if (!x) return;
    const quem = k === 'sai' ? (x.forn || x.sub || x.cat) : (x.cli || x.cat);
    act((k === 'sai' ? 'Despesa' : 'Entrada') + ' excluída: ' + quem + ' de ' + dmy(x.data) + ', ' + money(x.valor) + ' (' + x.cat + (x.sub ? ' · ' + x.sub : '') + ').', () => {
      if (k === 'sai') {
        S.contas.forEach((c) => { if (c.dreId === x.id || c.id === x.contaId) { c.dreId = null; c.dreSkip = false; logC(c, 'Lançamento na DRE excluído (' + money(x.valor) + '); conta volta para "falta lançar na DRE"'); } });
        S.saidas = S.saidas.filter((s) => s.id !== x.id);
      } else S.entradas = S.entradas.filter((s) => s.id !== x.id);
    });
    view.modal = null; render();
  }
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (view.modal === 'lanc') {
      if (t.id === 'lSave') { salvarLanc(); return; }
      if (t.closest('#lDel')) { view.lDel = true; render(); return; }
      if (t.id === 'lDelNo') { view.lDel = false; render(); return; }
      if (t.id === 'lDelOk') { excluirLanc(); return; }
      return;
    }
    if (t.closest('button, a, input, select, textarea, label')) return;
    const row = t.closest('#app tr[data-lanc]'); if (row) { const [k, id] = row.dataset.lanc.split(':'); openLanc(k, id); }
  });

  function render(){
    const y0 = window.scrollY;
    let el0 = anchorSel ? document.querySelector(anchorSel) : null;
    const top0 = el0 ? el0.getBoundingClientRect().top : null;
    try { renderCore(); }
    catch (err) {
      console.error(err);
      document.getElementById('app').innerHTML = '<div class="today"><h1>' + esc(({ pagar: 'Contas a pagar', of: 'Oficinas', parc: 'Parcelamentos', pr: 'Prorrogadas', rel: 'Relatório', dre: 'DRE', drel: 'DRE lançamentos', cfg: 'Configurações' })[view.tela] || '') + '</h1></div><section class="panel" style="padding:18px;border-color:var(--danger)"><b style="color:var(--danger-ink)">Esta tela não abriu.</b><p style="margin:6px 0;color:var(--muted);font-size:14px">Recarregue a página. Se continuar, mande um print desta mensagem para o Lucca. Detalhe técnico: <code>' + esc(String(err && err.message || err)) + '</code></p><button type="button" class="btn" onclick="location.reload()">Recarregar</button></section>';
    }
    { const tt = document.getElementById('topTitle'); const td = document.querySelector('#app > .today'); tt.innerHTML = ''; if (td) tt.appendChild(td); }
    document.getElementById('modalHost').innerHTML = modalHTML();
    const el1 = anchorSel ? document.querySelector(anchorSel) : null;
    if (el1 && top0 != null) window.scrollBy(0, el1.getBoundingClientRect().top - top0);
    else window.scrollTo(0, y0);
  }
  function renderCore(){
    document.querySelectorAll('[data-tela]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tela === view.tela)));
    document.getElementById('btnNew').textContent = view.tela === 'of' ? '+ Nova entrega' : view.tela === 'parc' ? '+ Novo parcelamento' : '+ Nova conta';
    { const gs = document.getElementById('gSearch'); if (gs) gs.placeholder = view.tela === 'of' ? 'Buscar oficina' : 'Buscar fornecedor ou categoria'; }
    { const ub = document.getElementById('userBox'); if (ub) ub.innerHTML = 'Conectado como<span class="ub-name">' + esc(S.user) + '</span><button type="button" class="ub-out" id="btnSair">Sair</button>'; }
    document.getElementById('btnNew').hidden = ['pr','rel','dre','drel','cfg'].includes(view.tela);
    document.getElementById('btnPdf').hidden = view.tela !== 'rel';
    document.getElementById('btnXls').hidden = view.tela !== 'dre' && view.tela !== 'drel';
    if (view.tela === 'parc') return renderParc();
    if (view.tela === 'of') return renderOf();
    if (view.tela === 'pr') return renderPr();
    if (view.tela === 'rel') return renderRel();
    if (view.tela === 'dre') return renderDre();
    if (view.tela === 'drel') return renderDrel();
    if (view.tela === 'cfg') return renderCfg();
    const app = document.getElementById('app');
    const late = S.contas.filter(isLate).sort((a,b) => a.data.localeCompare(b.data));
    const hoje = S.contas.filter((c) => c.data === HOJE && !c.pago);
    const prorHoje = hoje.filter(isPror);
    let h = '';

    h += '<section class="today"><h1>Hoje, ' + DIAS[TODAY.getDay()] + ', ' + pad(TODAY.getDate()) + '/' + pad(TODAY.getMonth()+1) + '</h1>' +
      '<span class="sub">A pagar hoje <b class="num">' + money(sum(hoje)) + '</b> · ' + hoje.length + (hoje.length === 1 ? ' conta' : ' contas') +
      (prorHoje.length ? ' · ' + prorHoje.length + ' prorrogada' + (prorHoje.length > 1 ? 's' : '') + ' para hoje' : '') + '</span>' +
      (late.length ? '' : '<span class="allok">✓ Nada vencido</span>') + '</section>';

    let vencH = '';
    if (late.length) {
      vencH += '<section class="panel venc" aria-labelledby="vh"><div class="ph"><h2 id="vh">Vencidas · ' + late.length + '</h2><span class="num" style="color:var(--danger-ink);font-weight:600">' + money(sum(late)) + '</span></div>';
      vencH += '<div style="padding:0 12px 8px;color:var(--muted);font-size:13px">Sem pagamento e sem nova data. Pague ou prorrogue cada uma.</div>';
      late.forEach((c) => {
        const paying = view.paying === c.id && view.payWhere === 'top';
        vencH += '<div class="venc-row clk" data-id="' + c.id + '">' +
          '<div class="who"><button type="button" class="rowopen" data-edit="' + c.id + '"><b>' + esc(c.forn) + '</b></button><span>Venceu ' + dm(c.data) + (isPror(c) ? ' · já prorrogada ' + nPror(c) + 'x' : '') + ' · ' + (c.cat ? esc(c.cat) : 'sem categoria') + '</span></div>' +
          '<div class="num" style="text-align:right;font-weight:600">' + num(c.valor) + '</div>' +
          '<div class="acts">' + (paying
            ? '<span style="font-size:13px">Pago em</span><input type="date" class="mini" id="payDate" value="' + HOJE + '" max="' + HOJE + '" aria-label="Data do pagamento"><button type="button" class="btn sm pri" data-a="payOk">Confirmar</button><button type="button" class="btn sm" data-a="cancel">✕</button>'
            : '<button type="button" class="btn sm pri" data-a="pay">Pagar</button><button type="button" class="btn sm" data-a="prorPick">Prorrogar</button>') +
          '</div></div>';
      });
      vencH += '</section>';
    } else vencH = '<section class="panel" style="padding:16px"><span class="allok">✓ Nada vencido</span><p style="margin:6px 0 0;color:var(--muted);font-size:13px">Toda conta que passar da data sem pagamento aparece aqui.</p></section>';

    // mês + gráfico
    const mk = monthOfWeek(view.week);
    const [yy, mm] = mk.split('-').map(Number);
    const weeks = weeksOfMonth(mk);
    const mRows = S.contas.filter((c) => weeks.some((w) => inWeek(c, w)));
    const mPago = sum(mRows.filter((c) => c.pago)), mAberto = sum(mRows.filter((c) => !c.pago));
    const saldoPrev = prevSaldo(mk);
    const data = weeks.map((w) => {
      const r = S.contas.filter((c) => inWeek(c, w));
      return { w, paid: sum(r.filter((c) => c.pago)), late: sum(r.filter(isLate)), pror: sum(r.filter((c) => !c.pago && !isLate(c) && isPror(c))), open: sum(r.filter((c) => !c.pago && !isLate(c) && !isPror(c))) };
    });
    // a previsão ainda não lançada vai para as semanas que ainda não acabaram, em partes iguais
    const futuras = data.filter((d) => iso(addDays(parse(d.w), 6)) >= HOJE);
    data.forEach((d) => { d.prev = futuras.includes(d) ? saldoPrev / futuras.length : 0; });
    const max = Math.max(1, ...data.map((d) => d.paid + d.late + d.pror + d.open + d.prev));
    const H = 115;
    const px = (v) => v > 0 ? Math.max(3, v / max * H).toFixed(1) + 'px' : '0';
    h += '<section class="panel" aria-labelledby="mh"><div class="month-head">' +
      '<div class="mnav"><button type="button" class="nav" data-mnav="-1" aria-label="Mês anterior">‹</button><h2 id="mh">' + MESES[mm-1].replace(/^./, (x) => x.toUpperCase()) + ' de ' + yy + '</h2><button type="button" class="nav" data-mnav="1" aria-label="Próximo mês">›</button></div>' +
      '<div class="stats">' +
        '<div class="stat"><span class="lbl">Total do mês</span><b class="num">' + money(mPago + mAberto) + '</b></div>' +
        '<div class="stat"><span class="lbl">Pago</span><b class="num">' + money(mPago) + '</b></div>' +
        '<div class="stat"><span class="lbl">A pagar</span><b class="num">' + money(mAberto) + '</b></div>' +
        '<div class="stat"><span class="lbl">Previsão a lançar</span><b class="num">' + money(saldoPrev) + '</b></div>' +
        (() => { const fr = S.contas.filter((c) => isPror(c) && origOf(c).slice(0,7) === mk && (c.pago ? (c.pagoEm || c.data) : c.data).slice(0,7) > mk); return '<button type="button" class="stat" data-prlink="' + mk + '" style="background:var(--warn-soft);border:0;border-radius:8px;padding:4px 10px;text-align:left;cursor:pointer;color:var(--ink)" title="Venceria neste mês e foi prorrogado para depois"><span class="lbl" style="color:var(--warn-ink)">Prorrogado para frente ›</span><b class="num">' + money(sum(fr)) + '</b></button>'; })() +
        (() => { const prev = S.contas.filter((c) => (isPror(c) || isLate(c)) && origOf(c).slice(0,7) < mk && (isLate(c) || c.data.slice(0,7) === mk)); const pm = (() => { const d = new Date(yy, mm-2, 1); return d.getFullYear() + '-' + pad(d.getMonth()+1); })(); return '<button type="button" class="stat" data-prlink="' + pm + '" style="background:var(--warn-soft);border:0;border-radius:8px;padding:4px 10px;text-align:left;cursor:pointer;color:var(--ink)" title="Ver o que venceu antes e caiu neste mês"><span class="lbl" style="color:var(--warn-ink)">Vindo de meses anteriores ›</span><b class="num">' + money(sum(prev)) + '</b></button>'; })() +
      '</div></div>';
    h += '<div class="chart" role="group" aria-label="Valores por semana">';
    data.forEach((d) => {
      const tot = d.paid + d.late + d.pror + d.open;
      h += '<button type="button" class="bar" data-week="' + d.w + '" aria-pressed="' + (d.w === view.week) + '" aria-label="Semana de ' + weekLabel(d.w) + ': ' + money(tot) + ' em contas' + (d.prev ? ' e ' + money(d.prev) + ' de previsão' : '') + '" title="Pago ' + money(d.paid) + ' · A pagar ' + money(d.open + d.pror + d.late) + (d.pror ? ' (prorrogado ' + money(d.pror) + ')' : '') + (d.prev ? ' · Previsão ' + money(d.prev) : '') + '">' +
        '<span class="val num">' + (tot + d.prev ? short(tot + d.prev) : '—') + '</span><span class="stack">' +
        '<span class="s-prev" style="height:' + px(d.prev) + '"></span>' +
        '<span class="s-open" style="height:' + px(d.open) + '"></span>' +
        '<span class="s-pror" style="height:' + px(d.pror) + '"></span>' +
        '<span class="s-late" style="height:' + px(d.late) + '"></span>' +
        '<span class="s-paid" style="height:' + px(d.paid) + '"></span></span></button>';
    });
    h += '</div><div class="xlabels">' + data.map((d) => '<span class="' + (d.w === view.week ? 'on' : '') + '">' + weekLabel(d.w) + '</span>').join('') + '</div>';
    h += '<div class="legend"><span><i style="background:var(--blue)"></i>Pago</span><span><i style="border:1.5px solid var(--blue)"></i>A pagar</span><span><i style="background:var(--yellow)"></i>Prorrogado</span><span><i style="background:var(--danger)"></i>Vencido</span><span><i style="background:repeating-linear-gradient(135deg,var(--blue-2) 0 2px,transparent 2px 6px);border:1.5px dashed var(--blue)"></i>Previsão ainda não lançada, dividida pelas semanas que faltam</span><span>Clique numa barra para abrir a semana.</span></div></section>';

    // layout: mês em cima (largura total); vencidas à esquerda e semana à direita; previsões embaixo (scroll único)
    h += '<div class="cols"><aside class="vcol">' + vencH + '</aside><div class="wcol">';
    // semana
    const rows = S.contas.filter((c) => inWeek(c, view.week)).sort((a,b) => a.data.localeCompare(b.data) || a.forn.localeCompare(b.forn));
    const aberto = rows.filter((c) => !c.pago), pagas = rows.filter((c) => c.pago), npr = aberto.filter(isPror).length;
    h += '<section class="panel" aria-labelledby="wh"><div class="ph"><div class="mnav"><button type="button" class="nav" data-wnav="-1" aria-label="Semana anterior">‹</button><h2 id="wh" style="min-width:210px;text-align:center">Semana ' + weekLabel(view.week) + '</h2><button type="button" class="nav" data-wnav="1" aria-label="Próxima semana">›</button>' +
      (view.week !== iso(monday(TODAY)) ? '<button type="button" class="btn sm" data-wnav="0">Voltar para esta semana</button>' : '') + '</div>' +
      '<div class="stats"><div class="stat"><span class="lbl">A pagar</span><b class="num">' + money(sum(aberto)) + '</b></div><div class="stat"><span class="lbl">Pago</span><b class="num">' + money(sum(pagas)) + '</b></div><div class="stat"><span class="lbl">Contas</span><b class="num">' + rows.length + (npr ? ' · ' + npr + ' prorrogada' + (npr > 1 ? 's' : '') : '') + '</b></div></div></div>';
    h += '<div class="scroll"><table><thead><tr><th style="width:124px">Data</th><th style="min-width:220px">Fornecedor / descrição</th><th style="width:270px">Categoria / subcategoria</th><th class="r" style="width:116px">Valor</th><th style="width:140px">Situação</th><th class="r" style="width:190px"></th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="6" class="empty">Nenhuma conta nesta semana. Use + Nova conta para lançar.</td></tr>';
    let lastDay = null;
    rows.forEach((c) => {
      if (c.data !== lastDay) {
        lastDay = c.data;
        const d = parse(c.data);
        h += '<tr class="dayhead' + (c.data === HOJE ? ' istoday' : '') + '"><td colspan="6">' + DIAS[d.getDay()] + ', ' + dm(c.data) + (c.data === HOJE ? ' · hoje' : '') + '<span class="s">a pagar ' + money(sum(rows.filter((x) => x.data === c.data && !x.pago))) + ' · pago ' + money(sum(rows.filter((x) => x.data === c.data && x.pago))) + '</span></td></tr>';
      }
      if (view.paying === c.id && view.payWhere !== 'top') {
        h += '<tr class="confirm" data-id="' + c.id + '"><td colspan="6"><div class="cbox"><span>Pagar ' + esc(c.forn) + ' · ' + money(c.valor) + '</span>Pago em <input type="date" class="mini" id="payDate" value="' + (c.data <= HOJE ? c.data : HOJE) + '" max="' + HOJE + '" aria-label="Data do pagamento"><button type="button" class="btn sm pri" data-a="payOk">Confirmar pagamento</button><button type="button" class="btn sm" data-a="cancel">Cancelar</button></div></td></tr>';
        return;
      }
      if (view.proring === c.id) {
        h += '<tr class="confirm" data-id="' + c.id + '"><td colspan="6"><div class="cbox"><span>Prorrogar ' + esc(c.forn) + ' · ' + money(c.valor) + '<small style="display:block;font-weight:400;color:var(--muted)">' + esc(histText(c)) + '</small></span>Nova data <input type="date" class="mini" id="prorNew" min="' + HOJE + '" value="' + iso(addDays(parse(c.data > HOJE ? c.data : HOJE), 1)) + '" aria-label="Nova data de pagamento"><button type="button" class="btn sm pri" data-a="prorOk">Confirmar nova data</button><button type="button" class="btn sm" data-a="cancel">Cancelar</button></div></td></tr>';
        return;
      }
      if (view.removing === c.id) {
        h += '<tr class="confirm rm" data-id="' + c.id + '"><td colspan="6"><div class="cbox"><span>Remover ' + esc(c.forn) + ' · ' + money(c.valor) + '? Use só se foi lançada errado. Para pagar em outra data, mude a data.</span><button type="button" class="btn sm del" data-a="delOk">Remover</button><button type="button" class="btn sm" data-a="cancel">Cancelar</button></div></td></tr>';
        return;
      }
      let chip;
      if (c.pago) chip = '<span class="chip c-paid">✓ Pago' + (c.pagoEm && c.pagoEm < origOf(c) ? ' antecipado' : '') + ' ' + dm(c.pagoEm || c.data) + '</span>' + (c.dreId ? '<small style="display:block;color:var(--ok-ink);font-size:12px">lançado na DRE</small>' : '<small style="display:block;color:var(--warn-ink);font-size:12px;font-weight:700">falta lançar na DRE</small>');
      else if (isLate(c)) chip = '<span class="chip c-late">Vencida</span>';
      else if (isAnt(c)) chip = '<span class="chip c-ant">Antecipada de ' + dm(c.orig) + '</span>';
      else if (isPror(c)) chip = '<button type="button" class="chip c-pror" data-a="hist" style="border:0;cursor:pointer" title="Ver histórico de datas" aria-expanded="' + (view.histOpen === c.id) + '">Prorrogada de ' + dm(c.orig) + (nPror(c) > 1 ? ' · ' + nPror(c) + 'x' : '') + ' ▾</button>';
      else chip = '<span class="chip c-open">A pagar</span>';
      h += '<tr data-id="' + c.id + '" class="clk' + (c.pago ? ' paid' : '') + '">' +
        '<td class="ro num">' + dm(c.data) + '</td>' +
        '<td class="ro"><button type="button" class="rowopen" data-edit="' + c.id + '" title="Abrir para editar">' + esc(c.forn) + '</button></td>' +
        '<td class="ro"><span class="cat1">' + (c.cat ? esc(c.cat) : '<i style="color:var(--muted)">sem categoria</i>') + '</span><span class="cat2">' + esc(c.sub || '') + '</span></td>' +
        '<td class="ro num r">' + num(c.valor) + '</td>' +
        '<td>' + chip + (c.estim && !c.pago ? '<small style="display:block;color:var(--muted);font-size:12px;line-height:16px">valor estimado</small>' : '') + (isOf(c) && (c.recebidoEm || c.entrega) ? '<small style="display:block;color:var(--muted);font-size:12px;line-height:16px">' + (c.recebidoEm ? 'chegou ' + dm(c.recebidoEm) : 'entrega ' + dm(c.entrega)) + '</small>' : '') + '</td>' +
        '<td><div class="rowacts">' + (c.pago
          ? '<button type="button" class="btn sm" data-a="unpay">Desfazer</button>'
          : '<button type="button" class="btn sm pri" data-a="pay">Pagar</button>' + (c.data <= HOJE ? '<button type="button" class="btn sm" data-a="prorPick">Prorrogar</button>' : '')) +
        '</div></td></tr>';
      if (view.histOpen === c.id) h += '<tr class="histrow"><td></td><td colspan="5" style="color:var(--warn-ink);font-size:14px;padding:6px 6px 10px">' + esc(histText(c)) + '</td></tr>';
    });
    const wEnd = iso(addDays(parse(view.week), 6));
    const defDate = HOJE >= view.week && HOJE <= wEnd ? HOJE : view.week;
    h += '</tbody></table></div><div class="hint"><span>Clique na linha para abrir a conta: lá você edita, paga, exclui e vê a linha do tempo das datas. Pagar, Desfazer e Prorrogar funcionam direto aqui.</span>' + (view.addErr ? '<span class="err" role="alert">' + esc(view.addErr) + '</span>' : '') + '</div></section>';
    h += '</div></div>';
    // previsões do mês
    const pv = prevsOf(mk);
    const inMonth = S.contas.filter((c) => c.data.slice(0,7) === mk);
    let totP = 0, totL = 0;
    h += '<section class="panel" aria-labelledby="pt"><div class="ph"><h2 id="pt">Previsões de ' + MESES[mm-1] + '</h2><span style="color:var(--muted);font-size:14px">Quanto já foi lançado de cada previsão do mês. <button type="button" class="lnk" data-gocfg="prev">Configurar previsões ›</button></span></div>' + (reviewPending() ? '<div class="rvnote">' + cap(mesNome(closedMk)) + ' fechou: há uma sugestão de previsões pela média para os próximos meses. <button type="button" class="btn sm y" data-gocfg="prev">Revisar</button></div>' : '') + '<div class="prev">';
    if (!pv.length) h += '<div class="pv"><span style="color:var(--muted)">Nenhuma previsão para ' + MESES[mm-1] + '. Crie em Configurações › Previsões.</span></div>';
    pv.forEach((p) => {
      const l = sum(inMonth.filter((c) => matchPrev(p, c))); totP += p.valor; totL += l;
      const over = l > p.valor, pct = p.valor ? Math.min(100, l / p.valor * 100) : 0;
      const pc = p.valor ? Math.round(l / p.valor * 100) : 0;
      h += '<div class="pv ro" data-pid="' + p.id + '"><div class="t"><b>' + esc(p.nome) + '</b><span class="pct num' + (over ? ' over' : '') + '">' + pc + '%</span></div>' +
        '<div class="pbar' + (over ? ' over' : '') + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
        '<div class="s"><span>Lançado <b class="num">' + num(l) + '</b> de <span class="num">' + num(p.valor) + '</span></span>' + (over ? '<span class="over">passou ' + num(l - p.valor) + '</span>' : '') + '</div></div>';
    });
    h += '</div>';

    if (pv.length) h += '<div class="hint"><span>Previsto <b class="num">' + money(totP) + '</b> · lançado <b class="num">' + money(totL) + '</b></span></div>';
    h += '</section>';

    h += '<div class="foot"><span id="copyOut"></span></div>';
    app.innerHTML = h;
  }

  function reviewHTML(){
    const rows = reviewRows(); if (!rows.length) return '';
    const rv = S.prevReview[closedMk] || {};
    const pend = rows.filter((r) => !rv[r.k]);
    const n = histMonths().length;
    if (!pend.length) return '<div class="rvdone">' + cap(mesNome(closedMk)) + ' fechado: previsões dos próximos meses revisadas com a média. <button type="button" class="lnk" data-rv="reopen">Rever</button></div>';
    let h = '<div class="rv" role="region" aria-label="Revisão das previsões"><div class="rvh"><div><b>' + cap(mesNome(closedMk)) + ' fechou. Atualizar as previsões futuras pela média?</b><small>Média dos últimos ' + n + (n === 1 ? ' mês fechado' : ' meses fechados') + ' na DRE' + (n < 12 ? ' (vai até 12 conforme o histórico cresce)' : '') + '. ' + cap(mesNome(CUR)) + ' e os meses passados não mudam.</small></div>' +
      '<div class="rvb"><button type="button" class="btn sm y" data-rv="allAvg">Usar média em todas</button><button type="button" class="btn sm" data-rv="allKeep">Manter todas</button></div></div><table class="rvt"><thead><tr><th>Previsão</th><th>Meses</th><th class="r">Atual</th><th class="r">Média</th><th class="r">Diferença</th><th></th></tr></thead><tbody>';
    pend.forEach((r) => {
      const cur = r.fut.length ? r.fut[0].valor : r.base.valor, d = r.avg - cur;
      h += '<tr data-rk="' + esc(r.k) + '"><td>' + esc(r.base.nome) + '</td><td>' + (r.fut.length ? [...new Set(r.fut.map((p) => mesNome(p.mes).slice(0,3)))].join(', ') : mesNome(mAdd(CUR,1)).slice(0,3) + ' (nova)') + '</td><td class="r num">' + num(cur) + '</td><td class="r num">' + num(r.avg) + '</td><td class="r num" style="color:' + (d > 0 ? '#b42318' : '#067647') + '">' + (d >= 0 ? '+' : '') + num(d) + '</td>' +
        '<td><div class="rowacts"><button type="button" class="btn sm y" data-rv="avg">Atualizar para ' + num(r.avg) + '</button><button type="button" class="btn sm" data-rv="keep">Seguir anterior</button></div></td></tr>';
    });
    return h + '</tbody></table></div>';
  }

  // ---------- configurações ----------
  function renderCfg(){
    const app = document.getElementById('app');
    const tab = view.cfgTab || 'listas';
    let h = '<div class="today"><h1>Configurações</h1></div>';
    h += '<div class="seg" role="tablist" aria-label="Seções"><button type="button" role="tab" data-cfgtab="listas" aria-selected="' + (tab === 'listas') + '">Listas de fornecedores</button><button type="button" role="tab" data-cfgtab="prev" aria-selected="' + (tab === 'prev') + '">Previsões' + (reviewPending() ? ' <i class="dotp" title="Revisão pendente"></i>' : '') + '</button><button type="button" role="tab" data-cfgtab="logs" aria-selected="' + (tab === 'logs') + '">Usuários e logs</button></div>';
    h += tab === 'prev' ? cfgPrev() : tab === 'logs' ? cfgLogs() : cfgListas();
    app.innerHTML = h;
  }
  function cfgListas(){
    const all = S.fornecedores || [];
    const cnt = {}; all.forEach((f) => { cnt[f.cat] = (cnt[f.cat] || 0) + 1; });
    const cat = view.cfgCat || AC;
    const q = (view.cfgQ || '').trim().toUpperCase();
    const list = all.filter((f) => f.cat === cat && (!q || f.nome.toUpperCase().includes(q))).sort((a,b) => (a.sub || '').localeCompare(b.sub || '') || a.nome.localeCompare(b.nome));
    let h = '<div class="lgrid"><nav class="lcats" aria-label="Categorias">' + CATS.map((c) => '<button type="button" data-lcat="' + esc(c) + '" aria-current="' + (c === cat) + '"><span>' + esc(c.toLowerCase()) + '</span><b class="num">' + (cnt[c] || 0) + '</b></button>').join('') + '</nav>';
    h += '<section class="panel lpane"><div class="lhead"><div><h2>' + esc(cat.toLowerCase()) + '</h2><small>' + (cnt[cat] || 0) + ' fornecedores · aparecem na lista quando você lança uma conta com esta categoria</small></div><input type="search" id="cfQ" placeholder="Buscar" value="' + esc(view.cfgQ || '') + '" aria-label="Buscar fornecedor"></div>';
    h += '<table class="ltab"><thead><tr><th>Fornecedor</th><th>Subcategoria</th><th></th></tr></thead><tbody>';
    h += '<tr class="ladd"><td><input id="cfNome" placeholder="Novo fornecedor" autocomplete="off"></td><td><select id="cfSub">' + subOpts(cat, view.cfNewSub == null ? '' : view.cfNewSub, true).replace('Todas as subcategorias', 'Qualquer subcategoria') + '</select></td><td class="r"><button type="button" class="btn sm y" id="cfAdd">Adicionar</button></td></tr>';
    if (!list.length) h += '<tr><td colspan="3" class="empty">' + (q ? 'Nenhum fornecedor com "' + esc(view.cfgQ) + '".' : 'Nenhum fornecedor ainda. Adicione o primeiro na linha acima.') + '</td></tr>';
    list.forEach((f) => { h += '<tr data-fid="' + f.id + '"><td>' + esc(f.nome) + (cat === AC && OFSUBS.includes(f.sub) ? ' <label class="fixo" title="Pagamento fixo: não depende de entrega"><input type="checkbox" data-cffixo="' + esc(f.nome) + '"' + (isFixo(f.nome) ? ' checked' : '') + '> pagamento fixo</label>' : '') + '</td><td class="m">' + (f.sub ? esc(f.sub) : 'qualquer') + '</td><td class="r"><button type="button" class="icon" data-cf="del" aria-label="Remover ' + esc(f.nome) + '" title="Remover"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></td></tr>'; });
    h += '</tbody></table>';
    if (cat === AC) h += '<div class="lfoot">Oficinas: pagamento <input id="prazoOf" class="num" value="' + S.prazoOf + '" inputmode="numeric" aria-label="Dias entre a chegada e o pagamento"> dias depois da chegada. Caindo no fim de semana, vai para segunda.</div>';
    return h + '</section></div>';
  }
  function cfgLogs(){
    const us = S.usuarios, f = view.logUser || '', q = (view.logQ || '').trim().toUpperCase();
    const L = (S.logs || []).filter((x) => (!f || x.por === f) && (!q || x.txt.toUpperCase().includes(q)));
    const nPg = Math.max(1, Math.ceil(L.length / 15)); const pg = Math.min(view.logPg || 0, nPg - 1); view.logPg = pg;
    const TELA = { pagar: 'Contas a pagar', of: 'Oficinas', parc: 'Parcelamentos', pr: 'Prorrogadas', rel: 'Relatório', dre: 'DRE', drel: 'DRE lançamentos', cfg: 'Configurações', login: 'Login' };
    let h = '<div class="lgrid"><section class="panel lpane"><div class="lhead"><div><h2>Usuários</h2><small>Quem está logado: <b>' + esc(S.user) + '</b>. Cada um entra com a própria senha.</small></div></div><table class="ltab utab"><tbody>' +
      us.map((u) => '<tr><td>' + esc(u) + (u === S.user ? ' <span class="chip c-open" style="margin-left:6px">usando agora</span>' : '') + '</td><td class="r">' + (S.senhas && S.senhas[u] ? (ADMIN ? '<button type="button" class="btn sm" data-resetpw="' + esc(u) + '" title="Apaga a senha e gera um código de convite. A pessoa cria outra senha com esse código.">Redefinir senha</button>' : '') : '<small style="color:var(--muted)">sem senha ainda' + (S.convites[u] ? ' · convite <b class="num">' + esc(S.convites[u]) + '</b>' : '') + '</small>') + '</td></tr>').join('') +
      (ADMIN ? '<tr class="ladd"><td><input id="uNome" placeholder="Novo usuário" autocomplete="off"></td><td class="r"><button type="button" class="btn sm y" id="uAdd">Adicionar</button></td></tr>' : '') + '</tbody></table></section>';
    h += '<section class="panel lpane"><div class="lhead"><div><h2>Logs</h2><small>Tudo que foi feito no sistema, por quem e quando. Os ' + (S.logs || []).length + ' mais recentes primeiro.</small></div><div style="display:flex;gap:8px"><select id="logUser" aria-label="Filtrar por usuário" style="min-height:34px;border:1px solid var(--ctrl);border-radius:8px;padding:0 8px"><option value="">Todos</option>' + us.map((u) => '<option' + (u === f ? ' selected' : '') + '>' + esc(u) + '</option>').join('') + '</select><input type="search" id="logQ" placeholder="Buscar" value="' + esc(view.logQ || '') + '" aria-label="Buscar no log"></div></div>' +
      '<table class="ltab"><thead><tr><th style="width:110px">Quando</th><th style="width:110px">Quem</th><th>O que</th><th style="width:150px">Tela</th></tr></thead><tbody>' +
      (L.length ? L.slice(pg * 15, pg * 15 + 15).map((x) => '<tr><td class="num m">' + quando(x.em) + '</td><td><span class="who">' + esc(x.por || '—') + '</span></td><td>' + esc(x.txt) + '</td><td class="m">' + esc(TELA[x.tela] || '') + '</td></tr>').join('') : '<tr><td colspan="4" class="empty">Nada registrado ainda. Cada ação feita no sistema aparece aqui.</td></tr>') +
      '</tbody></table>' + (L.length > 15 ? '<div class="pager"><span><b>' + (pg * 15 + 1) + '–' + Math.min(L.length, pg * 15 + 15) + '</b> de ' + L.length + '</span><div><button type="button" class="btn sm" data-lpg="' + (pg - 1) + '"' + (pg ? '' : ' disabled') + '>‹ Anterior</button><span>Página <b>' + (pg + 1) + '</b> de ' + nPg + '</span><button type="button" class="btn sm" data-lpg="' + (pg + 1) + '"' + (pg < nPg - 1 ? '' : ' disabled') + '>Próxima ›</button></div></div>' : '') + '</section></div>';
    return h.replace('<div class="lgrid">', '<div class="lgrid lg2">');
  }
  // ----- previsões: grade do ano -----
  const reviewPending = () => { const rv = S.prevReview[closedMk] || {}; return reviewRows().some((r) => !rv[r.k]); };
  function pvRows(y){
    const by = {};
    S.previsoes.filter((p) => p.mes.slice(0,4) === String(y)).sort((a,b) => a.mes.localeCompare(b.mes)).forEach((p) => { const k = pKey(p); by[k] = by[k] || { k, base: p, m: {} }; by[k].m[p.mes] = p; if (p.mes <= CUR || !by[k].cur) by[k].base = p.mes <= CUR ? p : by[k].base; });
    return Object.values(by).sort((a,b) => b.base.valor - a.base.valor);
  }
  const gastoMes = (p, mk) => S.saidas.filter((x) => x.data.slice(0,7) === mk && matchPrev(p, x)).reduce((a, x) => a + x.valor, 0);
  function setPrev(r, mk, v){
    const ex = r.m[mk];
    if (v == null) { if (ex) S.previsoes = S.previsoes.filter((x) => x !== ex); return; }
    if (ex) ex.valor = v; else S.previsoes.push({ id: novoId('p'), mes: mk, nome: r.base.nome, cat: r.base.cat, subs: r.base.subs.slice(), valor: v });
  }
  function cfgPrev(){
    const y = view.pvYear || +CUR.slice(0,4);
    const months = Array.from({ length: 12 }, (_, i) => y + '-' + pad(i + 1));
    const rows = pvRows(y);
    const n = histMonths().length;
    const vazio = {}; months.forEach((mk) => { vazio[mk] = mk < CUR && !rows.some((r) => r.m[mk] || gastoMes(r.base, mk)); });
    let h = '<section class="panel pvpane">';
    h += '<div class="pvtop"><div class="mnav"><button type="button" class="nav" data-pvy="-1" aria-label="Ano anterior">‹</button><h2>' + y + '</h2><button type="button" class="nav" data-pvy="1" aria-label="Próximo ano">›</button></div>' +
      '<p>Edite qualquer mês de ' + mesNome(CUR) + ' em diante. Os meses que já passaram ficam travados e mostram o que foi gasto de fato. A média usa os últimos ' + n + ' meses fechados da DRE.</p>' +
      '<div class="pvacts"><button type="button" class="btn sm" data-pva="modelo">Baixar modelo Excel</button><button type="button" class="btn sm y" data-pva="importar">Importar Excel</button><input type="file" id="pvFile" accept=".xlsx" hidden><button type="button" class="btn sm" data-pva="fillAll">Preencher meses vazios com o mês anterior</button><button type="button" class="btn sm" data-pva="avgAll">Usar a média em todos os meses futuros</button></div></div>';
    if (reviewPending() && !view.rvOpen) h += '<div class="rvnote" style="margin:14px 18px 0">' + cap(mesNome(closedMk)) + ' fechou: ' + reviewRows().filter((r) => !(S.prevReview[closedMk] || {})[r.k]).length + ' previsões têm sugestão pela média para os próximos meses.<button type="button" class="btn sm y" data-rvopen>Ver sugestões</button></div>';
    else h += reviewHTML();
    h += '<div class="pvscroll"><table class="pvt"><thead><tr><th class="nm">Previsão</th>' + months.map((mk) => '<th class="' + (mk === CUR ? 'cur' : mk < CUR ? 'past' : '') + (vazio[mk] ? ' vz' : '') + '"' + (vazio[mk] ? ' title="Sem dados em ' + mesNome(mk) + '"' : '') + '>' + mesNome(mk).slice(0,3) + (mk === CUR ? '<small>atual</small>' : '') + '</th>').join('') + '<th class="avg">Média ' + n + 'm</th><th class="ra"></th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="16" class="empty">Nenhuma previsão em ' + y + '. Crie a primeira abaixo.</td></tr>';
    const tot = {};
    rows.forEach((r) => {
      const av = avgPrev(r.base);
      h += '<tr data-rk="' + esc(r.k) + '"><th class="nm" scope="row"><b>' + esc(r.base.nome) + '</b><small>' + esc(r.base.cat.toLowerCase()) + ' · ' + (r.base.subs.length ? r.base.subs.map((x) => esc(x.toLowerCase())).join(', ') : 'todas') + '</small></th>';
      months.forEach((mk) => {
        const p = r.m[mk], v = p ? p.valor : null; if (v) tot[mk] = (tot[mk] || 0) + v;
        if (mk < CUR) {
          const g = gastoMes(r.base, mk);
          const irr = av && g && Math.abs(g - av) / av > 0.10;
          if (vazio[mk]) { h += '<td class="past vz"></td>'; return; }
          h += '<td class="past" title="Gasto ' + num(g) + (v != null ? ' · previsto ' + num(v) : '') + (av ? ' · média ' + num(av) : '') + '"><span class="num' + (irr ? ' irr' : '') + '">' + (g ? short(g) : '—') + '</span>' + (v != null ? '<small class="num">prev. ' + short(v) + '</small>' : '') + '</td>';
        } else {
          const irr = av && v != null && Math.abs(v - av) / av > 0.10;
          h += '<td class="' + (mk === CUR ? 'cur' : '') + (irr ? ' irr' : '') + '"><input class="num" data-pc="' + mk + '" value="' + (v != null ? num(v) : '') + '" placeholder="—" aria-label="' + esc(r.base.nome) + ' em ' + mesNome(mk) + '"' + (irr ? ' title="' + (v > av ? 'Acima' : 'Abaixo') + ' da média em ' + Math.abs((v - av) / av * 100).toFixed(0) + '%"' : '') + '></td>';
        }
      });
      h += '<td class="avg num">' + (av ? num(av) : '—') + '</td><td class="ra"><div class="rowacts"><button type="button" class="btn xs" data-pvr="avg" title="Coloca a média em todos os meses depois de ' + mesNome(CUR) + '"' + (av ? '' : ' disabled') + '>Média →</button><button type="button" class="btn xs" data-pvr="rep" title="Repete o valor de ' + mesNome(CUR) + ' nos meses seguintes">Repetir →</button><button type="button" class="icon" data-pvr="del" aria-label="Remover ' + esc(r.base.nome) + ' dos meses futuros" title="Remover dos meses futuros"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></td></tr>';
    });
    h += '</tbody><tfoot><tr><th class="nm">Total previsto</th>' + months.map((mk) => '<td class="num' + (mk === CUR ? ' cur' : mk < CUR ? ' past' : '') + (vazio[mk] ? ' vz' : '') + '">' + (vazio[mk] ? '' : tot[mk] ? short(tot[mk]) : '—') + '</td>').join('') + '<td></td><td></td></tr></tfoot></table></div>';
    const fm = CUR.slice(0,4) == y ? CUR : y + '-01';
    h += '<div class="pvnew"><b>Nova previsão</b><label>Nome<input id="pNome" placeholder="Ex.: Oficinas"></label><label>Categoria<select id="pCat">' + catOpts(view.pCat) + '</select></label><label>Subcategoria<select id="pSub">' + subOpts(view.pCat, '', true) + '</select></label><label>Valor por mês<input id="pVal" class="num" placeholder="0,00" inputmode="decimal"></label><label>De<select id="pDe">' + months.filter((mk) => mk >= CUR).map((mk) => '<option value="' + mk + '"' + (mk === fm ? ' selected' : '') + '>' + mesNome(mk) + '</option>').join('') + '</select></label><label>Até<select id="pAte">' + months.filter((mk) => mk >= CUR).map((mk) => '<option value="' + mk + '"' + (mk.endsWith('-12') ? ' selected' : '') + '>' + mesNome(mk) + '</option>').join('') + '</select></label><button type="button" class="btn sm y" id="pAdd">Criar</button></div>';
    return h + '</section>';
  }

  // ---------- oficinas ----------
  // situação de uma entrega de oficina
  const ofSt = (c) => c.pago ? 'pago' : c.recebidoEm ? 'chegou' : c.entrega < HOJE ? 'atrasada' : 'achegar';
  const inOfWeek = (c, w) => c.entrega >= w && c.entrega < iso(addDays(parse(w), 7));
  const ofOrig = (c) => (c.histEnt && c.histEnt.length) ? c.histEnt[0].de : c.entrega;
  const ofChip = (c) => { const st = ofSt(c), o = ofOrig(c);
    if (st === 'pago') return '<span class="chip c-paid">✓ Pago ' + dm(c.pagoEm || c.data) + '</span><small class="cs2">chegou ' + dm(c.recebidoEm || c.entrega) + '</small>';
    if (st === 'chegou') return '<span class="chip c-chg">Chegou ' + dm(c.recebidoEm) + '</span><small class="cs2">paga em ' + dm(c.data) + (c.payManual ? ' (data ajustada)' : '') + '</small>';
    if (st === 'atrasada') return '<span class="chip c-late">Atrasada</span><small class="cs2">era para ' + dm(c.entrega) + '</small>';
    if (c.entrega > o) return '<span class="chip c-pror">Adiada de ' + dm(o) + '</span><small class="cs2">aguardando entrega</small>';
    if (c.entrega < o) return '<span class="chip c-ant">Antecipada de ' + dm(o) + '</span><small class="cs2">aguardando entrega</small>';
    return '<span class="chip c-open">Aguardando entrega</span>'; };
  function mudarEntrega(c, novo){
    if (!novo || novo === c.entrega) return;
    const ori = (c.histEnt && c.histEnt.length) ? c.histEnt[0].de : c.entrega;
    c.histEnt = c.histEnt || []; c.histEnt.push({ de: c.entrega, para: novo, em: agora(), por: S.user });
    logC(c, (novo > ori ? 'Entrega adiada' : novo < ori ? 'Entrega antecipada' : 'Entrega voltou à data original') + ' de ' + dm(c.entrega) + ' para ' + dmy(novo));
    c.entrega = novo; syncOf(c);
  }
  function marcarChegada(c, d){
    if (!d) { c.recebidoEm = null; logC(c, 'Chegada desfeita · pagamento volta para ' + dmy(payFrom(c.entrega))); syncOf(c); return; }
    c.recebidoEm = d; logC(c, 'Chegou em ' + dmy(d) + (d > c.entrega ? ' (' + Math.round((parse(d) - parse(c.entrega)) / 864e5) + ' dias depois do previsto)' : d < c.entrega ? ' (antes do previsto)' : ', no dia previsto')); syncOf(c);
  }
  function renderOf(){
    const app = document.getElementById('app');
    const ofs = S.contas.filter(isOf);
    const wk = view.ofWeek, mk = monthOfWeek(wk), [yy, mm] = mk.split('-').map(Number);
    const weeks = weeksOfMonth(mk);
    const mRows = ofs.filter((c) => weeks.some((w) => inOfWeek(c, w)));
    const by = (st) => mRows.filter((c) => ofSt(c) === st);
    let h = '<div class="today"><h1>Oficinas</h1><span class="sub">Data = entrega da mercadoria. O pagamento cai ' + S.prazoOf + ' dias depois da chegada.</span></div>';
    // mês + gráfico
    const data = weeks.map((w) => { const r = ofs.filter((c) => inOfWeek(c, w)); return { w, pago: sum(r.filter((c) => c.pago)), chg: sum(r.filter((c) => ofSt(c) === 'chegou')), late: sum(r.filter((c) => ofSt(c) === 'atrasada')), open: sum(r.filter((c) => ofSt(c) === 'achegar')) }; });
    const max = Math.max(1, ...data.map((d) => d.pago + d.chg + d.late + d.open)), H = 115;
    const px = (v) => v > 0 ? Math.max(3, v / max * H).toFixed(1) + 'px' : '0';
    const prevOf = prevsOf(mk).find((p) => p.cat === AC && p.subs.some((x) => OFSUBS.includes(x)));
    h += '<section class="panel" aria-labelledby="omh"><div class="month-head"><div class="mnav"><button type="button" class="nav" data-omnav="-1" aria-label="Mês anterior">‹</button><h2 id="omh">' + cap(MESES[mm-1]) + ' de ' + yy + '</h2><button type="button" class="nav" data-omnav="1" aria-label="Próximo mês">›</button></div><div class="stats">' +
      '<div class="stat"><span class="lbl">Esperado no mês</span><b class="num">' + money(sum(mRows)) + '</b></div>' +
      '<div class="stat"><span class="lbl">Aguardando entrega</span><b class="num">' + money(sum(by('achegar'))) + '</b></div>' +
      '<div class="stat"><span class="lbl">Chegou, a pagar</span><b class="num">' + money(sum(by('chegou'))) + '</b></div>' +
      '<div class="stat"><span class="lbl">Pago</span><b class="num">' + money(sum(by('pago'))) + '</b></div>' +
      (by('atrasada').length ? '<div class="stat"><span class="lbl" style="color:var(--danger-ink)">Atrasadas</span><b class="num" style="color:var(--danger-ink)">' + money(sum(by('atrasada'))) + '</b></div>' : '') +
      (prevOf ? '<div class="stat"><span class="lbl">Previsão oficinas</span><b class="num">' + money(prevOf.valor) + '</b></div>' : '') +
      '</div></div><div class="chart" role="group" aria-label="Entregas por semana">';
    data.forEach((d) => { const tot = d.pago + d.chg + d.late + d.open;
      h += '<button type="button" class="bar" data-oweek="' + d.w + '" aria-pressed="' + (d.w === wk) + '" aria-label="Semana de ' + weekLabel(d.w) + ': ' + money(tot) + ' em entregas" title="Pago ' + money(d.pago) + ' · Chegou, a pagar ' + money(d.chg) + ' · Aguardando ' + money(d.open) + (d.late ? ' · Atrasada ' + money(d.late) : '') + '">' +
        '<span class="val num">' + (tot ? short(tot) : '—') + '</span><span class="stack"><span class="s-open" style="height:' + px(d.open) + '"></span><span class="s-pror" style="height:' + px(d.chg) + '"></span><span class="s-late" style="height:' + px(d.late) + '"></span><span class="s-paid" style="height:' + px(d.pago) + '"></span></span></button>'; });
    h += '</div><div class="xlabels">' + data.map((d) => '<span class="' + (d.w === wk ? 'on' : '') + '">' + weekLabel(d.w) + '</span>').join('') + '</div>';
    h += '<div class="legend"><span><i style="background:var(--blue)"></i>Pago</span><span><i style="background:var(--yellow)"></i>Chegou, a pagar</span><span><i style="border:1.5px solid var(--blue)"></i>Aguardando entrega</span><span><i style="background:var(--danger)"></i>Atrasada</span><span>Clique numa barra para abrir a semana.</span></div></section>';

    // semana (tabela única)
    const wEnd = iso(addDays(parse(wk), 7));
    // na semana atual, entregas atrasadas de semanas anteriores entram no topo para não sumirem de vista
    const puxadas = wk === iso(monday(TODAY)) ? ofs.filter((c) => ofSt(c) === 'atrasada' && c.entrega < wk) : [];
    const rows = ofs.filter((c) => inOfWeek(c, wk)).concat(puxadas).sort((a,b) => a.entrega.localeCompare(b.entrega) || a.forn.localeCompare(b.forn));
    h += '<section class="panel" aria-labelledby="owh"><div class="ph"><div class="mnav"><button type="button" class="nav" data-onav="-1" aria-label="Semana anterior">‹</button><h2 id="owh" style="min-width:210px;text-align:center">Semana ' + weekLabel(wk) + '</h2><button type="button" class="nav" data-onav="1" aria-label="Próxima semana">›</button>' +
      (wk !== iso(monday(TODAY)) ? '<button type="button" class="btn sm" data-onav="0">Voltar para esta semana</button>' : '') + '</div>' +
      '<div class="stats"><div class="stat"><span class="lbl">Aguardando entrega</span><b class="num">' + money(sum(rows.filter((c) => !c.recebidoEm && !c.pago))) + '</b></div><div class="stat"><span class="lbl">Chegou</span><b class="num">' + money(sum(rows.filter((c) => c.recebidoEm || c.pago))) + '</b></div><div class="stat"><span class="lbl">Entregas</span><b class="num">' + rows.length + '</b></div></div></div>';
    h += '<div class="scroll"><table><thead><tr><th style="width:96px">Entrega</th><th style="min-width:200px">Oficina</th><th style="width:230px">Subcategoria</th><th class="r" style="width:116px">Valor</th><th style="width:170px">Situação</th><th class="r" style="width:200px"></th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="6" class="empty">Nenhuma entrega esperada nesta semana. Use + Nova entrega para lançar.</td></tr>';
    let last = null;
    rows.forEach((c) => {
      if (c.entrega !== last) { last = c.entrega; const d = parse(c.entrega); const dr = rows.filter((x) => x.entrega === c.entrega);
        h += '<tr class="dayhead' + (c.entrega === HOJE ? ' istoday' : '') + '"><td colspan="6">' + DIAS[d.getDay()] + ', ' + dm(c.entrega) + (c.entrega === HOJE ? ' · hoje' : '') + '<span class="s">aguardando ' + money(sum(dr.filter((x) => !x.recebidoEm && !x.pago))) + ' · chegou ' + money(sum(dr.filter((x) => x.recebidoEm || x.pago))) + '</span></td></tr>'; }
      const st = ofSt(c);
      const acts = st === 'pago' ? ''
        : st === 'chegou' ? '<button type="button" class="btn sm" data-oa="unrec">Desfazer chegada</button>'
        : '<button type="button" class="btn sm pri" data-oa="rec">Chegou</button>' + (c.entrega <= HOJE ? '<button type="button" class="btn sm" data-oa="ent">Nova data</button>' : '');
      h += '<tr data-id="' + c.id + '" class="clk' + (c.pago ? ' paid' : '') + '"><td class="ro num">' + dm(c.entrega) + '</td><td class="ro"><button type="button" class="rowopen" data-edit="' + c.id + '">' + esc(c.forn) + '</button></td><td class="ro"><span class="cat2">' + esc(c.sub) + '</span></td><td class="ro num r">' + num(c.valor) + '</td><td class="ro">' + ofChip(c) + '</td><td><div class="rowacts">' + acts + '</div></td></tr>';
    });
    h += '</tbody></table></div><div class="hint"><span>Clique na linha para abrir a entrega: lá você muda a data prevista, marca ou desfaz a chegada, edita e vê a linha do tempo. O pagamento é feito em Contas a pagar.</span></div></section>';

    // acompanhamento: chegou e ainda não pago
    const L = ofs.filter((c) => ofSt(c) === 'chegou').sort((a,b) => a.data.localeCompare(b.data) || a.forn.localeCompare(b.forn));
    h += '<section class="panel" aria-labelledby="oht"><div class="ph"><h2 id="oht">Chegou e ainda não foi pago</h2><span style="color:var(--muted);font-size:14px">Por data de pagamento. O pagamento é feito em Contas a pagar.</span></div>';
    h += '<div class="scroll"><table><thead><tr><th style="width:150px">Pagamento previsto</th><th>Oficina</th><th style="width:110px">Entrega</th><th style="width:110px">Chegou</th><th class="r" style="width:130px">Valor</th><th class="r" style="width:190px"></th></tr></thead><tbody>';
    if (!L.length) h += '<tr><td colspan="6" class="empty">Nada chegou sem pagamento.</td></tr>';
    let lp = null;
    L.forEach((c) => { if (c.data !== lp) { lp = c.data; h += '<tr class="dayhead' + (c.data === HOJE ? ' istoday' : '') + '"><td colspan="6">Pagamento previsto ' + DIAS[parse(c.data).getDay()].toLowerCase() + ', ' + dm(c.data) + (c.data === HOJE ? ' · hoje' : '') + '<span class="s">' + money(sum(L.filter((x) => x.data === c.data))) + '</span></td></tr>'; }
      h += '<tr data-id="' + c.id + '" class="clk"><td class="ro num">' + dm(c.data) + (c.payManual ? ' <small class="cs2" style="display:inline">ajustada</small>' : '') + '</td><td class="ro"><button type="button" class="rowopen" data-edit="' + c.id + '">' + esc(c.forn) + '</button></td><td class="ro num">' + dm(c.entrega) + '</td><td class="ro num">' + dm(c.recebidoEm) + '</td><td class="ro num r">' + num(c.valor) + '</td><td class="r"><button type="button" class="golink" data-gopay="' + c.id + '">Ver em Contas a pagar ›</button></td></tr>'; });
    h += '</tbody><tfoot><tr><th colspan="4" style="text-align:left;padding:8px 6px">' + L.length + (L.length === 1 ? ' entrega' : ' entregas') + '</th><th class="r num" style="padding:8px 6px">' + num(sum(L)) + '</th><th></th></tr></tfoot></table></div></section>';
    h += '<div class="foot"><span id="copyOut"></span></div>';
    app.innerHTML = h;
  }

  // ---------- prorrogadas ----------
  const origOf = (c) => c.orig || c.data;
  function prRows(){
    const m = view.prMes;
    return S.contas.filter((c) => {
      const o = origOf(c);
      if (m !== 'all' && o.slice(0,7) !== m) return false;
      return isPror(c) || isLate(c);
    });
  }
  // situação de uma conta em relação ao mês do vencimento original
  const prSit = (c) => { const m = origOf(c).slice(0,7), pg = c.pago ? (c.pagoEm || c.data).slice(0,7) : null;
    if (pg && pg <= m) return 'pago';
    if (!c.pago && m >= CUR && c.data.slice(0,7) === m && c.data >= HOJE) return 'avencer';
    return 'pror'; };
  const atrasPagos = (m) => S.contas.filter((c) => c.pago && (c.pagoEm || c.data).slice(0,7) === m && origOf(c).slice(0,7) < m);
  function prMonth(m){ const r = S.contas.filter((c) => origOf(c).slice(0,7) === m); const o = { m, dev: sum(r), pago: 0, pror: 0, av: 0, atr: sum(atrasPagos(m)) }; r.forEach((c) => { const k = prSit(c); o[k === 'pago' ? 'pago' : k === 'avencer' ? 'av' : 'pror'] += c.valor; }); o.saiu = o.pago + o.atr; return o; }
  function renderPr(){
    const app = document.getElementById('app');
    const all = [...new Set(S.contas.map((c) => origOf(c).slice(0,7)))].filter((m) => m <= mAdd(CUR, 3)).sort();
    const first = all[0] || CUR, lastM = mAdd(CUR, 3);
    if (!view.prMes || view.prMes === 'all') view.prMes = mAdd(CUR, -1);
    if (!view.prWin) view.prWin = CUR;
    if (view.prMes > view.prWin) view.prWin = view.prMes;
    if (view.prMes < mAdd(view.prWin, -3)) view.prWin = mAdd(view.prMes, 3);
    const months = [0,1,2,3].map((k) => mAdd(view.prWin, k - 3));
    const ml = (m) => cap(mesNome(m)) + (m.slice(0,4) !== CUR.slice(0,4) ? ' de ' + m.slice(0,4) : '');
    const ms = (m) => cap(mesNome(m)).slice(0,3) + (m.slice(0,4) !== CUR.slice(0,4) ? '/' + m.slice(2,4) : '');
    const data = months.map(prMonth);
    let h = '<div class="today"><h1>Prorrogadas</h1><span class="sub">O que deveria ser pago em cada mês, quanto foi pago no mês e quanto ficou para depois.</span></div>';
    h += '<section class="panel"><div class="ph"><div class="mnav"><button type="button" class="nav" data-prwin="-1" aria-label="Mês anterior"' + (months[0] <= first ? ' disabled' : '') + '>‹</button><h2 style="min-width:230px;text-align:center">' + cap(mesNome(months[0])) + ' a ' + mesNome(months[3]) + ' ' + months[3].slice(0,4) + '</h2><button type="button" class="nav" data-prwin="1" aria-label="Próximo mês"' + (months[3] >= lastM ? ' disabled' : '') + '>›</button>' + (view.prWin !== CUR ? '<button type="button" class="btn sm" data-prwin="0">Voltar para hoje</button>' : '') + '</div><span style="color:var(--muted);font-size:14px">Prorrogado = não foi pago dentro do mês em que vencia. Clique num mês para ver a lista.</span></div><div class="vchart" role="group" aria-label="Vencimentos e pagamentos por mês">';
    const vmax = Math.max(1, ...data.map((o) => Math.max(o.dev, o.saiu))), VH = 200;
    const hpx = (v) => v > 0 ? Math.max(3, v / vmax * VH) : 0;
    data.forEach((o) => {
      const hr = hpx(o.pror), hp = hpx(o.pago), ha = hpx(o.av), ht = hpx(o.atr);
      const lr = 0, lp = Math.max(hr ? 20 : 0, hr + hp / 2 - 9), lt = Math.max(hp + 2, hp + ht / 2 - 9);
      h += '<button type="button" class="vm" data-prbar="' + o.m + '" aria-pressed="' + (o.m === view.prMes) + '" aria-label="' + ml(o.m) + ': vencia ' + money(o.dev) + ', pago no mês ' + money(o.pago) + ', prorrogado ' + money(o.pror) + ', atrasados de meses anteriores pagos ' + money(o.atr) + '">' +
        '<span class="vplot" style="height:' + (VH + 26) + 'px">' +
          '<span class="vlabs l">' + (o.pror ? '<em class="lr num" style="bottom:' + lr + 'px">' + short(o.pror) + '</em>' : '') + (o.pago ? '<em class="lp num" style="bottom:' + lp.toFixed(0) + 'px">' + short(o.pago) + '</em>' : '') + '</span>' +
          '<span class="vstack" style="height:' + (hr + hp + ha).toFixed(1) + 'px">' +
            (ha ? '<i class="va" style="height:' + ha.toFixed(1) + 'px"></i>' : '') + (hp ? '<i class="vp" style="height:' + hp.toFixed(1) + 'px"></i>' : '') + (hr ? '<i class="vr" style="height:' + hr.toFixed(1) + 'px"></i>' : '') + '</span>' +
          '<span class="vstack v2" style="height:' + (hp + ht).toFixed(1) + 'px">' +
            (ht ? '<i class="vt" style="height:' + ht.toFixed(1) + 'px"></i>' : '') + (hp ? '<i class="vp" style="height:' + hp.toFixed(1) + 'px"></i>' : '') + '</span>' +
          '<span class="vlabs r">' + (o.atr ? '<em class="lt num" style="bottom:' + lt.toFixed(0) + 'px">+' + short(o.atr) + '</em>' : '') + '</span>' +
        '</span><span class="vsub"><span>vencia<b class="num">' + short(o.dev) + '</b></span><span>pagou<b class="num">' + (o.saiu ? short(o.saiu) : '—') + '</b></span></span><span class="vl">' + ms(o.m) + '</span></button>';
    });
    h += '</div><div class="legend"><span><i style="background:var(--blue)"></i>Pago dentro do mês</span><span><i style="background:var(--yellow)"></i>Prorrogado para outro mês</span><span><i style="background:#E07B39"></i>Atrasado de meses anteriores, pago neste mês</span><span><i style="background:repeating-linear-gradient(135deg,var(--blue-2) 0 2px,transparent 2px 6px);border:1.5px dashed var(--blue)"></i>Ainda a vencer</span></div></section>';

    // mês escolhido
    const o = prMonth(view.prMes);
    const isAtr = view.prTab === 'atr';
    const rows = (isAtr ? atrasPagos(view.prMes) : S.contas.filter((c) => origOf(c).slice(0,7) === view.prMes && prSit(c) === 'pror')).sort((a,b) => origOf(a).localeCompare(origOf(b)) || b.valor - a.valor);
    h += '<section class="panel" aria-labelledby="prh"><div class="ph"><div class="mnav"><button type="button" class="nav" data-prbar="' + mAdd(view.prMes, -1) + '" aria-label="Mês anterior"' + (view.prMes > first ? '' : ' disabled') + '>‹</button><h2 id="prh" style="min-width:200px;text-align:center">' + ml(view.prMes) + '</h2><button type="button" class="nav" data-prbar="' + mAdd(view.prMes, 1) + '" aria-label="Próximo mês"' + (view.prMes < lastM ? '' : ' disabled') + '>›</button></div>' +
      '<div class="stats"><div class="stat"><span class="lbl">Vencia no mês</span><b class="num">' + money(o.dev) + '</b></div><div class="stat"><span class="lbl">Pago dentro do mês</span><b class="num">' + money(o.pago) + '</b></div><div class="stat"><span class="lbl" style="color:var(--warn-ink)">Prorrogado</span><b class="num">' + money(o.pror) + '</b></div>' + (o.av ? '<div class="stat"><span class="lbl">Ainda a vencer</span><b class="num">' + money(o.av) + '</b></div>' : '') + '<div class="stat"><span class="lbl" style="color:#b0561d">Atrasados pagos no mês</span><b class="num">' + money(o.atr) + '</b></div><div class="stat"><span class="lbl">Total pago no mês</span><b class="num">' + money(o.saiu) + '</b></div></div></div>' +
      '<div style="padding:0 16px 10px"><div class="seg sm" role="tablist"><button type="button" role="tab" data-prtab="pror" aria-selected="' + (view.prTab !== 'atr') + '">Vencia em ' + mesNome(view.prMes) + ' e foi prorrogado</button><button type="button" role="tab" data-prtab="atr" aria-selected="' + (view.prTab === 'atr') + '">Atrasados pagos em ' + mesNome(view.prMes) + '</button></div></div>';
    h += '<div class="scroll"><table><thead><tr><th style="width:110px">Vencia em</th><th>Fornecedor</th><th style="width:240px">Categoria</th><th class="r" style="width:130px">Valor</th><th style="width:220px">O que aconteceu</th><th class="r" style="width:190px"></th></tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="6" class="empty">' + (isAtr ? 'Nenhum atrasado de meses anteriores foi pago em ' + mesNome(view.prMes) + '.' : 'Tudo que vencia em ' + mesNome(view.prMes) + ' foi pago no mês.') + '</td></tr>';
    rows.forEach((c) => {
      const sit = c.pago ? '<span class="chip c-paid">Pago em ' + dm(c.pagoEm || c.data) + '</span>' : isLate(c) ? '<span class="chip c-late">Vencida, sem nova data</span>' : '<span class="chip c-pror">Nova data ' + dm(c.data) + (c.data.slice(0,4) !== CUR.slice(0,4) ? '/' + c.data.slice(2,4) : '') + '</span>';
      h += '<tr data-id="' + c.id + '" class="clk"><td class="ro num">' + dm(origOf(c)) + (isAtr ? '<small class="cs2">' + mesNome(origOf(c)).slice(0,3) + '</small>' : '') + '</td><td class="ro"><button type="button" class="rowopen" data-edit="' + c.id + '">' + esc(c.forn) + '</button></td><td class="ro"><span class="cat1">' + (c.cat ? esc(c.cat) : 'sem categoria') + '</span><span class="cat2">' + esc(c.sub || '') + '</span></td><td class="ro num r">' + num(c.valor) + '</td><td class="ro">' + sit + '</td><td class="r"><button type="button" class="golink" data-gopay="' + c.id + '">Ver em Contas a pagar ›</button></td></tr>';
    });
    h += '</tbody>' + (rows.length ? '<tfoot><tr><th colspan="3" style="text-align:left;padding:8px 6px">' + rows.length + (rows.length === 1 ? ' conta' : ' contas') + (isAtr ? ' de meses anteriores paga' + (rows.length === 1 ? '' : 's') + ' em ' + mesNome(view.prMes) : ' que vencia' + (rows.length === 1 ? '' : 'm') + ' em ' + mesNome(view.prMes) + ' e não ' + (rows.length === 1 ? 'foi paga' : 'foram pagas') + ' no mês') + '</th><th class="r num" style="padding:8px 6px">' + num(sum(rows)) + '</th><th colspan="2"></th></tr></tfoot>' : '') + '</table></div></section>';
    h += '<div class="foot"><span id="copyOut"></span></div>';
    app.innerHTML = h;
  }

  // ---------- relatório ----------
  function relCols(){
    if (view.relVis === 'mes') {
      const out = []; for (let i = -1; i <= 2; i++) { const d = new Date(TODAY.getFullYear(), TODAY.getMonth()+i, 1); const k = d.getFullYear() + '-' + pad(d.getMonth()+1); out.push({ k, label: MESES[d.getMonth()].slice(0,3) + '/' + String(d.getFullYear()).slice(2), test: (c) => c.data.slice(0,7) === k, mes: k }); }
      return out;
    }
    return weeksOfMonth(view.relMes).map((w) => ({ k: w, label: weekLabel(w), test: (c) => inWeek(c, w), mes: view.relMes }));
  }
  function relData(){
    const cols = relCols();
    const filt = (c) => view.relVal === 'all' ? true : view.relVal === 'pago' ? c.pago : !c.pago;
    const rows = {};
    S.contas.forEach((c) => {
      if (!filt(c)) return;
      cols.forEach((col, i) => {
        if (!col.test(c)) return;
        const cat = c.cat || 'Sem categoria', sub = c.cat ? (c.sub || '—') : '—';
        rows[cat] = rows[cat] || { v: cols.map(() => 0), subs: {} };
        rows[cat].v[i] += c.valor;
        rows[cat].subs[sub] = rows[cat].subs[sub] || cols.map(() => 0);
        rows[cat].subs[sub][i] += c.valor;
      });
    });
    // previsto por categoria no(s) mês(es) das colunas
    const meses = [...new Set(cols.map((c) => c.mes))];
    const prevCat = {}, prevSub = {};
    S.previsoes.filter((p) => meses.includes(p.mes)).forEach((p) => {
      prevCat[p.cat] = (prevCat[p.cat] || 0) + p.valor;
      const key = p.cat + '|' + (p.subs.length === 1 ? p.subs[0] : '');
      prevSub[key] = (prevSub[key] || 0) + p.valor;
      rows[p.cat] = rows[p.cat] || { v: cols.map(() => 0), subs: {} };
    });
    // quanto do lançado corresponde a alguma previsão (para a diferença comparar igual com igual)
    const ps = S.previsoes.filter((p) => meses.includes(p.mes));
    const matched = {};
    S.contas.forEach((c) => { if (!filt(c) || !cols.some((col) => col.test(c))) return; if (ps.some((p) => p.mes === c.data.slice(0,7) && matchPrev(p, c))) matched[c.cat] = (matched[c.cat] || 0) + c.valor; });
    return { cols, rows, prevCat, prevSub, matched };
  }
  // dados do relatório mensal: pago, a pagar (lançado) e previsão ainda não lançada
  function repMonth(m){
    const o = { m, pago: 0, aberto: 0, prev: 0, cats: {} };
    const add = (cat, sub, k, v) => { if (!v) return; cat = cat || 'Sem categoria'; sub = sub || '—'; const c = o.cats[cat] = o.cats[cat] || { pago: 0, aberto: 0, prev: 0, subs: {} }; c[k] += v; const s2 = c.subs[sub] = c.subs[sub] || { pago: 0, aberto: 0, prev: 0 }; s2[k] += v; o[k] += v; };
    S.contas.forEach((c) => { if (c.pago) { if ((c.pagoEm || c.data).slice(0,7) === m) add(c.cat, c.sub, 'pago', c.valor); } else if (c.data.slice(0,7) === m) add(c.cat, c.sub, 'aberto', c.valor); });
    if (m >= CUR) prevsOf(m).forEach((p) => { const l = sum(S.contas.filter((c) => c.data.slice(0,7) === m && matchPrev(p, c))); add(p.cat, (p.subs.length === 1 ? p.subs[0] : p.nome) + ' · previsão', 'prev', Math.max(0, p.valor - l)); });
    o.tot = o.pago + o.aberto + o.prev; return o;
  }
  // por enquanto o relatório trabalha só com novembro e dezembro; para voltar à janela de 6 meses, deixe REP_FIXO = null
  const REP_FIXO = ['2026-11', '2026-12'];
  const repMonths = () => REP_FIXO ? REP_FIXO.slice() : [0,1,2,3,4,5].map((k) => mAdd(view.repWin || mAdd(CUR, -1), k));
  function renderRel(){
    const app = document.getElementById('app');
    if (!view.repWin) view.repWin = mAdd(CUR, -1);
    const months = repMonths();
    if (!view.repSel || !view.repSel.length || !view.repSel.every((m) => months.includes(m))) view.repSel = months.slice();
    const sel = months.filter((m) => view.repSel.includes(m));
    const D = months.map(repMonth), DS = D.filter((o) => sel.includes(o.m));
    const val = view.relVal || 'all';
    const pick = (x) => val === 'pago' ? x.pago : val === 'prev' ? x.aberto + x.prev : x.pago + x.aberto + x.prev;
    const ml = (m) => cap(mesNome(m)).slice(0,3) + (m.slice(0,4) !== CUR.slice(0,4) ? '/' + m.slice(2,4) : '');
    let h = '<div class="today"><h1>Relatório</h1><span class="sub">Custo por mês: o que já foi pago e o que ainda está previsto pagar.</span></div>';
    // KPIs
    const tP = sum(DS.map((o) => ({ valor: o.pago }))), tA = sum(DS.map((o) => ({ valor: o.aberto }))), tV = sum(DS.map((o) => ({ valor: o.prev })));
    const fimAno = CUR.slice(0,4) + '-12'; const resto = []; for (let m = CUR; m <= fimAno; m = mAdd(m, 1)) resto.push(repMonth(m));
    const falta = resto.reduce((a, o) => a + o.aberto + o.prev, 0);
    const pagoAno = S.contas.filter((c) => c.pago && (c.pagoEm || c.data).slice(0,4) === CUR.slice(0,4)).reduce((a, c) => a + c.valor, 0);
    h += '<div class="kpis"><div class="kpi"><span>Pago</span><b class="num">' + money(tP) + '</b><small>' + (sel.length === months.length ? (REP_FIXO ? 'em ' + months.map((m) => mesNome(m)).join(' e ') : 'nos 6 meses') : sel.map(ml).join(', ')) + '</small></div>' +
      '<div class="kpi g"><span>Previsto pagar</span><b class="num">' + money(tA + tV) + '</b><small>' + money(tA) + ' lançado · ' + money(tV) + ' de previsão a lançar</small></div>' +
      '<div class="kpi"><span>Total do recorte</span><b class="num">' + money(tP + tA + tV) + '</b><small>pago + previsto</small></div>' +
      '<div class="kpi d"><span>Falta pagar até dezembro</span><b class="num">' + money(falta) + '</b><small>' + cap(mesNome(CUR)) + ' a dezembro · ano todo ' + money(pagoAno + falta) + '</small></div></div>';
    // gráfico + recorte
    const max = Math.max(1, ...D.map((o) => o.tot)), H = 190;
    const px = (v) => v > 0 ? Math.max(3, v / max * H).toFixed(1) + 'px' : '0';
    h += '<section class="panel"><div class="ph"><div class="mnav">' + (REP_FIXO ? '<h2>' + cap(mesNome(months[0])) + ' e ' + mesNome(months[months.length-1]) + ' ' + months[0].slice(0,4) + '</h2>' : '<button type="button" class="nav" data-rwin="-1" aria-label="Mês anterior">‹</button><h2 style="min-width:240px;text-align:center">' + cap(mesNome(months[0])) + ' a ' + mesNome(months[5]) + ' ' + months[5].slice(0,4) + '</h2><button type="button" class="nav" data-rwin="1" aria-label="Próximo mês">›</button>' + (view.repWin !== mAdd(CUR, -1) ? '<button type="button" class="btn sm" data-rwin="0">Voltar para hoje</button>' : '')) + '</div>' +
      '<div class="rsel"><span class="lbl">Meses no recorte</span><div class="mtog" role="group" aria-label="Meses no recorte">' + months.map((m) => '<button type="button" data-rsel="' + m + '" aria-pressed="' + sel.includes(m) + '"><i aria-hidden="true"></i>' + ml(m) + '</button>').join('') + '</div><button type="button" class="mall" data-rsel="all"' + (sel.length === months.length ? ' disabled' : '') + '>Todos</button></div></div>';
    const hp = (v) => v > 0 ? Math.max(3, v / max * H) : 0;
    h += '<div class="rchart"' + (months.length <= 3 ? ' style="justify-content:center;gap:160px"' : '') + '>' + D.map((o) => { const a = hp(o.pago), b = hp(o.aberto), c = hp(o.prev);
      const lp = a / 2 - 9, la = Math.max(a ? lp + 19 : 0, a + b / 2 - 9), lv = Math.max(b ? la + 19 : (a ? lp + 19 : 0), a + b + c / 2 - 9);
      return '<button type="button" class="rcol' + (sel.includes(o.m) ? ' on' : '') + (o.m === CUR ? ' cur' : '') + '" data-rsel="' + o.m + '" title="' + cap(mesNome(o.m)) + ': pago ' + money(o.pago) + ' · a pagar lançado ' + money(o.aberto) + ' · previsão ' + money(o.prev) + '">' +
      '<span class="rtot num">' + (o.tot ? short(o.tot) : '—') + '</span><span class="rplot" style="height:' + H + 'px"><span class="rbar"><i class="rpv" style="height:' + c.toFixed(1) + 'px"></i><i class="ra" style="height:' + b.toFixed(1) + 'px"></i><i class="rp" style="height:' + a.toFixed(1) + 'px"></i></span>' +
      '<span class="rlabs">' + (o.pago ? '<em class="p num" style="bottom:' + Math.max(0, lp).toFixed(0) + 'px">' + short(o.pago) + '</em>' : '') + (o.aberto ? '<em class="a num" style="bottom:' + Math.max(0, la).toFixed(0) + 'px">' + short(o.aberto) + '</em>' : '') + (o.prev ? '<em class="v num" style="bottom:' + Math.max(0, lv).toFixed(0) + 'px">' + short(o.prev) + '</em>' : '') + '</span></span>' +
      '<span class="rlab">' + ml(o.m) + (o.m === CUR ? ' · atual' : '') + '</span></button>'; }).join('') + '</div>';
    h += '<div class="legend"><span><i style="background:var(--blue)"></i>Pago</span><span><i style="background:var(--yellow)"></i>A pagar · contas lançadas</span><span><i style="background:#F6E7B4;border:1.5px dashed #B8900F"></i>Previsão pela média histórica · ainda sem conta</span><span>Clique num mês para tirar ou pôr no recorte.</span></div></section>';
    // tabela
    const cats = {};
    DS.forEach((o, i) => Object.keys(o.cats).forEach((k) => { const c = o.cats[k]; const r = cats[k] = cats[k] || { v: sel.map(() => 0), subs: {} }; const ix = sel.indexOf(o.m); r.v[ix] += pick(c); Object.keys(c.subs).forEach((sk) => { const sv = r.subs[sk] = r.subs[sk] || sel.map(() => 0); sv[ix] += pick(c.subs[sk]); }); }));
    const keys = Object.keys(cats).filter((k) => cats[k].v.some((x) => x)).sort((a, b) => sum(cats[b].v.map((v) => ({ valor: v }))) - sum(cats[a].v.map((v) => ({ valor: v }))));
    const tot = (arr) => arr.reduce((a, b) => a + b, 0);
    const colTot = sel.map((_, i) => keys.reduce((a, k) => a + cats[k].v[i], 0)), grand = tot(colTot);
    const maxCell = Math.max(1, ...keys.flatMap((k) => cats[k].v)), maxRow = Math.max(1, ...keys.map((k) => tot(cats[k].v)));
    const heat = (v) => { if (!v) return ''; const t = Math.pow(v / maxCell, 0.6); return 'background:rgba(211,165,18,' + (0.06 + 0.5 * t).toFixed(3) + ')' + (t > 0.7 ? ';font-weight:700' : ''); };
    h += '<section class="panel"><div class="ph"><h2>Por categoria</h2><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div class="seg sm" role="tablist">' + [['all','Pago + previsto'],['pago','Só pago'],['prev','Só previsto']].map(([k, t]) => '<button type="button" role="tab" data-rval="' + k + '" aria-selected="' + (val === k) + '">' + t + '</button>').join('') + '</div><button type="button" class="btn sm" data-rel="open:all">Abrir todas</button><button type="button" class="btn sm" data-rel="open:none">Fechar todas</button></div></div>';
    h += '<div class="scroll"><table class="rel rep"><thead><tr><th style="min-width:280px">Categoria</th>' + sel.map((m) => '<th class="r' + (m === CUR ? ' cur' : '') + '">' + ml(m) + '</th>').join('') + '<th class="r">Total</th><th style="width:150px">Peso no recorte</th></tr></thead><tbody>';
    if (!keys.length) h += '<tr><td colspan="' + (sel.length + 3) + '" class="empty">Nada neste recorte.</td></tr>';
    keys.forEach((k) => { const r = cats[k], t = tot(r.v), open = view.relOpen[k];
      h += '<tr class="catrow"><td><button type="button" data-rel="tog:' + esc(k) + '" class="rtog">' + (open ? '▾ ' : '▸ ') + esc(k) + '</button></td>' + r.v.map((v) => '<td class="r num" style="' + heat(v) + '">' + (v ? num(v) : '') + '</td>').join('') +
        '<td class="r num" style="font-weight:700">' + num(t) + '</td><td><span class="wbar"><i style="width:' + (t / maxRow * 100).toFixed(1) + '%"></i></span><small class="num">' + (grand ? (t / grand * 100).toFixed(1).replace('.', ',') : '0') + '%</small></td></tr>';
      if (open) Object.keys(r.subs).filter((sk) => r.subs[sk].some((x) => x)).sort((a, b) => tot(r.subs[b]) - tot(r.subs[a])).forEach((sk) => { const sv = r.subs[sk];
        h += '<tr class="subrow"><td style="padding-left:28px;color:var(--muted)">' + (/ · previsão$/.test(sk) ? '<i class="pvtag">previsão</i> ' + esc(sk.replace(/ · previsão$/, '')) : esc(sk)) + '</td>' + sv.map((v) => '<td class="r num" style="color:var(--muted)">' + (v ? num(v) : '') + '</td>').join('') + '<td class="r num" style="color:var(--muted)">' + num(tot(sv)) + '</td><td></td></tr>'; });
    });
    h += '<tr class="totrow"><td>Total</td>' + colTot.map((v) => '<td class="r num">' + num(v) + '</td>').join('') + '<td class="r num">' + num(grand) + '</td><td></td></tr>';
    h += '</tbody></table></div><div class="hint"><span>Pago pela data do pagamento; a pagar pela data de vencimento atual. "Previsão" é a estimativa pela média histórica que ainda não virou conta: o valor da previsão do mês menos o que já foi lançado (Configurações › Previsões). Quanto mais forte o amarelo, maior o valor.</span></div></section>';
    h += '<div class="foot"><span id="copyOut"></span></div>';
    app.innerHTML = h;
  }

  // ---------- DRE ----------
  const EXCL_ENT = ['RECEBIMENTO MRBL', 'RECEBIMENTO STOFFA'];
  const DRE_MESES = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12'];
  // janeiro a junho: valores consolidados da aba DRE 2026 da planilha V2_12 (aba DreHistorico)
  const DRE_HIST = (() => {
    const H = { recCat: {}, cmv: [0,0,0,0,0,0], frete: [0,0,0,0,0,0], opexCat: {}, saldoJan: +(CFG.saldoJan || 0) };
    const z = () => [0,0,0,0,0,0];
    (dados.dreHistorico || []).forEach((r) => {
      const i = +String(r.mes).slice(5,7) - 1; if (!(i >= 0 && i < 6)) return; const v = +r.valor || 0;
      if (r.tipo === 'rec') (H.recCat[r.cat] = H.recCat[r.cat] || z())[i] += v;
      else if (r.tipo === 'cmv' || r.tipo === 'frete') H[r.tipo][i] += v;
      else if (r.tipo === 'opex') { const o = H.opexCat[r.cat] = H.opexCat[r.cat] || { v: z(), subs: {} }; o.v[i] += v; (o.subs[r.sub || '—'] = o.subs[r.sub || '—'] || z())[i] += v; }
    });
    return H;
  })();
  const grp = (c) => c.cat === 'FORNECEDORES (CMV)' ? 'cmv' : c.cat === 'FRETE' ? 'frete' : 'opex';
  function dreData(){
    const mi = (d) => DRE_MESES.indexOf(d.slice(0,7));
    const z = () => DRE_MESES.map(() => 0);
    const D = { rec: z(), recCat: {}, cmv: z(), frete: z(), opex: z(), opexCat: {} };
    S.entradas.forEach((e) => { const i = mi(e.data); if (i < 0 || EXCL_ENT.includes(e.cat)) return; D.rec[i] += e.valor; (D.recCat[e.cat] = D.recCat[e.cat] || z())[i] += e.valor; });
    S.saidas.forEach((c) => {
      const i = mi(c.data); if (i < 0) return;
      const g = grp(c); D[g][i] += c.valor;
      if (g === 'opex') { const k = c.cat || 'Sem categoria'; const o = D.opexCat[k] = D.opexCat[k] || { v: z(), subs: {} }; o.v[i] += c.valor; (o.subs[c.sub || '—'] = o.subs[c.sub || '—'] || z())[i] += c.valor; }
    });
    const NH = DRE_HIST.cmv.length;
    for (let i = 0; i < NH; i++) {
      Object.keys(DRE_HIST.recCat).forEach((k) => { const v = DRE_HIST.recCat[k][i]; D.rec[i] += v; (D.recCat[k] = D.recCat[k] || z())[i] += v; });
      D.cmv[i] += DRE_HIST.cmv[i]; D.frete[i] += DRE_HIST.frete[i];
      Object.keys(DRE_HIST.opexCat).forEach((k) => { const h = DRE_HIST.opexCat[k]; const o = D.opexCat[k] = D.opexCat[k] || { v: z(), subs: {} }; o.v[i] += h.v[i]; D.opex[i] += h.v[i];
        Object.keys(h.subs).forEach((sk) => { (o.subs[sk] = o.subs[sk] || z())[i] += h.subs[sk][i]; }); });
    }
    D.lucro = DRE_MESES.map((_, i) => D.rec[i] - D.cmv[i] - D.frete[i] - D.opex[i]);
    D.ini = z(); D.fim = z();
    DRE_MESES.forEach((_, i) => { D.ini[i] = i === 0 ? DRE_HIST.saldoJan : D.fim[i-1]; D.fim[i] = D.ini[i] + D.lucro[i]; });
    return D;
  }
  function renderDre(){
    const app = document.getElementById('app');
    const D = dreData();
    const lab = (k) => MESES[parseInt(k.slice(5),10)-1].slice(0,3) + '/' + k.slice(2,4);
    const seg = (on) => 'font:inherit;font-weight:700;min-height:34px;padding:0 12px;border-radius:8px;cursor:pointer;border:1px solid ' + (on ? 'var(--navy);background:var(--navy);color:#fff' : 'var(--ctrl);background:var(--surface);color:var(--ink)');
    const sumA = (a) => a.reduce((x,y) => x+y, 0);
    const cell = (v, neg) => '<td class="r num"' + (v < 0 ? ' style="color:var(--danger-ink)"' : '') + '>' + (v ? (v < 0 ? '−' : '') + num(Math.abs(v)) : '') + '</td>';
    const line = (label, arr, cls, tog, total) => '<tr class="' + (cls || 'catrow') + '"><td>' + (tog ? '<button type="button" data-dre="tog:' + esc(tog) + '" style="background:none;border:0;padding:6px 0;font-weight:700;cursor:pointer;color:var(--ink);text-align:left">' + (view.dreOpen[tog] ? '▾ ' : '▸ ') + label + '</button>' : label) + '</td>' + arr.map((v) => cell(v)).join('') + (total === false ? '<td></td>' : cell(sumA(arr))) + '</tr>';
    let h = '<section class="today"><h1>DRE</h1><span class="sub">Regime de caixa: entradas recebidas e contas pagas, no mês do pagamento. Recebimento MRBL e Recebimento STOFFA ficam de fora.</span></section>';
    h += '<section class="panel"><div class="ph"><div style="color:var(--muted);font-size:14px">Só lançamentos consolidados da DRE. Contas a pagar não entram aqui.</div>' +
      '<button type="button" class="btn sm" data-tela="drel">Ver lançamentos</button></div>';
    const parcial = (k) => k === HOJE.slice(0,7) ? ' (parcial)' : '';
    const fat = D.recCat['RECEBIMENTO DE CLIENTE'] || DRE_MESES.map(() => 0);
    const fm = Math.max(1, ...fat);
    const acc = []; fat.reduce((t, v, i) => (acc[i] = t + v), 0);
    const despA = sumA(D.cmv) + sumA(D.frete) + sumA(D.opex), lucA = sumA(D.lucro);
    const comDado = fat.filter((v) => v > 0).length;
    h += '<div class="kpis" style="padding:12px 16px 4px">' +
      '<div class="kpi"><span>Faturamento acumulado 2026</span><b class="num">' + money(sumA(fat)) + '</b><small>janeiro a ' + mesNome(HOJE.slice(0,7)) + ' · média ' + money(comDado ? sumA(fat) / comDado : 0) + '/mês</small></div>' +
      '<div class="kpi"><span>Recebimentos acumulados</span><b class="num">' + money(sumA(D.rec)) + '</b><small>faturamento + devoluções e outras entradas</small></div>' +
      '<div class="kpi"><span>Despesas acumuladas</span><b class="num">' + money(despA) + '</b><small>CMV, frete e operacionais</small></div>' +
      '<div class="kpi ' + (lucA < 0 ? 'd' : 'g') + '"><span>Lucro líquido acumulado</span><b class="num"' + (lucA < 0 ? ' style="color:var(--danger-ink)"' : '') + '>' + (lucA < 0 ? '−' : '') + money(Math.abs(lucA)) + '</b><small>recebimentos menos despesas</small></div></div>';
    h += '<div style="padding:12px 16px 0;border-top:1px solid var(--line)"><h3 style="margin:0;font-size:15px">Faturamento mês a mês · 2026</h3><span style="color:var(--muted);font-size:13px">Recebimento de cliente. Embaixo de cada mês: comparação com o mês anterior e o acumulado do ano. * mês em andamento, ainda parcial.</span></div>';
    h += '<div class="chart" style="height:180px">' + DRE_MESES.map((k, i) => '<div class="bar" style="cursor:default" title="' + lab(k) + parcial(k) + ': ' + money(fat[i]) + ' · acumulado ' + money(acc[i]) + '"><span class="val num">' + (fat[i] ? short(fat[i]) : '—') + '</span><span class="stack"><span style="display:block;height:' + (fat[i] ? Math.max(3, fat[i] / fm * 130).toFixed(1) : 0) + 'px;background:var(--navy);border-radius:3px 3px 0 0"></span></span></div>').join('') + '</div>';
    h += '<div class="xlabels">' + DRE_MESES.map((k, i) => { const pv = i ? fat[i-1] : 0; const pc = pv && fat[i] ? (fat[i] / pv - 1) * 100 : null; return '<span>' + lab(k) + (parcial(k) ? '*' : '') + '<br>' + (pc == null ? '<small style="color:var(--muted)">—</small>' : '<b class="num" style="color:' + (pc < 0 ? 'var(--danger-ink)' : 'var(--ok-ink)') + '">' + (pc < 0 ? '▼ ' : '▲ ') + Math.abs(pc).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%</b>') + '<br><small class="num" style="color:var(--muted)">' + (fat[i] ? 'acum. ' + short(acc[i]) : '') + '</small></span>'; }).join('') + '</div><div style="height:14px"></div></section>';
    // tabela
    h += '<section class="panel"><div class="drescroll"><table class="rel dre"><thead><tr><th>DRE gerencial</th>' + DRE_MESES.map((k) => '<th class="r">' + lab(k) + '</th>').join('') + '<th class="r">Acumulado 2026</th></tr></thead><tbody>';
    h += line('Saldo inicial', D.ini, 'subrow', null, false);
    h += line('Recebimentos', D.rec, 'catrow', 'rec');
    if (view.dreOpen.rec) Object.keys(D.recCat).forEach((k) => { h += '<tr class="subrow"><td style="padding-left:28px;color:var(--muted)">' + esc(k) + '</td>' + D.recCat[k].map((v) => cell(v)).join('') + cell(sumA(D.recCat[k])) + '</tr>'; });
    h += line('(−) Fornecedores (CMV)', D.cmv.map((v) => -v));
    h += line('(−) Frete', D.frete.map((v) => -v));
    h += line('(−) Despesas operacionais', D.opex.map((v) => -v), 'catrow', 'opex');
    if (view.dreOpen.opex) Object.keys(D.opexCat).sort((a,b) => sumA(D.opexCat[b].v) - sumA(D.opexCat[a].v)).forEach((k) => {
      const o = D.opexCat[k];
      h += '<tr class="subrow"><td style="padding-left:20px"><button type="button" data-dre="tog:c:' + esc(k) + '" style="background:none;border:0;padding:2px 0;cursor:pointer;color:var(--ink);text-align:left">' + (view.dreOpen['c:' + k] ? '▾ ' : '▸ ') + esc(k) + '</button></td>' + o.v.map((v) => cell(-v)).join('') + cell(-sumA(o.v)) + '</tr>';
      if (view.dreOpen['c:' + k]) Object.keys(o.subs).forEach((sk) => { h += '<tr class="subrow"><td style="padding-left:48px;color:var(--muted);font-size:12px">' + esc(sk) + '</td>' + o.subs[sk].map((v) => cell(-v)).join('') + cell(-sumA(o.subs[sk])) + '</tr>'; });
    });
    h += line('Lucro líquido', D.lucro, 'totrow');
    h += line('Resultado com saldo inicial', D.fim, 'totrow', null, false);
    h += '</tbody></table></div><div class="hint"><span>De julho em diante, despesas e recebimentos vêm de DRE lançamentos (BASE_DESPESAS e BASE_ENTRADAS da planilha V2_12); janeiro a junho vêm consolidados da aba DRE 2026, porque a base começa em julho. O faturamento da planilha do Cesar é lançado lá à mão. Saldo inicial de janeiro: ' + money(DRE_HIST.saldoJan) + ' e de julho: ' + money(+(CFG.saldoJul || 0)) + ', como na planilha.</span></div></section>';
    h += '<div class="foot"><span id="copyOut"></span></div>';
    app.innerHTML = h;
  }
  function renderDrel(){
    const app = document.getElementById('app');
    const mk = view.drelMes, mm = parseInt(mk.slice(5),10);
    const ent = S.entradas.filter((e) => e.data.slice(0,7) === mk).sort((a,b) => b.data.localeCompare(a.data));
    const sai = S.saidas.filter((x) => x.data.slice(0,7) === mk).sort((a,b) => b.data.localeCompare(a.data));
    const naDre = sum(ent.filter((e) => !EXCL_ENT.includes(e.cat)));
    const seg = (on) => 'font:inherit;font-weight:700;min-height:34px;padding:0 12px;border-radius:8px;cursor:pointer;border:1px solid ' + (on ? 'var(--navy);background:var(--navy);color:#fff' : 'var(--ctrl);background:var(--surface);color:var(--ink)');
    const F = view.dForm, E = view.eForm;
    const fld = (lab, ctl) => '<label class="ff"><span>' + lab + '</span>' + ctl + '</label>';
    const opt = (arr, sel) => arr.map((k) => '<option' + (k === sel ? ' selected' : '') + '>' + esc(k) + '</option>').join('');
    let h = '<section class="today"><h1>DRE · lançamentos</h1><span class="sub">O que foi pago e recebido de verdade. É isto que forma a DRE. O faturamento vem da planilha do Cesar.</span></section>';

    // formulários lado a lado, como a aba NOVO LANÇAMENTO
    const link = F.contaId ? S.contas.find((c) => c.id === F.contaId) : null;
    let fD = '<section class="panel fcard fdesp"><div class="ph"><h2>Nova despesa</h2></div><div class="fbody">' +
      fld('Data', '<input type="date" id="dData" value="' + esc(F.data) + '">') +
      fld('Categoria', '<select id="dCat">' + catOpts(F.cat) + '</select>') +
      fld('Subcategoria', '<select id="dSub">' + subOpts(F.cat, F.sub) + '</select>') +
      fld('MRBL/STOFFA', '<select id="dEmp">' + opt(EMPS, F.emp) + '</select>') +
      fld('Valor', '<input id="dVal" class="val" inputmode="decimal" placeholder="0,00" value="' + esc(F.valor) + '">') +
      fld('Fornecedor / descrição', '<input id="dForn" data-cbx="dFornList" data-novo="1" placeholder="Escolha ou digite" autocomplete="off" value="' + esc(F.forn) + '"><datalist id="dFornList">' + fornOpts(F.cat, F.sub) + '</datalist>') +
      fld('Responsável', '<input id="dResp" value="' + esc(S.user) + '" readonly title="Quem está logado">') +
      fld('Observação', '<input id="dObs" value="' + esc(F.obs) + '">') +
      (link ? '<div class="linked">Vinculada a <b>' + esc(link.forn) + '</b> (' + money(link.valor) + (link.pago ? ', paga ' + dm(link.pagoEm || link.data) + '). Ao registrar, fica ligada a este lançamento.' : ', vence ' + dm(link.data) + '). Ao registrar, a conta é marcada como paga.') + ' <button type="button" class="lnk" data-df="unlink">Desvincular</button></div>' : '') +
      '<div class="fact"><button type="button" class="btn" id="btnRegD">Registrar despesa</button><span class="status">' + esc(view.dStatus || '') + '</span></div></div></section>';
    // pagos em Contas a pagar: só sugestão. Nada vai para a DRE sem alguém conferir e registrar.
    const pagos = S.contas.filter((c) => c.pago && !c.dreId && !c.dreSkip && c.id !== F.contaId).sort((a,b) => (b.pagoEm || b.data).localeCompare(a.pagoEm || a.data));
    const pagH = '<section class="panel pgpane"><div class="ph"><div><h2>Pagos em Contas a pagar</h2><small>Falta lançar na DRE · ' + pagos.length + '. Usar preenche a nova despesa para conferir e registrar; Descartar tira daqui sem lançar.</small></div></div><div class="pglist">' +
      (pagos.length ? pagos.map((c) => '<div class="pgrow' + (F.contaId === c.id ? ' on' : '') + '"><div class="pgt"><b>' + esc(c.forn) + '</b><span class="num">' + num(c.valor) + '</span></div><small>pago ' + dm(c.pagoEm || c.data) + ' · ' + esc(c.cat || 'sem categoria') + (c.sub ? ' · ' + esc(c.sub) : '') + '</small><div class="pga"><button type="button" class="btn sm pri" data-usep="' + c.id + '">Usar</button><button type="button" class="btn sm" data-pgx="' + c.id + '">Descartar</button></div></div>').join('')
        : '<p class="empty" style="margin:0;padding:24px 16px">Tudo o que foi pago em Contas a pagar já foi lançado ou descartado.</p>') + '</div></section>';
    const fE = '<section class="panel fcard fent"><div class="ph"><h2>Nova entrada</h2></div><div class="fbody">' +
      fld('Data', '<input type="date" id="eData" value="' + esc(E.data) + '">') +
      fld('Categoria', '<select id="eCat">' + opt(ECATS, E.cat) + '</select>') +
      fld('Cliente', '<input id="eCli" data-cbx="cliList" value="' + esc(E.cli) + '"><datalist id="cliList">' + CLIENTES.map((k) => '<option value="' + esc(k) + '">').join('') + '</datalist>') +
      fld('NF', '<input id="eNf" value="' + esc(E.nf) + '">') +
      fld('Valor', '<input id="eVal" class="val" inputmode="decimal" placeholder="0,00" value="' + esc(E.valor) + '">') +
      fld('Responsável', '<input id="eResp" value="' + esc(S.user) + '" readonly title="Quem está logado">') +
      fld('Observação', '<input id="eObs" value="' + esc(E.obs) + '">') +
      '<div class="fact"><button type="button" class="btn" id="btnRegE">Registrar entrada</button><span class="status">' + esc(view.eStatus || '') + '</span></div></div></section>';
    h += '<div class="dlay">' + pagH + '<div class="dright"><div class="dforms">' + fD + fE + '</div>';

    // tabelas do mês
    h += '<section class="panel"><div class="ph"><div class="mnav"><button type="button" class="nav" data-drel="mes:-1" aria-label="Mês anterior">‹</button><h2 style="min-width:190px;text-align:center">' + MESES[mm-1].replace(/^./, (x) => x.toUpperCase()) + ' de ' + mk.slice(0,4) + '</h2><button type="button" class="nav" data-drel="mes:1" aria-label="Próximo mês">›</button>' +
      '<span style="width:12px"></span><button type="button" data-drel="tab:sai" style="' + seg(view.drelTab === 'sai') + '">Despesas · ' + sai.length + '</button><button type="button" data-drel="tab:ent" style="' + seg(view.drelTab === 'ent') + '">Entradas · ' + ent.length + '</button></div>' +
      '<div class="stats"><div class="stat"><span class="lbl">Despesas</span><b class="num">' + money(sum(sai)) + '</b></div><div class="stat"><span class="lbl">Entradas</span><b class="num">' + money(sum(ent)) + '</b></div><div class="stat"><span class="lbl">Entradas na DRE</span><b class="num">' + money(naDre) + '</b></div></div></div>';
    const sm = (t) => '<small style="display:block;color:var(--muted)">' + esc(t) + '</small>';
    if (view.drelTab === 'sai') {
      h += '<div class="dhist"><table><thead><tr><th style="width:56px">Data</th><th style="width:22%">Fornecedor / descrição</th><th style="width:30%">Categoria · subcategoria</th><th style="width:80px">Empresa</th><th class="r" style="width:104px">Valor</th><th style="width:66px">Resp.</th><th>Observação</th></tr></thead><tbody>';
      if (!sai.length) h += '<tr><td colspan="7" class="empty">Nenhuma despesa lançada neste mês.</td></tr>';
      sai.forEach((x) => { h += '<tr class="clk" data-lanc="sai:' + x.id + '" title="Clique para editar ou excluir"><td class="num">' + dm(x.data) + '</td><td>' + esc(x.forn || '—') + (x.contaId ? sm('ligada a Contas a pagar') : '') + '</td><td>' + esc(x.cat || '—') + (x.sub ? sm(x.sub) : '') + '</td><td>' + esc(x.emp || '') + '</td><td class="r num">' + num(x.valor) + '</td><td>' + esc(x.resp || '—') + '</td><td style="color:var(--muted)">' + esc(x.obs || '') + '</td></tr>'; });
    } else {
      h += '<div class="dhist"><table><thead><tr><th style="width:56px">Data</th><th style="width:24%">Categoria</th><th style="width:22%">Cliente</th><th style="width:14%">NF</th><th class="r" style="width:110px">Valor</th><th style="width:66px">Resp.</th><th>Observação</th></tr></thead><tbody>';
      if (!ent.length) h += '<tr><td colspan="7" class="empty">Nenhuma entrada lançada neste mês.</td></tr>';
      ent.forEach((x) => { const fora = EXCL_ENT.includes(x.cat); h += '<tr class="clk" data-lanc="ent:' + x.id + '" title="Clique para editar ou excluir"' + (fora ? ' style="opacity:.75"' : '') + '><td class="num">' + dm(x.data) + '</td><td>' + esc(x.cat) + (fora ? sm('não entra na DRE') : '') + '</td><td>' + esc(x.cli || '—') + '</td><td>' + esc(x.nf || '') + '</td><td class="r num">' + num(x.valor) + '</td><td>' + esc(x.resp || '—') + '</td><td style="color:var(--muted)">' + esc(x.obs || '') + '</td></tr>'; });
    }
    h += '</tbody></table></div><div class="hint"><span>Clique num lançamento para editar ou excluir. Toda mudança fica na linha do tempo do lançamento e no log, com o nome de quem fez.</span></div></section>';
    h += '</div></div>';
    h += '<div class="foot"><span id="copyOut"></span></div>';
    app.innerHTML = h;
  }
  function matchSug(){
    const used = new Set();
    const out = [];
    const ddays = (a, b) => (parse(a) - parse(b)) / 86400000;
    S.saidas.filter((x) => !x.contaId && !x.semConta && x.data >= '2026-10-25').forEach((x) => {
      const c = S.contas.filter((c) => !c.pago && !c.dreId && !used.has(c.id) && Math.abs(c.valor - x.valor) < 0.01 && (Math.abs(ddays(x.data, c.data)) <= 10 || (isLate(c) && x.data >= origOf(c))))
        .sort((a, b) => Math.abs(ddays(x.data, a.data)) - Math.abs(ddays(x.data, b.data)))[0];
      if (c) { used.add(c.id); out.push({ s: x, c }); }
    });
    return out;
  }
  const linkPay = (s, c) => { if (!c.pago) pagar(c, s.data); else c.pagoEm = s.data; logC(c, 'Lançada na DRE'); c.pagoEm = s.data; c.dreId = s.id; s.contaId = c.id; };
  function regDespesa(){
    const F = view.dForm; const v = parseVal(F.valor);
    if (!F.data || !F.cat || isNaN(v) || v <= 0) { view.dStatus = 'Preencha data, categoria e valor.'; render(); return; }
    const s = { id: novoId('s'), data: F.data, cat: F.cat, sub: F.sub, emp: F.emp, valor: v, forn: F.forn.trim(), resp: S.user, obs: F.obs.trim(), contaId: null };
    const c = F.contaId ? S.contas.find((x) => x.id === F.contaId) : null;
    const hora = new Date().toLocaleTimeString('pt-BR');
    act('Despesa de ' + money(v) + ' registrada na DRE' + (c ? '. ' + c.forn + ' marcada como paga.' : '.') + (s.forn ? novoTxt(s.forn, s.cat, s.sub) : ''), () => { S.saidas.push(s); if (c) linkPay(s, c); if (s.forn) ensureForn(s.forn, s.cat, s.sub); });
    view.dStatus = '✅ Despesa registrada às ' + hora + (c ? ' · ligada à conta ' + c.forn : '');
    view.dForm = Object.assign(blankD(), { data: F.data, resp: F.resp });
    render();
  }
  function regEntrada(){
    const E = view.eForm; const v = parseVal(E.valor);
    if (!E.data || isNaN(v) || v <= 0) { view.eStatus = 'Preencha data e valor.'; render(); return; }
    const en = { id: novoId('e'), data: E.data, cat: E.cat, cli: E.cli.trim(), nf: E.nf.trim(), valor: v, resp: S.user, obs: E.obs.trim() };
    const hora = new Date().toLocaleTimeString('pt-BR');
    act('Entrada de ' + money(v) + ' registrada' + (EXCL_ENT.includes(en.cat) ? '. Ela não conta na DRE.' : '.'), () => { S.entradas.push(en); });
    view.eStatus = '✅ Entrada registrada às ' + hora;
    view.eForm = Object.assign(blankE(), { data: E.data, resp: E.resp });
    render();
  }

  // ---------- eventos ----------
  const byId = (id) => S.contas.find((c) => c.id === id);
  const shiftWeek = (n) => { view.week = n === 0 ? iso(monday(TODAY)) : iso(addDays(parse(view.week), 7*n)); view.paying = view.removing = null; render(); };
  document.addEventListener('click', (e) => {
    const bar = e.target.closest('.bar'); if (bar) { view.week = bar.dataset.week; render(); return; }
    const wn = e.target.closest('[data-wnav]'); if (wn) { shiftWeek(parseInt(wn.dataset.wnav,10)); return; }
    const mn = e.target.closest('[data-mnav]');
    if (mn) { const [y,m] = monthOfWeek(view.week).split('-').map(Number); const d = new Date(y, m-1 + parseInt(mn.dataset.mnav,10), 1); view.week = weeksOfMonth(d.getFullYear() + '-' + pad(d.getMonth()+1))[0]; render(); return; }
    const pb = e.target.closest('[data-p="del"]');
    if (pb) { const id = pb.closest('[data-pid]').dataset.pid; const p = S.previsoes.find((x) => x.id === id); act('Previsão ' + p.nome + ' removida.', () => { S.previsoes = S.previsoes.filter((x) => x !== p); }); return; }
    const ro = e.target.closest('[data-edit]') || (!e.target.closest('button, a, input, select, label') && (view.tela === 'pagar' || view.tela === 'of' || view.tela === 'pr') && e.target.closest('#app .clk[data-id]'));
    if (ro) { const c = byId(ro.dataset.edit || ro.dataset.id); if (c) { openEdit(c); return; } }
    if (view.modal === 'ofedit') { const c = byId(view.editId);
      if (e.target.id === 'oeSave') { saveOf(c); return; }
      if (e.target.id === 'oeRecClr') { readOf(); view.oed.rec = ''; render(); return; }
      if (e.target.id === 'oeUnrec') { act('Chegada de ' + c.forn + ' desfeita. O pagamento volta a contar da entrega prevista (' + dm(payFrom(c.entrega)) + ').', () => { marcarChegada(c, null); view.oed.rec = ''; }); return; }
      if (e.target.id === 'oeRecBtn') { openCal(e.target, { commit: true, max: HOJE, value: HOJE, onPick: (d) => act(c.forn + ' chegou em ' + dm(d) + '.', () => { marcarChegada(c, d); view.oed.rec = d; }) }); return; }
      if (e.target.id === 'oePay') { openCal(e.target, { commit: true, max: HOJE, value: HOJE, onPick: (d) => act(c.forn + ' paga em ' + dm(d) + '.', () => pagar(c, d)) }); return; }
      if (e.target.id === 'oeUnpay') { if (c.dreId) { toast('Essa conta já está lançada na DRE. Remova o lançamento em DRE lançamentos para desfazer.', false); return; } act('Pagamento de ' + c.forn + ' desfeito.', () => despagar(c)); return; }
      if (e.target.id === 'eDel') { view.edDel = true; render(); return; }
      if (e.target.id === 'eDelNo') { view.edDel = false; render(); return; }
      if (e.target.id === 'eDelOk') { view.modal = null; act(c.forn + ' excluída.', () => { S.contas = S.contas.filter((x) => x !== c); }); return; }
    }
    const oab = e.target.closest('[data-oa]');
    if (oab) { const c = byId(oab.closest('[data-id]').dataset.id); if (!c) return;
      if (oab.dataset.oa === 'rec') { openCal(oab, { commit: true, max: HOJE, value: HOJE, onPick: (d) => act(c.forn + ' chegou em ' + dm(d) + '.' + (c.payManual ? '' : ' Pagamento em ' + dm(payFrom(d)) + '.'), () => marcarChegada(c, d)) }); return; }
      if (oab.dataset.oa === 'unrec') { if (c.pago) { toast('Essa entrega já foi paga. Desfaça o pagamento em Contas a pagar antes.', false); return; } act('Chegada de ' + c.forn + ' desfeita. O pagamento volta a contar da entrega prevista (' + dm(payFrom(c.entrega)) + ').', () => marcarChegada(c, null)); return; }
      if (oab.dataset.oa === 'ent') { openCal(oab, { commit: true, min: HOJE, value: c.entrega > HOJE ? c.entrega : HOJE, onPick: (d) => act('Entrega de ' + c.forn + ' mudou para ' + dm(d) + '.', () => mudarEntrega(c, d)) }); return; }
    }
    const omn = e.target.closest('[data-omnav]'); if (omn) { const d = new Date(+monthOfWeek(view.ofWeek).slice(0,4), +monthOfWeek(view.ofWeek).slice(5,7) - 1 + +omn.dataset.omnav, 1); view.ofWeek = weeksOfMonth(d.getFullYear() + '-' + pad(d.getMonth()+1))[0]; render(); return; }
    const owk = e.target.closest('[data-oweek]'); if (owk) { view.ofWeek = owk.dataset.oweek; render(); return; }
    const ofh = e.target.closest('[data-ofh]'); if (ofh) { view.ofHist = ofh.dataset.ofh; render(); return; }
    if (e.target.closest('[data-ofclr]')) { view.ofForn = ''; render(); return; }
    if (view.modal === 'edit') { const c = byId(view.editId);
      if (e.target.id === 'eSave') { saveEdit(c); return; }
      if (e.target.id === 'ePay') { openCal(e.target, { commit: true, max: HOJE, value: HOJE, onPick: (d) => act(c.forn + ' paga em ' + dm(d) + '.', () => pagar(c, d)) }); return; }
      if (e.target.id === 'eUnpay') { if (c.dreId) { toast('Essa conta já está lançada na DRE. Remova o lançamento em DRE lançamentos para desfazer.', false); return; } act('Pagamento de ' + c.forn + ' desfeito.', () => despagar(c)); view.ed.data = c.data; return; }
      if (e.target.id === 'eDel') { view.edDel = true; render(); return; }
      if (e.target.id === 'eDelNo') { view.edDel = false; render(); return; }
      if (e.target.id === 'eDelOk') { view.modal = null; act(c.forn + ' excluída.', () => { S.contas = S.contas.filter((x) => x !== c); }); return; }
    }
    const b = e.target.closest('button[data-a]');
    if (b) {
      const row = b.closest('[data-id]'); const c = row && byId(row.dataset.id); if (!c) return;
      const a = b.dataset.a;
      if (a === 'prorPick') { openCal(b, { commit: true, min: HOJE, title: 'Prorrogar ' + c.forn + ' para', onPick: (d) => act(c.forn + ' prorrogada para ' + dm(d) + (weekOf(d) !== view.week ? ', semana de ' + weekLabel(weekOf(d)) : '') + '.', () => setDate(c, d)) }); return; }
      if (a === 'pay') { openCal(b, { commit: true, max: HOJE, value: HOJE, onPick: (d) => act(c.forn + ' paga em ' + dm(d) + '. Ela aparece em DRE lançamentos para lançar.', () => pagar(c, d)) }); return; }
      if (a === 'payOld') { view.paying = c.id; view.payWhere = b.closest('.venc-row') ? 'top' : 'tbl'; view.removing = null; render(); const d = document.getElementById('payDate'); if (d) d.focus(); }
      if (a === 'payOk') { const pi = b.parentElement.querySelector('input[type=date]'); const d = (pi && pi.value) || HOJE; act(c.forn + ' paga em ' + dm(d) + '. Ela aparece em DRE lançamentos para lançar.', () => pagar(c, d)); }
      if (a === 'cancel') { view.paying = view.removing = view.proring = null; render(); }
      if (a === 'prorOpen') { view.proring = c.id; view.paying = view.removing = null; render(); const d = document.getElementById('prorNew'); if (d) d.focus(); }
      if (a === 'prorOk') { const d = document.getElementById('prorNew').value; if (!d || d < HOJE) { toast('Escolha uma data a partir de hoje.', false); return; } act(c.forn + ' prorrogada para ' + dm(d) + (weekOf(d) !== view.week ? ', semana de ' + weekLabel(weekOf(d)) : '') + '.', () => setDate(c, d)); }
      if (a === 'hist') { view.histOpen = view.histOpen === c.id ? null : c.id; render(); }
      if (a === 'unpay') { if (c.dreId) { toast('Essa conta já está lançada na DRE. Remova o lançamento em DRE lançamentos para desfazer.', false); return; } act('Pagamento de ' + c.forn + ' desfeito.', () => despagar(c)); }
      if (a === 'pror') act(c.forn + ' prorrogada para ' + dm(b.dataset.d) + '.', () => setDate(c, b.dataset.d));
      if (a === 'del') { view.removing = c.id; view.paying = null; render(); }
      if (a === 'delOk') act(c.forn + ' removida.', () => { S.contas = S.contas.filter((x) => x !== c); });
      return;
    }
    if (e.target.id === 'btnAdd') { addConta(); return; }
    if (e.target.id === 'pAdd') { addPrev(); return; }
    const rvb = e.target.closest('[data-rv]');
    if (rvb) { const a = rvb.dataset.rv;
      if (a === 'reopen') { delete S.prevReview[closedMk]; save(); render(); return; }
      const all = reviewRows().filter((r) => !(S.prevReview[closedMk] || {})[r.k]).map((r) => r.k);
      if (a === 'allAvg') { act('Previsões futuras atualizadas pela média.', () => applyReview(all, true)); return; }
      if (a === 'allKeep') { act('Previsões futuras mantidas.', () => applyReview(all, false)); return; }
      const k = rvb.closest('[data-rk]').dataset.rk;
      act(a === 'avg' ? 'Previsão atualizada pela média nos próximos meses.' : 'Previsão mantida.', () => applyReview([k], a === 'avg')); return; }
    if (e.target.closest('[data-rvopen]')) { view.rvOpen = true; render(); return; }
    const gc = e.target.closest('[data-gocfg]'); if (gc) { view.tela = 'cfg'; view.cfgTab = gc.dataset.gocfg; view.pvYear = +CUR.slice(0,4); render(); window.scrollTo(0,0); return; }
    const rp = e.target.closest('[data-resetpw]'); if (rp) { const u = rp.dataset.resetpw;
      api.chamar('usuarios.redefinir', { nome: u }).then((r) => { S.senhas[u] = false; S.convites[u] = r.convite; S.logs.unshift({ em: agora(), por: S.user, txt: 'Senha de ' + u + ' redefinida', tela: 'cfg' }); render(); toast('Senha de ' + u + ' redefinida. Novo código de convite: ' + r.convite, false); }, (err) => toast(err.message, false)); return; }
    if (e.target.closest('#btnSair')) { sair(); return; }
    if (e.target.id === 'uAdd') { const n = document.getElementById('uNome').value.trim(); if (!n) return; if (S.usuarios.includes(n)) { toast(n + ' já existe.', false); return; }
      api.chamar('usuarios.adicionar', { nome: n }).then((r) => { S.usuarios.push(n); S.senhas[n] = false; S.convites[n] = r.convite; S.logs.unshift({ em: agora(), por: S.user, txt: 'Usuário ' + n + ' adicionado', tela: 'cfg' }); render(); toast(n + ' adicionado. Código de convite: ' + r.convite, false); }, (err) => toast(err.message, false)); return; }
    const ct = e.target.closest('[data-cfgtab]'); if (ct) { view.cfgTab = ct.dataset.cfgtab; render(); return; }
    const lc = e.target.closest('[data-lcat]'); if (lc) { view.cfgCat = lc.dataset.lcat; view.cfgQ = ''; view.cfNewSub = ''; render(); return; }
    const py = e.target.closest('[data-pvy]'); if (py) { view.pvYear = (view.pvYear || +CUR.slice(0,4)) + +py.dataset.pvy; render(); return; }
    const lpg = e.target.closest('[data-lpg]'); if (lpg) { view.logPg = +lpg.dataset.lpg; render(); return; }
    const pva = e.target.closest('[data-pva]');
    if (pva && pva.dataset.pva === 'modelo') { pvModelo(); return; }
    if (pva && pva.dataset.pva === 'importar') { document.getElementById('pvFile').click(); return; }
    if (e.target.id === 'pvImpOk') { pvAplicar(); return; }
    if (pva) { const y = view.pvYear || +CUR.slice(0,4); const months = Array.from({ length: 12 }, (_, i) => y + '-' + pad(i + 1)).filter((mk) => mk > CUR); const rows = pvRows(y);
      if (pva.dataset.pva === 'fillAll') { let n = 0; act('Meses vazios preenchidos com o mês anterior.', () => { rows.forEach((r) => { let last = null; Object.keys(r.m).sort().forEach((mk) => { if (mk <= CUR) last = r.m[mk].valor; }); months.forEach((mk) => { if (r.m[mk]) last = r.m[mk].valor; else if (last != null) { setPrev(r, mk, last); n++; } }); }); }); return; }
      if (pva.dataset.pva === 'avgAll') { act('Média aplicada em todos os meses depois de ' + mesNome(CUR) + '.', () => { rows.forEach((r) => { const av = avgPrev(r.base); if (av) months.forEach((mk) => setPrev(r, mk, av)); }); S.prevReview[closedMk] = Object.fromEntries(reviewRows().map((r) => [r.k, 'media'])); }); return; } }
    const pvr = e.target.closest('[data-pvr]');
    if (pvr) { const y = view.pvYear || +CUR.slice(0,4); const k = pvr.closest('[data-rk]').dataset.rk; const r = pvRows(y).find((x) => x.k === k); const months = Array.from({ length: 12 }, (_, i) => y + '-' + pad(i + 1)).filter((mk) => mk > CUR);
      if (pvr.dataset.pvr === 'avg') { const av = avgPrev(r.base); act(r.base.nome + ': média ' + num(av) + ' de ' + mesNome(mAdd(CUR,1)) + ' em diante.', () => months.forEach((mk) => setPrev(r, mk, av))); }
      if (pvr.dataset.pvr === 'rep') { const src = r.m[CUR] || Object.keys(r.m).filter((mk) => mk <= CUR).sort().map((mk) => r.m[mk]).pop() || r.base; act(r.base.nome + ': ' + num(src.valor) + ' repetido nos meses seguintes.', () => months.forEach((mk) => setPrev(r, mk, src.valor))); }
      if (pvr.dataset.pvr === 'del') { act(r.base.nome + ' removida dos meses futuros.', () => { S.previsoes = S.previsoes.filter((p) => !(pKey(p) === k && p.mes > CUR)); }); }
      return; }
    if (e.target.id === 'cfAdd') { const nome = document.getElementById('cfNome').value.trim(), cat = view.cfgCat || AC, sub = document.getElementById('cfSub').value;
      if (!nome) { toast('Escreva o nome do fornecedor.', false); return; }
      if ((S.fornecedores || []).some((f) => f.nome.toUpperCase() === nome.toUpperCase() && f.cat === cat && f.sub === sub)) { toast(nome + ' já está cadastrado aí.', false); return; }
      view.cfNewCat = cat; view.cfNewSub = sub;
      act(nome + ' cadastrado em ' + cat + (sub ? ' · ' + sub : '') + '.', () => { S.fornecedores = S.fornecedores || []; S.fornecedores.push({ id: novoId('f'), nome, cat, sub }); }); return; }
    const cfd = e.target.closest('[data-cf="del"]');
    if (cfd) { const id = cfd.closest('[data-fid]').dataset.fid; const f = S.fornecedores.find((x) => x.id === id); act(f.nome + ' removido da lista.', () => { S.fornecedores = S.fornecedores.filter((x) => x.id !== id); }); return; }
    if (e.target.closest('#btnPdf')) { gerarPdf(); return; }
    if (e.target.closest('#btnXls')) { if (view.tela === 'drel') exportarLancXlsx(); else exportarDreXlsx(); return; }
    if (e.target.id === 'btnNew' && view.tela === 'parc') { view.modal = 'parcnew'; view.pf = blankPF(); render(); const f = document.getElementById('pcNome'); if (f) f.focus(); return; }
    if (e.target.id === 'btnNew') { view.modal = view.tela === 'of' ? 'of' : 'conta'; render(); const f = document.getElementById(view.modal === 'of' ? 'oForn' : 'nForn'); if (f) f.focus(); return; }
    if (e.target.closest('[data-modal-close]') || e.target.matches('[data-modal-bg]')) { view.modal = null; render(); return; }
    const gp = e.target.closest('[data-gopay]'); if (gp) { const c = byId(gp.dataset.gopay); if (c) goPay(c); return; }
    const gt = e.target.closest('[data-goto]'); if (gt) { view.tela = 'pagar'; view.week = weekOf(gt.dataset.goto); render(); const t = document.getElementById('wh'); if (t) t.scrollIntoView({block:'start'}); return; }
    const db = e.target.closest('[data-dre]');
    if (db) { const [k, v] = db.dataset.dre.split(/:(.*)/s); if (k === 'tog') view.dreOpen[v] = !view.dreOpen[v]; render(); return; }
    const dl = e.target.closest('[data-drel]');
    if (dl) { const [k, v] = dl.dataset.drel.split(':'); if (k === 'tab') view.drelTab = v; if (k === 'mes') { const [y,m] = view.drelMes.split('-').map(Number); const d = new Date(y, m-1+parseInt(v,10), 1); view.drelMes = d.getFullYear() + '-' + pad(d.getMonth()+1); } view.removing = null; render(); return; }
    const xb = e.target.closest('button[data-x]');
    if (xb) { const row = xb.closest('[data-xid]'); const L = row.dataset.xk === 'sai' ? 'saidas' : 'entradas'; const it = S[L].find((x) => x.id === row.dataset.xid); const a = xb.dataset.x;
      if (a === 'del') { view.removing = it.id; render(); }
      if (a === 'cancel') { view.removing = null; render(); }
      if (a === 'delOk') act((L === 'saidas' ? 'Despesa' : 'Entrada') + ' removida da DRE.', () => { if (it.contaId) { const c = S.contas.find((x) => x.id === it.contaId); if (c) { despagar(c); c.dreId = null; logC(c, 'Lançamento da DRE removido'); } } S[L] = S[L].filter((x) => x !== it); });
      return; }
    const up = e.target.closest('[data-usep]');
    if (up) { const c = S.contas.find((x) => x.id === up.dataset.usep); view.dForm = Object.assign({}, view.dForm, { contaId: c.id, data: c.pagoEm || c.data, cat: c.cat, sub: c.sub, valor: num(c.valor), forn: c.forn }); view.dStatus = ''; render(); return; }
    const pgx = e.target.closest('[data-pgx]');
    if (pgx) { const c = S.contas.find((x) => x.id === pgx.dataset.pgx); act(c.forn + ' (' + money(c.valor) + ') descartado do lançamento na DRE.', () => { c.dreSkip = true; logC(c, 'Descartada do lançamento na DRE'); }); return; }
    const us = e.target.closest('[data-use]');
    if (us) { const c = S.contas.find((x) => x.id === us.dataset.use); view.dForm = Object.assign({}, view.dForm, { contaId: c.id, data: c.data < HOJE ? HOJE : view.dForm.data, cat: c.cat, sub: c.sub, valor: num(c.valor), forn: c.forn }); view.dStatus = ''; render(); return; }
    if (e.target.closest('[data-df="unlink"]')) { view.dForm.contaId = null; render(); return; }
    if (e.target.id === 'btnRegD') { regDespesa(); return; }
    if (e.target.id === 'btnRegE') { regEntrada(); return; }
    const rw = e.target.closest('[data-rwin]'); if (rw) { const n = +rw.dataset.rwin; view.repWin = n === 0 ? mAdd(CUR, -1) : mAdd(view.repWin || mAdd(CUR, -1), n); view.repSel = null; render(); return; }
    const rs = e.target.closest('[data-rsel]'); if (rs) { const m = rs.dataset.rsel; if (m === 'all') view.repSel = null; else { const cur = view.repSel || []; const allOn = cur.length === repMonths().length; view.repSel = allOn ? [m] : cur.includes(m) ? cur.filter((x) => x !== m) : cur.concat(m); if (!view.repSel.length) view.repSel = null; } render(); return; }
    const rv = e.target.closest('[data-rval]'); if (rv) { view.relVal = rv.dataset.rval; render(); return; }
    const rb = e.target.closest('[data-rel]');
    if (rb) { const [k, v] = rb.dataset.rel.split(/:(.*)/s);
      if (k === 'vis') view.relVis = v;
      if (k === 'val') view.relVal = v;
      if (k === 'mes') { const [y,m] = view.relMes.split('-').map(Number); const d = new Date(y, m-1+parseInt(v,10), 1); view.relMes = d.getFullYear() + '-' + pad(d.getMonth()+1); }
      if (k === 'tog') view.relOpen[v] = !view.relOpen[v];
      if (k === 'open') { view.relOpen = {}; if (v === 'all') Object.keys(relData().rows).forEach((c) => { view.relOpen[c] = true; }); }
      render(); return; }
    const pw = e.target.closest('[data-prwin]'); if (pw) { const n = +pw.dataset.prwin; view.prWin = n === 0 ? CUR : mAdd(view.prWin || CUR, n); if (view.prMes > view.prWin || view.prMes < mAdd(view.prWin, -3)) view.prMes = n === 0 ? mAdd(CUR, -1) : (n > 0 ? view.prWin : mAdd(view.prWin, -3)); render(); return; }
    const prt = e.target.closest('[data-prtab]'); if (prt) { view.prTab = prt.dataset.prtab; render(); return; }
    const pb2 = e.target.closest('[data-prbar]'); if (pb2) { view.prMes = pb2.dataset.prbar; render(); return; }
    const pl = e.target.closest('[data-prlink]'); if (pl) { view.tela = 'pr'; view.prMes = pl.dataset.prlink; render(); window.scrollTo(0,0); return; }
    const tb = e.target.closest('[data-tela]'); if (tb) { view.tela = tb.dataset.tela; render(); return; }
    const on = e.target.closest('[data-onav]'); if (on) { const n = parseInt(on.dataset.onav,10); view.ofWeek = n === 0 ? iso(monday(TODAY)) : iso(addDays(parse(view.ofWeek), 7*n)); view.receiving = null; render(); return; }
    const ob = e.target.closest('button[data-o]');
    if (ob) {
      const row = ob.closest('[data-id]'); const c = row && byId(row.dataset.id); if (!c) return;
      const o = ob.dataset.o;
      if (o === 'rec') { view.receiving = c.id; view.recWhere = ob.closest('.venc-row') ? 'top' : 'tbl'; render(); }
      if (o === 'cancel') { view.receiving = null; render(); }
      if (o === 'recOk') { const ri = ob.parentElement.querySelector('input[type=date]'); const d = (ri && ri.value) || HOJE; act(c.forn + ' chegou em ' + dm(d) + '.' + (c.payManual || c.pago ? '' : ' Pagamento em ' + dm(payFrom(d)) + '.'), () => { c.recebidoEm = d; syncOf(c); view.receiving = null; }); }
      if (o === 'unrec') act('Recebimento de ' + c.forn + ' desfeito.', () => { c.recebidoEm = null; syncOf(c); });
      if (o === 'histEnt') { view.histOpen = view.histOpen === c.id ? null : c.id; render(); }
      return;
    }
    if (e.target.id === 'btnAddOf') { addOf(); return; }
    if (e.target.id === 'btnCopy') { copyExcel(); return; }
  });
  // abre o calendário ao clicar em qualquer campo de data
  // datas de linhas existentes só gravam quando você clica em Salvar
  const COMMIT_DATE = '[data-f="data"],[data-o="entrega"],[data-o="receb"],[data-o="entDate"],[data-a="prorDate"],[data-xf="data"]';
  function pendDate(t){
    const host = t.closest('td') || t.closest('label') || t.parentElement;
    if (host.querySelector('.dsave')) return;
    const box = document.createElement('span'); box.className = 'dsave';
    box.innerHTML = '<button type="button" class="btn sm pri" data-dsave>Salvar</button><button type="button" class="btn sm" data-dcancel aria-label="Cancelar mudança de data">✕</button>';
    (t.closest('label') || t).insertAdjacentElement('afterend', box);
    t.classList.add('pending');
  }
  document.addEventListener('click', (e) => {
    const sv = e.target.closest('[data-dsave]');
    if (sv) { e.stopPropagation(); const box = sv.closest('.dsave'); const host = box.parentElement; const t = host.querySelector('input.pending'); if (!t || !t.value) { render(); return; } if (t.value.slice(0,4) < '2000') { toast('Data incompleta.', false); return; } t._force = true; t.dispatchEvent(new Event('change', { bubbles: true })); return; }
    if (e.target.closest('[data-dcancel]')) { e.stopPropagation(); render(); return; }
  }, true);
  document.addEventListener('keydown', (e) => {
    const t = e.target; if (!(t.matches && t.matches('input.pending'))) return;
    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); const b = t.parentElement.querySelector('[data-dsave]') || (t.closest('label') && t.closest('label').parentElement.querySelector('[data-dsave]')); if (b) b.click(); }
    if (e.key === 'Escape') { e.preventDefault(); render(); }
  }, true);

  // ---------- mini calendário para todo campo de data ----------
  let cal = null;

  // ---------- busca geral ----------
  const norm = (x) => (x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  let gSel = -1, gList = [];
  function gSearch(){
    const inp = document.getElementById('gSearch'), box = document.getElementById('gRes');
    const q = norm(inp.value.trim());
    if (q.length < 2) { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); gList = []; return; }
    const terms = q.split(/\s+/);
    const isO = view.tela === 'of';
    const hit = (isO ? S.contas.filter(isOf) : S.contas).filter((c) => { const t = norm(c.forn + ' ' + c.cat + ' ' + c.sub); return terms.every((w) => t.includes(w)); });
    const rank = (c) => isO ? ({ atrasada: 0, chegou: 1, achegar: 1, pago: 2 })[ofSt(c)] : (c.pago ? 2 : isLate(c) ? 0 : 1);
    hit.sort((a, b) => rank(a) - rank(b) || Math.abs(parse(isO ? a.entrega : a.data) - TODAY) - Math.abs(parse(isO ? b.entrega : b.data) - TODAY));
    gList = hit.slice(0, 40); gSel = gList.length ? 0 : -1;
    const tot = sum(hit.filter((c) => !c.pago));
    const mk = (txt) => { let h = esc(txt); terms.forEach((w) => { const n = norm(txt); const i = n.indexOf(w); if (i >= 0) h = esc(txt.slice(0, i)) + '<mark>' + esc(txt.slice(i, i + w.length)) + '</mark>' + esc(txt.slice(i + w.length)); }); return h; };
    box.innerHTML = gList.length ? '<div class="gh">' + hit.length + (hit.length === 1 ? ' conta' : ' contas') + (tot ? ' · em aberto ' + money(tot) : '') + (hit.length > 40 ? ' · mostrando as 40 mais próximas de hoje' : '') + '</div>' +
      gList.map((c, i) => { let st = c.pago ? '<span class="chip c-paid">Pago</span>' : isLate(c) ? '<span class="chip c-late">Vencida</span>' : isPror(c) ? '<span class="chip c-pror">Prorrogada</span>' : isAnt(c) ? '<span class="chip c-ant">Antecipada</span>' : '<span class="chip c-open">A pagar</span>';
        if (isO) st = ofChip(c).replace(/<small[^>]*>.*?<\/small>/, '');
        return '<button type="button" role="option" data-gid="' + c.id + '"' + (i === gSel ? ' class="on"' : '') + '><span class="gd">' + dm(isO ? c.entrega : c.data) + '</span><span class="gn"><b>' + mk(c.forn) + '</b><small>' + mk(c.cat || 'sem categoria') + (c.sub ? ' · ' + mk(c.sub) : '') + '</small></span><span class="gv">' + num(c.valor) + '</span>' + st + '</button>'; }).join('')
      : '<div class="empty">Nada encontrado para "' + esc(inp.value.trim()) + '". Tente outro fornecedor ou categoria.</div>';
    box.hidden = false; inp.setAttribute('aria-expanded', 'true');
  }
  function gClose(){ const b = document.getElementById('gRes'); if (b) b.hidden = true; const i = document.getElementById('gSearch'); if (i) i.setAttribute('aria-expanded', 'false'); }
  function gOpen(id){ const c = byId(id); if (!c) return; gClose(); openEdit(c); }
  document.addEventListener('input', (e) => { if (e.target.id === 'gSearch') gSearch(); });
  document.addEventListener('focusin', (e) => { if (e.target.id === 'gSearch' && e.target.value.trim().length >= 2) gSearch(); });
  document.addEventListener('mousedown', (e) => { const g = e.target.closest && e.target.closest('[data-gid]'); if (g) { e.preventDefault(); gOpen(g.dataset.gid); return; } if (!(e.target.closest && e.target.closest('.gsearch'))) gClose(); }, true);
  document.addEventListener('keydown', (e) => {
    if (e.target.id !== 'gSearch') return;
    const btns = [...document.querySelectorAll('#gRes [data-gid]')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!btns.length) return; gSel = (gSel + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length; btns.forEach((b, i) => b.classList.toggle('on', i === gSel)); btns[gSel].scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter') { e.preventDefault(); if (gList[gSel]) gOpen(gList[gSel].id); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (e.target.value) { e.target.value = ''; gClose(); } else e.target.blur(); }
  }, true);
  window.addEventListener('scroll', () => { const tb = document.getElementById('topBar'); if (tb) tb.classList.toggle('stuck', window.scrollY > 4); }, { passive: true });

  // ---------- PDF do relatório ----------
  const loadJs = (src) => new Promise((ok, no) => { if (document.querySelector('script[src="' + src + '"]')) return ok(); const t = document.createElement('script'); t.src = src; t.onload = ok; t.onerror = () => no(new Error('falha ao carregar ' + src)); document.head.appendChild(t); });
  function pdfPages(){
    if (!view.repWin) view.repWin = mAdd(CUR, -1);
    const months6 = repMonths();
    const sel = months6.filter((m) => !view.repSel || view.repSel.includes(m));
    const D = sel.map(repMonth);
    const ml = (m) => cap(mesNome(m)) + (m.slice(0,4) !== CUR.slice(0,4) ? '/' + m.slice(2,4) : '');
    const ms = (m) => cap(mesNome(m)).slice(0,3) + (m.slice(0,4) !== CUR.slice(0,4) ? '/' + m.slice(2,4) : '');
    const my = (m) => cap(mesNome(m)).slice(0,3) + '/' + m.slice(2,4);
    const periodo = sel.length === 1 ? cap(mesNome(sel[0])) + ' ' + sel[0].slice(0,4) : my(sel[0]) + ' a ' + my(sel[sel.length-1]);
    const T = (k) => D.reduce((a, o) => a + o[k], 0);
    const tP = T('pago'), tA = T('aberto'), tV = T('prev'), tT = tP + tA + tV;
    const n = num, mi = (v) => v >= 1e6 ? 'R$ ' + (v/1e6).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' mi' : v >= 1000 ? 'R$ ' + Math.round(v/1000).toLocaleString('pt-BR') + ' mil' : money(v);
    const hm = histMonths().length;
    const pages = [];
    // página 1: resumo
    const max = Math.max(1, ...D.map((o) => o.tot)), H = 190;
    const bars = D.map((o) => { const a = o.pago / max * H, b = o.aberto / max * H, c = o.prev / max * H;
      return '<div class="pc"><b>' + mi(o.tot).replace('R$ ', '') + '</b><div class="pcb"><i style="height:' + c.toFixed(1) + 'px;background:#F6E7B4;box-shadow:inset 0 0 0 1.5px #B8900F"></i><i style="height:' + b.toFixed(1) + 'px;background:#D3A512"></i><i style="height:' + a.toFixed(1) + 'px;background:#102574"></i></div><span>' + ms(o.m) + '</span></div>'; }).join('');
    let p1 = '<h1>Previsão de saídas — ' + periodo + '</h1><p class="sub">MRBL · Pago = contas já pagas · A pagar = contas lançadas ainda não pagas · Previsão = estimativa pela média histórica que ainda não virou conta · emitido em ' + dmy(HOJE) + ' por ' + esc(S.user) + '</p>';
    p1 += '<div class="kp"><div><span>Pago</span><b>' + mi(tP) + '</b><small>' + (tT ? Math.round(tP / tT * 100) : 0) + '% do período</small></div><div><span>A pagar · lançado</span><b>' + mi(tA) + '</b><small>contas já lançadas</small></div><div><span>Previsão · média histórica</span><b>' + mi(tV) + '</b><small>ainda sem conta lançada</small></div><div class="d"><span>Total do período</span><b>' + mi(tT) + '</b><small>média ' + mi(tT / Math.max(1, sel.length)) + '/mês</small></div></div>';
    p1 += '<div class="two"><div><h2>Por mês</h2><div class="lg"><i style="background:#102574"></i>Pago <i style="background:#D3A512"></i>A pagar <i style="background:#F6E7B4;box-shadow:inset 0 0 0 1.5px #B8900F"></i>Previsão</div><div class="pch">' + bars + '</div></div>';
    p1 += '<div><h2>Mês a mês (R$)</h2><table><thead><tr><th>Mês</th><th class="r">Pago</th><th class="r">A pagar</th><th class="r">Previsão</th><th class="r">Total</th></tr></thead><tbody>' + D.map((o) => '<tr><td>' + ml(o.m) + '</td><td class="r">' + n(o.pago) + '</td><td class="r">' + n(o.aberto) + '</td><td class="r">' + n(o.prev) + '</td><td class="r"><b>' + n(o.tot) + '</b></td></tr>').join('') + '</tbody><tfoot><tr><td>Total</td><td class="r">' + n(tP) + '</td><td class="r">' + n(tA) + '</td><td class="r">' + n(tV) + '</td><td class="r">' + n(tT) + '</td></tr></tfoot></table></div></div>';
    // categorias
    const cats = {}; D.forEach((o) => Object.keys(o.cats).forEach((k) => { const c = o.cats[k], r = cats[k] = cats[k] || { pago: 0, aberto: 0, prev: 0 }; r.pago += c.pago; r.aberto += c.aberto; r.prev += c.prev; }));
    const ck = Object.keys(cats).sort((a, b) => (cats[b].pago + cats[b].aberto + cats[b].prev) - (cats[a].pago + cats[a].aberto + cats[a].prev));
    const cmax = Math.max(1, ...ck.map((k) => cats[k].pago + cats[k].aberto + cats[k].prev));
    p1 += '<h2>Por categoria (R$)</h2><table class="cat"><thead><tr><th>Categoria</th><th class="r">Pago</th><th class="r">A pagar</th><th class="r">Previsão</th><th class="r">Total</th><th style="width:90px"></th></tr></thead><tbody>' + ck.slice(0, 18).map((k) => { const r = cats[k], t = r.pago + r.aberto + r.prev; return '<tr><td>' + esc(cap(k.toLowerCase())) + '</td><td class="r">' + n(r.pago) + '</td><td class="r">' + n(r.aberto) + '</td><td class="r">' + n(r.prev) + '</td><td class="r"><b>' + n(t) + '</b></td><td><span class="wb"><i style="width:' + (t / cmax * 100).toFixed(1) + '%"></i></span></td></tr>'; }).join('') + (ck.length > 18 ? '<tr><td colspan="6" class="mut">+ ' + (ck.length - 18) + ' categorias menores</td></tr>' : '') + '</tbody></table>';
    pages.push({ t: 'Resumo', h: p1 });
    // página 2: previsões
    const prevRows = [];
    const byKey = {};
    sel.filter((m) => m >= CUR).forEach((m) => prevsOf(m).forEach((p) => { const k = pKey(p); const r = byKey[k] = byKey[k] || { nome: p.nome, cat: p.cat, sub: p.subs.join(', ') || 'todas', m: {} }; const l = sum(S.contas.filter((c) => c.data.slice(0,7) === m && matchPrev(p, c))); r.m[m] = { v: p.valor, l, s: Math.max(0, p.valor - l) }; }));
    const pm = sel.filter((m) => m >= CUR);
    let p2 = '<h1 class="h1s">Previsões pela média histórica</h1><p class="sub">Para custos que ainda não têm conta lançada (oficinas, férias, rescisões, manutenção, taxas…) usamos uma estimativa por mês. Ela vem da média dos últimos ' + hm + ' meses fechados na DRE e pode ser ajustada em Configurações › Previsões. Conforme as contas da mesma categoria e subcategoria são lançadas, elas descontam da previsão: no total do relatório entra só o que <b>ainda falta lançar</b>, para não contar duas vezes.</p>';
    if (pm.length && Object.keys(byKey).length) {
      const ks = Object.keys(byKey).sort((a, b) => Object.values(byKey[b].m).reduce((x, y) => x + y.v, 0) - Object.values(byKey[a].m).reduce((x, y) => x + y.v, 0));
      p2 += '<h2>Previsões do período (R$) · previsto / já lançado / falta lançar</h2><table><thead><tr><th>Previsão</th><th>Categoria</th>' + pm.map((m) => '<th class="r">' + ms(m) + '</th>').join('') + '<th class="r">Falta lançar</th></tr></thead><tbody>' +
        ks.map((k) => { const r = byKey[k]; const fl = Object.values(r.m).reduce((a, x) => a + x.s, 0); return '<tr><td>' + esc(r.nome) + '</td><td class="mut">' + esc(cap(r.cat.toLowerCase())) + '</td>' + pm.map((m) => r.m[m] ? '<td class="r"><b>' + n(r.m[m].v) + '</b><small>' + n(r.m[m].l) + ' / ' + n(r.m[m].s) + '</small></td>' : '<td class="r mut">—</td>').join('') + '<td class="r"><b>' + n(fl) + '</b></td></tr>'; }).join('') +
        '</tbody><tfoot><tr><td colspan="2">Total que ainda falta lançar</td>' + pm.map((m) => '<td class="r">' + n(Object.values(byKey).reduce((a, r) => a + (r.m[m] ? r.m[m].s : 0), 0)) + '</td>').join('') + '<td class="r">' + n(tV) + '</td></tr></tfoot></table>';
    } else p2 += '<p class="mut">Nenhuma previsão para os meses do período (previsões só valem do mês atual em diante).</p>';
    p2 += '<div class="note"><b>Como ler:</b> Pago = saiu do caixa no mês (data do pagamento). A pagar = contas lançadas e ainda não pagas, pela data de vencimento atual. Previsão = estimativa pela média histórica que ainda não tem conta. As páginas seguintes listam as contas a pagar e as pagas de cada mês.</div>';
    pages.push({ t: 'Previsões', h: p2 });
    // listas
    const ROWS = 50;
    const listPages = (titulo, contas, dateOf) => {
      const lines = []; let lastD = null;
      contas.sort((a, b) => dateOf(a).localeCompare(dateOf(b)) || b.valor - a.valor).forEach((c) => { const d = dateOf(c); if (d !== lastD) { lastD = d; lines.push({ day: d, tot: contas.filter((x) => dateOf(x) === d).reduce((a, x) => a + x.valor, 0) }); } lines.push({ c }); });
      if (!lines.length) return;
      const tot = contas.reduce((a, c) => a + c.valor, 0);
      for (let i = 0; i < lines.length; i += ROWS) {
        const chunk = lines.slice(i, i + ROWS);
        let hh = '<h1 class="h1s">' + titulo + '</h1><p class="sub">' + contas.length + ' contas · total ' + money(tot) + (i ? ' · continuação' : '') + '</p><table class="ls"><thead><tr><th style="width:62px">Data</th><th>Descrição</th><th style="width:250px">Categoria · subcategoria</th><th class="r" style="width:96px">Valor (R$)</th></tr></thead><tbody>';
        chunk.forEach((x) => { hh += x.day ? '<tr class="dh"><td colspan="3">' + DIAS[parse(x.day).getDay()].slice(0,3).toLowerCase() + ' ' + dm(x.day) + '</td><td class="r">' + n(x.tot) + '</td></tr>' : '<tr><td></td><td>' + esc(x.c.forn) + (isPror(x.c) ? ' <em>prorrogada · venceu ' + dm(origOf(x.c)) + '</em>' : isLate(x.c) ? ' <em class="lt">vencida</em>' : '') + '</td><td class="mut">' + esc(cap((x.c.cat || 'sem categoria').toLowerCase())) + (x.c.sub ? ' · ' + esc(x.c.sub.toLowerCase()) : '') + '</td><td class="r">' + n(x.c.valor) + '</td></tr>'; });
        hh += '</tbody>' + (i + ROWS >= lines.length ? '<tfoot><tr><td colspan="3">Total</td><td class="r">' + n(tot) + '</td></tr></tfoot>' : '') + '</table>';
        pages.push({ t: titulo, h: hh });
      }
    };
    sel.forEach((m) => {
      listPages('A pagar · ' + ml(m) + ' ' + m.slice(0,4), S.contas.filter((c) => !c.pago && c.data.slice(0,7) === m), (c) => c.data);
      listPages('Pago · ' + ml(m) + ' ' + m.slice(0,4), S.contas.filter((c) => c.pago && (c.pagoEm || c.data).slice(0,7) === m), (c) => c.pagoEm || c.data);
    });
    return { pages, periodo, file: 'MRBL_Previsao_Saidas_' + sel[0] + (sel.length > 1 ? '_a_' + sel[sel.length-1] : '') + '.pdf' };
  }
  // entrega de arquivo: no claude.ai usa a permissão de download; fora dele, link comum
  async function baixar(filename, blob){
    let dl = null;
    try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) { dl = null; }
    if (dl) {
      try { await dl.save({ filename: filename, data: blob }); return 'ok'; }
      catch (e) { const c = e && e.code; if (c === 'declined') return 'declined'; if (c === 'rate_limited') return 'busy'; if (c !== 'unavailable' && c !== 'not_granted' && c !== 'capability_disabled' && c !== 'capability_removed') throw e; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    return 'ok';
  }
  async function exportarLancXlsx(){
    const btn = document.getElementById('btnXls'); const lbl = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Gerando Excel…';
    try {
      await loadJs('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js');
      const wb = new ExcelJS.Workbook(); wb.creator = S.user || 'MRBL';
      const FMT = '#,##0.00';
      const sheet = (nome, cols, rows, cor, valCol) => {
        const ws = wb.addWorksheet(nome, { views: [{ state: 'frozen', ySplit: 1 }] });
        ws.columns = cols.map((c) => ({ header: c[0], width: c[1] }));
        ws.getRow(1).eachCell((c) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cor } }; });
        rows.forEach((r) => { const row = ws.addRow(r); row.getCell(1).numFmt = 'dd/mm/yyyy'; row.getCell(valCol).numFmt = FMT; });
        ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
        const t = ws.addRow([]); const tr = ws.addRow(['Total']); tr.font = { bold: true };
        tr.getCell(valCol).value = { formula: 'SUBTOTAL(9,' + ws.getColumn(valCol).letter + '2:' + ws.getColumn(valCol).letter + (rows.length + 1) + ')' }; tr.getCell(valCol).numFmt = FMT;
      };
      const dt = (d) => { const [y, m, dd] = d.slice(0,10).split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd)); };
      const sai = S.saidas.slice().sort((a,b) => a.data.localeCompare(b.data));
      const ent = S.entradas.slice().sort((a,b) => a.data.localeCompare(b.data));
      sheet('Despesas', [['Data', 12], ['Mês', 10], ['Categoria', 34], ['Subcategoria', 36], ['Empresa', 10], ['Valor', 15], ['Fornecedor / descrição', 40], ['Responsável', 14], ['Observação', 44], ['Ligada a Contas a pagar', 12]],
        sai.map((x) => [dt(x.data), x.data.slice(0,7), x.cat || '', x.sub || '', x.emp || '', Math.round(x.valor * 100) / 100, x.forn || '', x.resp || '', x.obs || '', x.contaId ? 'Sim' : '']), 'FFB42318', 6);
      sheet('Entradas', [['Data', 12], ['Mês', 10], ['Categoria', 28], ['Cliente', 34], ['NF', 22], ['Valor', 15], ['Responsável', 14], ['Observação', 44], ['Entra na DRE', 12]],
        ent.map((x) => [dt(x.data), x.data.slice(0,7), x.cat || '', x.cli || '', x.nf || '', Math.round(x.valor * 100) / 100, x.resp || '', x.obs || '', EXCL_ENT.includes(x.cat) ? 'Não' : 'Sim']), 'FF17784A', 6);
      const buf = await wb.xlsx.writeBuffer();
      const r = await baixar('MRBL_DRE_lancamentos_' + HOJE + '.xlsx', new Blob([buf]));
      if (r === 'declined') { toast('Download cancelado.', false); return; }
      if (r === 'busy') { toast('Já tem um download esperando confirmação.', false); return; }
      logar('Exportou os lançamentos da DRE em Excel (' + sai.length + ' despesas, ' + ent.length + ' entradas)', 'drel');
      toast('Excel com ' + sai.length + ' despesas e ' + ent.length + ' entradas pronto.', false);
    } catch (err) { console.error(err); toast('Não consegui gerar o Excel. Confira a conexão e tente de novo.', false); }
    finally { btn.disabled = false; btn.innerHTML = lbl; }
  }
  async function exportarDreXlsx(){
    const btn = document.getElementById('btnXls'); const lbl = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Gerando Excel…';
    try {
      await loadJs('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js');
      const D = dreData();
      const sumA = (a) => a.reduce((x,y) => x+y, 0);
      const meses = DRE_MESES.map((k) => cap(MESES[parseInt(k.slice(5),10)-1].slice(0,3)) + '/' + k.slice(2,4));
      const wb = new ExcelJS.Workbook(); wb.creator = S.user || 'MRBL'; wb.created = new Date();
      const NAVY = 'FF102574', GOLD = 'FFD3A512', FMT = '#,##0.00;[Red]-#,##0.00;"–"';
      const ws = wb.addWorksheet('DRE 2026', { views: [{ state: 'frozen', xSplit: 1, ySplit: 4 }], properties: { outlineLevelRow: 2 } });
      ws.properties.outlineProperties = { summaryBelow: false };
      ws.getColumn(1).width = 46; for (let c = 2; c <= 14; c++) ws.getColumn(c).width = c === 14 ? 17 : 14;
      ws.mergeCells(1, 1, 1, 14); ws.getCell(1,1).value = 'DRE gerencial 2026 · MRBL · regime de caixa';
      ws.getCell(1,1).font = { bold: true, size: 14, color: { argb: NAVY } };
      ws.mergeCells(2, 1, 2, 14); ws.getCell(2,1).value = 'Exportado em ' + dmy(HOJE) + ' por ' + (S.user || '—') + '. Jan–jun: aba DRE 2026 (consolidado); jul em diante: DRE lançamentos. Recebimento MRBL e STOFFA ficam de fora.';
      ws.getCell(2,1).font = { size: 9, color: { argb: 'FF666666' } };
      const head = ws.getRow(4); head.values = ['DRE gerencial'].concat(meses, ['Acumulado 2026']);
      head.eachCell((c) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }; c.alignment = { horizontal: 'center' }; });
      head.getCell(1).alignment = { horizontal: 'left' };
      const add = (label, arr, o) => {
        o = o || {};
        const r2 = (v) => v == null ? null : Math.round(v * 100) / 100;
        const r = ws.addRow([label].concat(arr.map(r2), [o.noTot ? null : r2(sumA(arr))]));
        for (let c = 2; c <= 14; c++) r.getCell(c).numFmt = FMT;
        if (o.lvl) { r.outlineLevel = o.lvl; r.getCell(1).alignment = { indent: o.lvl * 2 }; }
        if (o.bold) r.font = { bold: true };
        if (o.total) r.eachCell((c) => { c.font = { bold: true }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF6D9' } }; c.border = { top: { style: 'thin', color: { argb: GOLD } } }; });
        if (o.muted) r.font = { color: { argb: 'FF666666' }, size: 10 };
        return r;
      };
      add('Saldo inicial', D.ini, { noTot: true, muted: true });
      add('Recebimentos', D.rec, { bold: true });
      Object.keys(D.recCat).forEach((k) => add(k, D.recCat[k], { lvl: 1 }));
      add('(−) Fornecedores (CMV)', D.cmv.map((v) => -v), { bold: true });
      add('(−) Frete', D.frete.map((v) => -v), { bold: true });
      add('(−) Despesas operacionais', D.opex.map((v) => -v), { bold: true });
      Object.keys(D.opexCat).sort((a,b) => sumA(D.opexCat[b].v) - sumA(D.opexCat[a].v)).forEach((k) => {
        const o = D.opexCat[k];
        add(k, o.v.map((v) => -v), { lvl: 1 });
        Object.keys(o.subs).sort((a,b) => sumA(o.subs[b]) - sumA(o.subs[a])).forEach((sk) => add(sk, o.subs[sk].map((v) => -v), { lvl: 2 }));
      });
      add('Lucro líquido', D.lucro, { total: true });
      add('Resultado com saldo inicial', D.fim, { total: true, noTot: true });
      // aba faturamento
      const wf = wb.addWorksheet('Faturamento 2026', { views: [{ state: 'frozen', ySplit: 1 }] });
      wf.columns = [{ header: 'Mês', width: 12 }, { header: 'Faturamento', width: 18 }, { header: 'vs mês anterior', width: 16 }, { header: 'Acumulado no ano', width: 20 }];
      wf.getRow(1).eachCell((c) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }; });
      const fat = D.recCat['RECEBIMENTO DE CLIENTE'] || DRE_MESES.map(() => 0);
      let ac = 0;
      DRE_MESES.forEach((k, i) => {
        ac = Math.round((ac + fat[i]) * 100) / 100; fat[i] = Math.round(fat[i] * 100) / 100;
        const r = wf.addRow([meses[i] + (k === HOJE.slice(0,7) ? ' *' : ''), fat[i] || null, i && fat[i-1] && fat[i] ? fat[i] / fat[i-1] - 1 : null, fat[i] ? ac : null]);
        r.getCell(2).numFmt = FMT; r.getCell(3).numFmt = '+0.0%;[Red]-0.0%'; r.getCell(4).numFmt = FMT;
      });
      const tr = wf.addRow(['Total', sumA(fat)]); tr.font = { bold: true }; tr.getCell(2).numFmt = FMT;
      wf.addRow([]); wf.addRow(['* mês em andamento, ainda parcial']).font = { size: 9, color: { argb: 'FF666666' } };
      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const r = await baixar('MRBL_DRE_2026_' + HOJE + '.xlsx', blob);
      if (r === 'declined') { toast('Download cancelado.', false); return; }
      if (r === 'busy') { toast('Já tem um download esperando confirmação.', false); return; }
      logar('Exportou a DRE 2026 em Excel', 'dre');
      toast('Excel da DRE 2026 pronto.', false);
    } catch (err) { console.error(err); toast('Não consegui gerar o Excel. Confira a conexão e tente de novo.'); }
    finally { btn.disabled = false; btn.innerHTML = lbl; }
  }
  async function gerarPdf(){
    const btn = document.getElementById('btnPdf'); const lbl = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Gerando PDF…';
    try {
      await loadJs('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadJs('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const { pages, periodo, file } = pdfPages();
      const host = document.getElementById('pdfHost');
      host.innerHTML = pages.map((p, i) => '<div class="pg"><div class="pgh"><b>' + esc(p.t) + '</b><span>MRBL · Previsão de saídas · ' + esc(periodo) + '</span></div>' + p.h + '<div class="pgf">' + (i + 1) + '/' + pages.length + '</div></div>').join('');
      const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const els = [...host.querySelectorAll('.pg')];
      for (let i = 0; i < els.length; i++) {
        btn.textContent = 'Gerando PDF… ' + (i + 1) + '/' + els.length;
        const cv = await window.html2canvas(els[i], { scale: 1.7, backgroundColor: '#ffffff', logging: false });
        if (i) pdf.addPage();
        pdf.addImage(cv.toDataURL('image/jpeg', 0.86), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
      host.innerHTML = '';
      const r = await baixar(file, pdf.output('blob'));
      if (r === 'declined') { toast('Download cancelado.', false); return; }
      if (r === 'busy') { toast('Já tem um download esperando confirmação.', false); return; }
      toast('PDF gerado: ' + file + ' (' + els.length + ' páginas).', false);
    } catch (err) { console.error(err); toast('Não consegui gerar o PDF: ' + (err && err.message || err), false); }
    finally { btn.disabled = false; btn.innerHTML = lbl; }
  }



  // ---------- previsões: modelo e importação em Excel ----------
  const MES3 = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const XLS = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
  const pvMeses = () => Array.from({ length: 14 }, (_, i) => mAdd(CUR, i));
  const mkLabel = (mk) => MES3[+mk.slice(5,7) - 1] + '/' + mk.slice(2,4);
  const normTxt = (t) => String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase().replace(/\s+/g, ' ');
  async function pvModelo(){
    try {
      await loadJs(XLS);
      const wb = new ExcelJS.Workbook(); const ms = pvMeses();
      const ws = wb.addWorksheet('Previsões', { views: [{ state: 'frozen', xSplit: 3, ySplit: 1 }] });
      ws.columns = [{ width: 34 }, { width: 34 }, { width: 34 }].concat(ms.map(() => ({ width: 12 })));
      const hd = ws.addRow(['Previsão', 'Categoria', 'Subcategoria'].concat(ms.map(mkLabel)));
      hd.eachCell((c) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF102574' } }; c.alignment = { horizontal: 'center' }; });
      const by = {};
      S.previsoes.filter((p) => p.mes >= CUR).forEach((p) => { const k = pKey(p); (by[k] = by[k] || { p, m: {} }).m[p.mes] = p.valor; });
      Object.values(by).sort((a,b) => a.p.cat.localeCompare(b.p.cat) || a.p.nome.localeCompare(b.p.nome)).forEach((r) => {
        const row = ws.addRow([r.p.nome, r.p.cat, r.p.subs.join('; ')].concat(ms.map((mk) => r.m[mk] != null ? r.m[mk] : null)));
        for (let c = 4; c < 4 + ms.length; c++) row.getCell(c).numFmt = '#,##0.00';
      });
      for (let i = 0; i < 30; i++) { const row = ws.addRow([]); for (let c = 4; c < 4 + ms.length; c++) row.getCell(c).numFmt = '#,##0.00'; }
      const cats = Object.keys(LISTAS);
      const wl = wb.addWorksheet('Listas'); wl.columns = [{ header: 'Categoria', width: 40 }, { header: 'Subcategoria', width: 44 }];
      wl.getRow(1).font = { bold: true };
      cats.forEach((c) => (LISTAS[c].length ? LISTAS[c] : ['']).forEach((sb) => wl.addRow([c, sb])));
      wl.addRow([]); cats.forEach((c, i) => { wl.getCell(i + 2, 4).value = c; }); wl.getColumn(4).hidden = true;
      for (let r = 2; r <= ws.rowCount; r++) ws.getCell(r, 2).dataValidation = { type: 'list', allowBlank: true, formulae: ['Listas!$D$2:$D$' + (cats.length + 1)] };
      const wi = wb.addWorksheet('Como usar'); wi.getColumn(1).width = 110;
      ['Como preencher', '1. Uma linha por previsão. Categoria e subcategoria como na aba Listas (a categoria tem lista suspensa).', '2. Um valor por mês nas colunas de mês. Célula vazia não muda nada; meses que já passaram são ignorados.',
       '3. Se já existe previsão com a mesma categoria e subcategoria no mês, o valor é substituído. Se não existe, ela é criada. Mais de uma subcategoria: separe com ponto e vírgula.', '4. No sistema: Configurações › Previsões › Importar Excel. Antes de gravar aparece a prévia do que muda.']
        .forEach((t, i) => { const c = wi.getCell(i + 1, 1); c.value = t; if (!i) c.font = { bold: true, size: 13, color: { argb: 'FF102574' } }; });
      const buf = await wb.xlsx.writeBuffer();
      const r = await baixar('MRBL_Previsoes_modelo_' + CUR + '.xlsx', new Blob([buf]));
      if (r === 'ok') toast('Modelo baixado, já com as previsões atuais.', false);
    } catch (err) { console.error(err); toast('Não consegui gerar o modelo. Confira a conexão e tente de novo.', false); }
  }
  const cellVal = (v) => (v && typeof v === 'object' && !(v instanceof Date)) ? (v.result != null ? v.result : v.text != null ? v.text : v.richText ? v.richText.map((x) => x.text).join('') : null) : v;
  function mkDe(v){
    v = cellVal(v);
    if (v instanceof Date) return v.getUTCFullYear() + '-' + pad(v.getUTCMonth() + 1);
    const t = normTxt(v).toLowerCase();
    let m = t.match(/^(\d{4})-(\d{1,2})$/); if (m) return m[1] + '-' + pad(+m[2]);
    m = t.match(/^(\d{1,2})\/(\d{4})$/); if (m) return m[2] + '-' + pad(+m[1]);
    m = t.match(/^([a-z]{3})[a-z]*[\/\s.-]*(\d{2}|\d{4})$/); if (m) { const i = MES3.indexOf(m[1]); if (i >= 0) return (m[2].length === 2 ? '20' + m[2] : m[2]) + '-' + pad(i + 1); }
    return null;
  }
  document.addEventListener('change', async (e) => {
    if (e.target.id !== 'pvFile') return;
    const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return;
    try {
      await loadJs(XLS);
      const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await file.arrayBuffer());
      const ws = wb.worksheets.find((w) => /previs/i.test(w.name)) || wb.worksheets[0];
      let hr = 0, cN = 0, cC = 0, cS = 0; const mc = {};
      for (let r = 1; r <= Math.min(8, ws.rowCount) && !hr; r++) {
        ws.getRow(r).eachCell((c, ci) => { const t = normTxt(cellVal(c.value)); if (t === 'CATEGORIA') { hr = r; cC = ci; } });
        if (hr) ws.getRow(r).eachCell((c, ci) => { const t = normTxt(cellVal(c.value)); if (/^(PREVISAO|NOME|DESCRICAO)/.test(t)) cN = ci; if (/^SUBCATEGORIA/.test(t)) cS = ci; const mk = mkDe(c.value); if (mk) mc[ci] = mk; });
      }
      if (!hr || !Object.keys(mc).length) { toast('Não achei o cabeçalho (Previsão, Categoria, Subcategoria e os meses). Use o modelo.', false); return; }
      const catKey = {}; Object.keys(LISTAS).forEach((k) => { catKey[normTxt(k)] = k; });
      const ops = [], errs = []; let ign = 0;
      for (let r = hr + 1; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const nome = String(cellVal(row.getCell(cN || 1).value) || '').trim(), catT = cellVal(row.getCell(cC).value), subT = cS ? cellVal(row.getCell(cS).value) : '';
        const vals = Object.keys(mc).map((ci) => ({ mk: mc[ci], v: cellVal(row.getCell(+ci).value) })).filter((x) => x.v !== null && x.v !== undefined && String(x.v).trim() !== '');
        if (!nome && !catT && !vals.length) continue;
        const cat = catKey[normTxt(catT)];
        if (!cat) { errs.push('Linha ' + r + ': categoria "' + (catT || '') + '" não existe.'); continue; }
        const subsT = String(subT || '').split(';').map((x) => x.trim()).filter(Boolean);
        const subs = subsT.map((t) => LISTAS[cat].find((x) => normTxt(x) === normTxt(t)));
        const bad = subsT.filter((t, i) => !subs[i]);
        if (bad.length) { errs.push('Linha ' + r + ': subcategoria "' + bad.join('; ') + '" não existe em ' + cat + '.'); continue; }
        const sub = subs.join('; ');
        vals.forEach((x) => {
          const v = typeof x.v === 'number' ? x.v : parseVal(String(x.v));
          if (isNaN(v) || v < 0) { errs.push('Linha ' + r + ', ' + mkLabel(x.mk) + ': valor "' + x.v + '" inválido.'); return; }
          if (x.mk < CUR) { ign++; return; }
          const k = pKey({ cat, subs });
          const ex = S.previsoes.find((p) => p.mes === x.mk && pKey(p) === k);
          const tipo = !ex ? 'novo' : Math.abs(ex.valor - v) < 0.005 ? 'igual' : 'altera';
          ops.push({ mes: x.mk, nome: nome || (ex ? ex.nome : sub || cat), cat, sub, subs, valor: Math.round(v * 100) / 100, tipo, antes: ex ? ex.valor : null, id: ex ? ex.id : null });
        });
      }
      view.pvImp = { file: file.name, ops, errs, ign }; view.modal = 'pvimp'; render();
    } catch (err) { console.error(err); toast('Não consegui ler esse arquivo. Ele precisa ser .xlsx.', false); }
  });
  function pvImpHTML(){
    const I = view.pvImp, ch = I.ops.filter((o) => o.tipo !== 'igual');
    const n = I.ops.filter((o) => o.tipo === 'novo').length, a = I.ops.filter((o) => o.tipo === 'altera').length, ig = I.ops.length - n - a;
    return '<div class="modal-bg" data-modal-bg><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" id="pvImp" style="width:min(860px,96vw)"><div class="mh"><h2 id="mt">Importar previsões · ' + esc(I.file) + '</h2><button type="button" class="mx" data-modal-close aria-label="Fechar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="fbody">' +
      '<div class="imp-sum"><span class="n">' + n + ' novas</span><span class="a">' + a + ' alteradas</span><span>' + ig + ' sem mudança</span>' + (I.ign ? '<span>' + I.ign + ' de meses passados, ignoradas</span>' : '') + (I.errs.length ? '<span class="e">' + I.errs.length + ' com erro</span>' : '') + '</div>' +
      (ch.length ? '<div class="imp-tab"><table><thead><tr><th>Mês</th><th>Previsão</th><th>Categoria · subcategoria</th><th class="r">Antes</th><th class="r">Novo valor</th></tr></thead><tbody>' +
        ch.sort((x, y) => x.mes.localeCompare(y.mes) || x.cat.localeCompare(y.cat)).slice(0, 300).map((o) => '<tr><td class="num">' + mkLabel(o.mes) + '</td><td>' + esc(o.nome) + (o.tipo === 'novo' ? ' <span class="chip c-open">nova</span>' : '') + '</td><td style="color:var(--muted)">' + esc(o.cat) + (o.sub ? ' · ' + esc(o.sub) : '') + '</td><td class="r num" style="color:var(--muted)">' + (o.antes == null ? '—' : num(o.antes)) + '</td><td class="r num"><b>' + num(o.valor) + '</b></td></tr>').join('') + '</tbody></table></div>'
        : '<p style="margin:0;color:var(--muted)">Nada muda com este arquivo.</p>') +
      (I.errs.length ? '<ul class="imp-err">' + I.errs.slice(0, 40).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      '<div class="fact" style="margin-top:14px"><span class="grow" style="color:var(--muted);font-size:13px">Linhas com erro ficam de fora. Nada é gravado antes de você confirmar.</span><button type="button" class="btn y" id="pvImpOk"' + (ch.length ? '' : ' disabled') + '>Aplicar ' + ch.length + ' mudança' + (ch.length === 1 ? '' : 's') + '</button></div></div></div></div>';
  }
  function pvAplicar(){
    const I = view.pvImp; if (!I) return; const ch = I.ops.filter((o) => o.tipo !== 'igual');
    const n = ch.filter((o) => o.tipo === 'novo').length, a = ch.length - n;
    view.modal = null; view.pvImp = null;
    act('Importou previsões do Excel "' + I.file + '": ' + n + ' novas, ' + a + ' alteradas.', () => {
      ch.forEach((o, i) => { if (o.id) { const p = S.previsoes.find((x) => x.id === o.id); if (p) p.valor = o.valor; } else S.previsoes.push({ id: novoId('p'), mes: o.mes, nome: o.nome, cat: o.cat, subs: o.subs.slice(), valor: o.valor }); });
    });
  }

  function sair(){ if (cal) closeCal(); view.modal = null; aoSair(); }

  // ---------- lista de opções (mesmo visual do select) ----------
  let cbx = null;
  function cbxOpts(inp){ const dl = document.getElementById(inp.dataset.cbx); return dl ? [...dl.querySelectorAll('option')].map((o) => o.value).filter(Boolean) : []; }
  function cbxOpen(inp, all){
    const q = all ? '' : inp.value.trim().toUpperCase();
    let items = cbxOpts(inp); items = [...new Set(items)];
    const f = q ? items.filter((x) => x.toUpperCase().includes(q)) : items;
    const host = document.getElementById('cbxHost');
    const cur = inp.value.trim().toUpperCase();
    const novo = inp.dataset.novo && cur && !items.some((x) => x.toUpperCase() === cur);
    if (!f.length && !novo) { cbxClose(); return; }
    let act = f.findIndex((x) => x.toUpperCase() === cur);
    cbx = { inp, f, act };
    const r = inp.getBoundingClientRect();
    const below = window.innerHeight - r.bottom, h = Math.min(240, f.length * 30 + 4 + (novo ? 44 : 0)), up = below < h + 8 && r.top > below;
    host.innerHTML = '<ul class="cbx" role="listbox" style="left:' + r.left + 'px;width:' + r.width + 'px;' + (up ? 'bottom:' + (window.innerHeight - r.top + 2) + 'px' : 'top:' + (r.bottom + 2) + 'px') + '">' + f.map((x, i) => '<li role="option" data-i="' + i + '"' + (i === act ? ' class="on" aria-selected="true"' : '') + '>' + esc(x) + '</li>').join('') + (novo ? '<li class="novo" aria-disabled="true">+ “' + esc(inp.value.trim()) + '” não está na lista. Ao salvar, entra como fornecedor novo.</li>' : '') + '</ul>';
    inp.setAttribute('aria-expanded', 'true');
    const on = host.querySelector('.on'); if (on) on.scrollIntoView({ block: 'nearest' });
  }
  function cbxClose(){ if (cbx) cbx.inp.setAttribute('aria-expanded', 'false'); cbx = null; const h = document.getElementById('cbxHost'); if (h) h.innerHTML = ''; }
  function cbxPick(i){ const c = cbx; if (!c) return; c.inp.value = c.f[i]; cbxClose(); c.inp.dispatchEvent(new Event('change', { bubbles: true })); }
  function cbxMove(d){ if (!cbx) return; cbx.act = Math.max(0, Math.min(cbx.f.length - 1, cbx.act + d)); document.querySelectorAll('#cbxHost li').forEach((li, i) => { li.classList.toggle('on', i === cbx.act); if (i === cbx.act) li.scrollIntoView({ block: 'nearest' }); }); }
  document.addEventListener('mousedown', (e) => {
    const li = e.target.closest && e.target.closest('#cbxHost li'); if (li) { e.preventDefault(); if (li.dataset.i != null) cbxPick(+li.dataset.i); return; }
    // clique na barra de rolagem da lista: mantém a lista aberta
    if (e.target.closest && e.target.closest('#cbxHost')) { e.preventDefault(); return; }
    const inp = e.target.closest && e.target.closest('input[data-cbx]');
    if (inp) { if (cbx && cbx.inp === inp) cbxClose(); else setTimeout(() => cbxOpen(inp, true), 0); return; }
    if (cbx) cbxClose();
  }, true);
  document.addEventListener('input', (e) => { if (e.target.matches && e.target.matches('input[data-cbx]')) cbxOpen(e.target, false); });
  document.addEventListener('keydown', (e) => {
    const t = e.target; if (!(t.matches && t.matches('input[data-cbx]'))) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!cbx) cbxOpen(t, true); else cbxMove(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cbxMove(-1); }
    else if (e.key === 'Enter' && cbx && cbx.act >= 0) { e.preventDefault(); e.stopPropagation(); cbxPick(cbx.act); }
    else if (e.key === 'Escape' && cbx) { e.preventDefault(); e.stopPropagation(); cbxClose(); }
    else if (e.key === 'Tab') cbxClose();
  }, true);
  // rolar a página fecha a lista; rolar a própria lista não
  window.addEventListener('scroll', (e) => { if (cbx && !(e.target && e.target.closest && e.target.closest('#cbxHost'))) cbxClose(); }, true);
  window.addEventListener('resize', () => { if (cbx) cbxClose(); });
  function openCal(anchor, o){
    const v = o.value || (anchor.value && anchor.value.length === 10 ? anchor.value : '') || '';
    const base = parse(v || HOJE);
    cal = { anchor, sel: v, y: base.getFullYear(), m: base.getMonth(), min: o.min || anchor.min || '', max: o.max || anchor.max || '', commit: !!o.commit, title: o.title || '', onPick: o.onPick || null };
    drawCal();
  }
  function closeCal(){ cal = null; document.getElementById('calHost').innerHTML = ''; }
  function drawCal(){
    if (!cal) return;
    const first = new Date(cal.y, cal.m, 1), off = (first.getDay() + 6) % 7, nd = new Date(cal.y, cal.m + 1, 0).getDate();
    let g = ['S','T','Q','Q','S','S','D'].map((x) => '<span class="wd">' + x + '</span>').join('');
    for (let i = 0; i < off; i++) g += '<span></span>';
    for (let d = 1; d <= nd; d++) {
      const k = cal.y + '-' + pad(cal.m + 1) + '-' + pad(d);
      const dis = (cal.min && k < cal.min) || (cal.max && k > cal.max);
      g += '<button type="button" class="d' + (k === HOJE ? ' today' : '') + (k === cal.sel ? ' sel' : '') + '" data-cal="d:' + k + '"' + (dis ? ' disabled' : '') + '>' + d + '</button>';
    }
    const html = '<div class="cal" role="dialog" aria-label="' + esc(cal.title || 'Escolher data') + '">' +
      '<div class="ch"><button type="button" class="nav" data-cal="prev" aria-label="Mês anterior">‹</button><b>' + MESES[cal.m].replace(/^./, (x) => x.toUpperCase()) + ' de ' + cal.y + '</b><button type="button" class="nav" data-cal="next" aria-label="Próximo mês">›</button></div>' +
      '<div class="cg">' + g + '</div><div class="cf">' +
      (cal.commit ? '<span class="grow"></span><button type="button" class="btn sm" data-cal="cancel">Cancelar</button><button type="button" class="btn sm pri" data-cal="save"' + (cal.sel ? '' : ' disabled') + '>Salvar</button>'
                  : '<button type="button" class="btn sm" data-cal="today"' + ((cal.min && HOJE < cal.min) || (cal.max && HOJE > cal.max) ? ' disabled' : '') + '>Hoje</button><span class="grow"></span><button type="button" class="btn sm" data-cal="cancel">Fechar</button>') + '</div></div>';
    const host = document.getElementById('calHost'); host.innerHTML = html;
    const box = host.firstChild, r = cal.anchor.getBoundingClientRect();
    let top = r.bottom + 6, left = r.left;
    const bw = box.offsetWidth, bh = box.offsetHeight;
    if (left + bw > window.innerWidth - 8) left = window.innerWidth - bw - 8;
    if (top + bh > window.innerHeight - 8) top = Math.max(8, r.top - bh - 6);
    box.style.top = top + 'px'; box.style.left = Math.max(8, left) + 'px';
  }
  function applyCal(k){
    const c = cal; closeCal();
    if (c.onPick) { c.onPick(k); return; }
    const t = c.anchor; if (!document.body.contains(t)) return;
    t.value = k; if (c.commit) t._force = true;
    t.dispatchEvent(new Event('change', { bubbles: true }));
  }
  document.addEventListener('mousedown', (e) => {
    if (e.target.closest && e.target.closest('#calHost')) return;
    const t = e.target.closest && e.target.closest('input[type=date]');
    if (t && !t.disabled) { e.preventDefault(); t.focus({ preventScroll: true }); openCal(t, { commit: t.matches(COMMIT_DATE) }); return; }
    if (cal) closeCal();
  }, true);
  document.getElementById('calHost').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cal]'); if (!b || !cal) return; e.stopPropagation();
    const v = b.dataset.cal;
    if (v === 'prev' || v === 'next') { cal.m += v === 'next' ? 1 : -1; if (cal.m < 0) { cal.m = 11; cal.y--; } if (cal.m > 11) { cal.m = 0; cal.y++; } drawCal(); return; }
    if (v === 'cancel') { closeCal(); return; }
    if (v === 'today') { applyCal(HOJE); return; }
    if (v === 'save') { if (cal.sel) applyCal(cal.sel); return; }
    if (v.startsWith('d:')) { const k = v.slice(2); if (cal.commit) { cal.sel = k; drawCal(); } else applyCal(k); }
  });
  document.addEventListener('keydown', (e) => { if (cal && e.key === 'Escape') { e.stopPropagation(); closeCal(); } }, true);
  window.addEventListener('scroll', () => { if (cal) drawCal(); }, { passive: true });
  document.addEventListener('input', (e) => { if (e.target.id === 'logQ') { view.logQ = e.target.value; view.logPg = 0; const pos = e.target.selectionStart; render(); const q = document.getElementById('logQ'); if (q) { q.focus(); q.setSelectionRange(pos, pos); } return; } if (e.target.id === 'cfQ') { view.cfgQ = e.target.value; const pos = e.target.selectionStart; render(); const q = document.getElementById('cfQ'); if (q) { q.focus(); q.setSelectionRange(pos, pos); } } });
  document.addEventListener('change', (e) => {
    const t = e.target;
    // enquanto o ano está sendo digitado (0002, 0020, 0202...) não grava nada
    if (t.type === 'date' && t.value && t.value.slice(0,4) < '2000') return;
    if (t.type === 'date' && t.matches(COMMIT_DATE) && !t._force) { pendDate(t); return; }
    if (t.id === 'kData') { readEdit(); view.ed.data = t.value; render(); return; }
    if (t.id === 'kCat') { readEdit(); view.ed.cat = t.value; view.ed.sub = (LISTAS[t.value] || [''])[0]; render(); return; }
    if (t.id === 'kSub') { readEdit(); view.ed.sub = t.value; render(); return; }
    if (t.id === 'kForn' || t.id === 'kVal') { readEdit(); return; }
    if (t.id === 'oeEnt') { readOf(); view.oed.entrega = t.value; render(); return; }
    if (t.id === 'oeRec') { readOf(); view.oed.rec = t.value; render(); return; }
    if (t.id === 'oeSub') { readOf(); view.oed.sub = t.value; return; }
    if (t.id === 'oeForn' || t.id === 'oeVal') { readOf(); return; }
    if (t.id === 'ofFilt') { view.ofForn = t.value.trim(); render(); return; }
    const DF = { dData: 'data', dCat: 'cat', dSub: 'sub', dEmp: 'emp', dVal: 'valor', dForn: 'forn', dResp: 'resp', dObs: 'obs' };
    const EF = { eData: 'data', eCat: 'cat', eCli: 'cli', eNf: 'nf', eVal: 'valor', eResp: 'resp', eObs: 'obs' };
    if (DF[t.id]) { view.dForm[DF[t.id]] = t.value; if (t.id === 'dCat') { view.dForm.sub = (LISTAS[t.value] || [''])[0]; } if (t.id === 'dData' || t.id === 'dForn' || t.id === 'dCat') render(); return; }
    if (EF[t.id]) { view.eForm[EF[t.id]] = t.value; return; }
    if (t.dataset.xf) {
      const row = t.closest('[data-xid]'); const L = row.dataset.xk === 'sai' ? 'saidas' : 'entradas'; const it = S[L].find((x) => x.id === row.dataset.xid); const f = t.dataset.xf;
      if (f === 'valor') { const v = parseVal(t.value); if (isNaN(v) || v <= 0) { toast('Valor inválido. Use o formato 1.234,56.', false); render(); return; } act('Valor alterado para ' + money(v) + '.', () => { it.valor = v; }); return; }
      if (f === 'data' && !t.value) { render(); return; }
      act('Lançamento alterado.', () => { it[f] = t.value; if (f === 'cat' && L === 'saidas') it.sub = (LISTAS[t.value] || [''])[0]; }); return;
    }
    if (t.id === 'prMes') { view.prMes = t.value; render(); return; }
    if (t.dataset && t.dataset.cffixo != null) { const k = nomeKey(t.dataset.cffixo), on = t.checked; act(t.dataset.cffixo + (on ? ' agora tem pagamento fixo (sem controle de entrega).' : ' volta a ter pagamento pela entrega.'), () => { S.ofFixas = on ? [...new Set([...(S.ofFixas || []), k])] : (S.ofFixas || []).filter((x) => x !== k); converterFixos(); normalize(); }); return; }
    if (t.id === 'prazoOf') { const n = parseInt(t.value,10); if (n >= 0 && n <= 120) act('Prazo das oficinas: ' + n + ' dias depois da entrega.', () => { S.prazoOf = n; S.contas.forEach(syncOf); }); else render(); return; }
    if (t.dataset.o === 'receb') {
      const c = byId(t.closest('[data-id]').dataset.id); const d = t.value || null;
      if (d && d > HOJE) { toast('A data de chegada não pode ser depois de hoje.', false); render(); return; }
      if (!d) { act('Chegada de ' + c.forn + ' apagada. O pagamento volta a contar da entrega prevista.', () => { c.recebidoEm = null; syncOf(c); }); return; }
      act(c.forn + ' chegou em ' + dm(d) + '.' + (c.payManual || c.pago ? '' : ' Pagamento em ' + dm(payFrom(d)) + ', em Contas a pagar na semana de ' + weekLabel(weekOf(payFrom(d))) + '.'), () => { c.recebidoEm = d; syncOf(c); });
      return;
    }
    if (t.dataset.o === 'entDate' || t.dataset.o === 'entrega') {
      const c = byId(t.closest('[data-id]').dataset.id); const novo = t.value;
      if (!novo || novo === c.entrega) { render(); return; }
      act('Entrega de ' + c.forn + ' mudou para ' + dm(novo) + '.' + (c.payManual || c.pago ? '' : ' Pagamento em ' + dm(payFrom(novo)) + '.'), () => { c.histEnt = c.histEnt || []; c.histEnt.push({ de: c.entrega, para: novo, em: HOJE }); c.entrega = novo; syncOf(c); });
      return;
    }
    if (t.dataset.o === 'forn' || t.dataset.o === 'sub') { const c = byId(t.closest('[data-id]').dataset.id); act('Oficina alterada.', () => { c[t.dataset.o] = t.value; }); return; }
    if (t.dataset.o === 'valor') { const c = byId(t.closest('[data-id]').dataset.id); const v = parseVal(t.value); if (isNaN(v) || v <= 0) { toast('Valor inválido. Use o formato 1.234,56.', false); render(); return; } act('Valor de ' + c.forn + ' alterado para ' + money(v) + '.', () => { c.valor = v; }); return; }
    if (t.id === 'nSub') { view.newSub = t.value; const dl = document.getElementById('fornList'); if (dl) dl.innerHTML = fornOpts(view.newCat, t.value); return; }
    if (t.id === 'nCat') { view.newCat = t.value; document.getElementById('nSub').innerHTML = subOpts(t.value); view.newSub = (LISTAS[t.value] || [''])[0]; { const dl = document.getElementById('fornList'); if (dl) dl.innerHTML = fornOpts(t.value, view.newSub); } return; }
    if (t.id === 'logUser') { view.logUser = t.value; view.logPg = 0; render(); return; }
    if (t.id === 'cfSub') { view.cfNewSub = t.value; return; }
    if (t.dataset.pc) { const y = view.pvYear || +CUR.slice(0,4); const k = t.closest('[data-rk]').dataset.rk; const r = pvRows(y).find((x) => x.k === k); const raw = t.value.trim(); const v = raw === '' ? null : parseVal(raw);
      if (v != null && (isNaN(v) || v < 0)) { toast('Valor inválido.', false); render(); return; }
      act(r.base.nome + ' em ' + mesNome(t.dataset.pc) + ': ' + (v == null ? 'sem previsão' : num(v)) + '.', () => setPrev(r, t.dataset.pc, v)); return; }
    if (t.id === 'pCat') { view.pCat = t.value; document.getElementById('pSub').innerHTML = subOpts(t.value, '', true); return; }
    if (t.dataset.a === 'prorDate') {
      const c = byId(t.closest('[data-id]').dataset.id);
      if (t.value && t.value >= HOJE) act(c.forn + ' prorrogada para ' + dm(t.value) + ', semana de ' + weekLabel(weekOf(t.value)) + '.', () => setDate(c, t.value));
      return;
    }
    if (t.dataset.p === 'valor') {
      const p = S.previsoes.find((x) => x.id === t.closest('[data-pid]').dataset.pid); const v = parseVal(t.value);
      if (!isNaN(v) && v >= 0) act('Previsão ' + p.nome + ' alterada para ' + money(v) + '.', () => { p.valor = v; }); else render();
      return;
    }
    const f = t.dataset.f; if (!f) return;
    const c = byId(t.closest('[data-id]').dataset.id); if (!c) return;
    if (f === 'data') {
      if (!t.value) { render(); return; }
      const novo = t.value, w1 = weekOf(novo);
      const msg = novo > (c.orig || c.data) && !c.pago ? c.forn + ' prorrogada para ' + dm(novo) + (w1 !== view.week ? ', semana de ' + weekLabel(w1) : '') + '.' : 'Data de ' + c.forn + ' alterada para ' + dm(novo) + '.';
      act(msg, () => { if (c.pago) { c.data = novo; } else setDate(c, novo); });
      return;
    }
    if (f === 'valor') { const v = parseVal(t.value); if (isNaN(v) || v <= 0) { toast('Valor inválido. Use o formato 1.234,56.', false); render(); return; } act('Valor de ' + c.forn + ' alterado para ' + money(v) + '.', () => { c.valor = v; }); return; }
    if (f === 'cat') { act('Categoria de ' + c.forn + ' alterada. Escolha a subcategoria.', () => { c.cat = t.value; c.sub = (LISTAS[t.value] || [''])[0]; }); return; }
    act('Conta alterada.', () => { c[f] = t.value; });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.closest('.fcard') && e.target.tagName === 'INPUT') { e.preventDefault(); e.target.dispatchEvent(new Event('change', { bubbles: true })); (e.target.id.startsWith('d') ? regDespesa : regEntrada)(); }
    else if (e.key === 'Enter' && e.target.closest('#addOf')) { e.preventDefault(); addOf(); }
    else if (e.key === 'Enter' && e.target.closest('#addRow')) { e.preventDefault(); addConta(); }
    else if (e.key === 'Enter' && e.target.closest('.padd')) { e.preventDefault(); addPrev(); }
    else if (e.key === 'Enter' && e.target.matches('td input')) { e.target.blur(); }
    else if (e.key === 'Escape' && view.modal) { view.modal = null; render(); }
    else if (e.key === 'Escape' && (view.paying || view.removing)) { view.paying = view.removing = null; render(); }
  });
  function readOf(){ const g = (id) => document.getElementById(id); if (!g('oeForn')) return; view.oed.forn = g('oeForn').value; if (g('oeObs')) view.oed.obs = g('oeObs').value; const v = parseVal(g('oeVal').value); if (!isNaN(v)) view.oed.valor = v; }
  function saveOf(c){
    readOf(); const ed = view.oed, err = (m) => { document.getElementById('modalErr').textContent = m; };
    if (!ed.forn.trim()) return err('Preencha a oficina.');
    if (isNaN(parseVal(document.getElementById('oeVal').value)) || ed.valor <= 0) return err('Valor inválido.');
    if (ed.rec && ed.rec > HOJE) return err('A chegada não pode ser depois de hoje.');
    const dsc = [];
    if (!c.pago && ed.entrega !== c.entrega) dsc.push('entrega para ' + dm(ed.entrega));
    if ((ed.rec || '') !== (c.recebidoEm || '')) dsc.push(ed.rec ? 'chegou em ' + dm(ed.rec) : 'chegada apagada');
    const obsTxt = (ed.obs || '').trim(); if (obsTxt) dsc.push('observação adicionada');
    if (c.forn !== ed.forn.trim()) dsc.push('oficina alterada');
    if (c.sub !== ed.sub) dsc.push('subcategoria ' + ed.sub);
    if (Math.abs(c.valor - ed.valor) > 0.001) dsc.push('valor ' + num(c.valor) + ' → ' + num(ed.valor));
    view.modal = null;
    act(ed.forn.trim() + ': ' + (dsc.length ? dsc.join(', ') : 'nada mudou') + '.' + novoTxt(ed.forn, AC, ed.sub), () => {
      ensureForn(ed.forn, AC, ed.sub);
      if (!c.pago && ed.entrega !== c.entrega) mudarEntrega(c, ed.entrega);
      if (!c.pago && (ed.rec || '') !== (c.recebidoEm || '')) marcarChegada(c, ed.rec || null);
      const mud = [];
      if (c.forn !== ed.forn.trim()) mud.push('oficina ' + c.forn + ' → ' + ed.forn.trim());
      if (c.sub !== ed.sub) mud.push('subcategoria → ' + ed.sub);
      if (Math.abs(c.valor - ed.valor) > 0.001) mud.push('valor ' + num(c.valor) + ' → ' + num(ed.valor));
      if (mud.length) logC(c, 'Editada: ' + mud.join('; '));
      if (obsTxt) logC(c, 'Obs: ' + obsTxt);
      c.forn = ed.forn.trim(); c.sub = ed.sub; c.valor = ed.valor; syncOf(c);
    });
  }
  function goPay(c){
    view.modal = null; view.tela = 'pagar'; view.week = weekOf(c.data); if (cal) closeCal(); render();
    const tr = document.querySelector('#app tr[data-id="' + c.id + '"]');
    if (tr) { const y = tr.getBoundingClientRect().top + window.scrollY - window.innerHeight / 3; window.scrollTo({ top: Math.max(0, y) }); tr.classList.add('flash'); setTimeout(() => tr.classList.remove('flash'), 2600); }
  }
  function openEdit(c){ if (view.tela === 'of' && isOf(c)) { view.modal = 'ofedit'; view.editId = c.id; view.edDel = false; view.oed = { entrega: c.entrega, rec: c.recebidoEm || '', sub: c.sub, forn: c.forn, valor: c.valor }; if (cal) closeCal(); render(); return; }
    view.modal = 'edit'; view.editId = c.id; view.edDel = false; view.ed = { data: c.data, cat: c.cat || '', sub: c.sub || '', forn: c.forn, valor: c.valor }; if (cal) closeCal(); render(); }
  function readEdit(){ const g = (id) => document.getElementById(id); if (!g('kForn')) return; view.ed.forn = g('kForn').value; if (g('kObs')) view.ed.obs = g('kObs').value; const v = parseVal(g('kVal').value); if (!isNaN(v)) view.ed.valor = v; }
  function saveEdit(c){
    readEdit(); const ed = view.ed;
    if (!ed.forn.trim()) { document.getElementById('modalErr').textContent = 'Preencha o fornecedor.'; return; }
    if (isNaN(parseVal(document.getElementById('kVal').value)) || ed.valor <= 0) { document.getElementById('modalErr').textContent = 'Valor inválido.'; return; }
    view.modal = null;
    const dsc = [];
    if (!c.pago && ed.data !== c.data) { const tp = tipoMud(c, ed.data); dsc.push(tp === 'Voltou ao vencimento original' ? 'voltou ao vencimento original ' + dm(ed.data) : tp.toLowerCase() + ' de ' + dm(c.data) + ' para ' + dm(ed.data)); }
    const obsTxt = (ed.obs || '').trim(); if (obsTxt) dsc.push('observação adicionada');
    if (c.forn !== ed.forn.trim()) dsc.push('fornecedor alterado');
    if (c.cat !== ed.cat || c.sub !== ed.sub) dsc.push('categoria ' + (ed.sub || ed.cat));
    if (Math.abs(c.valor - ed.valor) > 0.001) dsc.push('valor ' + num(c.valor) + ' → ' + num(ed.valor));
    act(ed.forn.trim() + ': ' + (dsc.length ? dsc.join(', ') : 'nada mudou') + '.' + novoTxt(ed.forn, ed.cat, ed.sub), () => {
      ensureForn(ed.forn, ed.cat, ed.sub);
      if (!c.pago && ed.data !== c.data) setDate(c, ed.data);
      const mud = [];
      if (c.forn !== ed.forn.trim()) mud.push('fornecedor ' + c.forn + ' → ' + ed.forn.trim());
      if (c.cat !== ed.cat || c.sub !== ed.sub) mud.push('categoria ' + (c.sub || c.cat || '—') + ' → ' + (ed.sub || ed.cat));
      if (Math.abs(c.valor - ed.valor) > 0.001) mud.push('valor ' + num(c.valor) + ' → ' + num(ed.valor));
      if (mud.length) logC(c, 'Editada: ' + mud.join('; '));
      if (obsTxt) logC(c, 'Obs: ' + obsTxt);
      c.forn = ed.forn.trim(); c.cat = ed.cat; c.sub = ed.sub; c.valor = ed.valor; c.estim = false;
      syncOf(c);
    });
  }
  function addConta(){
    const d = document.getElementById('nData').value, fo = document.getElementById('nForn').value.trim();
    const ca = document.getElementById('nCat').value, su = document.getElementById('nSub').value, v = parseVal(document.getElementById('nVal').value);
    if (!d || !fo || isNaN(v) || v <= 0) { const er = document.getElementById('modalErr'); if (er) er.textContent = 'Preencha data, fornecedor e um valor maior que zero.'; document.getElementById(!fo ? 'nForn' : 'nVal').focus(); return; }
    view.modal = null;
    view.addErr = '';
    const nova = { id: novoId('c'), data: d, orig: null, forn: fo, cat: ca, sub: su, valor: v, pago: false, pagoEm: null, hist: [] }; logC(nova, 'Criada com vencimento ' + dmy(d) + ' · ' + money(v));
    if (isOf(nova)) { nova.payManual = true; nova.entrega = null; nova.histEnt = []; }
    const w = weekOf(d);
    const p = prevsOf(d.slice(0,7)).find((x) => matchPrev(x, nova));
    { const ob = (document.getElementById('nObs') || {}).value; if (ob && ob.trim()) logC(nova, 'Obs: ' + ob.trim()); }
    act(fo + ' adicionada em ' + dm(d) + (w !== view.week ? ', semana de ' + weekLabel(w) : '') + (p ? '. Descontou da previsão ' + p.nome : '') + '.' + novoTxt(fo, ca, su), () => { S.contas.push(nova); ensureForn(fo, ca, su); });
    const f = document.getElementById('nForn'); if (f) f.focus();
  }
  function addPrev(){
    const nome = document.getElementById('pNome').value.trim(), cat = document.getElementById('pCat').value, sub = document.getElementById('pSub').value, v = parseVal(document.getElementById('pVal').value);
    if (!nome || isNaN(v) || v <= 0) { toast('Dê um nome e um valor para a previsão.', false); return; }
    const de = (document.getElementById('pDe') || {}).value || monthOfWeek(view.week), ate = (document.getElementById('pAte') || {}).value || de;
    if (ate < de) { toast('O mês final vem antes do inicial.', false); return; }
    const ms = []; for (let m = de; m <= ate; m = mAdd(m, 1)) ms.push(m);
    act('Previsão ' + nome + ' criada de ' + mesNome(de) + ' a ' + mesNome(ate) + '.', () => { ms.forEach((m, i) => S.previsoes.push({ id: novoId('p'), mes: m, nome, cat, subs: sub ? [sub] : [], valor: v })); });
  }
  function addOf(){
    const d = document.getElementById('oData').value, fo = document.getElementById('oForn').value.trim(), su = document.getElementById('oSub').value, v = parseVal(document.getElementById('oVal').value);
    if (!d || !fo || isNaN(v) || v <= 0) { toast('Preencha entrega, oficina e valor.', false); return; }
    const pay = payFrom(d);
    view.modal = null;
    const nova = { id: novoId('c'), entrega: d, histEnt: [], data: pay, orig: null, hist: [], forn: fo, cat: AC, sub: su, valor: v, pago: false, pagoEm: null }; logC(nova, 'Lançada com entrega prevista ' + dmy(d) + ' · ' + money(v));
    { const ob = (document.getElementById('oObs') || {}).value; if (ob && ob.trim()) logC(nova, 'Obs: ' + ob.trim()); }
    act(fo + ': entrega ' + dm(d) + ', pagamento ' + dm(pay) + ' em Contas a pagar.' + novoTxt(fo, AC, su), () => { S.contas.push(nova); ensureForn(fo, AC, su); });
    const f = document.getElementById('oForn'); if (f) f.focus();
  }
  function copyExcel(){
    if (view.tela === 'rel') {
      const { cols, rows, prevCat, prevSub } = relData();
      const lines = [['Categoria','Subcategoria'].concat(cols.map((c) => c.label), ['Total','Previsto']).join('\t')];
      Object.keys(rows).forEach((k) => { const r = rows[k]; lines.push([k, ''].concat(r.v.map(num), [num(r.v.reduce((a,b)=>a+b,0)), prevCat[k] ? num(prevCat[k]) : '']).join('\t'));
        Object.keys(r.subs).forEach((sk) => { const sv = r.subs[sk]; lines.push([k, sk].concat(sv.map(num), [num(sv.reduce((a,b)=>a+b,0)), prevSub[k + '|' + sk] ? num(prevSub[k + '|' + sk]) : '']).join('\t')); }); });
      const txt = lines.join('\n');
      try { navigator.clipboard.writeText(txt).then(() => toast('Relatório copiado. Cole no Excel com Ctrl+V.', false), () => toast('Não foi possível copiar neste navegador.', false)); } catch (err) { toast('Não foi possível copiar neste navegador.', false); }
      return;
    }
    if (view.tela === 'pr') {
      const rows = prRows().sort((a,b) => origOf(a).localeCompare(origOf(b)));
      const txt = [['Vencimento original','Data atual','Fornecedor / descrição','Categoria','Subcategoria','Valor','Situação','Histórico de datas'].join('\t')].concat(rows.map((c) => [dmy(origOf(c)), dmy(c.data), c.forn, c.cat, c.sub, num(c.valor), c.pago ? 'Pago' : isLate(c) ? 'Vencida' : 'Prorrogada', nPror(c) ? histText(c) : ''].join('\t'))).join('\n');
      try { navigator.clipboard.writeText(txt).then(() => toast(rows.length + ' linhas copiadas. Cole no Excel com Ctrl+V.', false), () => toast('Não foi possível copiar neste navegador.', false)); } catch (err) { toast('Não foi possível copiar neste navegador.', false); }
      return;
    }
    if (view.tela === 'of') {
      const wEnd = iso(addDays(parse(view.ofWeek), 7));
      const rows = S.contas.filter((c) => isOf(c) && c.entrega >= view.ofWeek && c.entrega < wEnd).sort((a,b) => a.entrega.localeCompare(b.entrega));
      const txt = [['Entrega prevista','Chegou em','Oficina','Subcategoria','Valor','Pagamento','Pago em'].join('\t')].concat(rows.map((c) => [dmy(c.entrega), c.recebidoEm ? dmy(c.recebidoEm) : '', c.forn, c.sub, num(c.valor), dmy(c.data), c.pagoEm ? dmy(c.pagoEm) : ''].join('\t'))).join('\n');
      try { navigator.clipboard.writeText(txt).then(() => toast(rows.length + ' linhas copiadas. Cole no Excel com Ctrl+V.', false), () => toast('Não foi possível copiar neste navegador.', false)); } catch (err) { toast('Não foi possível copiar neste navegador.', false); }
      return;
    }
    const rows = S.contas.filter((c) => inWeek(c, view.week)).sort((a,b) => a.data.localeCompare(b.data));
    const head = ['Data','Vencimento original','Fornecedor / descrição','Categoria','Subcategoria','Valor','Situação','Pago em','Histórico de datas'];
    const lines = [head.join('\t')].concat(rows.map((c) => [dmy(c.data), c.orig ? dmy(c.orig) : '', c.forn, c.cat, c.sub, num(c.valor),
      c.pago ? 'Pago' : isLate(c) ? 'Vencida' : isPror(c) ? 'Prorrogada' : 'A pagar', c.pagoEm ? dmy(c.pagoEm) : '', nPror(c) ? histText(c) : ''].join('\t')));
    const txt = lines.join('\n');
    const fallback = () => { const o = document.getElementById('copyOut'); o.innerHTML = '<textarea class="copybox" readonly aria-label="Tabela para copiar">' + esc(txt) + '</textarea>'; const ta = o.querySelector('textarea'); ta.focus(); ta.select(); toast('Copie com Ctrl+C a tabela que apareceu no rodapé.', false); };
    try { navigator.clipboard.writeText(txt).then(() => toast(rows.length + ' linhas copiadas. Cole no Excel com Ctrl+V.', false), fallback); } catch (err) { fallback(); }
  }
  render();
  return { recarregar: (d) => d };
}
