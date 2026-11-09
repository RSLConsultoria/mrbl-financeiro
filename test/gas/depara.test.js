import { describe, it, expect } from 'vitest';
import { carregarServidor } from './carregar.js';

describe('de-para das listas', () => {
  it('limpa mês, NF, referência e parcela do nome', () => {
    const g = carregarServidor();
    expect(g.DePara.limpar('ELVA SERRUDA NOVEMBRO')).toBe('ELVA SERRUDA');
    expect(g.DePara.limpar('Elva Serruda - outubro')).toBe('ELVA SERRUDA');
    expect(g.DePara.limpar('ADERE NF 3955')).toBe('ADERE');
    expect(g.DePara.limpar('GIANOTTI CONTADORES REF 04/2026')).toBe('GIANOTTI CONTADORES');
    expect(g.DePara.limpar('MARCIA')).toBe('MARCIA');
    expect(g.DePara.limpar('MAIO')).toBe('MAIO');
    expect(g.DePara.limpar('CLAUDIA SOUSA - P/ VALTER')).toBe('CLAUDIA SOUSA - P/ VALTER');
    expect(g.DePara.limpar('CONFECCOES 23 MAIO')).toBe('CONFECCOES 23 MAIO');
  });
  it('gera a planilha separada com uma linha por nome e a sugestão unificada', () => {
    const g = carregarServidor();
    const C = (id, forn, valor, extra) => ({ id, data: '2026-10-10', forn, cat: 'ACESSORIAS', sub: 'ACESSORIAS EM GERAL (OF)', valor, pago: false, hist: [], ...extra });
    g.Db.gravarLote('Contas', [C('c1', 'ELVA SERRUDA OUTUBRO', 10), C('c2', 'ELVA SERRUDA NOVEMBRO', 20), C('c3', 'ESTEVAO', 5), C('c4', 'ESTEVAO', 5), C('c5', 'ESTEVÃO', 5)], []);
    g.Db.gravarLote('Entradas', [{ id: 'e1', data: '2026-10-01', cat: 'RECEBIMENTO DE CLIENTE', cli: 'ANIMALE', valor: 100 }], []);
    const r = g.gerarDePara();
    expect(r.linhas).toBe(5);
    const sh = g.SpreadsheetApp.openById(g.PropertiesService.getScriptProperties().getProperty('DEPARA_ID')).getSheets()[0];
    const rows = sh.rows.slice(1);
    const sug = Object.fromEntries(rows.map((x) => [x[2], x[9]]));
    expect(sug['ELVA SERRUDA OUTUBRO']).toBe('ELVA SERRUDA');
    expect(sug['ELVA SERRUDA NOVEMBRO']).toBe('ELVA SERRUDA');
    expect(sug['ESTEVÃO']).toBe('ESTEVAO');
    expect(rows.find((x) => x[2] === 'ANIMALE')[0]).toBe('Clientes');
    // rodar de novo reaproveita a mesma planilha
    g.gerarDePara();
    expect(g.SpreadsheetApp.criadas.length).toBe(1);
  });
});

describe('de-para ignora o que o app nomeia', () => {
  it('não lista parcelas de parcelamento nem cheques', () => {
    const g = carregarServidor();
    g.Db.gravarLote('Contas', [g.Sync.paraLinha('Contas', { id: 'c1', data: '2026-11-10', forn: 'ITAU · 17/60', cat: 'FINANCIAMENTOS', sub: 'X', valor: 1, hist: [], parcId: 'pc1', parcN: 17 })], []);
    expect(g.gerarDePara().linhas).toBe(0);
  });
});
