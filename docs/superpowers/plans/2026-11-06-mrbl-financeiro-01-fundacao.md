# MRBL Financeiro · Plano 01 — Fundação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sistema publicado em que Lucca, Viviane e Cris entram com senha própria, com servidor em Apps Script gravando na planilha "Financeiro MRBL", logs de tudo e deploy automático a partir do GitHub. As telas de negócio chegam nos planos 03–06; aqui elas aparecem como "Em construção".

**Architecture:** front estático (Vite, JavaScript puro, CSS do protótipo) chama por `POST text/plain` um Web App do Google Apps Script vinculado à planilha. O servidor tem um roteador de ações, login próprio com hash de senha e convite, uma camada `Db` que lê e grava as abas como objetos e guarda um diário para o Desfazer, e a aba `Logs` sempre por último. Os testes do servidor rodam em Node, com um simulador em memória dos serviços do Apps Script.

**Tech Stack:** Node 20, Vite 5.4.10, Vitest 2.1.4, jsdom 24.1.0, @google/clasp 2.4.2, Google Apps Script (V8), GitHub Actions, GitHub Pages.

Visão geral, esquema completo e fases: `docs/superpowers/plans/2026-11-06-mrbl-financeiro-00-visao-geral.md`.

## Global Constraints

- Planilha de dados: `1fm5bpU5LTHD5VB2_tCFLZi_eU-rS-6Eu2usUapEOL14` ("Financeiro MRBL"). O SharePoint da DRE antiga não é lido nem escrito.
- Textos de interface em português do Brasil, frases curtas, sem jargão técnico.
- Identidade: azul `#102574`, amarelo `#D3A512`, tema claro. O CSS vem do protótipo (`reference/mock.html`) via `npm run css`, nunca reescrito à mão; ajustes vão em `src/styles/extra.css`.
- Datas gravadas como texto `aaaa-mm-dd`; hora dos logs `aaaa-mm-ddTHH:mm` no fuso `America/Sao_Paulo`.
- Logs é sempre a última aba da planilha.
- Toda escrita passa por `mutar_` (trava, diário para Desfazer, linha em Logs com o usuário da sessão).
- Senha nunca é gravada; só `hash` com `salt` e o `PEPPER` das Propriedades do Script. Primeiro acesso exige código de convite. Mínimo de 6 caracteres.
- Nenhum segredo no repositório: `PEPPER` fica no Apps Script, `CLASPRC_JSON` nos segredos do GitHub, URL do Web App em variável do GitHub.
- Nada é lançado na DRE automaticamente (regra que vale para os planos seguintes; nenhuma ação deste plano cria despesa ou entrada).

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `package.json`, `vite.config.js` | dependências, scripts, configuração do Vite e do Vitest |
| `.clasp.json`, `apps-script/appsscript.json` | projeto do Apps Script, ordem de envio dos arquivos, Web App |
| `apps-script/Schema.js` | abas, colunas, chaves, `setupPlanilha()` |
| `apps-script/Db.js` | ler/gravar abas como objetos, diário e reversão |
| `apps-script/Logs.js` | hora local, registrar log, listar logs paginados |
| `apps-script/Auth.js` | hash de senha, convite, bloqueio, sessões |
| `apps-script/Main.js` | `doGet`, `doPost`, roteador, ações de login e `dados.carregar` |
| `apps-script/Escrita.js` | `mutar_`, `config.definir`, `acao.desfazer`, `logs.listar` |
| `test/gas/fakes.js`, `test/gas/carregar.js` | simulador do Apps Script e carregador dos arquivos do servidor |
| `src/api/client.js` | chamadas ao Web App, sessão no navegador |
| `src/ui/util.js`, `src/ui/login.js`, `src/ui/shell.js`, `src/main.js` | tela de login, casca com menu e usuário, inicialização |
| `tools/extrair-css.mjs`, `tools/gerar-index.mjs` | CSS e index gerados a partir do protótipo |
| `tools/fumaca.mjs` | teste de fumaça contra o Web App publicado |
| `.github/workflows/testes.yml`, `.github/workflows/publicar.yml` | CI e publicação |

---

### Task 1: Ferramentas, simulador do Apps Script, esquema e camada Db

**Files:**
- Create: `package.json`, `vite.config.js`, `.gitignore`, `.clasp.json`, `apps-script/appsscript.json`
- Create: `reference/mock.html` (cópia do artefato "MRBL A Pagar", versão 57)
- Create: `test/gas/fakes.js`, `test/gas/carregar.js`
- Create: `apps-script/Schema.js`, `apps-script/Db.js`
- Test: `test/gas/schema.test.js`, `test/gas/db.test.js`

**Interfaces:**
- Produces: `SCHEMA` (objeto aba → colunas), `CHAVES`, `chaveDe_(aba)`, `setupPlanilha()`; `Db.todos(aba) → objeto[]`, `Db.pegar(aba, id) → objeto|null`, `Db.inserir(aba, obj)`, `Db.atualizar(aba, id, patch) → objeto`, `Db.remover(aba, id) → objeto|null`, `Db.iniciarDiario()`, `Db.fecharDiario() → {aba,id,antes,depois}[]`, `Db.reverter(diario)`.
- Produces (testes): `carregarServidor({ agora? }) → contexto` com os globais do servidor e `ss` (planilha falsa); `chamar(ctx, acao, dados, token) → resposta JSON`.

- [ ] **Step 1: Criar o repositório e as ferramentas**

```bash
mkdir mrbl-financeiro && cd mrbl-financeiro && git init -b main
mkdir -p apps-script src/api src/ui src/styles test/gas test/front tools reference .github/workflows docs/superpowers/plans
```

`package.json`:

```json
{
  "name": "mrbl-financeiro",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "css": "node tools/extrair-css.mjs reference/mock.html src/styles/app.css",
    "gas:push": "clasp push --force",
    "index": "node tools/gerar-index.mjs"
  },
  "devDependencies": {
    "@google/clasp": "2.4.2",
    "jsdom": "24.1.0",
    "vite": "5.4.10",
    "vitest": "2.1.4"
  }
}
```

`vite.config.js`:

```js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  test: { environment: 'jsdom', include: ['test/**/*.test.js'] },
});
```

`.gitignore`:

```text
node_modules/
dist/
.env*
.clasprc.json
```

`.clasp.json` (o `scriptId` real entra na Task 7):

```json
{
  "scriptId": "COLE_AQUI_O_ID_DO_SCRIPT",
  "rootDir": "apps-script",
  "filePushOrder": [
    "apps-script/Schema.js",
    "apps-script/Db.js",
    "apps-script/Logs.js",
    "apps-script/Auth.js",
    "apps-script/Main.js",
    "apps-script/Escrita.js"
  ]
}
```

`apps-script/appsscript.json`:

```json
{
  "timeZone": "America/Sao_Paulo",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

Copie o protótipo aprovado para `reference/mock.html` (arquivo do artefato "MRBL A Pagar", versão 57; já está na pasta do projeto entregue junto com este plano). Depois:

```bash
npm install
```

Expected: `node_modules/.bin` contém `vite`, `vitest` e `clasp`.

- [ ] **Step 2: Escrever o simulador do Apps Script**

`test/gas/fakes.js`:

```js
// Imitação em memória dos serviços do Google Apps Script usados pelo servidor.
import crypto from 'node:crypto';

class FakeRange {
  constructor(sheet, r, c, nr, nc) { Object.assign(this, { sheet, r, c, nr, nc }); }
  getValues() {
    const out = [];
    for (let i = 0; i < this.nr; i++) {
      const row = this.sheet.rows[this.r - 1 + i] || [];
      out.push(Array.from({ length: this.nc }, (_, j) => (row[this.c - 1 + j] ?? '')));
    }
    return out;
  }
  setValues(v) {
    v.forEach((row, i) => {
      const at = this.r - 1 + i;
      this.sheet.rows[at] = this.sheet.rows[at] || [];
      row.forEach((x, j) => { this.sheet.rows[at][this.c - 1 + j] = x; });
    });
    return this;
  }
  setNumberFormat(f) { this.sheet.formats.push([this.r, this.c, this.nr, this.nc, f]); return this; }
  setFontWeight() { return this; }
}

class FakeSheet {
  constructor(name) { this.name = name; this.rows = []; this.formats = []; this.frozen = 0; }
  getName() { return this.name; }
  getLastRow() { return this.rows.length; }
  getLastColumn() { return Math.max(0, ...this.rows.map((r) => r.length)); }
  getRange(r, c, nr = 1, nc = 1) { return new FakeRange(this, r, c, nr, nc); }
  appendRow(row) { this.rows.push(row.slice()); return this; }
  deleteRow(r) { this.rows.splice(r - 1, 1); return this; }
  setFrozenRows(n) { this.frozen = n; return this; }
  getMaxRows() { return Math.max(1000, this.rows.length); }
}

