import { describe, it, expect } from 'vitest';
import { carregarServidor } from './carregar.js';

describe('Db', () => {
  it('insere, lê, atualiza e remove pela chave', () => {
    const { Db } = carregarServidor();
    Db.inserir('Fornecedores', { id: 'f1', nome: 'ENERGISA', cat: 'UTILIDADES', sub: '' });
    expect(Db.pegar('Fornecedores', 'f1')).toEqual({ id: 'f1', nome: 'ENERGISA', cat: 'UTILIDADES', sub: null });
    Db.atualizar('Fornecedores', 'f1', { sub: 'ENERGIA ELETRICA' });
    expect(Db.todos('Fornecedores')[0].sub).toBe('ENERGIA ELETRICA');
    Db.remover('Fornecedores', 'f1');
    expect(Db.todos('Fornecedores')).toEqual([]);
  });
  it('reverte o diário na ordem inversa', () => {
    const { Db } = carregarServidor();
    Db.inserir('Fornecedores', { id: 'f1', nome: 'A', cat: 'X', sub: '' });
    Db.iniciarDiario();
    Db.atualizar('Fornecedores', 'f1', { nome: 'B' });
    Db.inserir('Fornecedores', { id: 'f2', nome: 'C', cat: 'X', sub: '' });
    Db.remover('Fornecedores', 'f1');
    Db.reverter(Db.fecharDiario());
    expect(Db.todos('Fornecedores').map((f) => f.id + f.nome)).toEqual(['f1A']);
  });
  it('erro claro quando o registro não existe', () => {
    const { Db } = carregarServidor();
    expect(() => Db.atualizar('Contas', 'nao-existe', {})).toThrow('Registro não encontrado: Contas nao-existe');
  });
});
