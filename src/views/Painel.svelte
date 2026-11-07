<script>
  import { db } from '../lib/store.svelte.js';
  import { brl, dataBR, serieMensal, situacao, HOJE, diasEntre } from '../lib/logic.js';
  let { ctx } = $props();

  const serie = $derived(serieMensal(db.doacoes));
  const max = $derived(Math.max(...serie.map((s) => s.valor), 1));
  const ano = $derived(db.doacoes.filter((d) => diasEntre(d.data, HOJE) <= 365).reduce((s, d) => s + d.valor, 0));
  const soma = (a, b) => db.doacoes.filter((d) => diasEntre(d.data, HOJE) >= a && diasEntre(d.data, HOJE) < b).reduce((s, d) => s + d.valor, 0);
  const mes = $derived(soma(0, 30));
  const ant = $derived(soma(30, 60));
  const delta = $derived(ant ? Math.round(((mes - ant) / ant) * 100) : 0);
  const ativos = $derived(db.doadores.filter((d) => situacao(d, db.doacoes) === 'Ativo').length);
  const recorrentes = $derived(db.doadores.filter((d) => d.recorrente).length);
  const risco = $derived(db.doadores.filter((d) => situacao(d, db.doacoes) === 'Em risco'));
  const vol = $derived(db.voluntarios.filter((v) => v.status === 'Ativo').length);
  const recentes = $derived(db.doacoes.slice(0, 6));
  const nome = (id) => db.doadores.find((d) => d.id === id)?.nome ?? '—';
  const camp = (id) => db.campanhas.find((c) => c.id === id)?.nome ?? '—';
  const W = 640, H = 220, P = 28, bw = (W - P) / 12;
</script>

<header class="top">
  <div><h1>Bom dia, equipe.</h1><p>Resumo de {dataBR(HOJE)} · Instituto Candeia (organização fictícia)</p></div>
  <button class="btn" onclick={() => ctx.abreDoacao()}>+ Registrar doação</button>
</header>

<section class="grid kpis" aria-label="Indicadores">
  <div class="card kpi dest"><div class="l">Arrecadado em 12 meses</div><div class="v">{brl(ano)}</div><div class="d">{db.doacoes.length} doações registradas</div></div>
  <div class="card kpi"><div class="l">Últimos 30 dias</div><div class="v">{brl(mes)}</div><div class="d">{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% sobre os 30 dias anteriores</div></div>
  <div class="card kpi"><div class="l">Doadores ativos</div><div class="v">{ativos}</div><div class="d">{recorrentes} com doação mensal</div></div>
  <div class="card kpi"><div class="l">Voluntários ativos</div><div class="v">{vol}</div><div class="d">de {db.voluntarios.length} cadastrados</div></div>
</section>

<section class="grid cols">
  <div class="card">
    <h2>Doações por mês <small>últimos 12 meses · o mês atual está em andamento</small></h2>
    <svg class="chart" viewBox="0 0 {W} {H}" role="img" aria-label="Gráfico de barras com o total doado em cada um dos últimos 12 meses">
      {#each [0, 0.5, 1] as t}
        <line x1={P} x2={W} y1={H - 24 - t * (H - 48)} y2={H - 24 - t * (H - 48)} stroke="#e6dfd0" />
        <text x="0" y={H - 20 - t * (H - 48)}>{Math.round((max * t) / 1000)}k</text>
      {/each}
      <g class="bars">
        {#each serie as s, i}
          {@const h = (s.valor / max) * (H - 48)}
          <g><title>{s.rotulo}: {brl(s.valor)}</title>
            <rect x={P + i * bw + 5} y={H - 24 - h} width={bw - 10} height={h} rx="4" class:cur={i === 11} />
            <text x={P + i * bw + bw / 2} y={H - 8} text-anchor="middle">{s.rotulo}</text></g>
        {/each}
      </g>
    </svg>
  </div>
  <div class="card">
    <h2>Atenção: recorrentes em risco <small>{risco.length}</small></h2>
    {#if risco.length}
      <ul class="list">
        {#each risco.slice(0, 5) as d}
          <li><span class="name">{d.nome}<small>sem doar há mais de 45 dias</small></span>
            <button class="btn ghost sm" onclick={() => ctx.abreDoacao(d.id)}>Registrar</button></li>
        {/each}
      </ul>
    {:else}<p class="vazio">Nenhum doador recorrente em atraso.</p>{/if}
  </div>
</section>

<section class="card" style="margin-top:16px">
  <h2>Últimas doações</h2>
  <ul class="list">
    {#each recentes as g}
      <li><span class="name">{nome(g.doadorId)}<small>{camp(g.campanhaId)} · {g.forma} · {dataBR(g.data)}</small></span><span class="val">{brl(g.valor)}</span></li>
    {/each}
  </ul>
</section>
