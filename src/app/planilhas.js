// Leitura das planilhas de origem para a carga inicial, no navegador:
//  - DRE (DRE_FLUXO_DE_CAIXA_MRBL_2026_*.xlsx): abas BASE_DESPESAS, BASE_ENTRADAS e LISTAS (clientes).
//  - Relatório semanal (RELATÓRIO_PAGAMENTO_SEMANAL_*.xlsx): abas da semana atual em diante e ATRASADOS MRBL.
// As funções recebem a pasta já lida como { nome: [[valores da linha]] }, para poderem ser testadas sem o Excel.

const pad = (n) => String(n).padStart(2, '0');
const isoUTC = (d) => d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
const ehData = (v) => v instanceof Date && !isNaN(v);
const dataDe = (v) => (ehData(v) ? isoUTC(v) : null);
const limpa = (v) => String(v == null ? '' : v).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const txt = (v) => (v == null ? '' : String(v).trim());
const num = (v) => { if (typeof v === 'number' && isFinite(v)) return Math.round(v * 100) / 100; const n = parseFloat(v); return isFinite(n) ? Math.round(n * 100) / 100 : null; };

// ---- DRE ----
export function lerDre(abas) {
  const saidas = [], entradas = [];
  (abas.BASE_DESPESAS || []).slice(1).forEach((r) => {
    const d = dataDe(r[0]), v = num(r[4]);
    if (!d || v == null) return;
    let forn = txt(r[5]); if (forn.startsWith('Migrado de')) forn = '';
    saidas.push({ data: d, cat: txt(r[1]), sub: txt(r[2]), emp: txt(r[3]), valor: v, forn, resp: txt(r[6]), obs: txt(r[7]) });
  });
  (abas.BASE_ENTRADAS || []).slice(1).forEach((r) => {
    const d = dataDe(r[0]), v = num(r[4]);
    if (!d || v == null) return;
    let nf = txt(r[3]); if (nf === '-') nf = '';
    let obs = txt(r[6]); if (obs.startsWith('Migrado de')) obs = '';
    entradas.push({ data: d, cat: txt(r[1]), cli: txt(r[2]), nf, valor: v, resp: txt(r[5]), obs });
  });
  const L = abas.LISTAS || [], ci = (L[0] || []).indexOf('Cliente');
  const clientes = ci < 0 ? [] : L.slice(1).map((r) => txt(r[ci])).filter(Boolean);
  return { saidas, entradas, clientes };
}

// ---- relatório semanal ----
const TXT = /^(\d\d)\/(\d\d)\/(\d{4}) (.+?)(?:\s{2,}\d{5}\s|\s*$)/;
const VENC = /venceu\s+(\d\d)\/(\d\d)/i;
const PREV = /\bPREVIS[ÃA]O\b|\bPREVIA\b/i;

function linhaRel(r, atr, ci, si) {
  const a = r[0];
  let data = dataDe(a), forn = limpa(r[1]);
  if (!data) {
    const m = TXT.exec(String(a == null ? '' : a));
    if (!m) return null;
    data = m[3] + '-' + m[2] + '-' + m[1];
    if (!forn) {
      const m2 = /(.+?)\s+\d{5}\s+\d\d\/\d\d\/\d{4}/.exec(String(a).slice(11));
      forn = m2 ? limpa(m2[1]) : limpa(m[4].trim().split(/\s{2,}/)[0]);
    }
  }
  if (!forn || /^PREVISÃO/i.test(forn)) return null;
  const c = r[2], d = r[3];
  if (typeof c !== 'number') return null;
  let valor = num(c), estim = false;
  if (valor === 0) {
    if (typeof d === 'number' && !atr) { valor = num(d); estim = true; } else return null;
  }
  if (PREV.test(forn)) { forn = limpa(forn.replace(new RegExp(PREV.source, 'gi'), '')); estim = true; }
  let orig = null;
  if (typeof d === 'string') {
    const m = VENC.exec(d);
    if (m) { const y = +data.slice(0, 4); orig = y + '-' + m[2] + '-' + m[1]; if (orig > data) orig = (y - 1) + '-' + m[2] + '-' + m[1]; }
    else if (!['', '.'].includes(limpa(d))) forn = forn + ' · ' + limpa(d);
  }
  const pago = limpa(r[si + 1]).toUpperCase() === 'PAGO';
  return { data, forn, cat: atr ? '' : limpa(r[ci]), sub: atr ? '' : limpa(r[si]), valor, orig, estim, atr, pago };
}

