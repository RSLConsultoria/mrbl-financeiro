// Gera o index.html do app com a mesma marcação do protótipo (reference/mock.html): cabeçalho, barra do topo e
// os "hosts" de modal, calendário e listas. Os scripts do protótipo não entram; as telas vêm de src/app/telas.js.
import fs from 'node:fs';
const html = fs.readFileSync('reference/mock.html', 'utf8');
const logo = (html.match(/<img src="(data:image\/png;base64,[^"]+)"/) || [])[1];
if (!logo) { console.error('Logo não encontrado em reference/mock.html'); process.exit(1); }
const ini = html.indexOf('<header class="top">');
const fim = html.indexOf('<div id="cbxHost"></div>');
if (ini < 0 || fim < 0) { console.error('Marcação do protótipo não encontrada'); process.exit(1); }
const corpo = html.slice(ini, fim + '<div id="cbxHost"></div>'.length).replace(/<script[\s\S]*?<\/script>/g, '');
fs.writeFileSync('index.html', `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>MRBL Financeiro</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
</head>
<body>
${corpo}
<div id="loginHost"></div>
<script type="module" src="/src/main.js"></script>
</body>
</html>
`);
console.log('index.html gerado (' + fs.statSync('index.html').size + ' bytes)');
