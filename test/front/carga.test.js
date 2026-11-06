import { describe, it, expect, vi } from 'vitest';
import { precisaCarga, montarCarga } from '../../src/app/carga.js';

describe('carga inicial', () => {
  it('aparece só para administrador com a planilha vazia', () => {
    expect(precisaCarga({ admin: true, contas: [], saidas: [], entradas: [] })).toBe(true);
    expect(precisaCarga({ admin: false, contas: [], saidas: [], entradas: [] })).toBe(false);
    expect(precisaCarga({ admin: true, contas: [{ id: 'c1' }], saidas: [], entradas: [] })).toBe(false);
  });
  it('lê o arquivo, mostra o resumo e envia', async () => {
    const host = document.createElement('div');
    const api = { chamar: vi.fn(async () => ({})) };
    const aoConcluir = vi.fn();
    montarCarga(host, { api, aoConcluir });
    const input = host.querySelector('#cgFile');
    const arq = new File([JSON.stringify({ contas: [{ id: 'c1' }, { id: 'c2' }], saidas: [{ id: 's1' }] })], 'carga-inicial.json');
    Object.defineProperty(input, 'files', { value: [arq] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await vi.waitFor(() => expect(host.textContent).toContain('2 contas'));
    host.querySelector('#cgOk').click();
    await vi.waitFor(() => expect(aoConcluir).toHaveBeenCalled());
    expect(api.chamar).toHaveBeenCalledWith('carga.importar', { carga: { contas: [{ id: 'c1' }, { id: 'c2' }], saidas: [{ id: 's1' }] } });
  });
});
