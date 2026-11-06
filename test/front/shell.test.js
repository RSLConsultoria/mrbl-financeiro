import { describe, it, expect, vi } from 'vitest';
import { montarShell, TELAS } from '../../src/ui/shell.js';

describe('casca do app', () => {
  it('mostra as 7 telas, o usuário e troca de tela', () => {
    const raiz = document.createElement('div');
    const aoSair = vi.fn();
    montarShell(raiz, { usuario: 'Cris', aoSair });
    expect([...raiz.querySelectorAll('[data-tela]')].map((b) => b.textContent)).toEqual(TELAS.map((t) => t[1]));
    expect(raiz.querySelector('#userBox').textContent).toContain('Cris');
    raiz.querySelector('[data-tela="dre"]').click();
    expect(raiz.querySelector('[data-tela="dre"]').getAttribute('aria-pressed')).toBe('true');
    expect(raiz.querySelector('#topTitle h1').textContent).toBe('DRE');
    raiz.querySelector('#btnSair').click();
    expect(aoSair).toHaveBeenCalled();
  });
});
