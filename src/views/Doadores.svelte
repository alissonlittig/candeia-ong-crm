<script>
  import { db, setNota } from '../lib/store.svelte.js';
  import { brl, dataBR, totalDoador, nivel, situacao, ultimaDoacao } from '../lib/logic.js';
  let { ctx } = $props();
  let q = $state(''), filtro = $state('Todos'), sel = $state(null), dlg;

  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const linhas = $derived(
    db.doadores
      .map((d) => ({ ...d, total: totalDoador(db.doacoes, d.id), sit: situacao(d, db.doacoes), ult: ultimaDoacao(db.doacoes, d.id) }))
      .map((d) => ({ ...d, nivel: nivel(d.total) }))
      .filter((d) => (filtro === 'Todos' || d.nivel === filtro || (filtro === 'Recorrentes' && d.recorrente) || (filtro === 'Em risco' && d.sit === 'Em risco')) && norm(d.nome + d.email + d.cidade).includes(norm(q)))
      .sort((a, b) => b.total - a.total)
  );
  const atual = $derived(sel && linhas.find((d) => d.id === sel.id) ? linhas.find((d) => d.id === sel.id) : sel ? { ...sel, total: totalDoador(db.doacoes, sel.id), sit: situacao(sel, db.doacoes), nivel: nivel(totalDoador(db.doacoes, sel.id)), ult: ultimaDoacao(db.doacoes, sel.id) } : null);
  const hist = $derived(atual ? db.doacoes.filter((g) => g.doadorId === atual.id).slice(0, 8) : []);
  const camp = (id) => db.campanhas.find((c) => c.id === id)?.nome ?? '—';
  const cor = { Guardião: 'gold', Aliado: 'ok', Amigo: '', Novo: '' };
  const corS = { Ativo: 'ok', 'Em risco': 'warn', Inativo: 'bad', 'Sem doação': '' };
  function abre(d) { sel = d; dlg.showModal(); }
</script>

<header class="top">
  <div><h1>Doadores</h1><p>{linhas.length} de {db.doadores.length} pessoas · quem sustenta o trabalho</p></div>
  <button class="btn" onclick={ctx.abreDoador}>+ Novo doador</button>
</header>

<div class="tools">
  <input type="search" placeholder="Buscar doador" aria-label="Buscar doadores" bind:value={q}>
  <select aria-label="Filtrar" bind:value={filtro}>
    {#each ['Todos', 'Guardião', 'Aliado', 'Amigo', 'Recorrentes', 'Em risco'] as o}<option>{o}</option>{/each}
  </select>
</div>

<div class="card tw" style="padding:4px 8px">
  <table>
    <thead><tr><th>Doador</th><th>Nível</th><th class="hide-m">Situação</th><th class="hide-m">Última</th><th class="num">Total</th></tr></thead>
    <tbody>
      {#each linhas as d (d.id)}
        <tr class="click" onclick={() => abre(d)} onkeydown={(e) => e.key === 'Enter' && abre(d)} tabindex="0">
          <td><span class="name">{d.nome}<small>{d.cidade}{d.recorrente ? ' · mensal' : ''}</small></span></td>
          <td><span class="tag {cor[d.nivel]}">{d.nivel}</span></td>
          <td class="hide-m"><span class="tag {corS[d.sit]}">{d.sit}</span></td>
          <td class="hide-m">{d.ult ? dataBR(d.ult) : '—'}</td>
          <td class="num val">{brl(d.total)}</td>
        </tr>
      {:else}
        <tr><td colspan="5" class="vazio">Nenhum doador com esse filtro.</td></tr>
      {/each}
    </tbody>
  </table>
</div>

<dialog bind:this={dlg} aria-label="Ficha do doador">
  {#if atual}
    <div class="dlg det">
      <button class="btn ghost sm x" onclick={() => dlg.close()} aria-label="Fechar">Fechar</button>
      <div><h2>{atual.nome}</h2><span class="tag {cor[atual.nivel]}">{atual.nivel}</span> <span class="tag {corS[atual.sit]}">{atual.sit}</span></div>
      <dl>
        <dt>E-mail</dt><dd>{atual.email}</dd><dt>Cidade</dt><dd>{atual.cidade}</dd>
        <dt>Apoia desde</dt><dd>{dataBR(atual.desde)}</dd><dt>Total doado</dt><dd class="val">{brl(atual.total)}</dd>
      </dl>
      <div>
        <strong>Histórico</strong>
        <ul class="list">{#each hist as g}<li><span>{camp(g.campanhaId)}<span class="sub">{dataBR(g.data)} · {g.forma}</span></span><span class="val">{brl(g.valor)}</span></li>{:else}<li class="vazio">Sem doações ainda.</li>{/each}</ul>
      </div>
      <div class="f"><label>Anotações da equipe
        <textarea rows="2" value={atual.nota} onchange={(e) => { setNota(atual.id, e.currentTarget.value); ctx.avisa('Anotação salva.'); }}></textarea></label></div>
      <div class="acts"><button class="btn" onclick={() => { dlg.close(); ctx.abreDoacao(atual.id); }}>Registrar doação</button></div>
    </div>
  {/if}
</dialog>
