import { describe, it, expect } from 'vitest';
import { carregarServidor, chamar } from './carregar.js';

function logado() {
  const g = carregarServidor();
  g.Db.inserir('Usuarios', { nome: 'Viviane', convite: 'V1', ativo: true });
  g.Db.inserir('Usuarios', { nome: 'Cris', convite: 'C1', ativo: true });
  const viv = chamar(g, 'auth.criarSenha', { nome: 'Viviane', convite: 'V1', senha: 'senha123' }).dados.token;
  const cris = chamar(g, 'auth.criarSenha', { nome: 'Cris', convite: 'C1', senha: 'senha123' }).dados.token;
  return { g, viv, cris };
}

describe('roteador e escrita', () => {
  it('ação desconhecida responde erro claro', () => {
    const { g } = logado();
    expect(chamar(g, 'nao.existe')).toMatchObject({ ok: false, codigo: 'acao_desconhecida' });
  });
  it('escrita registra log com o usuário da sessão', () => {
    const { g, viv } = logado();
    const r = chamar(g, 'config.definir', { chave: 'prazoOficinas', valor: 20 }, viv);
    expect(r.ok).toBe(true);
    expect(g.Db.pegar('Config', 'prazoOficinas').valor).toBe(20);
    const ult = g.Db.todos('Logs').at(-1);
    expect([ult.por, ult.tela, ult.txt]).toEqual(['Viviane', 'cfg', 'Configuração prazoOficinas alterada para 20']);
  });
  it('desfazer volta o valor e só vale para quem fez', () => {
    const { g, viv, cris } = logado();
    const { desfazer } = chamar(g, 'config.definir', { chave: 'prazoOficinas', valor: 20 }, viv).dados;
    expect(chamar(g, 'acao.desfazer', { id: desfazer }, cris).codigo).toBe('desfazer_outro');
    expect(chamar(g, 'acao.desfazer', { id: desfazer }, viv).ok).toBe(true);
    expect(g.Db.pegar('Config', 'prazoOficinas').valor).toBe(15);
    expect(chamar(g, 'acao.desfazer', { id: desfazer }, viv).codigo).toBe('desfazer_expirado');
  });
  it('erro no meio da escrita não deixa nada pela metade', () => {
    const { g, viv } = logado();
    g.acao_('teste.quebra', (d, s) => g.mutar_(s, 'cfg', () => {
      g.Db.inserir('Fornecedores', { id: 'f9', nome: 'X', cat: 'Y', sub: '' });
      throw new Error('falhou');
    }));
    expect(chamar(g, 'teste.quebra', {}, viv)).toMatchObject({ ok: false, erro: 'Erro no servidor: falhou' });
    expect(g.Db.todos('Fornecedores')).toEqual([]);
  });
  it('logs: 15 por página, mais recentes primeiro, com filtro', () => {
    const { g, viv } = logado();
    for (let i = 0; i < 20; i++) g.Logs.registrar(i % 2 ? 'Cris' : 'Viviane', 'pagar', 'Ação ' + i);
    const p0 = chamar(g, 'logs.listar', { pagina: 0 }, viv).dados;
    expect(p0.itens).toHaveLength(15);
    expect(p0.itens[0].txt).toBe('Ação 19');
    expect(p0.paginas).toBe(2);
    const cris = chamar(g, 'logs.listar', { usuario: 'Cris', busca: 'ação 1' }, viv).dados;
    expect(cris.itens.every((x) => x.por === 'Cris')).toBe(true);
    expect(cris.itens.map((x) => x.txt)).toEqual(['Ação 19', 'Ação 17', 'Ação 15', 'Ação 13', 'Ação 11', 'Ação 1']);
  });
});
