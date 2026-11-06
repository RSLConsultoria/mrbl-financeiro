// Painel "Carga inicial": aparece só para o administrador e só enquanto a planilha não tem contas nem lançamentos.
// Lê o arquivo JSON da carga, mostra quantos registros vêm e manda para o servidor (carga.importar).
import { esc } from '../ui/util.js';

const ROTULOS = { contas: 'contas', saidas: 'despesas da DRE', entradas: 'entradas da DRE', previsoes: 'previsões', fornecedores: 'fornecedores', clientes: 'clientes', dreHistorico: 'linhas da DRE jan–jun' };

const lerTexto = (f) => new Promise((ok, falha) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = falha; r.readAsText(f); });

export function precisaCarga(dados) {
  return !!dados.admin && !(dados.contas || []).length && !(dados.saidas || []).length && !(dados.entradas || []).length;
}

export function montarCarga(host, { api, aoConcluir }) {
  let carga = null, nome = '', erro = '', enviando = false;
  function render() {
    const resumo = carga ? Object.keys(ROTULOS).filter((k) => Array.isArray(carga[k])).map((k) => '<li><b class="num">' + carga[k].length + '</b> ' + ROTULOS[k] + '</li>').join('') : '';
    host.innerHTML = '<section class="panel" style="margin:16px auto;max-width:720px;padding:18px 20px">' +
      '<h2 style="margin:0 0 6px">Carga inicial</h2>' +
      '<p style="margin:0 0 12px;color:var(--muted)">A planilha ainda está vazia. Escolha o arquivo <b>carga-inicial.json</b> para trazer as contas, os lançamentos e as previsões do protótipo.</p>' +
      '<input type="file" id="cgFile" accept=".json,application/json">' +
      (carga ? '<p style="margin:12px 0 4px">Arquivo <b>' + esc(nome) + '</b>:</p><ul style="margin:0 0 12px">' + resumo + '</ul>' +
        '<button type="button" class="btn pri" id="cgOk"' + (enviando ? ' disabled' : '') + '>' + (enviando ? 'Gravando na planilha…' : 'Gravar na planilha') + '</button>' : '') +
      (erro ? '<p class="lg-err" role="alert">' + esc(erro) + '</p>' : '') + '</section>';
  }
  host.addEventListener('change', async (e) => {
    if (e.target.id !== 'cgFile' || !e.target.files[0]) return;
    const f = e.target.files[0];
    erro = ''; carga = null; nome = f.name;
    try { carga = JSON.parse(await lerTexto(f)); if (!carga || typeof carga !== 'object') throw new Error(); }
    catch { carga = null; erro = 'Esse arquivo não é uma carga válida.'; }
    render();
  });
  host.addEventListener('click', async (e) => {
    if (e.target.id !== 'cgOk' || !carga || enviando) return;
    enviando = true; erro = ''; render();
    try { await api.chamar('carga.importar', { carga }); aoConcluir(); }
    catch (err) { enviando = false; erro = err.message; render(); }
  });
  render();
}
