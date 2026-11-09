import { describe, it, expect } from 'vitest';
import { carregarServidor, chamar } from './carregar.js';

const SHA = 'a'.repeat(40), SENHA = 'senha-de-publicacao-de-teste-123';
function servidor() {
  const g = carregarServidor();
  g.props.set('DEPLOY_SENHA', SENHA);
  g.props.set('DEPLOY_ID', 'DEP1');
  g.fetches.responder = (url, o) => {
    if (url.startsWith('https://raw.githubusercontent.com/')) {
      if (url.endsWith('/.clasp.json')) return { code: 200, body: JSON.stringify({ filePushOrder: ['apps-script/Schema.js', 'apps-script/Main.js'] }) };
      return { code: 200, body: '// ' + url };
    }
    if (url.endsWith('/versions')) return { code: 200, body: JSON.stringify({ versionNumber: 7 }) };
    return { code: 200, body: '{}' };
  };
  return g;
}

describe('deploy.publicar', () => {
  it('recusa sem a senha certa e com commit inválido', () => {
    const g = servidor();
    expect(chamar(g, 'deploy.publicar', { sha: SHA, senha: 'errada' }).codigo).toBe('sem_permissao');
    expect(chamar(g, 'deploy.publicar', { sha: 'main', senha: SENHA }).codigo).toBe('deploy_sha');
    g.props.delete('DEPLOY_SENHA');
    expect(chamar(g, 'deploy.publicar', { sha: SHA, senha: SENHA }).codigo).toBe('sem_permissao');
    expect(g.fetches.feitos).toHaveLength(0);
  });
  it('baixa os arquivos do commit, troca o código, cria versão e atualiza a implantação', () => {
    const g = servidor();
    const r = chamar(g, 'deploy.publicar', { sha: SHA, senha: SENHA });
    expect(r).toMatchObject({ ok: true, dados: { versao: 7, arquivos: 3 } });
    const api = g.fetches.feitos.filter((f) => f.url.startsWith('https://script.googleapis.com/'));
    expect(api.map((f) => f.o.method + ' ' + f.url.replace('https://script.googleapis.com/v1/projects/SCRIPT123', ''))).toEqual(['put /content', 'post /versions', 'put /deployments/DEP1']);
    const files = JSON.parse(api[0].o.payload).files;
    expect(files.map((f) => f.name + ':' + f.type)).toEqual(['Schema:SERVER_JS', 'Main:SERVER_JS', 'appsscript:JSON']);
    expect(files[0].source).toContain('/' + SHA + '/apps-script/Schema.js');
    expect(JSON.parse(api[2].o.payload).deploymentConfig).toMatchObject({ versionNumber: 7, scriptId: 'SCRIPT123' });
    expect(api[0].o.headers.Authorization).toBe('Bearer tok');
  });
  it('erro da API vira mensagem clara', () => {
    const g = servidor();
    const base = g.fetches.responder;
    g.fetches.responder = (url, o) => (url.endsWith('/content') ? { code: 403, body: '{"error":"PERMISSION_DENIED"}' } : base(url, o));
    expect(chamar(g, 'deploy.publicar', { sha: SHA, senha: SENHA })).toMatchObject({ ok: false, codigo: 'deploy_api' });
  });
});