// Abas de semana ("31 A 06-11") da que termina hoje ou depois até a última. O nome só tem dia e mês:
// o ano sai da última aba (a mais próxima de hoje) e vai voltando de uma em uma.
const SEMANA = /^(\d{1,2})(?:-\d{1,2})?\s*[AÁ]\s*(\d{1,2})-(\d{1,2})$/i;
export function abasDaSemana(nomes, hoje) {
  const H = Date.parse(hoje);
  const fins = nomes.map((n) => { const m = SEMANA.exec(limpa(n)); return m ? [+m[3] - 1, +m[2]] : null; });
  let i = nomes.length - 1;
  while (i >= 0 && !fins[i]) i--;
  if (i < 0) return [];
  const y0 = +hoje.slice(0, 4);
  let ultimo = [y0 - 1, y0, y0 + 1].map((y) => Date.UTC(y, fins[i][0], fins[i][1])).sort((a, b) => Math.abs(a - H) - Math.abs(b - H))[0];
  const sel = [];
  for (let k = i; k >= 0; k--) {
    if (!fins[k]) continue;
    const y = new Date(ultimo).getUTCFullYear();
    let t = Date.UTC(y, fins[k][0], fins[k][1]);
    if (t > ultimo) t = Date.UTC(y - 1, fins[k][0], fins[k][1]);
    if (t < H) break;
    sel.unshift(nomes[k]);
    ultimo = t;
  }
  return sel;
}

export function lerRelatorio(abas, nomes, hoje) {
  const semanas = abasDaSemana(nomes, hoje);
  const linhas = [];
  semanas.forEach((n, k) => {
    let atr = false, ci = 5, si = 6;
    (abas[n] || []).forEach((r0) => {
      const r = Array.from(r0).concat(Array(8).fill(null));
      const cl = r.map(limpa);
      if (cl.includes('Categoria') && cl.includes('Subcategoria')) { ci = cl.indexOf('Categoria'); si = cl.indexOf('Subcategoria'); }
      if (cl[1].toUpperCase() === 'ATRASADOS') { atr = k === 0; return; }
      if (cl[0].toUpperCase().startsWith('RELATÓRIO DE CONTAS')) { atr = false; return; }
      const x = linhaRel(r, atr, ci, si);
      if (x) linhas.push(x);
    });
  });
  const at = abas['ATRASADOS MRBL'] || [];
  const tot = (at.find((r) => limpa(r[1]).toUpperCase() === 'TOTAL SILMAQ') || [])[2];
  const datasSilmaq = at.slice(2).filter((r) => limpa(r[1]).toUpperCase().includes('SILMAQ')).map((r) => dataDe(r[0]) || (/^(\d\d)\/(\d\d)\/(\d{4})/.exec(String(r[0] || '')) || []).slice(1).reverse().join('-')).filter((d) => /^\d{4}-\d\d-\d\d$/.test(d)).sort();
  const silmaq = typeof tot === 'number' && tot > 0 ? { valor: num(tot), de: datasSilmaq[0] || null, n: at.slice(2).filter((r) => limpa(r[1]).toUpperCase().includes('SILMAQ')).length } : null;
  return { semanas, linhas, silmaq };
}

// ---- monta a carga no formato do app (mesma regra do protótipo) ----
const AC = 'ACESSORIAS', OFS = ['ACESSORIAS EM GERAL (OF)', 'ACESSORIAS EM GERAL (OF) SN'];
const isOf = (c) => c.cat === AC && OFS.includes(c.sub);
const dias = (a, b) => Math.abs((Date.parse(a) - Date.parse(b)) / 864e5);

