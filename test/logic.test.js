import { describe, it, expect } from 'vitest';
import { nivel, situacao, serieMensal, progresso, validaDoacao, totalDoador } from '../src/lib/logic.js';
import { doadores, doacoes, campanhas } from '../src/lib/data.js';

describe('logic', () => {
  it('nivel por total doado', () => { expect(nivel(0)).toBe('Novo'); expect(nivel(100)).toBe('Amigo'); expect(nivel(3000)).toBe('Aliado'); expect(nivel(10000)).toBe('Guardião'); });
  it('situacao: recorrente atrasado fica em risco', () => {
    const d = { id: 'x', recorrente: true };
    expect(situacao(d, [{ doadorId: 'x', data: '2026-10-20', valor: 1 }])).toBe('Ativo');
    expect(situacao(d, [{ doadorId: 'x', data: '2026-08-01', valor: 1 }])).toBe('Em risco');
    expect(situacao({ id: 'y', recorrente: false }, [])).toBe('Sem doação');
  });
  it('serie mensal tem 12 meses e soma só o que cai na janela', () => {
    const s = serieMensal([{ data: '2026-11-02', valor: 10 }, { data: '2026-11-05', valor: 5 }, { data: '2020-01-01', valor: 99 }]);
    expect(s).toHaveLength(12); expect(s[11].valor).toBe(15);
  });
  it('progresso limita a 100%', () => { expect(progresso({ id: 'a', meta: 10 }, [{ campanhaId: 'a', valor: 50 }])).toBe(100); });
  it('valida doacao', () => { expect(validaDoacao({ valor: 0, doadorId: 'd1', campanhaId: 'c1' })).toMatch(/valor/); expect(validaDoacao({ valor: 5, doadorId: 'd1', campanhaId: 'c1' })).toBe(''); });
  it('dados de exemplo coerentes', () => {
    expect(doadores.length).toBeGreaterThan(30); expect(campanhas).toHaveLength(5);
    expect(doacoes.every((g) => doadores.some((d) => d.id === g.doadorId))).toBe(true);
    expect(totalDoador(doacoes, 'd1')).toBeGreaterThan(0);
  });
});