class FakeSpreadsheet {
  constructor() { this.sheets = [new FakeSheet('Página1')]; this.active = null; }
  getSheetByName(n) { return this.sheets.find((s) => s.name === n) || null; }
  getSheets() { return this.sheets.slice(); }
  insertSheet(n) { const s = new FakeSheet(n); this.sheets.push(s); return s; }
  setActiveSheet(s) { this.active = s; return s; }
  moveActiveSheet(pos) { const i = this.sheets.indexOf(this.active); this.sheets.splice(i, 1); this.sheets.splice(pos - 1, 0, this.active); }
}

export function criarFakes({ agora = () => Date.now() } = {}) {
  const ss = new FakeSpreadsheet();
  const cache = new Map();
  const props = new Map([['PEPPER', 'pepper-de-teste']]);
  return {
    ss,
    cache,
    Date: class extends Date { constructor(...a) { super(...(a.length ? a : [agora()])); } static now() { return agora(); } },
    SpreadsheetApp: { getActive: () => ss },
    CacheService: { getScriptCache: () => ({
      get: (k) => (cache.has(k) ? cache.get(k) : null),
      put: (k, v) => { cache.set(k, String(v)); },
      remove: (k) => { cache.delete(k); },
    }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (props.has(k) ? props.get(k) : null) }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (alg, txt) => Array.from(crypto.createHash(alg).update(txt, 'utf8').digest()).map((b) => (b > 127 ? b - 256 : b)),
      getUuid: () => crypto.randomUUID(),
      formatDate: (d, tz, fmt) => {
        const p = new Intl.DateTimeFormat('sv-SE', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
        return fmt === "yyyy-MM-dd'T'HH:mm" ? p.replace(' ', 'T') : p.slice(0, 10);
      },
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (txt) => ({ txt, setMimeType() { return this; }, getContent() { return this.txt; } }),
    },
  };
}
```

`test/gas/carregar.js`:

```js
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
```

- [ ] **Step 3: Escrever os testes que falham**

`test/gas/schema.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { carregarServidor } from './carregar.js';

describe('setupPlanilha', () => {
  it('cria todas as abas com cabeçalho e deixa Logs por último', () => {
    const g = carregarServidor();
    const nomes = g.ss.getSheets().map((s) => s.getName());
    expect(nomes.at(-1)).toBe('Logs');
    for (const aba of Object.keys(g.SCHEMA)) {
      const sh = g.ss.getSheetByName(aba);
      expect(sh.rows[0]).toEqual(g.SCHEMA[aba]);
      expect(sh.frozen).toBe(1);
    }
  });
  it('pode rodar de novo sem duplicar nada', () => {
    const g = carregarServidor();
    g.setupPlanilha();
    expect(g.ss.getSheetByName('Contas').rows.length).toBe(1);
    expect(g.Db.todos('Config')).toEqual([{ chave: 'prazoOficinas', valor: 15 }]);
  });
  it('recusa aba com cabeçalho diferente', () => {
    const g = carregarServidor();
    g.ss.getSheetByName('Clientes').rows[0] = ['outra coisa'];
    expect(() => g.setupPlanilha()).toThrow(/Cabeçalho diferente na aba Clientes/);
  });
});
```

`test/gas/db.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { carregarServidor } from './carregar.js';

describe('Db', () => {
  it('insere, lê, atualiza e remove pela chave', () => {
    const { Db } = carregarServidor();
    Db.inserir('Fornecedores', { id: 'f1', nome: 'ENERGISA', cat: 'UTILIDADES', sub: '' });
    expect(Db.pegar('Fornecedores', 'f1')).toEqual({ id: 'f1', nome: 'ENERGISA', cat: 'UTILIDADES', sub: null });
    Db.atualizar('Fornecedores', 'f1', { sub: 'ENERGIA ELETRICA' });
    expect(Db.todos('Fornecedores')[0].sub).toBe('ENERGIA ELETRICA');
    Db.remover('Fornecedores', 'f1');
    expect(Db.todos('Fornecedores')).toEqual([]);
  });
  it('reverte o diário na ordem inversa', () => {
    const { Db } = carregarServidor();
    Db.inserir('Fornecedores', { id: 'f1', nome: 'A', cat: 'X', sub: '' });
    Db.iniciarDiario();
    Db.atualizar('Fornecedores', 'f1', { nome: 'B' });
    Db.inserir('Fornecedores', { id: 'f2', nome: 'C', cat: 'X', sub: '' });
    Db.remover('Fornecedores', 'f1');
    Db.reverter(Db.fecharDiario());
    expect(Db.todos('Fornecedores').map((f) => f.id + f.nome)).toEqual(['f1A']);
  });
  it('erro claro quando o registro não existe', () => {
    const { Db } = carregarServidor();
    expect(() => Db.atualizar('Contas', 'nao-existe', {})).toThrow('Registro não encontrado: Contas nao-existe');
  });
});
```

- [ ] **Step 4: Rodar e ver falhar**

Run: `npx vitest run test/gas/schema.test.js test/gas/db.test.js`
Expected: FAIL (`g.SCHEMA` indefinido / `Db` indefinido), porque `apps-script/` ainda está vazio.

- [ ] **Step 5: Implementar o esquema e a camada Db**

`apps-script/Schema.js`:

```js
// Abas da planilha "Financeiro MRBL" e suas colunas. A ordem aqui é a ordem das abas; Logs fica sempre por último.
var SCHEMA = {
  Usuarios: ['nome', 'convite', 'salt', 'hash', 'ativo', 'criadoEm'],
  Sessoes: ['token', 'usuario', 'expira'],
  Contas: ['id', 'data', 'orig', 'forn', 'cat', 'sub', 'valor', 'estim', 'pago', 'pagoEm', 'dreId', 'dreSkip', 'entrega', 'recebidoEm', 'payManual', 'criadoEm', 'criadoPor'],
  ContasHist: ['id', 'contaId', 'em', 'por', 'tipo', 'de', 'para', 'txt'],
  Despesas: ['id', 'data', 'cat', 'sub', 'emp', 'valor', 'forn', 'resp', 'obs', 'contaId', 'criadoEm'],
  Entradas: ['id', 'data', 'cat', 'cli', 'nf', 'valor', 'resp', 'obs', 'criadoEm'],
  DreHistorico: ['mes', 'tipo', 'cat', 'sub', 'valor'],
  Previsoes: ['id', 'mes', 'nome', 'cat', 'subs', 'valor'],
  PrevRevisao: ['mes', 'chave', 'decisao', 'em', 'por'],
  Fornecedores: ['id', 'nome', 'cat', 'sub'],
  Listas: ['tipo', 'cat', 'sub'],
  Clientes: ['nome'],
  Config: ['chave', 'valor'],
  Logs: ['em', 'por', 'tela', 'txt']
};

// Coluna-chave de cada aba (null = aba sem chave, só leitura em bloco).
var CHAVES = { Usuarios: 'nome', Sessoes: 'token', Clientes: 'nome', Config: 'chave', DreHistorico: null, PrevRevisao: null, Listas: null, Logs: null };
function chaveDe_(aba) { return Object.prototype.hasOwnProperty.call(CHAVES, aba) ? CHAVES[aba] : 'id'; }

// Colunas guardadas como texto (datas aaaa-mm-dd e ids), para a planilha não converter.
var COLUNAS_TEXTO = ['id', 'data', 'orig', 'pagoEm', 'dreId', 'entrega', 'recebidoEm', 'criadoEm', 'contaId', 'em', 'mes', 'token', 'nf', 'de', 'para'];

// Cria as abas que faltam com o cabeçalho, sem apagar nada. Rode uma vez pelo editor do Apps Script.
function setupPlanilha() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(SCHEMA).forEach(function (aba) {
    var cols = SCHEMA[aba];
    var sh = ss.getSheetByName(aba) || ss.insertSheet(aba);
    if (sh.getLastRow() === 0) sh.appendRow(cols);
    var atual = sh.getRange(1, 1, 1, cols.length).getValues()[0];
    if (atual.join('|') !== cols.join('|')) throw new Error('Cabeçalho diferente na aba ' + aba + ': ' + atual.join(', '));
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    cols.forEach(function (c, i) { if (COLUNAS_TEXTO.indexOf(c) >= 0) sh.getRange(1, i + 1, sh.getMaxRows(), 1).setNumberFormat('@'); });
  });
  var logs = ss.getSheetByName('Logs');
  ss.setActiveSheet(logs);
  ss.moveActiveSheet(ss.getSheets().length);
  if (!Db.pegar('Config', 'prazoOficinas')) Db.inserir('Config', { chave: 'prazoOficinas', valor: 15 });
}
```

`apps-script/Db.js`:

```js
// Leitura e escrita das abas como listas de objetos. Guarda um diário das mudanças para o "Desfazer".
var Db = (function () {
  var diario = null;
  function aba_(nome) {
    var sh = SpreadsheetApp.getActive().getSheetByName(nome);
    if (!sh) throw new Error('Aba não existe: ' + nome + '. Rode setupPlanilha().');
    return sh;
  }
  // Célula vazia vira null; data que a planilha converteu por conta própria volta a ser texto aaaa-mm-dd.
  function deCelula_(v) {
    if (v === '') return null;
    if (Object.prototype.toString.call(v) === '[object Date]') return Utilities.formatDate(v, 'America/Sao_Paulo', 'yyyy-MM-dd');
    return v;
  }
  function paraCelula_(v) { return v === null || v === undefined ? '' : v; }
  function obj_(cols, linha) { var o = {}; cols.forEach(function (c, i) { o[c] = deCelula_(linha[i]); }); return o; }
  function linha_(cols, o) { return cols.map(function (c) { return paraCelula_(o[c]); }); }

  function todos(nome) {
    var sh = aba_(nome), n = sh.getLastRow(), cols = SCHEMA[nome];
    if (n < 2) return [];
    return sh.getRange(2, 1, n - 1, cols.length).getValues().map(function (r) { return obj_(cols, r); });
  }
  function linhaDe_(nome, id) {
    var k = chaveDe_(nome);
    if (!k) throw new Error('A aba ' + nome + ' não tem chave.');
    var sh = aba_(nome), n = sh.getLastRow();
    if (n < 2) return -1;
    var col = SCHEMA[nome].indexOf(k) + 1;
    var vals = sh.getRange(2, col, n - 1, 1).getValues();
    for (var i = 0; i < vals.length; i++) if (String(vals[i][0]) === String(id)) return i + 2;
    return -1;
  }
  function pegar(nome, id) {
    var r = linhaDe_(nome, id);
    if (r < 0) return null;
    var cols = SCHEMA[nome];
    return obj_(cols, aba_(nome).getRange(r, 1, 1, cols.length).getValues()[0]);
  }
  function inserir(nome, o) {
    aba_(nome).appendRow(linha_(SCHEMA[nome], o));
    var k = chaveDe_(nome);
    if (diario && k) diario.push({ aba: nome, id: o[k], antes: null, depois: o });
    return o;
  }
  function atualizar(nome, id, patch) {
    var r = linhaDe_(nome, id);
    if (r < 0) throw new Error('Registro não encontrado: ' + nome + ' ' + id);
    var cols = SCHEMA[nome], rg = aba_(nome).getRange(r, 1, 1, cols.length);
    var antes = obj_(cols, rg.getValues()[0]);
    var depois = Object.assign({}, antes, patch);
    rg.setValues([linha_(cols, depois)]);
    if (diario) diario.push({ aba: nome, id: id, antes: antes, depois: depois });
    return depois;
  }
  function remover(nome, id) {
    var r = linhaDe_(nome, id);
    if (r < 0) return null;
    var antes = pegar(nome, id);
    aba_(nome).deleteRow(r);
    if (diario) diario.push({ aba: nome, id: id, antes: antes, depois: null });
    return antes;
  }
  function iniciarDiario() { diario = []; }
  function fecharDiario() { var d = diario || []; diario = null; return d; }
  // Desfaz um diário na ordem inversa.
  function reverter(d) {
    for (var i = d.length - 1; i >= 0; i--) {
      var e = d[i];
      if (e.antes === null) remover(e.aba, e.id);
      else if (e.depois === null) inserir(e.aba, e.antes);
      else atualizar(e.aba, e.id, e.antes);
    }
  }
  return { todos: todos, pegar: pegar, inserir: inserir, atualizar: atualizar, remover: remover, iniciarDiario: iniciarDiario, fecharDiario: fecharDiario, reverter: reverter };
})();
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npx vitest run test/gas/schema.test.js test/gas/db.test.js`
Expected: PASS, 6 testes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: esquema da planilha, camada Db e simulador do Apps Script"
```

