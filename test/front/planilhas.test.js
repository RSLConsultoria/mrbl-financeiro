import { describe, it, expect } from 'vitest';
import { abasDaSemana, lerDre, lerRelatorio, montarCarga } from '../../src/app/planilhas.js';

const D = (s) => new Date(s + 'T00:00:00Z');

describe('leitura das planilhas', () => {
  it('escolhe as abas da semana atual em diante, virando o ano', () => {
    const nomes = ['ATRASADOS MRBL', '25-07 Á 31-07 ', '24 A 30-10', '31 A 06-11', '07 A 13-11', '26 A 02-01', 'LISTAS'];
    expect(abasDaSemana(nomes, '2026-11-06')).toEqual(['31 A 06-11', '07 A 13-11', '26 A 02-01']);
    expect(abasDaSemana(nomes, '2026-11-07')).toEqual(['07 A 13-11', '26 A 02-01']);
  });
  it('DRE: despesas, entradas e clientes', () => {
    const dre = lerDre({
      BASE_DESPESAS: [['Data'], [D('2026-07-01'), 'ALUGUEL', 'ALUGUEL', 'MRBL', 100.555, "Migrado de 'Jul'", null, null], [null, 'x']],
      BASE_ENTRADAS: [['Data'], [D('2026-07-02'), 'RECEBIMENTO DE CLIENTE', 'ANIMALE', '-', 50, 'Cris', "Migrado de 'Jul'"]],
      LISTAS: [['Categoria', 'Cliente'], ['A', 'ANIMALE'], ['B', null]],
    });
    expect(dre.saidas).toEqual([{ data: '2026-07-01', cat: 'ALUGUEL', sub: 'ALUGUEL', emp: 'MRBL', valor: 100.56, forn: '', resp: '', obs: '' }]);
    expect(dre.entradas[0]).toMatchObject({ cli: 'ANIMALE', nf: '', obs: '', resp: 'Cris' });
    expect(dre.clientes).toEqual(['ANIMALE']);
  });
  it('relatório: atrasados, previsão, prorrogada, pago e ligação com a DRE', () => {
    const txt = (d, nome) => d + ' ' + nome.padEnd(60) + ' 00066 24/07/2025      1     8 05      6.350,00 DESC';
    const abas = {
      '31 A 06-11': [
        [null, 'ATRASADOS '],
        [txt('25/05/2026', 'GIANOTTI LTDA'), 'GIANOTTI LTDA', 6700, 'REF 04/2026'],
        [txt('30/09/2026', 'PAULO TAVARES'), null, 0, 4000],
        [txt('10/10/2026', 'MBI CONTABILIDADE'), null, 1800, null, null, null, null, 'PAGO'],
        ['RELATÓRIO DE CONTAS A PAGAR DE 31 a 06/11'],
        [null, null, null, 'BANCO', null, 'Categoria', 'Subcategoria'],
        [D('2026-10-31'), 'RRLS CONFECÇÕES PREVISÃO', 0, 5520, null, 'ACESSORIAS', 'ACESSORIAS EM GERAL (OF)'],
        [txt('09/11/2026', 'PREFEITURA'), null, 9466.95, 'PRORROGADO VENCEU 25/10', null, 'DESPESAS TRIBUTARIAS MUNICIPAIS', 'IPTU'],
        [D('2026-11-01'), 'Previsão - Taxa', 67000, null, null, 'DESPESAS FINANCEIRAS', 'TAXA'],
        [null, 'TOTAL SEMANA', 999],
      ],
      'ATRASADOS MRBL': [['RELATÓRIO'], ['VCTO'], [D('2025-12-17'), 'SILMAQ COM', 100], [null, 'TOTAL SILMAQ', 787899.54]],
    };
    const rel = lerRelatorio(abas, ['ATRASADOS MRBL', '31 A 06-11'], '2026-11-06');
    expect(rel.linhas.map((l) => [l.data, l.forn, l.valor, l.estim, l.orig, l.pago, l.atr])).toEqual([
      ['2026-05-25', 'GIANOTTI LTDA · REF 04/2026', 6700, false, null, false, true],
      ['2026-10-10', 'MBI CONTABILIDADE', 1800, false, null, true, true],
      ['2026-10-31', 'RRLS CONFECÇÕES', 5520, true, null, false, false],
      ['2026-11-09', 'PREFEITURA', 9466.95, false, '2026-10-25', false, false],
    ]);
    expect(rel.silmaq).toMatchObject({ valor: 787899.54, de: '2025-12-17' });
    const dre = { saidas: [{ data: '2026-10-12', cat: 'DESPESAS ADMINISTRATIVA', sub: 'CONTABILIDADE', emp: 'MRBL', valor: 1800, forn: 'MBI', resp: '', obs: '' }, { data: '2026-07-01', cat: 'ALUGUEL', sub: 'ALUGUEL', emp: 'MRBL', valor: 10, forn: '', resp: '', obs: '' }], entradas: [], clientes: ['A', 'A'] };
    const c = montarCarga({ dre, rel, hoje: '2026-11-06' });
    const mbi = c.contas.find((x) => x.forn === 'MBI CONTABILIDADE');
    expect(mbi).toMatchObject({ pago: true, pagoEm: '2026-10-12', dreId: 's1' });
    expect(c.saidas[0].contaId).toBe(mbi.id);
    expect(c.contas.filter((x) => x.dreId === 's1')).toHaveLength(1);
    expect(c.contas.find((x) => x.dreId === 's2')).toMatchObject({ pago: true, forn: 'ALUGUEL' });
    expect(c.contas.find((x) => x.forn === 'RRLS CONFECÇÕES')).toMatchObject({ entrega: '2026-10-31', recebidoEm: '2026-10-31', estim: true });
    expect(c.contas.find((x) => x.forn === 'PREFEITURA').hist).toEqual([{ de: '2026-10-25', para: '2026-11-09', em: null }]);
    expect(c.contas.at(-1)).toMatchObject({ valor: 787899.54, orig: '2025-12-17' });
    expect(c.clientes).toEqual([{ nome: 'A' }]);
  });
});
