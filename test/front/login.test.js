import { describe, it, expect, vi } from 'vitest';
import { montarLogin } from '../../src/ui/login.js';

const espera = () => new Promise((r) => setTimeout(r, 0));
function apiFalsa(usuarios) {
  return {
    chamar: vi.fn(async (a) => { if (a === 'auth.usuarios') return usuarios; throw new Error('?'); }),
    entrar: vi.fn(async (nome, senha) => { if (senha !== 'segredo1') { const e = new Error('Usuário ou senha incorretos.'); e.codigo = 'login'; throw e; } return { token: 't', usuario: nome }; }),
    criarSenha: vi.fn(async (nome, convite, senha) => ({ token: 't', usuario: nome })),
  };
}

describe('tela de login', () => {
  it('quem já tem senha vê só a senha; erro aparece na tela', async () => {
    const raiz = document.createElement('div');
    const api = apiFalsa([{ nome: 'Lucca', temSenha: true }]);
    const aoEntrar = vi.fn();
    await montarLogin(raiz, { api, aoEntrar }).abrir();
    expect(raiz.querySelector('#lgConvite')).toBeNull();
    raiz.querySelector('#lgPw').value = 'errada';
    raiz.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await espera();
    expect(raiz.querySelector('#lgErr').textContent).toBe('Usuário ou senha incorretos.');
    raiz.querySelector('#lgPw').value = 'segredo1';
    raiz.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await espera();
    expect(aoEntrar).toHaveBeenCalledWith({ token: 't', usuario: 'Lucca' });
  });
  it('primeiro acesso pede convite e confere as duas senhas', async () => {
    const raiz = document.createElement('div');
    const api = apiFalsa([{ nome: 'Lucca', temSenha: true }, { nome: 'Viviane', temSenha: false }]);
    await montarLogin(raiz, { api, aoEntrar: () => {} }).abrir();
    const sel = raiz.querySelector('#lgUser');
    sel.value = 'Viviane';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    expect(raiz.querySelector('#lgConvite')).not.toBeNull();
    raiz.querySelector('#lgConvite').value = 'V1';
    raiz.querySelector('#lgPw').value = 'senha123';
    raiz.querySelector('#lgPw2').value = 'senha999';
    raiz.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await espera();
    expect(raiz.querySelector('#lgErr').textContent).toBe('As duas senhas não são iguais.');
    expect(api.criarSenha).not.toHaveBeenCalled();
    raiz.querySelector('#lgPw2').value = 'senha123';
    raiz.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await espera();
    expect(api.criarSenha).toHaveBeenCalledWith('Viviane', 'V1', 'senha123');
  });
});
