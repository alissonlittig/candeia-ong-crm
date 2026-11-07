<script>
  import { db } from '../lib/store.svelte.js';
  import { brl, dataBR, arrecadado, progresso, diasEntre, HOJE } from '../lib/logic.js';
  let { ctx } = $props();
  const doadoresDe = (id) => new Set(db.doacoes.filter((g) => g.campanhaId === id).map((g) => g.doadorId)).size;
</script>

<header class="top">
  <div><h1>Campanhas</h1><p>{db.campanhas.length} frentes de arrecadação em andamento</p></div>
  <button class="btn" onclick={() => ctx.abreDoacao()}>+ Registrar doação</button>
</header>

<section class="grid camps">
  {#each db.campanhas as c (c.id)}
    {@const p = progresso(c, db.doacoes)}
    {@const dias = diasEntre(HOJE, c.fim)}
    <article class="card camp" style="--c:{c.cor}">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:start">
        <h3>{c.nome}</h3>
        <span class="tag {p >= 100 ? 'ok' : dias < 30 && p < 80 ? 'warn' : ''}">{p >= 100 ? 'Meta batida' : dias < 0 ? 'Encerrada' : `${dias} dias`}</span>
      </div>
      <p>{c.desc}</p>
      <div class="big">{brl(arrecadado(db.doacoes, c.id))}</div>
      <div class="bar" role="progressbar" aria-label="Progresso de {c.nome}" aria-valuenow={p} aria-valuemin="0" aria-valuemax="100" style="margin-top:8px"><i style="width:{p}%"></i></div>
      <div class="row"><span>{p}% de {brl(c.meta)}</span><span>{doadoresDe(c.id)} doadores</span></div>
      <div class="row"><span>Encerra em {dataBR(c.fim)}</span></div>
    </article>
  {/each}
</section>
