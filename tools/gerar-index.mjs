// Gera o index.html do app com o logo da MRBL tirado do protótipo (reference/mock.html).
import fs from 'node:fs';
const html = fs.readFileSync('reference/mock.html', 'utf8');
const logo = (html.match(/<img src="(data:image\/png;base64,[^"]+)"/) || [])[1];
if (!logo) { console.error('Logo não encontrado em reference/mock.html'); process.exit(1); }
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
<img id="logoMrbl" src="${logo}" alt="" hidden>
<div id="raiz"></div>
<div id="loginHost"></div>
<script type="module" src="/src/main.js"></script>
</body>
</html>
`);
console.log('index.html gerado (' + fs.statSync('index.html').size + ' bytes)');
