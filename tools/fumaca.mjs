// Teste de fumaça contra o Web App publicado: node tools/fumaca.mjs <URL do Web App>
const url = process.argv[2];
if (!url) { console.error('Uso: node tools/fumaca.mjs https://script.google.com/macros/s/.../exec'); process.exit(1); }
const post = (corpo) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corpo), redirect: 'follow' }).then((r) => r.json());

const get = await fetch(url, { redirect: 'follow' }).then((r) => r.json());
if (!get.ok || get.app !== 'mrbl-financeiro') throw new Error('doGet inesperado: ' + JSON.stringify(get));
console.log('doGet ok');

const us = await post({ acao: 'auth.usuarios' });
if (!us.ok || !Array.isArray(us.dados)) throw new Error('auth.usuarios inesperado: ' + JSON.stringify(us));
console.log('auth.usuarios ok: ' + us.dados.map((u) => u.nome + (u.temSenha ? '' : ' (sem senha)')).join(', '));

const neg = await post({ acao: 'dados.carregar', token: 'falso' });
if (neg.ok || neg.codigo !== 'sessao_expirada') throw new Error('Servidor aceitou token falso: ' + JSON.stringify(neg));
console.log('token falso recusado ok');
