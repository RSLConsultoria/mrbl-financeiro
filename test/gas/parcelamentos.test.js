import { describe, it, expect } from 'vitest';
import { carregarServidor, chamar } from './carregar.js';

function entrar() {
  const g = carregarServidor();
  // planilha de antes desta versão: sem as abas Parcelamentos e Cheques
  const ss = g.SpreadsheetApp.getActive();
  for (const n of ['Parcelamentos', 'Cheques']) { const sh = ss.getSheetByName(n); if (sh) ss.deleteSheet(sh); }
  g.Db.inserir('Usuarios', { nome: 'Lucca', convite: 'T', ativo: true });
  const token = chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'T', senha: 'teste123' }).dados.token;
  return { g, token };
}

describe('parcelamentos e cheques', () => {
  it('cria as abas que faltam e grava/carrega parcelamentos, cheques e o vínculo da conta', () => {
    const { g, token } = entrar();
    const mud = {
      Parcelamentos: { up: [{ id: 'pc1', nome: 'ICMS · 36x', emp: 'MRBL', cat: 'X', sub: 'Y', valorParcela: 100, qtd: 36, valorTotal: 3600, pagasAntes: 19, log: [{ txt: 'Criado' }] }], del: [] },
      Cheques: { up: [{ id: 'cq1', data: '2026-12-04', numero: '253', desc: 'ICMS', valor: 8000, aPagar: 8000, grupo: 'G', cat: '', sub: '', contaId: null, log: [] }], del: [] },
      Contas: { up: [{ id: 'c1', data: '2026-12-10', forn: 'ICMS · 36x · 20/36', cat: 'X', sub: 'Y', valor: 100, pago: false, hist: [], parcId: 'pc1', parcN: 20 }], del: [] },
    };
    const r = chamar(g, 'sync.aplicar', { mud, msg: 'teste' }, token);
    expect(r.ok).toBe(true);
    const ss = g.SpreadsheetApp.getActive();
    expect(ss.getSheets().map((s) => s.getName()).slice(-1)[0]).toBe('Logs');
    const d = chamar(g, 'dados.carregar', {}, token).dados;
    expect(d.parcelamentos[0]).toMatchObject({ id: 'pc1', qtd: 36, pagasAntes: 19, log: [{ txt: 'Criado' }] });
    expect(String(d.cheques[0].numero)).toBe('253');
    expect(d.contas[0]).toMatchObject({ parcId: 'pc1', parcN: 20 });
  });
});
