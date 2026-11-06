// Painel "Carga inicial": aparece só para o administrador e só enquanto a planilha não tem contas nem lançamentos.
// Aceita as planilhas de origem (DRE e relatório semanal, .xlsx) e, opcionalmente, um .json com o que elas não têm
// (histórico jan–jun da DRE, saldos e previsões). Mostra quantos registros vêm e manda para o servidor (carga.importar).
import { esc } from '../ui/util.js';
import { lerPasta, lerDre, lerRelatorio, montarCarga as montarDados, tipoDaPasta } from './planilhas.js';

const ROTULOS = { contas: 'contas', saidas: 'despesas da DRE', entradas: 'entradas da DRE', previsoes: 'previsões', fornecedores: 'fornecedores', clientes: 'clientes', dreHistorico: 'linhas da DRE jan–jun' };
const EXCELJS = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';

const lerBinario = (f) => new Promise((ok, falha) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = falha; r.readAsArrayBuffer(f); });
const lerTexto = (f) => new Promise((ok, falha) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = falha; r.readAsText(f); });
const hojeLocal = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function carregarExcelJS() {
  if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
  return new Promise((ok, falha) => { const s = document.createElement('script'); s.src = EXCELJS; s.onload = () => ok(window.ExcelJS); s.onerror = () => falha(new Error('Não consegui carregar o leitor de Excel.')); document.head.appendChild(s); });
}

export function precisaCarga(dados) {
  return !!dados.admin && !(dados.contas || []).length && !(dados.saidas || []).length && !(dados.entradas || []).length;
}

export function montarCarga(host, { api, aoConcluir, excel = carregarExcelJS, hoje = hojeLocal }) {
  const fontes = { dre: null, rel: null, extra: null };
  let carga = null, erro = '', ocupado = '';
  function juntar() {
    if (!fontes.dre && !fontes.rel && !fontes.extra) { carga = null; return; }
    let c = {};
    if (fontes.dre && fontes.rel) c = montarDados({ dre: fontes.dre.dados, rel: fontes.rel.dados, hoje: hoje() });
    else if (fontes.dre || fontes.rel) { carga = null; return; }
    if (fontes.extra) Object.assign(c, fontes.extra.dados, { config: Object.assign({}, c.config, fontes.extra.dados.config) });
    carga = c;
  }
  function render() {
    const arq = Object.values(fontes).filter(Boolean).map((f) => '<li>' + esc(f.nome) + ' <small style="color:var(--muted)">(' + f.tipo + ')</small></li>').join('');
    const faltam = (fontes.dre || fontes.rel) && !(fontes.dre && fontes.rel) ? '<p style="margin:6px 0;color:var(--muted)">Falta ' + (fontes.dre ? 'o relatório semanal' : 'a planilha da DRE') + '.</p>' : '';
    const resumo = carga ? Object.keys(ROTULOS).filter((k) => Array.isArray(carga[k])).map((k) => '<li><b class="num">' + carga[k].length + '</b> ' + ROTULOS[k] + '</li>').join('') : '';
    host.innerHTML = '<section class="panel" style="margin:16px auto;max-width:720px;padding:18px 20px">' +
      '<h2 style="margin:0 0 6px">Carga inicial</h2>' +
      '<p style="margin:0 0 12px;color:var(--muted)">A planilha ainda está vazia. Escolha a planilha da <b>DRE</b> e o <b>relatório semanal</b> (.xlsx). Se tiver, junte também o arquivo .json com o histórico de janeiro a junho e as previsões.</p>' +
      '<input type="file" id="cgFile" multiple accept=".xlsx,.json,application/json">' +
      (arq ? '<ul style="margin:10px 0 4px">' + arq + '</ul>' : '') + faltam +
      (ocupado ? '<p style="margin:8px 0">' + esc(ocupado) + '</p>' : '') +
      (carga && !ocupado ? '<p style="margin:12px 0 4px">Vai entrar na planilha:</p><ul style="margin:0 0 12px">' + resumo + '</ul><button type="button" class="btn pri" id="cgOk">Gravar na planilha</button>' : '') +
      (erro ? '<p class="lg-err" role="alert">' + esc(erro) + '</p>' : '') + '</section>';
  }
  async function lerArquivo(f) {
    if (/\.json$/i.test(f.name)) {
      const d = JSON.parse(await lerTexto(f));
      if (!d || typeof d !== 'object') throw new Error(f.name + ' não é uma carga válida.');
      fontes.extra = { nome: f.name, tipo: 'complemento', dados: d };
      return;
    }
    const pasta = await lerPasta(await excel(), await lerBinario(f));
    const tipo = tipoDaPasta(pasta.nomes);
    if (tipo === 'dre') fontes.dre = { nome: f.name, tipo: 'DRE', dados: lerDre(pasta.abas) };
    else if (tipo === 'rel') {
      const rel = lerRelatorio(pasta.abas, pasta.nomes, hoje());
      if (!rel.semanas.length) throw new Error('Não achei no relatório a aba da semana atual.');
      fontes.rel = { nome: f.name, tipo: 'relatório, de ' + rel.semanas[0] + ' a ' + rel.semanas[rel.semanas.length - 1], dados: rel };
    } else throw new Error(f.name + ': não reconheci. Precisa ter a aba BASE_DESPESAS (DRE) ou ATRASADOS MRBL (relatório).');
  }
  host.addEventListener('change', async (e) => {
    if (e.target.id !== 'cgFile' || !e.target.files.length) return;
    const lista = [...e.target.files];
    erro = ''; ocupado = 'Lendo ' + lista.length + ' arquivo(s)…'; render();
    for (const f of lista) { try { await lerArquivo(f); } catch (err) { erro = err.message || String(err); } }
    ocupado = ''; juntar(); render();
  });
  host.addEventListener('click', async (e) => {
    if (e.target.id !== 'cgOk' || !carga || ocupado) return;
    ocupado = 'Gravando na planilha… pode levar um minuto.'; erro = ''; render();
    try { await api.chamar('carga.importar', { carga }); aoConcluir(); }
    catch (err) { ocupado = ''; erro = err.message; render(); }
  });
  render();
}
