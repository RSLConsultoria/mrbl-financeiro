import { describe, it, expect } from 'vitest';
import { carregarServidor, chamar } from './carregar.js';

function comUsuario(opts) {
  const g = carregarServidor(opts);
  g.Db.inserir('Usuarios', { nome: 'Lucca', convite: 'ABC123', ativo: true, criadoEm: '2026-11-06' });
  return g;
}

describe('login', () => {
  it('lista usuários sem expor hash nem convite', () => {
    const g = comUsuario();
    expect(chamar(g, 'auth.usuarios')).toEqual({ ok: true, dados: [{ nome: 'Lucca', temSenha: false }] });
  });
  it('primeiro acesso exige o convite certo e senha de 6+', () => {
    const g = comUsuario();
    expect(chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'errado', senha: 'segredo1' }).codigo).toBe('convite');
    expect(chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: '123' }).codigo).toBe('senha_curta');
    const r = chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: 'segredo1' });
    expect(r.ok).toBe(true);
    expect(r.dados.token).toHaveLength(64);
    const u = g.Db.pegar('Usuarios', 'Lucca');
    expect(u.convite).toBeNull();
    expect(u.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(u.hash).not.toContain('segredo1');
  });
  it('entra com a senha certa e recusa a errada', () => {
    const g = comUsuario();
    chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: 'segredo1' });
    expect(chamar(g, 'auth.entrar', { nome: 'Lucca', senha: 'errada' })).toMatchObject({ ok: false, codigo: 'login' });
    const r = chamar(g, 'auth.entrar', { nome: 'Lucca', senha: 'segredo1' });
    expect(r.ok).toBe(true);
    expect(chamar(g, 'dados.carregar', {}, r.dados.token).dados.usuario).toBe('Lucca');
  });
  it('bloqueia depois de 5 erros seguidos', () => {
    const g = comUsuario();
    chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: 'segredo1' });
    for (let i = 0; i < 5; i++) chamar(g, 'auth.entrar', { nome: 'Lucca', senha: 'x' });
    expect(chamar(g, 'auth.entrar', { nome: 'Lucca', senha: 'segredo1' }).codigo).toBe('bloqueado');
  });
  it('sessão expira em 12 horas e Sair encerra na hora', () => {
    let t = Date.parse('2026-11-06T12:00:00Z');
    const g = comUsuario({ agora: () => t });
    const { token } = chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: 'segredo1' }).dados;
    expect(chamar(g, 'dados.carregar', {}, token).ok).toBe(true);
    t += 13 * 3600 * 1000;
    expect(chamar(g, 'dados.carregar', {}, token).codigo).toBe('sessao_expirada');
    t = Date.parse('2026-11-06T12:00:00Z');
    chamar(g, 'auth.sair', {}, token);
    expect(chamar(g, 'dados.carregar', {}, token).codigo).toBe('sessao_expirada');
  });
  it('ação sem sessão é recusada', () => {
    const g = comUsuario();
    expect(chamar(g, 'dados.carregar', {}, 'token-falso')).toMatchObject({ ok: false, codigo: 'sessao_expirada' });
  });
});
