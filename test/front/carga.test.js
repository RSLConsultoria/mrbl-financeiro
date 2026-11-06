import { describe, it, expect, vi } from 'vitest';
import { precisaCarga, montarCarga } from '../../src/app/carga.js';

const arquivo = (nome, conteudo) => new File([conteudo], nome);
async function escolher(host, arquivos) {
  const input = host.querySelector('#cgFile');
  Object.defineProperty(input, 'files', { value: arquivos, configurable: true });
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('carga inicial', () => {
  it('aparece só para administrador com a planilha vazia', () => {
    expect(precisaCarga({ admin: true, contas: [], saidas: [], entradas: [] })).toBe(true);
    expect(precisaCarga({ admin: false, contas: [], saidas: [], entradas: [] })).toBe(false);
    expect(precisaCarga({ admin: true, contas: [{ id: 'c1' }], saidas: [], entradas: [] })).toBe(false);
  });
  it('com só o complemento .json, mostra o resumo e envia', async () => {
    const host = document.createElement('div');
    const api = { chamar: vi.fn(async () => ({})) };
    const aoConcluir = vi.fn();
    montarCarga(host, { api, aoConcluir });
    await escolher(host, [arquivo('complemento.json', JSON.stringify({ previsoes: [{ id: 'p1' }], dreHistorico: [{ mes: '2026-01' }, { mes: '2026-02' }] }))]);
    await vi.waitFor(() => expect(host.textContent).toContain('2 linhas da DRE jan–jun'));
    host.querySelector('#cgOk').click();
    await vi.waitFor(() => expect(aoConcluir).toHaveBeenCalled());
    expect(api.chamar.mock.calls[0][1].carga.previsoes).toEqual([{ id: 'p1' }]);
  });
  it('planilha não reconhecida mostra erro', async () => {
    const host = document.createElement('div');
    const excel = async () => ({ Workbook: class { constructor() { this.xlsx = { load: async () => {} }; } eachSheet(fn) { fn({ name: 'Outra', eachRow() {} }); } } });
    montarCarga(host, { api: {}, aoConcluir() {}, excel });
    await escolher(host, [arquivo('x.xlsx', 'abc')]);
    await vi.waitFor(() => expect(host.textContent).toContain('não reconheci'));
    expect(host.querySelector('#cgOk')).toBeNull();
  });
});
