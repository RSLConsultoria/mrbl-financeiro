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
