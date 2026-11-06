// Carrega os arquivos de apps-script/ num contexto isolado, como o Apps Script faz (escopo global compartilhado).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { criarFakes } from './fakes.js';

export const ORDEM = ['Schema.js', 'Db.js', 'Logs.js', 'Auth.js', 'Main.js', 'Escrita.js'];

export function carregarServidor(opts) {
  const fakes = criarFakes(opts);
  const ctx = vm.createContext({ ...fakes, console, JSON, Math, Object, Array, String, Number, Error });
  for (const f of ORDEM) {
    const arq = path.join(process.cwd(), 'apps-script', f);
    if (fs.existsSync(arq)) vm.runInContext(fs.readFileSync(arq, 'utf8'), ctx, { filename: f });
  }
  if (typeof ctx.setupPlanilha === 'function') ctx.setupPlanilha();
  return ctx;
}

// Chama o doPost como o navegador chamaria e devolve o JSON da resposta.
export function chamar(ctx, acao, dados, token) {
  const out = ctx.doPost({ postData: { contents: JSON.stringify({ acao, dados, token }) } });
  return JSON.parse(out.getContent());
}
