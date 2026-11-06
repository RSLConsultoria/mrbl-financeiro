import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { ORDEM } from './carregar.js';

// O Apps Script executa os arquivos na ordem de envio. Main.js define acao_, que Escrita.js usa ao carregar.
describe('ordem de envio do clasp', () => {
  it('é a mesma ordem que os testes usam', () => {
    const clasp = JSON.parse(fs.readFileSync('.clasp.json', 'utf8'));
    expect(clasp.filePushOrder).toEqual(ORDEM.map((f) => 'apps-script/' + f));
  });
  it('todo arquivo de apps-script/ está na ordem', () => {
    const arquivos = fs.readdirSync('apps-script').filter((f) => f.endsWith('.js')).sort();
    expect(arquivos).toEqual([...ORDEM].sort());
  });
});
