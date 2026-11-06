// Copia o <style> do protótipo (reference/mock.html) para o CSS do app, para as telas ficarem iguais.
import fs from 'node:fs';
const [, , origem, destino] = process.argv;
const html = fs.readFileSync(origem, 'utf8');
const blocos = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1].trim());
if (!blocos.length) { console.error('Nenhum <style> encontrado em ' + origem); process.exit(1); }
fs.writeFileSync(destino, '/* Gerado de ' + origem + ' por tools/extrair-css.mjs. Não edite à mão; ajustes vão em src/styles/extra.css. */\n' + blocos.join('\n') + '\n');
console.log('CSS: ' + blocos.length + ' bloco(s), ' + fs.statSync(destino).size + ' bytes → ' + destino);
