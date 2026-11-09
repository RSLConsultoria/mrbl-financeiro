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
  clearContent() { for (let i = 0; i < this.nr; i++) { const row = this.sheet.rows[this.r - 1 + i]; if (row) for (let j = 0; j < this.nc; j++) row[this.c - 1 + j] = ''; } return this; }
}

class FakeSheet {
  constructor(name) { this.name = name; this.rows = []; this.formats = []; this.frozen = 0; }
  getName() { return this.name; }
  getLastRow() { let n = this.rows.length; while (n && (this.rows[n - 1] || []).every((x) => x === '' || x == null)) n--; return n; }
  getLastColumn() { return Math.max(0, ...this.rows.map((r) => r.length)); }
  getRange(r, c, nr = 1, nc = 1) { return new FakeRange(this, r, c, nr, nc); }
  appendRow(row) { this.rows.push(row.slice()); return this; }
  deleteRow(r) { this.rows.splice(r - 1, 1); return this; }
  deleteRows(r, n) { this.rows.splice(r - 1, n); return this; }
  setFrozenRows(n) { this.frozen = n; return this; }
  getMaxRows() { return Math.max(this.maxRows || 1000, this.rows.length); }
  insertRowsAfter(r, n) { this.maxRows = this.getMaxRows() + n; return this; }
}

class FakeSpreadsheet {
  constructor() { this.sheets = [new FakeSheet('Página1')]; this.active = null; }
  getSheetByName(n) { return this.sheets.find((s) => s.name === n) || null; }
  getSheets() { return this.sheets.slice(); }
  deleteSheet(s) { this.sheets.splice(this.sheets.indexOf(s), 1); }
  insertSheet(n) { const s = new FakeSheet(n); this.sheets.push(s); return s; }
  setActiveSheet(s) { this.active = s; return s; }
  moveActiveSheet(pos) { const i = this.sheets.indexOf(this.active); this.sheets.splice(i, 1); this.sheets.splice(pos - 1, 0, this.active); }
}

export function criarFakes({ agora = () => Date.now() } = {}) {
  const ss = new FakeSpreadsheet();
  const cache = new Map();
  const props = new Map([['PEPPER', 'pepper-de-teste']]);
  const fetches = { feitos: [], responder: () => ({ code: 404, body: '' }) };
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
    props,
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (props.has(k) ? props.get(k) : null) }) },
    // UrlFetchApp e ScriptApp: os testes trocam fetches.responder para simular GitHub e Apps Script API.
    fetches,
    UrlFetchApp: { fetch(url, o) { const f = fetches; f.feitos.push({ url, o: o || {} }); const r = f.responder(url, o || {}); return { getResponseCode: () => r.code, getContentText: () => r.body }; } },
    ScriptApp: { getScriptId: () => 'SCRIPT123', getOAuthToken: () => 'tok' },
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
