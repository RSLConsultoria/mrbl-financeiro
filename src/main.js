import './styles/app.css';
import './styles/extra.css';
import { criarApi } from './api/client.js';
import { montarLogin } from './ui/login.js';
import { iniciarTelas } from './app/telas.js';
import { criarSincronizador } from './app/sync.js';

const URL_API = import.meta.env.VITE_API_URL;
const app = document.getElementById('app');
const raizLogin = document.getElementById('loginHost');
const logo = document.querySelector('.brand img')?.getAttribute('src') || '';

const api = criarApi({ url: URL_API, aoExpirar: (m) => login.abrir(m) });
const login = montarLogin(raizLogin, { api, logo, aoEntrar: iniciar });

function aviso(txt, erro) {
  const host = document.getElementById('toastHost');
  host.innerHTML = '<div class="toast" role="status"' + (erro ? ' style="background:var(--danger-ink,#9b1c1c)"' : '') + '><span></span></div>';
  host.querySelector('span').textContent = txt;
}

// Enquanto houver gravação pendente, avisa antes de fechar a aba.
let pendentes = 0;
window.addEventListener('beforeunload', (e) => { if (pendentes) { e.preventDefault(); e.returnValue = ''; } });

let iniciado = false;
async function iniciar() {
  if (iniciado) { location.reload(); return; }
  app.innerHTML = '<p class="lg-note" style="padding:40px">Carregando dados…</p>';
  try {
    const dados = await api.chamar('dados.carregar');
    const sync = criarSincronizador({
      api,
      aoMudarEstado: (n) => { pendentes = n; document.body.classList.toggle('salvando', n > 0); },
      aoErro: (err) => {
        if (err.codigo === 'sessao_expirada') return;
        aviso('Não consegui salvar: ' + err.message + ' Vou recarregar os dados da planilha.', true);
        setTimeout(() => location.reload(), 3500);
      },
    });
    iniciado = true;
    iniciarTelas({ dados, api, sync, aoSair: async () => { await sync.esperar(); await api.sair(); location.reload(); } });
  } catch (err) {
    if (err.codigo !== 'sessao_expirada') app.innerHTML = '<p class="lg-err" style="padding:40px">' + err.message + '</p>';
  }
}

if (!URL_API) app.innerHTML = '<p class="lg-err" style="padding:40px">Falta configurar VITE_API_URL (URL do Web App do Apps Script).</p>';
else if (api.sessao()) iniciar();
else login.abrir();
