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
