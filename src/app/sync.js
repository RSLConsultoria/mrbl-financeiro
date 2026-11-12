// Grava na planilha só o que mudou. Guarda uma "fotografia" do estado depois de cada gravação e,
// na próxima, compara registro a registro pelo id. As gravações saem em fila, na ordem em que foram feitas.
export const COLECOES = { contas: 'Contas', saidas: 'Despesas', entradas: 'Entradas', previsoes: 'Previsoes', fornecedores: 'Fornecedores', parcelamentos: 'Parcelamentos', cheques: 'Cheques' };

const configDe = (S) => ({ prazoOficinas: S.prazoOf, prevRevisao: JSON.stringify(S.prevReview || {}), oficinasFixas: JSON.stringify(S.ofFixas || []), relFoto: JSON.stringify(S.relFoto || null) });

export function fotografar(S) {
  const f = {};
  for (const k of Object.keys(COLECOES)) f[k] = new Map((S[k] || []).map((o) => [String(o.id), JSON.stringify(o)]));
  f.config = configDe(S);
  return f;
}

export function diferenca(antes, S) {
  const mud = {};
  let vazio = true;
  for (const [k, aba] of Object.entries(COLECOES)) {
    const ant = antes[k] || new Map(), up = [], vistos = new Set();
    for (const o of S[k] || []) {
      const id = String(o.id);
      vistos.add(id);
      const j = JSON.stringify(o);
      if (ant.get(id) !== j) up.push(JSON.parse(j));
    }
    const del = [...ant.keys()].filter((id) => !vistos.has(id));
    if (up.length || del.length) { mud[aba] = { up, del }; vazio = false; }
  }
  const cAnt = antes.config || {}, cNovo = configDe(S), cfg = {};
  if (cAnt.prazoOficinas !== cNovo.prazoOficinas) cfg.prazoOficinas = cNovo.prazoOficinas;
  if (cAnt.prevRevisao !== cNovo.prevRevisao) cfg.prevRevisao = JSON.parse(cNovo.prevRevisao);
  if (cAnt.oficinasFixas !== cNovo.oficinasFixas) cfg.oficinasFixas = JSON.parse(cNovo.oficinasFixas);
  if (cAnt.relFoto !== cNovo.relFoto && S.relFoto) cfg.relFoto = JSON.parse(cNovo.relFoto);
  if (Object.keys(cfg).length) { mud.Config = cfg; vazio = false; }
  return { mud, vazio };
}

export function criarSincronizador({ api, aoErro, aoMudarEstado = () => {} }) {
  let base = null, fila = Promise.resolve(), pendentes = 0;
  const avisar = () => aoMudarEstado(pendentes);
  return {
    base(S) { base = fotografar(S); },
    salvar(S, msg, tela) {
      const { mud, vazio } = diferenca(base, S);
      if (vazio) return fila;
      base = fotografar(S);
      pendentes++; avisar();
      fila = fila
        .then(() => api.chamar('sync.aplicar', { tela, msg: msg || 'Alteração salva', mud }))
        .catch((err) => aoErro(err, msg))
        .finally(() => { pendentes--; avisar(); });
      return fila;
    },
    get pendentes() { return pendentes; },
    esperar() { return fila; },
  };
}
