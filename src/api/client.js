// Fala com o Web App do Apps Script. POST text/plain evita a checagem de CORS (preflight) que o Apps Script não responde.
const CHAVE_SESSAO = 'mrbl-sessao';

export class ErroApi extends Error {
  constructor(codigo, msg) { super(msg); this.codigo = codigo; }
}

export function criarApi({ url, fetchFn = (...a) => fetch(...a), storage = localStorage, aoExpirar = () => {} }) {
  const lerSessao = () => { try { return JSON.parse(storage.getItem(CHAVE_SESSAO) || 'null'); } catch { return null; } };
  const gravarSessao = (s) => { try { s ? storage.setItem(CHAVE_SESSAO, JSON.stringify(s)) : storage.removeItem(CHAVE_SESSAO); } catch { /* navegador sem storage */ } };

  async function chamar(acao, dados = {}) {
    const s = lerSessao();
    let resp;
    try {
      resp = await fetchFn(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ acao, dados, token: s ? s.token : undefined }),
        redirect: 'follow',
      });
    } catch {
      throw new ErroApi('rede', 'Sem conexão com o servidor. Confira a internet e tente de novo.');
    }
    if (!resp.ok) throw new ErroApi('http', 'O servidor respondeu com erro ' + resp.status + '.');
    const r = await resp.json();
    if (!r.ok) {
      if (r.codigo === 'sessao_expirada') { gravarSessao(null); aoExpirar(r.erro); }
      throw new ErroApi(r.codigo, r.erro);
    }
    return r.dados;
  }

  async function entrar(nome, senha) { const s = await chamar('auth.entrar', { nome, senha }); gravarSessao(s); return s; }
  async function criarSenha(nome, convite, senha) { const s = await chamar('auth.criarSenha', { nome, convite, senha }); gravarSessao(s); return s; }
  async function sair() { try { await chamar('auth.sair'); } finally { gravarSessao(null); } }
  const sessao = () => { const s = lerSessao(); return s && s.expira > Date.now() ? s : null; };

  return { chamar, entrar, criarSenha, sair, sessao };
}
