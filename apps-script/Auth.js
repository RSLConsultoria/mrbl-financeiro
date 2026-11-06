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
