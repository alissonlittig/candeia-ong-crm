import * as seed from './data.js';
const KEY = 'candeia.v1';
const inicial = () => structuredClone({ campanhas: seed.campanhas, doadores: seed.doadores, doacoes: seed.doacoes, voluntarios: seed.voluntarios, horas: seed.horas });
function carrega() {
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (r && r.doadores) return r; } catch { /* sem dado salvo: usa a semente */ }
  return inicial();
}
export const db = $state(carrega());
const salva = () => localStorage.setItem(KEY, JSON.stringify($state.snapshot(db)));
const id = (p) => p + Date.now().toString(36) + Math.floor(Math.random() * 99);

export function addDoacao(d) { db.doacoes.unshift({ id: id('g'), forma: 'Pix', data: '2026-11-07', ...d, valor: Number(d.valor) }); salva(); }
export function addDoador(d) { const n = { id: id('d'), desde: '2026-11-07', nota: '', ...d }; db.doadores.unshift(n); salva(); return n.id; }
export function setNota(doadorId, nota) { db.doadores.find((x) => x.id === doadorId).nota = nota; salva(); }
export function addVoluntario(v) { db.voluntarios.unshift({ id: id('v'), status: 'Em integração', desde: '2026-11-07', ...v }); salva(); }
export function setStatus(vid, status) { db.voluntarios.find((x) => x.id === vid).status = status; salva(); }
export function addHoras(h) { db.horas.unshift({ id: id('h'), data: '2026-11-07', ...h, horas: Number(h.horas) }); salva(); }
export function restaurar() { Object.assign(db, inicial()); salva(); }