---

### Task 2: Login no servidor

**Files:**
- Create: `apps-script/Logs.js`, `apps-script/Auth.js`, `apps-script/Main.js`
- Test: `test/gas/auth.test.js`

**Interfaces:**
- Consumes: `Db.*`, `SCHEMA` (Task 1).
- Produces: `agora_() → 'aaaa-mm-ddTHH:mm'`, `hoje_() → 'aaaa-mm-dd'`; `Logs.registrar(por, tela, txt)`, `Logs.listar({ pagina, usuario, busca }) → { itens, total, pagina, paginas }`; `Auth.hash(salt, senha)`, `Auth.usuarios() → { nome, temSenha }[]`, `Auth.entrar({ nome, senha }) → { token, usuario, expira }`, `Auth.criarSenha({ nome, convite, senha }) → { token, usuario, expira }`, `Auth.sessao(token) → { token, usuario }|null`, `Auth.sair(token)`, `Auth.erro(codigo, msg) → Error`; `acao_(nome, fn(dados, sessao), publica)`, `doGet()`, `doPost(e)`.
- Ações expostas: `auth.usuarios`, `auth.entrar`, `auth.criarSenha` (públicas); `auth.sair`, `dados.carregar` (com sessão).
- Resposta de `doPost`: `{ ok: true, dados }` ou `{ ok: false, codigo, erro }`. Códigos: `login`, `bloqueado`, `convite`, `senha_curta`, `ja_tem_senha`, `sessao_expirada`, `acao_desconhecida`, `config`, `erro`.

- [ ] **Step 1: Escrever o teste que falha**

`test/gas/auth.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { carregarServidor, chamar } from './carregar.js';

function comUsuario(opts) {
  const g = carregarServidor(opts);
  g.Db.inserir('Usuarios', { nome: 'Lucca', convite: 'ABC123', ativo: true, criadoEm: '2026-11-06' });
  return g;
}

describe('login', () => {
  it('lista usuários sem expor hash nem convite', () => {
    const g = comUsuario();
    expect(chamar(g, 'auth.usuarios')).toEqual({ ok: true, dados: [{ nome: 'Lucca', temSenha: false }] });
  });
  it('primeiro acesso exige o convite certo e senha de 6+', () => {
    const g = comUsuario();
    expect(chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'errado', senha: 'segredo1' }).codigo).toBe('convite');
    expect(chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: '123' }).codigo).toBe('senha_curta');
    const r = chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: 'segredo1' });
    expect(r.ok).toBe(true);
    expect(r.dados.token).toHaveLength(64);
    const u = g.Db.pegar('Usuarios', 'Lucca');
    expect(u.convite).toBeNull();
    expect(u.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(u.hash).not.toContain('segredo1');
  });
  it('entra com a senha certa e recusa a errada', () => {
    const g = comUsuario();
    chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: 'segredo1' });
    expect(chamar(g, 'auth.entrar', { nome: 'Lucca', senha: 'errada' })).toMatchObject({ ok: false, codigo: 'login' });
    const r = chamar(g, 'auth.entrar', { nome: 'Lucca', senha: 'segredo1' });
    expect(r.ok).toBe(true);
    expect(chamar(g, 'dados.carregar', {}, r.dados.token).dados.usuario).toBe('Lucca');
  });
  it('bloqueia depois de 5 erros seguidos', () => {
    const g = comUsuario();
    chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: 'segredo1' });
    for (let i = 0; i < 5; i++) chamar(g, 'auth.entrar', { nome: 'Lucca', senha: 'x' });
    expect(chamar(g, 'auth.entrar', { nome: 'Lucca', senha: 'segredo1' }).codigo).toBe('bloqueado');
  });
  it('sessão expira em 12 horas e Sair encerra na hora', () => {
    let t = Date.parse('2026-11-06T12:00:00Z');
    const g = comUsuario({ agora: () => t });
    const { token } = chamar(g, 'auth.criarSenha', { nome: 'Lucca', convite: 'ABC123', senha: 'segredo1' }).dados;
    expect(chamar(g, 'dados.carregar', {}, token).ok).toBe(true);
    t += 13 * 3600 * 1000;
    expect(chamar(g, 'dados.carregar', {}, token).codigo).toBe('sessao_expirada');
    t = Date.parse('2026-11-06T12:00:00Z');
    chamar(g, 'auth.sair', {}, token);
    expect(chamar(g, 'dados.carregar', {}, token).codigo).toBe('sessao_expirada');
  });
  it('ação sem sessão é recusada', () => {
    const g = comUsuario();
    expect(chamar(g, 'dados.carregar', {}, 'token-falso')).toMatchObject({ ok: false, codigo: 'sessao_expirada' });
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run test/gas/auth.test.js`
Expected: FAIL com `ctx.doPost is not a function`.

