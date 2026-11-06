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
