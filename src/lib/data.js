// Dados 100% fictícios, gerados com semente fixa (mesmo resultado em todo acesso).
import { HOJE } from './logic.js';
let s = 20261107;
const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const addDias = (iso, n) => new Date(new Date(iso).getTime() + n * 864e5).toISOString().slice(0, 10);

const nomes = ['Helena','Otávio','Marina','Caetano','Luíza','Tomás','Beatriz','Rafael','Cecília','Davi','Alice','Henrique','Valentina','Samuel','Laura','Gael','Isadora','Bruno','Manuela','Íris','Mateus','Sofia','Joaquim','Clara','Enzo','Yasmin','Augusto','Lívia','Nicolas','Rebeca'];
const sobrenomes = ['Albuquerque','Bastos','Cardoso','Duarte','Esteves','Fontoura','Guedes','Horta','Iglesias','Jardim','Klein','Lacerda','Medeiros','Nogueira','Osório','Pacheco','Queiroz','Rangel','Siqueira','Teles'];
const cidades = ['Curitiba','São José dos Pinhais','Londrina','Maringá','Ponta Grossa','Joinville','Florianópolis','Porto Alegre'];

export const campanhas = [
  { id: 'c1', nome: 'Merenda de Inverno', meta: 30000, fim: '2026-12-20', cor: '#d9622b', desc: 'Refeições quentes para 320 crianças das escolas parceiras durante o recesso.' },
  { id: 'c2', nome: 'Biblioteca Itinerante', meta: 25000, fim: '2027-02-28', cor: '#14453d', desc: 'Uma van com 1.800 livros circulando por seis bairros da periferia.' },
  { id: 'c3', nome: 'Cisternas do Sertão', meta: 40000, fim: '2027-03-31', cor: '#2f6f9f', desc: 'Captação de água de chuva para 40 famílias no semiárido.' },
  { id: 'c4', nome: 'Oficina de Costura Solidária', meta: 12000, fim: '2026-11-30', cor: '#8a4b8f', desc: 'Máquinas e formação para um coletivo de 18 mulheres.' },
  { id: 'c5', nome: 'Fundo Permanente', meta: 90000, fim: '2027-12-31', cor: '#b08a1e', desc: 'Doações mensais que mantêm a equipe e a sede o ano todo.' },
];

export const doadores = Array.from({ length: 42 }, (_, i) => {
  const n = nomes[i % nomes.length], sn = sobrenomes[(i * 7 + 3) % sobrenomes.length];
  return { id: 'd' + (i + 1), nome: `${n} ${sn}`, email: `${n}.${sn}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@exemplo.org', cidade: pick(cidades), desde: addDias(HOJE, -Math.floor(rnd() * 700 + 40)), recorrente: rnd() < 0.38, nota: '' };
});

export const doacoes = [];
doadores.forEach((d) => {
  const base = pick([40, 60, 80, 120, 200, 350, 600, 1200, 2500]);
  const qtd = d.recorrente ? 8 + Math.floor(rnd() * 5) : 1 + Math.floor(rnd() * 3);
  let data = addDias(HOJE, -Math.floor(rnd() * (d.recorrente ? 40 : 330)));
  if (d.recorrente && rnd() < 0.2) data = addDias(HOJE, -(50 + Math.floor(rnd() * 40)));
  for (let k = 0; k < qtd; k++) {
    const camp = d.recorrente ? (rnd() < 0.7 ? 'c5' : pick(campanhas).id) : pick(campanhas).id;
    doacoes.push({ id: `g${doacoes.length + 1}`, doadorId: d.id, campanhaId: camp, valor: d.recorrente ? base : Math.round(base * (0.6 + rnd())), data, forma: pick(['Pix', 'Pix', 'Cartão', 'Boleto']) });
    data = addDias(data, -(d.recorrente ? 30 : 45 + Math.floor(rnd() * 120)));
  }
});
doacoes.sort((a, b) => (a.data < b.data ? 1 : -1));

export const voluntarios = [
  ['Ana Beatriz Moraes','Cozinha','Tardes de sáb.'],['Caio Vasconcelos','Logística','Manhãs de seg.'],['Dália Ferrer','Educação','Qua. e sex.'],['Elias Montenegro','Comunicação','Flexível'],
  ['Fátima Rosário','Cozinha','Tardes de sáb.'],['Gustavo Pinheiro','Educação','Ter. à noite'],['Heloísa Camargo','Costura','Qui. à tarde'],['Ícaro Salgado','Logística','Fins de semana'],
  ['Jussara Brandão','Costura','Qui. à tarde'],['Kauê Mendonça','Comunicação','Flexível'],['Lorena Vidal','Educação','Qua. e sex.'],['Murilo Aragão','Cozinha','Dom. de manhã'],
  ['Nádia Quintela','Logística','Manhãs de seg.'],['Orlando Prado','Educação','Ter. à noite'],['Pietra Lemos','Comunicação','Flexível'],['Quirino Assis','Cozinha','Tardes de sáb.'],
].map(([nome, area, disp], i) => ({ id: 'v' + (i + 1), nome, area, disp, status: i % 7 === 6 ? 'Em pausa' : i % 11 === 10 ? 'Em integração' : 'Ativo', desde: addDias(HOJE, -Math.floor(rnd() * 600 + 20)) }));

export const horas = [];
voluntarios.forEach((v) => { const q = 3 + Math.floor(rnd() * 9); for (let k = 0; k < q; k++) horas.push({ id: `h${horas.length + 1}`, voluntarioId: v.id, data: addDias(HOJE, -Math.floor(rnd() * 120)), horas: pick([2, 3, 4, 4, 6]), atividade: v.area }); });
horas.sort((a, b) => (a.data < b.data ? 1 : -1));