- [ ] **Step 3: Implementar logs, login e roteador**

`apps-script/Logs.js`:

```js
// Aba Logs: quem fez o quê, quando e em que tela.
var TZ = 'America/Sao_Paulo';
function agora_() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm"); }
function hoje_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }

var Logs = {
  registrar: function (por, tela, txt) {
    SpreadsheetApp.getActive().getSheetByName('Logs').appendRow([agora_(), por, tela, txt]);
  },
  // Mais recentes primeiro, 15 por página, com filtro por usuário e busca no texto.
  listar: function (d) {
    var porPagina = 15;
    var busca = String(d.busca || '').trim().toUpperCase();
    var lista = Db.todos('Logs').reverse().filter(function (x) {
      return (!d.usuario || x.por === d.usuario) && (!busca || String(x.txt).toUpperCase().indexOf(busca) >= 0);
    });
    var paginas = Math.max(1, Math.ceil(lista.length / porPagina));
    var pagina = Math.min(Math.max(0, Number(d.pagina) || 0), paginas - 1);
    return { itens: lista.slice(pagina * porPagina, pagina * porPagina + porPagina), total: lista.length, pagina: pagina, paginas: paginas };
  }
};
```

`apps-script/Auth.js`:

```js
// Login próprio: senha com hash (salt + PEPPER das Propriedades do Script), convite no primeiro acesso,
// bloqueio após 5 erros seguidos e sessão de 12 horas.
var Auth = (function () {
  var HORAS = 12, MAX_ERROS = 5, BLOQUEIO_SEG = 15 * 60;
  function erro(codigo, msg) { var e = new Error(msg); e.codigo = codigo; return e; }
  function hex_(bytes) { return bytes.map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, '0'); }).join(''); }
  function pepper_() {
    var p = PropertiesService.getScriptProperties().getProperty('PEPPER');
    if (!p) throw erro('config', 'Falta a propriedade PEPPER no Apps Script.');
    return p;
  }
  function hash(salt, senha) {
    var h = salt + ':' + senha + ':' + pepper_();
    for (var i = 0; i < 300; i++) h = hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h, Utilities.Charset.UTF_8));
    return h;
  }
  function ativo_(u) { return u && u.ativo !== false && String(u.ativo).toUpperCase() !== 'FALSE'; }
  function usuarios() {
    return Db.todos('Usuarios').filter(ativo_).map(function (u) { return { nome: u.nome, temSenha: !!u.hash }; });
  }
  function novaSessao_(nome) {
    var token = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
    var expira = Date.now() + HORAS * 3600 * 1000;
    Db.inserir('Sessoes', { token: token, usuario: nome, expira: expira });
    CacheService.getScriptCache().put('s:' + token, JSON.stringify({ usuario: nome, expira: expira }), 21600);
    return { token: token, usuario: nome, expira: expira };
  }
  function contarErro_(nome) {
    var c = CacheService.getScriptCache(), k = 'erros:' + nome, n = Number(c.get(k) || 0) + 1;
    c.put(k, String(n), BLOQUEIO_SEG);
    return n;
  }
  function entrar(d) {
    var nome = String(d.nome || ''), u = Db.pegar('Usuarios', nome);
    if (Number(CacheService.getScriptCache().get('erros:' + nome) || 0) >= MAX_ERROS) throw erro('bloqueado', 'Muitas tentativas erradas. Tente de novo em 15 minutos.');
    if (!ativo_(u) || !u.hash || hash(u.salt, String(d.senha || '')) !== u.hash) {
      contarErro_(nome);
      throw erro('login', 'Usuário ou senha incorretos.');
    }
    CacheService.getScriptCache().remove('erros:' + nome);
    Logs.registrar(nome, 'login', 'Entrou no sistema');
    return novaSessao_(nome);
  }
  function criarSenha(d) {
    var nome = String(d.nome || ''), u = Db.pegar('Usuarios', nome);
    if (!ativo_(u)) throw erro('login', 'Usuário não encontrado.');
    if (u.hash) throw erro('ja_tem_senha', 'Esse usuário já tem senha. Use Entrar.');
    if (!u.convite || String(d.convite || '').trim() !== String(u.convite)) {
      contarErro_(nome);
      throw erro('convite', 'Código de convite incorreto. Peça um novo ao administrador.');
    }
    if (String(d.senha || '').length < 6) throw erro('senha_curta', 'A senha precisa ter pelo menos 6 caracteres.');
    var salt = Utilities.getUuid();
    Db.atualizar('Usuarios', nome, { salt: salt, hash: hash(salt, String(d.senha)), convite: null });
    Logs.registrar(nome, 'login', 'Criou a senha no primeiro acesso');
    return novaSessao_(nome);
  }
  function sessao(token) {
    if (!token) return null;
    var c = CacheService.getScriptCache().get('s:' + token);
    var s = c ? JSON.parse(c) : Db.pegar('Sessoes', token);
    if (!s || Number(s.expira) < Date.now()) return null;
    return { token: token, usuario: s.usuario };
  }
  function sair(token) {
    var s = sessao(token);
    CacheService.getScriptCache().remove('s:' + token);
    Db.remover('Sessoes', token);
    if (s) Logs.registrar(s.usuario, 'login', 'Saiu do sistema');
  }
  return { hash: hash, usuarios: usuarios, entrar: entrar, criarSenha: criarSenha, sessao: sessao, sair: sair, erro: erro };
})();
```

`apps-script/Main.js`:

```js
// Porta de entrada do Web App. O navegador manda POST text/plain com { acao, token, dados }.
var ACOES = {};
function acao_(nome, fn, publica) { ACOES[nome] = { fn: fn, publica: !!publica }; }

function doGet() { return json_({ ok: true, app: 'mrbl-financeiro' }); }

function doPost(e) {
  var res;
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var a = ACOES[req.acao];
    if (!a) throw Auth.erro('acao_desconhecida', 'Ação desconhecida: ' + req.acao);
    var sess = null;
    if (!a.publica) {
      sess = Auth.sessao(req.token);
      if (!sess) throw Auth.erro('sessao_expirada', 'Sua sessão expirou. Entre de novo.');
    }
    res = { ok: true, dados: a.fn(req.dados || {}, sess) };
  } catch (err) {
    res = { ok: false, codigo: err.codigo || 'erro', erro: err.codigo ? err.message : 'Erro no servidor: ' + err.message };
  }
  return json_(res);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ---- ações públicas (sem sessão) ----
acao_('auth.usuarios', function () { return Auth.usuarios(); }, true);
acao_('auth.entrar', function (d) { return Auth.entrar(d); }, true);
acao_('auth.criarSenha', function (d) { return Auth.criarSenha(d); }, true);

// ---- ações com sessão ----
acao_('auth.sair', function (d, s) { Auth.sair(s.token); return true; });

acao_('dados.carregar', function (d, s) {
  return {
    usuario: s.usuario,
    hoje: hoje_(),
    contas: Db.todos('Contas'),
    contasHist: Db.todos('ContasHist'),
    despesas: Db.todos('Despesas'),
    entradas: Db.todos('Entradas'),
    dreHistorico: Db.todos('DreHistorico'),
    previsoes: Db.todos('Previsoes'),
    prevRevisao: Db.todos('PrevRevisao'),
    fornecedores: Db.todos('Fornecedores'),
    listas: Db.todos('Listas'),
    clientes: Db.todos('Clientes'),
    config: Db.todos('Config'),
    usuarios: Auth.usuarios()
  };
});
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run test/gas`
Expected: PASS, 12 testes (6 do login + 6 da Task 1).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: login no servidor com convite, bloqueio e sessão de 12h"
```

---

### Task 3: Escrita com trava, Desfazer e logs paginados

**Files:**
- Create: `apps-script/Escrita.js`
- Test: `test/gas/main.test.js`, `test/gas/ordem.test.js`

**Interfaces:**
- Consumes: `acao_`, `Auth.*`, `Db.*`, `Logs.*` (Tasks 1–2).
- Produces: `mutar_(sessao, tela, fn) → { ...resultado, msg, desfazer: id|null }` — todo plano seguinte cria ações de escrita assim:
  ```js
  acao_('contas.pagar', function (d, s) {
    return mutar_(s, 'pagar', function () { /* Db.atualizar(...) */ return { msg: 'texto do log' }; });
  });
  ```
- Ações: `config.definir({ chave, valor })`, `acao.desfazer({ id })` (10 min, só quem fez), `logs.listar({ pagina, usuario, busca })` (15 por página).

- [ ] **Step 1: Escrever os testes que falham**

`test/gas/main.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { carregarServidor, chamar } from './carregar.js';

