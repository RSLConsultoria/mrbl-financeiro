# MRBL Financeiro

Contas a pagar, oficinas, previsões e DRE da MRBL. Dados no Google Sheets "Financeiro MRBL", servidor em Google Apps Script, telas estáticas publicadas pelo GitHub.

## Rodar localmente

```bash
npm ci
npm test                       # testes do servidor (simulador do Apps Script) e das telas
VITE_API_URL=<url do Web App> npm run dev

# sem o Google: servidor local com a planilha simulada (Lucca e Viviane, senha teste123)
node tools/servidor-local.mjs 8787 [carga.json]
VITE_API_URL=http://localhost:8787 npm run dev
```

## Estrutura

| Pasta | O que tem |
|---|---|
| `apps-script/` | servidor: esquema da planilha, leitura/escrita, login, ações. Enviado com `clasp`. |
| `src/` | telas (Vite, JavaScript puro). `src/app/telas.js` é o protótipo v57 ligado à planilha; `src/app/sync.js` grava só o que mudou. |
| `test/gas/` | simulador em memória do Apps Script e testes do servidor. |
| `test/front/` | testes das telas (jsdom). |
| `tools/` | geração do CSS e do index a partir do protótipo, teste de fumaça. |
| `reference/mock.html` | protótipo aprovado (versão 57). É a referência visual e de regras. |
| `docs/superpowers/plans/` | planos de cada fase. |

## Publicação

Todo push na `main` roda os testes, envia o Apps Script (mesma URL do Web App) e publica as telas. Configuração única: plano 01, tarefa 7.
