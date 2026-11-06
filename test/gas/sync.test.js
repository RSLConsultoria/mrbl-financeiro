import { describe, it, expect } from 'vitest';
import { carregarServidor, chamar } from './carregar.js';

function logado() {
  const g = carregarServidor();
  for (const [n, c] of [['Lucca', 'L1'], ['Viviane', 'V1']]) g.Db.inserir('Usuarios', { nome: n, convite: c, ativo: true });
  const luc = chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'L1', senha: 'senha123' }).dados.token;
  const viv = chamar(g, 'auth.criarSenha', { nome: 'Viviane', convite: 'V1', senha: 'senha123' }).dados.token;
  return { g, luc, viv };
}
const conta = (id, extra) => ({ id, data: '2026-11-10', orig: null, forn: 'ACME', cat: 'ALUGUEL', sub: 'ALUGUEL', valor: 100.5, pago: false, pagoEm: null, hist: [], log: [{ txt: 'Criada', em: '2026-11-06T10:00', por: 'Viviane' }], ...extra });

describe('sync.aplicar e dados.carregar', () => {
  it('insere, altera e apaga, e devolve no carregar igual ao que foi mandado', () => {
    const { g, viv } = logado();
    let r = chamar(g, 'sync.aplicar', { tela: 'pagar', msg: 'Conta criada', mud: { Contas: { up: [conta('c1'), conta('c2', { marca: { a: 1 } })] } } }, viv);
    expect(r.ok).toBe(true);
    r = chamar(g, 'sync.aplicar', { tela: 'pagar', msg: 'Paga', mud: { Contas: { up: [conta('c1', { pago: true, pagoEm: '2026-11-06' })], del: ['c2'] } } }, viv);
    expect(r.ok).toBe(true);
    const d = chamar(g, 'dados.carregar', {}, viv).dados;
    expect(d.contas).toEqual([{ ...conta('c1', { pago: true, pagoEm: '2026-11-06' }), estim: null, dreId: null, dreSkip: null, entrega: null, recebidoEm: null, payManual: null, histEnt: null }]);
    const linha = g.Db.pegar('Contas', 'c1');
    expect(linha.criadoPor).toBe('Viviane');
    expect(d.logs.slice(0, 2).map((x) => x.txt)).toEqual(['Paga', 'Conta criada']);
  });
  it('campos sem coluna vão e voltam pelo extra', () => {
    const { g, viv } = logado();
    chamar(g, 'sync.aplicar', { mud: { Contas: { up: [conta('c9', { marca: { a: 1 }, histEnt: [{ de: '2026-11-01', para: '2026-11-03' }] })] } } }, viv);
    const c = chamar(g, 'dados.carregar', {}, viv).dados.contas[0];
    expect(c.marca).toEqual({ a: 1 });
    expect(c.histEnt).toEqual([{ de: '2026-11-01', para: '2026-11-03' }]);
  });
  it('responsável da despesa é sempre quem lançou, e cliente novo entra na lista', () => {
    const { g, viv, luc } = logado();
    chamar(g, 'sync.aplicar', { mud: { Despesas: { up: [{ id: 's1', data: '2026-11-06', cat: 'ALUGUEL', sub: 'ALUGUEL', emp: 'MRBL', valor: 10, forn: 'X', resp: 'Outra pessoa', obs: '', contaId: null }] },
      Entradas: { up: [{ id: 'e1', data: '2026-11-06', cat: 'RECEBIMENTO DE CLIENTE', cli: 'Cliente Novo', nf: '0012', valor: 5, resp: 'X', obs: '' }] } } }, viv);
    chamar(g, 'sync.aplicar', { mud: { Despesas: { up: [{ id: 's1', data: '2026-11-06', cat: 'ALUGUEL', sub: 'ALUGUEL', emp: 'MRBL', valor: 20, forn: 'X', resp: 'Lucca', obs: '', contaId: null }] } } }, luc);
    const d = chamar(g, 'dados.carregar', {}, viv).dados;
    expect(d.saidas[0]).toMatchObject({ resp: 'Viviane', valor: 20 });
    expect(d.entradas[0]).toMatchObject({ resp: 'Viviane', nf: '0012' });
    expect(d.clientes).toEqual([{ nome: 'Cliente Novo' }]);
  });
  it('recusa aba fora do app e configuração não editável', () => {
    const { g, viv } = logado();
    expect(chamar(g, 'sync.aplicar', { mud: { Usuarios: { up: [{ nome: 'X' }] } } }, viv).codigo).toBe('aba_proibida');
    expect(chamar(g, 'sync.aplicar', { mud: { Config: { admins: ['Viviane'] } } }, viv).codigo).toBe('config_proibida');
    expect(chamar(g, 'sync.aplicar', { mud: { Config: { prazoOficinas: 20, prevRevisao: { '2026-10': { k: 'avg' } } } } }, viv).ok).toBe(true);
    expect(chamar(g, 'dados.carregar', {}, viv).dados.config).toMatchObject({ prazoOficinas: 20, prevRevisao: { '2026-10': { k: 'avg' } } });
  });
  it('muitas linhas de uma vez são gravadas em bloco', () => {
    const { g, viv } = logado();
    const ups = Array.from({ length: 1200 }, (_, i) => conta('c' + i));
    expect(chamar(g, 'sync.aplicar', { mud: { Contas: { up: ups } } }, viv).ok).toBe(true);
    const alt = ups.slice(0, 30).map((c) => ({ ...c, valor: 1 }));
    expect(chamar(g, 'sync.aplicar', { mud: { Contas: { up: alt, del: ['c1199'] } } }, viv).ok).toBe(true);
    const d = chamar(g, 'dados.carregar', {}, viv).dados.contas;
    expect(d).toHaveLength(1199);
    expect(d.filter((c) => c.valor === 1)).toHaveLength(30);
  });
});