export function montarCarga({ dre, rel, hoje }) {
  const saidas = dre.saidas.map((x, i) => ({ id: 's' + (i + 1), ...x, contaId: null }));
  const entradas = dre.entradas.map((x, i) => ({ id: 'e' + (i + 1), ...x }));
  // pagos no relatório: liga à despesa da DRE de mesmo valor, até 20 dias de distância
  const usados = new Set(), liga = new Map();
  rel.linhas.forEach((r, k) => {
    if (!r.pago) return;
    let best = null;
    saidas.forEach((x, i) => { if (usados.has(i) || Math.abs(x.valor - r.valor) > 0.01) return; const d = dias(x.data, r.data); if (d <= 20 && (!best || d < best[0])) best = [d, i]; });
    if (best) { usados.add(best[1]); liga.set(k, best[1]); }
  });
  let n = 0;
  const C = (data, forn, cat, sub, valor, extra) => Object.assign({ id: 'c' + (++n), data, orig: null, forn, cat, sub, valor, pago: false, pagoEm: null }, extra || {});
  const contas = [];
  saidas.forEach((x, i) => { if (usados.has(i)) return; const c = C(x.data, x.forn || x.sub, x.cat, x.sub, x.valor, { pago: true, pagoEm: x.data, dreId: x.id }); x.contaId = c.id; contas.push(c); });
  rel.linhas.forEach((r, k) => {
    const c = C(r.data, r.forn, r.cat, r.sub, r.valor, { orig: r.orig, estim: r.estim });
    if (isOf(c)) { c.entrega = r.data; c.histEnt = []; if (r.data < hoje) c.recebidoEm = r.data; }
    if (r.pago) {
      c.pago = true;
      if (liga.has(k)) { const x = saidas[liga.get(k)]; c.pagoEm = x.data; c.dreId = x.id; x.contaId = c.id; }
      else c.pagoEm = r.data < hoje ? r.data : hoje;
    }
    contas.push(c);
  });
  if (rel.silmaq) contas.push(C('2027-01-15', 'SILMAQ · parcelas vencidas desde ' + (rel.silmaq.de || '').split('-').reverse().join('/') + ' (aba ATRASADOS MRBL)', 'AQUISIÇÕES / INVESTIMENTOS', 'COMPRA DE MAQUINAS', rel.silmaq.valor, { orig: rel.silmaq.de }));
  contas.forEach((c) => { c.hist = c.orig ? [{ de: c.orig, para: c.data, em: null }] : []; });
  return { contas, saidas, entradas, fornecedores: fornecedoresDe(contas, saidas), clientes: [...new Set(dre.clientes)].map((nome) => ({ nome })) };
}

// Lista inicial de fornecedores: oficinas das contas e fornecedores que aparecem 2+ vezes na DRE.
export function fornecedoresDe(contas, saidas) {
  const seen = new Set(), out = [];
  const add = (nome, cat, sub) => { nome = (nome || '').trim(); if (!nome || !cat) return; const k = nome.toUpperCase() + '|' + cat + '|' + (sub || ''); if (seen.has(k)) return; seen.add(k); out.push({ id: 'f' + out.length, nome, cat, sub: sub || '' }); };
  contas.filter(isOf).forEach((c) => add(c.forn.split(' · ')[0], c.cat, c.sub));
  const cnt = {};
  saidas.forEach((x) => { if (!x.forn) return; const k = x.forn.trim().toUpperCase() + '|' + x.cat + '|' + x.sub; cnt[k] = (cnt[k] || 0) + 1; });
  saidas.forEach((x) => { if (x.forn && cnt[x.forn.trim().toUpperCase() + '|' + x.cat + '|' + x.sub] >= 2) add(x.forn, x.cat, x.sub); });
  return out.sort((a, b) => a.cat.localeCompare(b.cat) || a.nome.localeCompare(b.nome));
}

// ---- ExcelJS -> { nome: linhas } ----
export function valorCelula(v) {
  if (v == null) return null;
  if (ehData(v) || typeof v !== 'object') return v;
  if ('result' in v) return valorCelula(v.result);
  if (v.richText) return v.richText.map((t) => t.text).join('');
  if ('text' in v) return v.text;
  if (v.error) return null;
  return null;
}
export async function lerPasta(ExcelJS, buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const abas = {}, nomes = [];
  wb.eachSheet((ws) => {
    nomes.push(ws.name);
    const linhas = [];
    ws.eachRow({ includeEmpty: true }, (row, i) => {
      const vals = Array.isArray(row.values) ? row.values.slice(1) : [];
      linhas[i - 1] = Array.from(vals, valorCelula);
    });
    for (let i = 0; i < linhas.length; i++) if (!linhas[i]) linhas[i] = [];
    abas[ws.name] = linhas;
  });
  return { abas, nomes };
}
export const tipoDaPasta = (nomes) => (nomes.includes('BASE_DESPESAS') ? 'dre' : nomes.includes('ATRASADOS MRBL') ? 'rel' : null);
