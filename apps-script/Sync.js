// Sincronização das telas com a planilha.
// As telas carregam tudo ao entrar (dados.carregar) e, a cada ação, mandam só o que mudou (sync.aplicar).
var ABAS_APP = { Contas: 'contas', Despesas: 'saidas', Entradas: 'entradas', Previsoes: 'previsoes', Fornecedores: 'fornecedores', Clientes: 'clientes' };
var CONFIG_EDITAVEL = ['prazoOficinas', 'prevRevisao'];

var Sync = {
  // Objeto do app -> linha da aba. Campos sem coluna vão para "extra".
  paraLinha: function (aba, o) {
    var cols = SCHEMA[aba], r = {}, extra = {}, temExtra = false;
    Object.keys(o).forEach(function (k) {
      if (cols.indexOf(k) >= 0) r[k] = o[k];
      else if (o[k] !== undefined) { extra[k] = o[k]; temExtra = true; }
    });
    if (cols.indexOf('extra') >= 0) r.extra = temExtra ? extra : null;
    return r;
  },
  // Linha da aba -> objeto do app.
  doLinha: function (aba, r) {
    var o = {};
    Object.keys(r).forEach(function (k) { if (k !== 'extra' && k !== 'criadoEm' && k !== 'criadoPor') o[k] = r[k]; });
    if (r.extra && typeof r.extra === 'object') Object.keys(r.extra).forEach(function (k) { o[k] = r.extra[k]; });
    return o;
  },
  config: function () {
    var c = {};
    Db.todos('Config').forEach(function (x) {
      var v = x.valor;
      if (typeof v === 'string' && /^[\[{]/.test(v)) { try { v = JSON.parse(v); } catch (e) { /* texto */ } }
      c[x.chave] = v;
    });
    return c;
  },
  admins: function () {
    var a = Sync.config().admins;
    return Array.isArray(a) && a.length ? a : ['Lucca'];
  },
  carregar: function (sess) {
    var out = { usuario: sess.usuario, hoje: hoje_(), config: Sync.config() };
    Object.keys(ABAS_APP).forEach(function (aba) {
      out[ABAS_APP[aba]] = Db.todos(aba).map(function (r) { return Sync.doLinha(aba, r); });
    });
    out.dreHistorico = Db.todos('DreHistorico');
    var admin = Sync.admins().indexOf(sess.usuario) >= 0;
    out.admin = admin;
    out.usuarios = Db.todos('Usuarios').filter(function (u) { return String(u.ativo).toUpperCase() !== 'FALSE'; }).map(function (u) {
      var x = { nome: u.nome, temSenha: !!u.hash };
      if (admin && !u.hash && u.convite) x.convite = String(u.convite);
      return x;
    });
    var logs = Db.todos('Logs');
    out.logs = logs.slice(Math.max(0, logs.length - 1000)).reverse();
    return out;
  },
  // mud: { Contas: { up: [...], del: [ids] }, ..., Config: { prazoOficinas: 20 } }
  aplicar: function (d, sess) {
    var mud = d.mud || {};
    Object.keys(mud).forEach(function (aba) {
      if (aba !== 'Config' && !ABAS_APP[aba]) throw Auth.erro('aba_proibida', 'O app não pode gravar na aba ' + aba + '.');
    });
    return mutar_(sess, d.tela || '', function () {
      var agora = agora_(), novosClientes = {};
      Object.keys(ABAS_APP).forEach(function (aba) {
        var m = mud[aba];
        if (!m) return;
        var k = chaveDe_(aba);
        var atuais = {};
        if (aba === 'Despesas' || aba === 'Entradas' || aba === 'Contas') Db.todos(aba).forEach(function (r) { atuais[String(r[k])] = r; });
        var ups = (m.up || []).map(function (o) {
          if (o[k] === undefined || o[k] === null || o[k] === '') throw Auth.erro('sem_chave', 'Registro sem ' + k + ' na aba ' + aba + '.');
          var r = Sync.paraLinha(aba, o), antes = atuais[String(o[k])];
          if (aba === 'Despesas' || aba === 'Entradas') {
            // O responsável é sempre quem estava logado quando lançou; não muda depois.
            r.resp = antes ? antes.resp : sess.usuario;
            r.criadoEm = antes ? antes.criadoEm : agora;
            if (aba === 'Entradas' && r.cli) novosClientes[String(r.cli).trim()] = true;
          }
          if (aba === 'Contas') { r.criadoEm = antes ? antes.criadoEm : agora; r.criadoPor = antes ? antes.criadoPor : sess.usuario; }
          return r;
        });
        Db.gravarLote(aba, ups, m.del || []);
      });
      var cli = Object.keys(novosClientes).filter(function (n) { return n; });
      if (cli.length) {
        var ja = {};
        Db.todos('Clientes').forEach(function (c) { ja[String(c.nome).toUpperCase()] = true; });
        var faltam = cli.filter(function (n) { return !ja[n.toUpperCase()]; }).map(function (n) { return { nome: n }; });
        if (faltam.length) Db.gravarLote('Clientes', faltam, []);
      }
      if (mud.Config) {
        Object.keys(mud.Config).forEach(function (chave) {
          if (CONFIG_EDITAVEL.indexOf(chave) < 0) throw Auth.erro('config_proibida', 'Configuração não editável pelo app: ' + chave);
          var v = mud.Config[chave];
          if (v !== null && typeof v === 'object') v = JSON.stringify(v);
          Db.gravarLote('Config', [{ chave: chave, valor: v }], []);
        });
      }
      return { msg: String(d.msg || 'Alteração salva') };
    });
  }
};

// ---- usuários (só administradores) ----
var Usuarios = {
  exigirAdmin_: function (sess) {
    if (Sync.admins().indexOf(sess.usuario) < 0) throw Auth.erro('sem_permissao', 'Só o administrador pode mexer em usuários.');
  },
  convite_: function () {
    var letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    var u = Utilities.getUuid().replace(/-/g, '');
    for (var i = 0; i < 6; i++) s += letras.charAt(parseInt(u.substr(i * 2, 2), 16) % letras.length);
    return s;
  },
  encerrarSessoes_: function (nome) {
    var c = CacheService.getScriptCache();
    Db.todos('Sessoes').filter(function (s) { return s.usuario === nome; }).forEach(function (s) {
      c.remove('s:' + s.token);
      Db.remover('Sessoes', s.token);
    });
  },
  adicionar: function (d, sess) {
    Usuarios.exigirAdmin_(sess);
    var nome = String(d.nome || '').trim();
    if (!nome) throw Auth.erro('nome', 'Informe o nome.');
    if (Db.pegar('Usuarios', nome)) throw Auth.erro('existe', nome + ' já existe.');
    var convite = Usuarios.convite_();
    return mutar_(sess, 'cfg', function () {
      Db.inserir('Usuarios', { nome: nome, convite: convite, ativo: true, criadoEm: agora_() });
      return { msg: 'Usuário ' + nome + ' adicionado', convite: convite };
    });
  },
  redefinir: function (d, sess) {
    Usuarios.exigirAdmin_(sess);
    var nome = String(d.nome || '');
    if (!Db.pegar('Usuarios', nome)) throw Auth.erro('nome', 'Usuário não encontrado.');
    var convite = Usuarios.convite_();
    return mutar_(sess, 'cfg', function () {
      Db.atualizar('Usuarios', nome, { salt: null, hash: null, convite: convite });
      Usuarios.encerrarSessoes_(nome);
      return { msg: 'Senha de ' + nome + ' redefinida', convite: convite };
    });
  }
};

acao_('dados.carregar', function (d, s) { return Sync.carregar(s); });
acao_('sync.aplicar', function (d, s) { return Sync.aplicar(d, s); });
acao_('logs.registrar', function (d, s) { Logs.registrar(s.usuario, String(d.tela || ''), String(d.txt || '').slice(0, 500)); return true; });
acao_('usuarios.adicionar', function (d, s) { return Usuarios.adicionar(d, s); });
acao_('usuarios.redefinir', function (d, s) { return Usuarios.redefinir(d, s); });
