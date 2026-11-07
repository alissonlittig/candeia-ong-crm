// Funções puras do CRM (testadas em test/logic.test.js)
export const HOJE = '2026-11-07';
export const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const dataBR = (iso) => iso.split('-').reverse().join('/');
export const diasEntre = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

export function totalDoador(doacoes, id) {
  return doacoes.filter((d) => d.doadorId === id).reduce((s, d) => s + d.valor, 0);
}
export function nivel(total) {
  if (total >= 10000) return 'Guardião';
  if (total >= 3000) return 'Aliado';
  if (total > 0) return 'Amigo';
  return 'Novo';
}
export function ultimaDoacao(doacoes, id) {
  const l = doacoes.filter((d) => d.doadorId === id).map((d) => d.data).sort();
  return l.length ? l[l.length - 1] : null;
}
// Risco de perda: recorrente sem doação há >45 dias; pontual sem doação há >240
export function situacao(doador, doacoes, hoje = HOJE) {
  const u = ultimaDoacao(doacoes, doador.id);
  if (!u) return 'Sem doação';
  const dias = diasEntre(u, hoje);
  if (doador.recorrente) return dias > 45 ? 'Em risco' : 'Ativo';
  return dias > 240 ? 'Inativo' : 'Ativo';
}
export function serieMensal(doacoes, hoje = HOJE, meses = 12) {
  const [ano, mes] = hoje.split('-').map(Number);
  const out = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(ano, mes - 1 - i, 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rotulo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    out.push({ chave, rotulo, valor: 0 });
  }
  for (const x of doacoes) {
    const m = out.find((o) => x.data.startsWith(o.chave));
    if (m) m.valor += x.valor;
  }
  return out;
}
export function arrecadado(doacoes, campanhaId) {
  return doacoes.filter((d) => d.campanhaId === campanhaId).reduce((s, d) => s + d.valor, 0);
}
export function progresso(camp, doacoes) {
  return Math.min(100, Math.round((arrecadado(doacoes, camp.id) / camp.meta) * 100));
}
export function horasVoluntario(horas, id) {
  return horas.filter((h) => h.voluntarioId === id).reduce((s, h) => s + h.horas, 0);
}
export function validaDoacao({ valor, doadorId, campanhaId }) {
  const v = Number(valor);
  if (!doadorId) return 'Escolha o doador.';
  if (!campanhaId) return 'Escolha a campanha.';
  if (!Number.isFinite(v) || v <= 0) return 'Informe um valor maior que zero.';
  return '';
}