function logado() {
  const g = carregarServidor();
  g.Db.inserir('Usuarios', { nome: 'Viviane', convite: 'V1', ativo: true });
  g.Db.inserir('Usuarios', { nome: 'Cris', convite: 'C1', ativo: true });
  const viv = chamar(g, 'auth.criarSenha', { nome: 'Viviane', convite: 'V1', senha: 'senha123' }).dados.token;
  const cris = chamar(g, 'auth.criarSenha', { nome: 'Cris', convite: 'C1', senha: 'senha123' }).dados.token;
  return { g, viv, cris };
}

describe('roteador e escrita', () => {
  it('ação desconhecida responde erro claro', () => {
    const { g } = logado();
    expect(chamar(g, 'nao.existe')).toMatchObject({ ok: false, codigo: 'acao_desconhecida' });
  });
  it('escrita registra log com o usuário da sessão', () => {
    const { g, viv } = logado();
    const r = chamar(g, 'config.definir', { chave: 'prazoOficinas', valor: 20 }, viv);
    expect(r.ok).toBe(true);
    expect(g.Db.pegar('Config', 'prazoOficinas').valor).toBe(20);
    const ult = g.Db.todos('Logs').at(-1);
    expect([ult.por, ult.tela, ult.txt]).toEqual(['Viviane', 'cfg', 'Configuração prazoOficinas alterada para 20']);
  });
  it('desfazer volta o valor e só vale para quem fez', () => {
    const { g, viv, cris } = logado();
    const { desfazer } = chamar(g, 'config.definir', { chave: 'prazoOficinas', valor: 20 }, viv).dados;
    expect(chamar(g, 'acao.desfazer', { id: desfazer }, cris).codigo).toBe('desfazer_outro');
    expect(chamar(g, 'acao.desfazer', { id: desfazer }, viv).ok).toBe(true);
    expect(g.Db.pegar('Config', 'prazoOficinas').valor).toBe(15);
    expect(chamar(g, 'acao.desfazer', { id: desfazer }, viv).codigo).toBe('desfazer_expirado');
  });
  it('erro no meio da escrita não deixa nada pela metade', () => {
    const { g, viv } = logado();
    g.acao_('teste.quebra', (d, s) => g.mutar_(s, 'cfg', () => {
      g.Db.inserir('Fornecedores', { id: 'f9', nome: 'X', cat: 'Y', sub: '' });
      throw new Error('falhou');
    }));
    expect(chamar(g, 'teste.quebra', {}, viv)).toMatchObject({ ok: false, erro: 'Erro no servidor: falhou' });
    expect(g.Db.todos('Fornecedores')).toEqual([]);
  });
  it('logs: 15 por página, mais recentes primeiro, com filtro', () => {
    const { g, viv } = logado();
    for (let i = 0; i < 20; i++) g.Logs.registrar(i % 2 ? 'Cris' : 'Viviane', 'pagar', 'Ação ' + i);
    const p0 = chamar(g, 'logs.listar', { pagina: 0 }, viv).dados;
    expect(p0.itens).toHaveLength(15);
    expect(p0.itens[0].txt).toBe('Ação 19');
    expect(p0.paginas).toBe(2);
    const cris = chamar(g, 'logs.listar', { usuario: 'Cris', busca: 'ação 1' }, viv).dados;
    expect(cris.itens.every((x) => x.por === 'Cris')).toBe(true);
    expect(cris.itens.map((x) => x.txt)).toEqual(['Ação 19', 'Ação 17', 'Ação 15', 'Ação 13', 'Ação 11', 'Ação 1']);
  });
});
```

`test/gas/ordem.test.js`:

```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run test/gas/main.test.js test/gas/ordem.test.js`
Expected: FAIL (`acao_desconhecida` para `config.definir`; `g.mutar_ is not a function`; `Escrita.js` ausente na pasta).

- [ ] **Step 3: Implementar**

`apps-script/Escrita.js`:

```js
// Toda escrita passa por aqui: trava a planilha, grava o diário para o Desfazer e registra o log.
// fn devolve { msg, ...resultado }. msg vira a linha do log.
function mutar_(sess, tela, fn) {
  var trava = LockService.getScriptLock();
  trava.waitLock(20000);
  try {
    Db.iniciarDiario();
    var r = fn() || {};
    var diario = Db.fecharDiario();
    if (r.msg) Logs.registrar(sess.usuario, tela, r.msg);
    var desfazer = null;
    if (diario.length) {
      desfazer = Utilities.getUuid();
      CacheService.getScriptCache().put('desfazer:' + desfazer, JSON.stringify({ usuario: sess.usuario, msg: r.msg, diario: diario }), 600);
    }
    r.desfazer = desfazer;
    return r;
  } catch (err) {
    Db.reverter(Db.fecharDiario());
    throw err;
  } finally {
    trava.releaseLock();
  }
}

// ---- ações de escrita e consulta de logs ----
acao_('logs.listar', function (d) { return Logs.listar(d); });

acao_('config.definir', function (d, s) {
  return mutar_(s, 'cfg', function () {
    var atual = Db.pegar('Config', d.chave);
    if (atual) Db.atualizar('Config', d.chave, { valor: d.valor }); else Db.inserir('Config', { chave: d.chave, valor: d.valor });
    return { msg: 'Configuração ' + d.chave + ' alterada para ' + d.valor };
  });
});

acao_('acao.desfazer', function (d, s) {
  var c = CacheService.getScriptCache(), k = 'desfazer:' + d.id, raw = c.get(k);
  if (!raw) throw Auth.erro('desfazer_expirado', 'Não dá mais para desfazer essa ação (passou de 10 minutos).');
  var reg = JSON.parse(raw);
  if (reg.usuario !== s.usuario) throw Auth.erro('desfazer_outro', 'Só quem fez a ação pode desfazer.');
  var trava = LockService.getScriptLock();
  trava.waitLock(20000);
  try { Db.reverter(reg.diario); c.remove(k); Logs.registrar(s.usuario, 'desfazer', 'Desfez: ' + reg.msg); }
  finally { trava.releaseLock(); }
  return { msg: 'Desfeito: ' + reg.msg };
});
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run test/gas`
Expected: PASS, 19 testes.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: escrita com trava, desfazer e logs paginados"
```

---

### Task 4: Cliente da API no navegador

**Files:**
- Create: `src/api/client.js`
- Test: `test/front/client.test.js`

**Interfaces:**
- Consumes: contrato de `doPost` (Task 2).
- Produces: `criarApi({ url, fetchFn?, storage?, aoExpirar? }) → { chamar(acao, dados) → Promise<dados>, entrar(nome, senha), criarSenha(nome, convite, senha), sair(), sessao() → { token, usuario, expira }|null }`; `ErroApi` com `.codigo` (`rede`, `http` ou o código do servidor). Sessão no `localStorage` na chave `mrbl-sessao`.

- [ ] **Step 1: Escrever o teste que falha**

