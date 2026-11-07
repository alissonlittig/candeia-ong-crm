<script>
  import { db, addVoluntario, setStatus, addHoras } from '../lib/store.svelte.js';
  import { dataBR, horasVoluntario } from '../lib/logic.js';
  let { ctx } = $props();
  const areas = ['Cozinha', 'Logística', 'Educação', 'Comunicação', 'Costura'];
  let area = $state('Todas'), dlgNovo, dlgHoras, erro = $state('');
  let n = $state({ nome: '', area: 'Cozinha', disp: '' });
  let h = $state({ voluntarioId: '', horas: 4 });
  const lista = $derived(db.voluntarios.filter((v) => area === 'Todas' || v.area === area));
  const total = $derived(db.horas.reduce((s, x) => s + x.horas, 0));
  const cor = { Ativo: 'ok', 'Em pausa': 'warn', 'Em integração': 'ember' };
  const proximo = { Ativo: 'Em pausa', 'Em pausa': 'Ativo', 'Em integração': 'Ativo' };

  function novo(e) {
    e.preventDefault();
    if (!n.nome.trim()) { erro = 'Informe o nome.'; return; }
    addVoluntario({ ...n, nome: n.nome.trim(), disp: n.disp || 'A combinar' });
    dlgNovo.close(); ctx.avisa('Voluntário cadastrado.');
  }
  function horas(e) {
    e.preventDefault();
    const v = db.voluntarios.find((x) => x.id === h.voluntarioId);
    if (!v || !(Number(h.horas) > 0)) { erro = 'Escolha o voluntário e as horas.'; return; }
    addHoras({ voluntarioId: v.id, horas: h.horas, atividade: v.area });
    dlgHoras.close(); ctx.avisa('Horas lançadas.');
  }
  const abreNovo = () => { n = { nome: '', area: 'Cozinha', disp: '' }; erro = ''; dlgNovo.showModal(); };
  const abreHoras = (id = '') => { h = { voluntarioId: id, horas: 4 }; erro = ''; dlgHoras.showModal(); };
</script>

<header class="top">
  <div><h1>Voluntários</h1><p>{db.voluntarios.length} pessoas · {total} horas doadas no período</p></div>
  <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost" onclick={() => abreHoras()}>Lançar horas</button><button class="btn" onclick={abreNovo}>+ Novo voluntário</button></div>
</header>

<div class="tools">
  <select aria-label="Filtrar por área" bind:value={area}><option>Todas</option>{#each areas as a}<option>{a}</option>{/each}</select>
</div>

<div class="card tw" style="padding:4px 8px">
  <table>
    <thead><tr><th>Voluntário</th><th class="hide-m">Área</th><th class="hide-m">Disponibilidade</th><th>Status</th><th class="num">Horas</th><th><span class="sr" style="position:absolute;left:-9999px">Ações</span></th></tr></thead>
    <tbody>
      {#each lista as v (v.id)}
        <tr>
          <td><span class="name">{v.nome}<small>{v.area} · desde {dataBR(v.desde)}</small></span></td>
          <td class="hide-m">{v.area}</td><td class="hide-m">{v.disp}</td>
          <td><span class="tag {cor[v.status]}">{v.status}</span></td>
          <td class="num val">{horasVoluntario(db.horas, v.id)} h</td>
          <td class="num"><button class="btn ghost sm" onclick={() => setStatus(v.id, proximo[v.status])} aria-label="Mudar status de {v.nome} para {proximo[v.status]}">{proximo[v.status] === 'Ativo' ? 'Ativar' : 'Pausar'}</button></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<dialog bind:this={dlgNovo} aria-labelledby="tv">
  <form class="dlg" onsubmit={novo}><h2 id="tv">Novo voluntário</h2>
    <div class="f">
      <label>Nome<input bind:value={n.nome} autocomplete="off"></label>
      <div class="two"><label>Área<select bind:value={n.area}>{#each areas as a}<option>{a}</option>{/each}</select></label>
        <label>Disponibilidade<input bind:value={n.disp} placeholder="Ex.: sábados"></label></div>
      <p class="err" role="alert">{erro}</p>
      <div class="acts"><button type="button" class="btn ghost" onclick={() => dlgNovo.close()}>Cancelar</button><button class="btn">Cadastrar</button></div>
    </div></form>
</dialog>

<dialog bind:this={dlgHoras} aria-labelledby="th">
  <form class="dlg" onsubmit={horas}><h2 id="th">Lançar horas</h2>
    <div class="f">
      <label>Voluntário<select bind:value={h.voluntarioId}><option value="">Selecione…</option>{#each db.voluntarios as v}<option value={v.id}>{v.nome}</option>{/each}</select></label>
      <label>Horas<input type="number" min="1" max="12" bind:value={h.horas}></label>
      <p class="err" role="alert">{erro}</p>
      <div class="acts"><button type="button" class="btn ghost" onclick={() => dlgHoras.close()}>Cancelar</button><button class="btn">Lançar</button></div>
    </div></form>
</dialog>