describe('usuários', () => {
  it('só o administrador adiciona e redefine; redefinir encerra a sessão e gera convite', () => {
    const { g, viv, luc } = logado();
    expect(chamar(g, 'usuarios.adicionar', { nome: 'Cris' }, viv).codigo).toBe('sem_permissao');
    const a = chamar(g, 'usuarios.adicionar', { nome: 'Cris' }, luc);
    expect(a.dados.convite).toMatch(/^[A-Z2-9]{6}$/);
    const d = chamar(g, 'dados.carregar', {}, luc).dados;
    expect(d.admin).toBe(true);
    expect(d.usuarios.find((u) => u.nome === 'Cris')).toEqual({ nome: 'Cris', temSenha: false, convite: a.dados.convite });
    expect(chamar(g, 'dados.carregar', {}, viv).dados.usuarios.find((u) => u.nome === 'Cris').convite).toBeUndefined();
    const r = chamar(g, 'usuarios.redefinir', { nome: 'Viviane' }, luc);
    expect(r.ok).toBe(true);
    g.cache.clear();
    expect(chamar(g, 'dados.carregar', {}, viv).codigo).toBe('sessao_expirada');
    expect(chamar(g, 'auth.criarSenha', { nome: 'Viviane', convite: r.dados.convite, senha: 'nova1234' }).ok).toBe(true);
  });
});

describe('carga inicial', () => {
  it('substitui as abas e registra no log', () => {
    const { g, viv } = logado();
    chamar(g, 'sync.aplicar', { mud: { Contas: { up: [conta('velha')] } } }, viv);
    g.CARGA = { contas: [conta('c1'), conta('c2')], saidas: [{ id: 's1', data: '2026-07-01', cat: 'ALUGUEL', sub: 'ALUGUEL', emp: 'MRBL', valor: 9, forn: '', resp: 'Cris', obs: '', contaId: 'c1' }],
      dreHistorico: [{ mes: '2026-01', tipo: 'cmv', cat: '', sub: '', valor: 3 }], config: { saldoJan: 1000 } };
    g.rodarCarga();
    const d = chamar(g, 'dados.carregar', {}, viv).dados;
    expect(d.contas.map((c) => c.id)).toEqual(['c1', 'c2']);
    expect(d.saidas[0].resp).toBe('Cris');
    expect(d.dreHistorico).toEqual([{ mes: '2026-01', tipo: 'cmv', cat: null, sub: null, valor: 3 }]);
    expect(d.config.saldoJan).toBe(1000);
    expect(d.logs.some((l) => l.txt.startsWith('Carga inicial'))).toBe(true);
  });
});

describe('carga pelo app', () => {
  it('só administrador e só com a planilha vazia', () => {
    const { g, viv, luc } = logado();
    const carga = { contas: [conta('c1')], saidas: [], entradas: [] };
    expect(chamar(g, 'carga.importar', { carga }, viv).codigo).toBe('sem_permissao');
    expect(chamar(g, 'carga.importar', { carga }, luc).dados).toMatchObject({ Contas: 1 });
    expect(chamar(g, 'carga.importar', { carga }, luc).codigo).toBe('planilha_com_dados');
  });
});