`test/front/client.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';
import { criarApi } from '../../src/api/client.js';

function memoria() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; }
const resposta = (corpo, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(corpo) });

describe('cliente da API', () => {
  it('manda POST text/plain com ação, dados e token', async () => {
    const fetchFn = vi.fn(() => resposta({ ok: true, dados: { token: 't1', usuario: 'Lucca', expira: Date.now() + 1e6 } }));
    const api = criarApi({ url: 'https://x', fetchFn, storage: memoria() });
    await api.entrar('Lucca', 'segredo1');
    const [url, opts] = fetchFn.mock.calls[0];
    expect(url).toBe('https://x');
    expect(opts.headers['Content-Type']).toBe('text/plain;charset=utf-8');
    expect(JSON.parse(opts.body)).toEqual({ acao: 'auth.entrar', dados: { nome: 'Lucca', senha: 'segredo1' } });
    fetchFn.mockImplementation(() => resposta({ ok: true, dados: [] }));
    await api.chamar('dados.carregar');
    expect(JSON.parse(fetchFn.mock.calls[1][1].body).token).toBe('t1');
    expect(api.sessao().usuario).toBe('Lucca');
  });
  it('erro do servidor vira exceção com código e mensagem', async () => {
    const api = criarApi({ url: 'u', fetchFn: () => resposta({ ok: false, codigo: 'login', erro: 'Usuário ou senha incorretos.' }), storage: memoria() });
    await expect(api.entrar('Lucca', 'x')).rejects.toMatchObject({ codigo: 'login', message: 'Usuário ou senha incorretos.' });
    expect(api.sessao()).toBeNull();
  });
  it('sessão expirada limpa a sessão e avisa', async () => {
    const st = memoria();
    st.setItem('mrbl-sessao', JSON.stringify({ token: 't', usuario: 'Cris', expira: Date.now() + 1e6 }));
    const aoExpirar = vi.fn();
    const api = criarApi({ url: 'u', fetchFn: () => resposta({ ok: false, codigo: 'sessao_expirada', erro: 'Sua sessão expirou. Entre de novo.' }), storage: st, aoExpirar });
    await expect(api.chamar('dados.carregar')).rejects.toMatchObject({ codigo: 'sessao_expirada' });
    expect(aoExpirar).toHaveBeenCalledWith('Sua sessão expirou. Entre de novo.');
    expect(api.sessao()).toBeNull();
  });
  it('falha de rede vira mensagem clara', async () => {
    const api = criarApi({ url: 'u', fetchFn: () => Promise.reject(new TypeError('Failed to fetch')), storage: memoria() });
    await expect(api.chamar('auth.usuarios')).rejects.toMatchObject({ codigo: 'rede' });
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run test/front/client.test.js`
Expected: FAIL com `Failed to resolve import "../../src/api/client.js"`.

- [ ] **Step 3: Implementar**

`src/api/client.js`:

```js
// Fala com o Web App do Apps Script. POST text/plain evita a checagem de CORS (preflight) que o Apps Script não responde.
const CHAVE_SESSAO = 'mrbl-sessao';

export class ErroApi extends Error {
  constructor(codigo, msg) { super(msg); this.codigo = codigo; }
}

export function criarApi({ url, fetchFn = (...a) => fetch(...a), storage = localStorage, aoExpirar = () => {} }) {
  const lerSessao = () => { try { return JSON.parse(storage.getItem(CHAVE_SESSAO) || 'null'); } catch { return null; } };
  const gravarSessao = (s) => { try { s ? storage.setItem(CHAVE_SESSAO, JSON.stringify(s)) : storage.removeItem(CHAVE_SESSAO); } catch { /* navegador sem storage */ } };

  async function chamar(acao, dados = {}) {
    const s = lerSessao();
    let resp;
    try {
      resp = await fetchFn(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ acao, dados, token: s ? s.token : undefined }),
        redirect: 'follow',
      });
    } catch {
      throw new ErroApi('rede', 'Sem conexão com o servidor. Confira a internet e tente de novo.');
    }
    if (!resp.ok) throw new ErroApi('http', 'O servidor respondeu com erro ' + resp.status + '.');
    const r = await resp.json();
    if (!r.ok) {
      if (r.codigo === 'sessao_expirada') { gravarSessao(null); aoExpirar(r.erro); }
      throw new ErroApi(r.codigo, r.erro);
    }
    return r.dados;
  }

  async function entrar(nome, senha) { const s = await chamar('auth.entrar', { nome, senha }); gravarSessao(s); return s; }
  async function criarSenha(nome, convite, senha) { const s = await chamar('auth.criarSenha', { nome, convite, senha }); gravarSessao(s); return s; }
  async function sair() { try { await chamar('auth.sair'); } finally { gravarSessao(null); } }
  const sessao = () => { const s = lerSessao(); return s && s.expira > Date.now() ? s : null; };

  return { chamar, entrar, criarSenha, sair, sessao };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run test/front/client.test.js`
Expected: PASS, 4 testes.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cliente da API com sessão no navegador"
```

---

### Task 5: Tela de login e casca do app

**Files:**
- Create: `tools/extrair-css.mjs`, `tools/gerar-index.mjs`, `src/styles/extra.css`
- Generate: `src/styles/app.css` (de `reference/mock.html`), `index.html`
- Create: `src/ui/util.js`, `src/ui/login.js`, `src/ui/shell.js`, `src/main.js`
- Test: `test/front/login.test.js`, `test/front/shell.test.js`

**Interfaces:**
- Consumes: `criarApi` (Task 4); ações `auth.usuarios`, `dados.carregar`.
- Produces: `esc(texto)`; `montarLogin(raiz, { api, logo, aoEntrar }) → { abrir(mensagem?) }`; `TELAS` (`[chave, nome][]`); `montarShell(raiz, { logo, usuario, aoSair, telas }) → { ir(tela), tela }` — os planos 03–06 registram cada tela passando `telas: { pagar: () => html, ... }`.

- [ ] **Step 1: Gerar CSS e index a partir do protótipo**

`tools/extrair-css.mjs`:

```js
// Copia o <style> do protótipo (reference/mock.html) para o CSS do app, para as telas ficarem iguais.
import fs from 'node:fs';
const [, , origem, destino] = process.argv;
const html = fs.readFileSync(origem, 'utf8');
const blocos = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1].trim());
if (!blocos.length) { console.error('Nenhum <style> encontrado em ' + origem); process.exit(1); }
fs.writeFileSync(destino, '/* Gerado de ' + origem + ' por tools/extrair-css.mjs. Não edite à mão; ajustes vão em src/styles/extra.css. */\n' + blocos.join('\n') + '\n');
console.log('CSS: ' + blocos.length + ' bloco(s), ' + fs.statSync(destino).size + ' bytes → ' + destino);
```

`tools/gerar-index.mjs`:

```js
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
```

`src/styles/extra.css`:

```css
/* Ajustes próprios do app, por cima do CSS gerado do protótipo. */
```

Run: `npm run css && npm run index`
Expected: `CSS: 1 bloco(s), 50473 bytes → src/styles/app.css` e `index.html gerado (46292 bytes)`.

- [ ] **Step 2: Escrever os testes que falham**

`test/front/login.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';
import { montarLogin } from '../../src/ui/login.js';

const espera = () => new Promise((r) => setTimeout(r, 0));
function apiFalsa(usuarios) {
  return {
    chamar: vi.fn(async (a) => { if (a === 'auth.usuarios') return usuarios; throw new Error('?'); }),
    entrar: vi.fn(async (nome, senha) => { if (senha !== 'segredo1') { const e = new Error('Usuário ou senha incorretos.'); e.codigo = 'login'; throw e; } return { token: 't', usuario: nome }; }),
    criarSenha: vi.fn(async (nome, convite, senha) => ({ token: 't', usuario: nome })),
  };
}

describe('tela de login', () => {
  it('quem já tem senha vê só a senha; erro aparece na tela', async () => {
    const raiz = document.createElement('div');
    const api = apiFalsa([{ nome: 'Lucca', temSenha: true }]);
    const aoEntrar = vi.fn();
    await montarLogin(raiz, { api, aoEntrar }).abrir();
    expect(raiz.querySelector('#lgConvite')).toBeNull();
    raiz.querySelector('#lgPw').value = 'errada';
    raiz.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await espera();
    expect(raiz.querySelector('#lgErr').textContent).toBe('Usuário ou senha incorretos.');
    raiz.querySelector('#lgPw').value = 'segredo1';
    raiz.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await espera();
    expect(aoEntrar).toHaveBeenCalledWith({ token: 't', usuario: 'Lucca' });
  });
  it('primeiro acesso pede convite e confere as duas senhas', async () => {
    const raiz = document.createElement('div');
    const api = apiFalsa([{ nome: 'Lucca', temSenha: true }, { nome: 'Viviane', temSenha: false }]);
    await montarLogin(raiz, { api, aoEntrar: () => {} }).abrir();
    const sel = raiz.querySelector('#lgUser');
    sel.value = 'Viviane';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    expect(raiz.querySelector('#lgConvite')).not.toBeNull();
    raiz.querySelector('#lgConvite').value = 'V1';
    raiz.querySelector('#lgPw').value = 'senha123';
    raiz.querySelector('#lgPw2').value = 'senha999';
    raiz.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await espera();
    expect(raiz.querySelector('#lgErr').textContent).toBe('As duas senhas não são iguais.');
    expect(api.criarSenha).not.toHaveBeenCalled();
    raiz.querySelector('#lgPw2').value = 'senha123';
    raiz.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await espera();
    expect(api.criarSenha).toHaveBeenCalledWith('Viviane', 'V1', 'senha123');
  });
});
```

`test/front/shell.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';
import { montarShell, TELAS } from '../../src/ui/shell.js';

