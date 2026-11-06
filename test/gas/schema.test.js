import { describe, it, expect } from 'vitest';
import { carregarServidor } from './carregar.js';

describe('setupPlanilha', () => {
  it('cria todas as abas com cabeçalho e deixa Logs por último', () => {
    const g = carregarServidor();
    const nomes = g.ss.getSheets().map((s) => s.getName());
    expect(nomes.at(-1)).toBe('Logs');
    for (const aba of Object.keys(g.SCHEMA)) {
      const sh = g.ss.getSheetByName(aba);
      expect(sh.rows[0]).toEqual(g.SCHEMA[aba]);
      expect(sh.frozen).toBe(1);
    }
  });
  it('pode rodar de novo sem duplicar nada', () => {
    const g = carregarServidor();
    g.setupPlanilha();
    expect(g.ss.getSheetByName('Contas').rows.length).toBe(1);
    expect(g.Db.todos('Config')).toEqual([{ chave: 'prazoOficinas', valor: 15 }]);
  });
  it('troca o cabeçalho de aba vazia e recusa aba com dados e cabeçalho diferente', () => {
    const g = carregarServidor();
    g.ss.getSheetByName('Clientes').rows[0] = ['outra coisa', 'x'];
    g.setupPlanilha();
    expect(g.ss.getSheetByName('Clientes').rows[0].filter(Boolean)).toEqual(['nome']);
    g.ss.getSheetByName('Clientes').rows[0] = ['outra coisa'];
    g.ss.getSheetByName('Clientes').rows.push(['ACME']);
    expect(() => g.setupPlanilha()).toThrow(/Cabeçalho diferente na aba Clientes/);
  });
  it('apaga abas antigas vazias e mantém as que têm dados', () => {
    const g = carregarServidor();
    g.ss.insertSheet('ContasHist').appendRow(['id']);
    const l = g.ss.insertSheet('Listas'); l.appendRow(['tipo']); l.appendRow(['x']);
    g.setupPlanilha();
    const nomes = g.ss.getSheets().map((s) => s.getName());
    expect(nomes).not.toContain('ContasHist');
    expect(nomes).not.toContain('Página1');
    expect(nomes).toContain('Listas');
    expect(nomes.at(-1)).toBe('Logs');
  });
});
