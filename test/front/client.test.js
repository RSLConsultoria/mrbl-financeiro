import { describe, it, expect, vi } from 'vitest';
import { criarApi } from '../../src/api/client.js';

function memoria() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; }
const resposta = (corpo, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(corpo) });

describe('cliente da API', () => {
  it('manda POST text/plain com ação, dados e token', async () => {
    const fetchFn = vi.fn(() => resposta({ ok: true, dados: { token: 't1', usuario: 'Lucca', expira: Date.now() + 1e6 } }));
    const api = criarApi({ url: 'https://x', fetchFn, storage: memoria() });
    await api.entrar('Lucca', 'segredo1');
    const [url, opts] = fetchFn.mock.calls[0];
    expect(url).toBe('https://x');
    expect(opts.headers['Content-Type']).toBe('text/plain;charset=utf-8');
    expect(JSON.parse(opts.body)).toEqual({ acao: 'auth.entrar', dados: { nome: 'Lucca', senha: 'segredo1' } });
    fetchFn.mockImplementation(() => resposta({ ok: true, dados: [] }));
    await api.chamar('dados.carregar');
    expect(JSON.parse(fetchFn.mock.calls[1][1].body).token).toBe('t1');
    expect(api.sessao().usuario).toBe('Lucca');
  });
  it('erro do servidor vira exceção com código e mensagem', async () => {
    const api = criarApi({ url: 'u', fetchFn: () => resposta({ ok: false, codigo: 'login', erro: 'Usuário ou senha incorretos.' }), storage: memoria() });
    await expect(api.entrar('Lucca', 'x')).rejects.toMatchObject({ codigo: 'login', message: 'Usuário ou senha incorretos.' });
    expect(api.sessao()).toBeNull();
  });
  it('sessão expirada limpa a sessão e avisa', async () => {
    const st = memoria();
    st.setItem('mrbl-sessao', JSON.stringify({ token: 't', usuario: 'Cris', expira: Date.now() + 1e6 }));
    const aoExpirar = vi.fn();
    const api = criarApi({ url: 'u', fetchFn: () => resposta({ ok: false, codigo: 'sessao_expirada', erro: 'Sua sessão expirou. Entre de novo.' }), storage: st, aoExpirar });
    await expect(api.chamar('dados.carregar')).rejects.toMatchObject({ codigo: 'sessao_expirada' });
    expect(aoExpirar).toHaveBeenCalledWith('Sua sessão expirou. Entre de novo.');
    expect(api.sessao()).toBeNull();
  });
  it('falha de rede vira mensagem clara', async () => {
    const api = criarApi({ url: 'u', fetchFn: () => Promise.reject(new TypeError('Failed to fetch')), storage: memoria() });
    await expect(api.chamar('auth.usuarios')).rejects.toMatchObject({ codigo: 'rede' });
  });
});
