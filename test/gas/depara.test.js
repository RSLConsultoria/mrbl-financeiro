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

describe('aplicar o de-para', () => {
  it('troca os nomes em todas as abas, junta fornecedores repetidos e guarda o mapa', () => {
    const g = carregarServidor();
    g.Db.inserir('Usuarios', { nome: 'Lucca', convite: 'T', ativo: true });
    const tok = JSON.parse(g.doPost({ postData: { contents: JSON.stringify({ acao: 'auth.criarSenha', dados: { nome: 'Lucca', convite: 'T', senha: 'teste123' } }) } }).getContent()).dados.token;
    const C = (id, forn, extra) => g.Sync.paraLinha('Contas', { id, data: '2026-10-10', forn, cat: 'ACESSORIAS', sub: 'OF', valor: 1, hist: [], log: [], ...extra });
    g.Db.gravarLote('Contas', [C('c1', 'ELVA SERRUDA OUTUBRO'), C('c2', 'elva serruda  novembro'), C('c3', 'ITAU · 1/60', { parcId: 'p' })], []);
    g.Db.gravarLote('Despesas', [{ id: 'd1', data: '2026-10-01', cat: 'ACESSORIAS', sub: 'OF', forn: 'ELVA SERRUDA OUTUBRO', valor: 1 }], []);
    g.Db.gravarLote('Fornecedores', [{ id: 'f1', nome: 'ELVA SERRUDA OUTUBRO', cat: 'ACESSORIAS', sub: 'OF' }, { id: 'f2', nome: 'ELVA SERRUDA NOVEMBRO', cat: 'ACESSORIAS', sub: 'OF' }], []);
    g.Db.gravarLote('Entradas', [{ id: 'e1', data: '2026-10-01', cat: 'RECEBIMENTO DE CLIENTE', cli: 'LELIS', valor: 1 }], []);
    g.Db.gravarLote('Clientes', [{ nome: 'LELIS' }], []);
    const mapa = [
      { lista: 'Fornecedores', cat: 'ACESSORIAS', orig: 'ELVA SERRUDA OUTUBRO', alvo: 'ELVA SERRUDA' },
      { lista: 'Fornecedores', cat: 'ACESSORIAS', orig: 'ELVA SERRUDA NOVEMBRO', alvo: 'ELVA SERRUDA ' },
      { lista: 'Clientes', cat: 'RECEBIMENTO DE CLIENTE', orig: 'LELIS', alvo: 'LE LIS BLANC' },
    ];
    const r = JSON.parse(g.doPost({ postData: { contents: JSON.stringify({ acao: 'depara.aplicar', token: tok, dados: { mapa } }) } }).getContent());
    expect(r.ok).toBe(true);
    expect(g.Db.todos('Contas').map((c) => c.forn)).toEqual(['ELVA SERRUDA', 'ELVA SERRUDA', 'ITAU · 1/60']);
    expect(g.Db.todos('Contas')[0].log.at(-1).txt).toContain('ELVA SERRUDA OUTUBRO → ELVA SERRUDA');
    expect(g.Db.todos('Despesas')[0].forn).toBe('ELVA SERRUDA');
    expect(g.Db.todos('Fornecedores').map((f) => f.nome)).toEqual(['ELVA SERRUDA']);
    expect(g.Db.todos('Entradas')[0].cli).toBe('LE LIS BLANC');
    expect(g.Db.todos('Clientes').map((c) => c.nome)).toEqual(['LE LIS BLANC']);
    expect(Object.keys(JSON.parse(g.Db.pegar('Config', 'depara').valor)).length).toBe(3);
  });
});
