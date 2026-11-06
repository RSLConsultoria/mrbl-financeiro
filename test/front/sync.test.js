import { describe, it, expect, vi } from 'vitest';
import { criarSincronizador, diferenca, fotografar } from '../../src/app/sync.js';

const estado = () => ({
  contas: [{ id: 'c1', valor: 10, hist: [] }, { id: 'c2', valor: 20 }],
  saidas: [], entradas: [], previsoes: [{ id: 'p1', subs: ['A'], valor: 5 }], fornecedores: [],
  prazoOf: 15, prevReview: {},
});

describe('diferença entre fotografias', () => {
  it('sem mudança não manda nada', () => {
    const S = estado();
    expect(diferenca(fotografar(S), S).vazio).toBe(true);
  });
  it('manda só os registros alterados, novos e apagados, e a configuração', () => {
    const S = estado(), f = fotografar(S);
    S.contas[0].valor = 11;
    S.contas[0].hist.push({ de: 'a', para: 'b' });
    S.contas.splice(1, 1);
    S.contas.push({ id: 'c3', valor: 1 });
    S.prazoOf = 20;
    S.prevReview['2026-10'] = { x: 'media' };
    const { mud, vazio } = diferenca(f, S);
    expect(vazio).toBe(false);
    expect(mud.Contas.up.map((c) => c.id)).toEqual(['c1', 'c3']);
    expect(mud.Contas.del).toEqual(['c2']);
    expect(mud.Previsoes).toBeUndefined();
    expect(mud.Config).toEqual({ prazoOficinas: 20, prevRevisao: { '2026-10': { x: 'media' } } });
  });
});

describe('sincronizador', () => {
  it('envia em fila, na ordem, e só a partir da última gravação', async () => {
    const chamadas = [];
    const api = { chamar: vi.fn(async (acao, d) => { chamadas.push(d); await new Promise((r) => setTimeout(r, 5)); return {}; }) };
    const s = criarSincronizador({ api, aoErro: vi.fn() });
    const S = estado();
    s.base(S);
    S.contas[0].valor = 1; s.salvar(S, 'primeira', 'pagar');
    S.contas[1].valor = 2; s.salvar(S, 'segunda', 'pagar');
    s.salvar(S, 'nada mudou', 'pagar');
    await s.esperar();
    expect(chamadas.map((c) => c.msg)).toEqual(['primeira', 'segunda']);
    expect(chamadas[1].mud.Contas.up.map((c) => c.id)).toEqual(['c2']);
  });
  it('erro do servidor chama aoErro e a fila continua', async () => {
    let n = 0;
    const api = { chamar: async () => { if (n++ === 0) throw new Error('fora do ar'); return {}; } };
    const aoErro = vi.fn();
    const s = criarSincronizador({ api, aoErro });
    const S = estado(); s.base(S);
    S.prazoOf = 1; s.salvar(S, 'a');
    S.prazoOf = 2; s.salvar(S, 'b');
    await s.esperar();
    expect(aoErro).toHaveBeenCalledTimes(1);
    expect(n).toBe(2);
    expect(s.pendentes).toBe(0);
  });
});
