// Servidor local para testar as telas sem o Google: roda o código de apps-script/ sobre a planilha simulada
// dos testes. Uso: node tools/servidor-local.mjs [porta] [carga.json]
// Usuários de teste: Lucca (administrador) e Viviane, ambos com a senha "teste123".
import http from 'node:http';
import fs from 'node:fs';
import { carregarServidor, chamar } from '../test/gas/carregar.js';

const porta = Number(process.argv[2] || 8787);
const g = carregarServidor();
for (const n of ['Lucca', 'Viviane', 'Cris']) g.Db.inserir('Usuarios', { nome: n, convite: 'T-' + n, ativo: true });
for (const n of ['Lucca', 'Viviane']) chamar(g, 'auth.criarSenha', { nome: n, convite: 'T-' + n, senha: 'teste123' });
if (process.argv[3]) { g.CARGA = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')); g.rodarCarga(); }

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'GET') { res.end(g.doGet().getContent()); return; }
  let corpo = '';
  req.on('data', (c) => { corpo += c; });
  req.on('end', () => {
    const out = g.doPost({ postData: { contents: corpo } }).getContent();
    res.setHeader('Content-Type', 'application/json');
    setTimeout(() => res.end(out), 150); // o Apps Script real leva de 0,5 a 2 s
  });
}).listen(porta, () => console.log('servidor local em http://localhost:' + porta));