describe('casca do app', () => {
  it('mostra as 7 telas, o usuário e troca de tela', () => {
    const raiz = document.createElement('div');
    const aoSair = vi.fn();
    montarShell(raiz, { usuario: 'Cris', aoSair });
    expect([...raiz.querySelectorAll('[data-tela]')].map((b) => b.textContent)).toEqual(TELAS.map((t) => t[1]));
    expect(raiz.querySelector('#userBox').textContent).toContain('Cris');
    raiz.querySelector('[data-tela="dre"]').click();
    expect(raiz.querySelector('[data-tela="dre"]').getAttribute('aria-pressed')).toBe('true');
    expect(raiz.querySelector('#topTitle h1').textContent).toBe('DRE');
    raiz.querySelector('#btnSair').click();
    expect(aoSair).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run test/front`
Expected: FAIL com `Failed to resolve import "../../src/ui/login.js"` e `"../../src/ui/shell.js"`.

- [ ] **Step 4: Implementar**

`src/ui/util.js`:

```js
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
```

`src/ui/login.js`:

```js
// Tela de entrada: escolhe o usuário; quem ainda não tem senha cria a sua com o código de convite.
import { esc } from './util.js';

export function montarLogin(raiz, { api, logo, aoEntrar }) {
  let usuarios = [];
  let atual = '';
  let msg = '';

  function html() {
    const u = usuarios.find((x) => x.nome === atual) || usuarios[0];
    const primeiro = u && !u.temSenha;
    return '<div class="login" id="loginBox"><form id="loginForm" novalidate><div class="lg-brand">' +
      (logo ? '<img src="' + logo + '" alt="MRBL">' : '<b>MRBL</b>') + '<small>Financeiro · contas a pagar e DRE</small></div>' +
      '<label>Usuário<select id="lgUser" autocomplete="username">' + usuarios.map((x) => '<option' + (u && x.nome === u.nome ? ' selected' : '') + '>' + esc(x.nome) + '</option>').join('') + '</select></label>' +
      (primeiro ? '<p class="lg-first">Primeiro acesso de <b>' + esc(u.nome) + '</b>: use o código de convite que você recebeu e crie sua senha (mínimo 6 caracteres).</p>' +
        '<label>Código de convite<input id="lgConvite" autocomplete="one-time-code" required></label>' : '') +
      '<label>Senha<input type="password" id="lgPw" autocomplete="' + (primeiro ? 'new-password' : 'current-password') + '" required></label>' +
      (primeiro ? '<label>Repita a senha<input type="password" id="lgPw2" autocomplete="new-password" required></label>' : '') +
      '<p class="lg-err" id="lgErr" role="alert">' + esc(msg) + '</p>' +
      '<button type="submit" class="btn pri" id="lgOk">' + (primeiro ? 'Criar senha e entrar' : 'Entrar') + '</button></form></div>';
  }
  function render() { raiz.innerHTML = html(); const f = raiz.querySelector('#lgConvite') || raiz.querySelector('#lgPw'); if (f) f.focus(); }

  raiz.addEventListener('change', (e) => { if (e.target.id === 'lgUser') { atual = e.target.value; msg = ''; render(); } });
  raiz.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = raiz.querySelector('#lgUser').value;
    const senha = raiz.querySelector('#lgPw').value;
    const pw2 = raiz.querySelector('#lgPw2');
    const btn = raiz.querySelector('#lgOk');
    const erro = (m) => { raiz.querySelector('#lgErr').textContent = m; };
    if (pw2 && pw2.value !== senha) return erro('As duas senhas não são iguais.');
    btn.disabled = true;
    try {
      const s = pw2 ? await api.criarSenha(nome, raiz.querySelector('#lgConvite').value, senha) : await api.entrar(nome, senha);
      raiz.innerHTML = '';
      aoEntrar(s);
    } catch (err) {
      btn.disabled = false;
      raiz.querySelector('#lgPw').value = '';
      erro(err.message);
    }
  });

  return {
    async abrir(texto) {
      msg = texto || '';
      raiz.innerHTML = '<div class="login"><p class="lg-note">Carregando…</p></div>';
      try { usuarios = await api.chamar('auth.usuarios'); }
      catch (err) { raiz.innerHTML = '<div class="login"><p class="lg-err">' + esc(err.message) + '</p></div>'; return; }
      render();
    },
  };
}
```

`src/ui/shell.js`:

```js
// Casca do app com a mesma estrutura do protótipo: cabeçalho lateral (logo, abas, usuário), barra do topo e área da tela.
import { esc } from './util.js';

export const TELAS = [
  ['pagar', 'Contas a pagar'], ['of', 'Oficinas'], ['pr', 'Prorrogadas'], ['rel', 'Relatório'],
  ['dre', 'DRE'], ['drel', 'DRE lançamentos'], ['cfg', 'Configurações'],
];

export function montarShell(raiz, { logo, usuario, aoSair, telas = {} }) {
  let tela = 'pagar';
  function conteudo() {
    const fn = telas[tela];
    if (fn) return fn();
    return '<section class="today"><h1>' + esc(TELAS.find((t) => t[0] === tela)[1]) + '</h1><span class="sub">Em construção: chega nas próximas fases.</span></section>';
  }
  function render() {
    raiz.innerHTML = '<header class="top"><div class="wrap"><div class="brand">' +
      (logo ? '<img src="' + logo + '" alt="MRBL Confecção" width="97" height="48">' : '<b>MRBL</b>') +
      '<nav class="tabs" aria-label="Telas">' + TELAS.map(([k, n]) => '<button type="button" data-tela="' + k + '" aria-pressed="' + (k === tela) + '">' + n + '</button>').join('') + '</nav>' +
      '<div class="userbox" id="userBox">Conectado como<span class="ub-name">' + esc(usuario) + '</span><button type="button" class="ub-out" id="btnSair">Sair</button></div></div></div></header>' +
      '<div class="topbar" id="topBar"><div id="topTitle"></div><div class="topacts"></div></div>' +
      '<main class="wrap" id="app">' + conteudo() + '</main><div id="toastHost"></div>';
    const titulo = raiz.querySelector('#app > .today');
    if (titulo) raiz.querySelector('#topTitle').appendChild(titulo);
  }
  raiz.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tela]');
    if (b) { tela = b.dataset.tela; render(); return; }
    if (e.target.closest('#btnSair')) aoSair();
  });
  render();
  return { ir(t) { tela = t; render(); }, get tela() { return tela; } };
}
```

`src/main.js`:

```js
import './styles/app.css';
import './styles/extra.css';
import { criarApi } from './api/client.js';
import { montarLogin } from './ui/login.js';
import { montarShell } from './ui/shell.js';

const URL_API = import.meta.env.VITE_API_URL;
const raiz = document.getElementById('raiz');
const raizLogin = document.getElementById('loginHost');
const logo = document.getElementById('logoMrbl')?.getAttribute('src') || '';

const api = criarApi({ url: URL_API, aoExpirar: (m) => login.abrir(m) });
const login = montarLogin(raizLogin, { api, logo, aoEntrar: iniciar });

async function iniciar() {
  raiz.innerHTML = '<p class="lg-note" style="padding:40px">Carregando dados…</p>';
  try {
    const dados = await api.chamar('dados.carregar');
    montarShell(raiz, { logo, usuario: dados.usuario, aoSair: async () => { await api.sair(); raiz.innerHTML = ''; login.abrir(); } });
  } catch (err) {
    if (err.codigo !== 'sessao_expirada') raiz.innerHTML = '<p class="lg-err" style="padding:40px">' + err.message + '</p>';
  }
}

if (!URL_API) raiz.innerHTML = '<p class="lg-err" style="padding:40px">Falta configurar VITE_API_URL (URL do Web App do Apps Script).</p>';
else if (api.sessao()) iniciar();
else login.abrir();
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test && npx vite build`
Expected: PASS, 26 testes no total; build termina com `✓ built`.

- [ ] **Step 6: Conferir na tela**

Run: `VITE_API_URL=https://exemplo.invalid/exec npm run dev`, abrir `http://localhost:5173`.
Expected: aparece "Sem conexão com o servidor…" (não há Web App ainda). Isso confirma o caminho de erro de rede. O login real é conferido na Task 7.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: tela de login e casca do app com o visual do protótipo"
```

---

### Task 6: Testes no GitHub e publicação automática

**Files:**
- Create: `.github/workflows/testes.yml`, `.github/workflows/publicar.yml`, `tools/fumaca.mjs`, `README.md`

**Interfaces:**
- Consumes: scripts `npm test`, `npm run build` (Tasks 1–5).
- Produces: a cada push na `main`: testes → `clasp push` → `clasp deploy` no mesmo deployment (URL fixa) → build com `VITE_API_URL` → GitHub Pages. Requer (Task 7): segredo `CLASPRC_JSON`, variáveis `APPS_SCRIPT_DEPLOYMENT_ID` e `VITE_API_URL`.

- [ ] **Step 1: Escrever os workflows e o teste de fumaça**

`.github/workflows/testes.yml`:

```yaml
name: Testes
on:
  pull_request:
  push:
    branches: [main]
