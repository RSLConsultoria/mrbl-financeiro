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
  it('recusa aba com cabeçalho diferente', () => {
    const g = carregarServidor();
    g.ss.getSheetByName('Clientes').rows[0] = ['outra coisa'];
    expect(() => g.setupPlanilha()).toThrow(/Cabeçalho diferente na aba Clientes/);
  });
});