jobs:
  testes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build
        env: { VITE_API_URL: https://exemplo.invalid/exec }
```

`.github/workflows/publicar.yml`:

```yaml
name: Publicar
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency: { group: publicar, cancel-in-progress: false }
jobs:
  servidor:
    # Só roda depois da configuração única (plano 01, tarefa 7). Antes disso o job fica como "pulado", não como erro.
    if: ${{ vars.APPS_SCRIPT_DEPLOYMENT_ID != '' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm test
      - name: Login do clasp
        run: echo '${{ secrets.CLASPRC_JSON }}' > ~/.clasprc.json
      - name: Envia o código do Apps Script
        run: npx clasp push --force
      - name: Atualiza o Web App (mesma URL)
        run: npx clasp deploy -i "${{ vars.APPS_SCRIPT_DEPLOYMENT_ID }}" -d "${{ github.sha }}"
  front:
    # Publica as telas assim que existir a URL do Web App, mesmo antes do envio automático do servidor estar configurado.
    needs: servidor
    if: ${{ always() && vars.VITE_API_URL != '' && needs.servidor.result != 'failure' }}
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.deploy.outputs.page_url }}' }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
        env: { VITE_API_URL: '${{ vars.VITE_API_URL }}' }
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - id: deploy
        uses: actions/deploy-pages@v4
```

`tools/fumaca.mjs`:

```js
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
```

`README.md`:

```markdown
# MRBL Financeiro

Contas a pagar, oficinas, previsões e DRE da MRBL. Dados no Google Sheets "Financeiro MRBL", servidor em Google Apps Script, telas estáticas publicadas pelo GitHub.

## Rodar localmente

```bash
npm ci
npm test                       # testes do servidor (simulador do Apps Script) e das telas
VITE_API_URL=<url do Web App> npm run dev
```

## Estrutura

| Pasta | O que tem |
|---|---|
| `apps-script/` | servidor: esquema da planilha, leitura/escrita, login, ações. Enviado com `clasp`. |
| `src/` | telas (Vite, JavaScript puro). |
| `test/gas/` | simulador em memória do Apps Script e testes do servidor. |
| `test/front/` | testes das telas (jsdom). |
| `tools/` | geração do CSS e do index a partir do protótipo, teste de fumaça. |
| `reference/mock.html` | protótipo aprovado (versão 57). É a referência visual e de regras. |
| `docs/superpowers/plans/` | planos de cada fase. |

## Publicação

Todo push na `main` roda os testes, envia o Apps Script (mesma URL do Web App) e publica as telas. Configuração única: plano 01, tarefa 7.
```

- [ ] **Step 2: Validar os YAML localmente**

Run: `node -e "for (const f of ['testes','publicar']) require('fs').readFileSync('.github/workflows/'+f+'.yml','utf8').includes('npm test') || process.exit(1)"`
Expected: sai sem erro.

- [ ] **Step 3: Subir para o GitHub e ver o CI passar**

```bash
git add -A
git commit -m "ci: testes em todo push e publicação automática"
git remote add origin git@github.com:RSLConsultoria/mrbl-financeiro.git
git push -u origin main
```

Expected: o workflow **Testes** fica verde. O workflow **Publicar** aparece com os jobs pulados até a Task 7 criar a variável `APPS_SCRIPT_DEPLOYMENT_ID`.

---

### Task 7: Configuração única nas contas Google e GitHub (feita pelo Lucca)

Estes passos precisam do login pessoal no navegador; não dá para automatizar. Levam ~15 minutos.

**Files:**
- Modify: `.clasp.json` (`scriptId` real)

- [ ] **Step 1: Repositório privado e Pages**

GitHub › RSLConsultoria › New repository › `mrbl-financeiro`, **Private**. Em Settings › Pages › Source: **GitHub Actions**. Se a organização estiver no plano Free e o Pages não aparecer para repositório privado, publique o front no Cloudflare Pages (Create project › conectar o repositório › build `npm run build`, saída `dist`, variável `VITE_API_URL`) e apague o job `front` de `publicar.yml`.

- [ ] **Step 2: Projeto do Apps Script ligado à planilha**

Abra a planilha "Financeiro MRBL" › Extensões › Apps Script. Em Configurações do projeto (engrenagem), copie o **ID do script** e cole em `.clasp.json` no lugar de `COLE_AQUI_O_ID_DO_SCRIPT`. Ainda nas configurações, marque "Mostrar o arquivo de manifesto appsscript.json".

Em Propriedades do script › Adicionar: `PEPPER` = um texto aleatório longo (gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Guarde em lugar seguro: se mudar, todas as senhas precisam ser recriadas.

- [ ] **Step 3: Enviar o código e criar as abas**

No seu computador, dentro do repositório:

```bash
npx clasp login          # abre o navegador; entre com contato@rslconsultoria.com
npx clasp push --force
```

No editor do Apps Script, selecione a função `setupPlanilha` e clique em Executar. Autorize o acesso à planilha.
Expected: a planilha ganha as 14 abas com cabeçalho em negrito, Logs por último, e `Config` com `prazoOficinas = 15`. A aba "Página1" pode ser apagada à mão.

- [ ] **Step 4: Cadastrar os usuários com convite**

Na aba `Usuarios`, adicione três linhas (colunas `nome`, `convite`, `ativo`):

| nome | convite | ativo |
|---|---|---|
| Lucca | um código seu, ex.: `MRBL-7F3K` | TRUE |
| Viviane | outro código | TRUE |
| Cris | outro código | TRUE |

Mande o código de cada pessoa por um canal privado. Ele só vale até a pessoa criar a senha.

- [ ] **Step 5: Publicar o Web App**

Editor do Apps Script › Implantar › Nova implantação › tipo **App da Web** › Executar como: **Eu** › Quem pode acessar: **Qualquer pessoa** › Implantar. Copie:
- a **URL do app da Web** (termina em `/exec`);
- o **ID da implantação**.

Run: `node tools/fumaca.mjs <URL do app da Web>`
Expected:
```
doGet ok
auth.usuarios ok: Lucca (sem senha), Viviane (sem senha), Cris (sem senha)
token falso recusado ok
```

- [ ] **Step 6: Segredos e variáveis do GitHub**

Repositório › Settings › Secrets and variables › Actions:
- **Secret** `CLASPRC_JSON`: o conteúdo inteiro do arquivo `~/.clasprc.json` criado pelo `clasp login` (no Windows: `%USERPROFILE%\.clasprc.json`).
- **Variable** `APPS_SCRIPT_DEPLOYMENT_ID`: o ID da implantação do Step 5.
- **Variable** `VITE_API_URL`: a URL do app da Web do Step 5.

Commit do `.clasp.json` com o `scriptId`:

```bash
git add .clasp.json
git commit -m "chore: liga o repositório ao projeto do Apps Script"
git push
```

Expected: o workflow **Publicar** fica verde e mostra o endereço do site.

- [ ] **Step 7: Validação ponta a ponta**

1. Abra o endereço do site. Escolha **Lucca**, informe o convite, crie a senha. Expected: entra e vê o menu com as 7 telas e "Conectado como Lucca".
2. Recarregue a página. Expected: continua logado.
3. Clique em **Sair** e entre de novo com a senha. Expected: entra.
4. Abra a aba `Logs` da planilha. Expected: linhas "Criou a senha no primeiro acesso", "Entrou no sistema", "Saiu do sistema", "Entrou no sistema", todas com `por = Lucca`.
5. Erre a senha 5 vezes. Expected: "Muitas tentativas erradas. Tente de novo em 15 minutos."
6. Confira na aba `Usuarios` que a coluna `convite` do Lucca ficou vazia e que `hash` é um texto de 64 caracteres, sem a senha.

Plano 01 concluído quando os 6 itens acima passarem. Próximo: plano 02 (carga inicial).
