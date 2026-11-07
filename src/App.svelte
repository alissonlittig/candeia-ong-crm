<script>
  import { db, addDoacao, addDoador, addVoluntario, restaurar } from './lib/store.svelte.js';
  import { validaDoacao } from './lib/logic.js';
  import Painel from './views/Painel.svelte';
  import Doadores from './views/Doadores.svelte';
  import Campanhas from './views/Campanhas.svelte';
  import Voluntarios from './views/Voluntarios.svelte';

  const abas = [
    { id: 'painel', nome: 'Painel', ic: 'M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z' },
    { id: 'doadores', nome: 'Doadores', ic: 'M12 21s-7-4.6-9.3-9.2C1.1 8.5 3 5 6.3 5c2 0 3.3 1 4.2 2.4h3C14.4 6 15.700 5 17.700 5 21 5 22.900 8.500 21.300 11.800 19 16.400 12 21 12 21z' },
    { id: 'campanhas', nome: 'Campanhas', ic: 'M4 21V4h13l-2 4 2 4H6v9z' },
    { id: 'voluntarios', nome: 'Voluntários', ic: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 13c-3.300 0-6 1.800-6 4v3h12v-3c0-2.200-2.700-4-6-4zm8 0c-.5 0-1 .1-1.500.2 1.500 1 2.500 2.300 2.500 3.800v3h4v-3c0-2-2.200-4-5-4z' },
  ];
  let aba = $state(location.hash.slice(1) || 'painel');
  if (!abas.some((a) => a.id === aba)) aba = 'painel';
  const ir = (id) => { aba = id; location.hash = id; window.scrollTo(0, 0); };

  let dlgDoacao, dlgDoador;
  let toast = $state('');
  const avisa = (t) => { toast = t; setTimeout(() => (toast = ''), 2600); };
  let f = $state({ doadorId: '', campanhaId: '', valor: '', forma: 'Pix' });
  let erro = $state('');
  let g = $state({ nome: '', email: '', cidade: '', recorrente: false });

  function abreDoacao(doadorId = '') { f = { doadorId, campanhaId: '', valor: '', forma: 'Pix' }; erro = ''; dlgDoacao.showModal(); }
  function salvaDoacao(e) {
    e.preventDefault();
    erro = validaDoacao(f);
    if (erro) return;
    addDoacao({ ...f });
    dlgDoacao.close(); avisa('Doação registrada.');
  }
  function salvaDoador(e) {
    e.preventDefault();
    if (!g.nome.trim() || !/^\S+@\S+\.\S+$/.test(g.email)) { erro = 'Informe nome e um e-mail válido.'; return; }
    addDoador({ ...g, nome: g.nome.trim() });
    dlgDoador.close(); avisa('Doador cadastrado.');
  }
  const abreDoador = () => { g = { nome: '', email: '', cidade: '', recorrente: false }; erro = ''; dlgDoador.showModal(); };
  const ctx = { abreDoacao, abreDoador, avisa };
</script>

<div class="app">
  <aside class="side">
    <div class="brand">
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#f5f0e6"/><path d="M32 10c6 9 11 15 11 23a11 11 0 0 1-22 0c0-4 2-7 4-9 1 3 3 5 5 5 0-8-2-12 2-19z" fill="#c4501b"/></svg>
      <span>Candeia<small>Instituto Candeia</small></span>
    </div>
    <nav class="nav" aria-label="Principal">
      {#each abas as a}
        <button aria-current={aba === a.id ? 'page' : undefined} onclick={() => ir(a.id)}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={a.ic}/></svg>{a.nome}
        </button>
      {/each}
    </nav>
    <div class="aviso">Demonstração com dados fictícios. Nomes, valores e organização não existem. Tudo fica salvo só neste navegador.
      <br><button onclick={() => { restaurar(); avisa('Dados de exemplo restaurados.'); }}>Restaurar exemplo</button></div>
  </aside>

  <main>
    {#if aba === 'painel'}<Painel {ctx} />
    {:else if aba === 'doadores'}<Doadores {ctx} />
    {:else if aba === 'campanhas'}<Campanhas {ctx} />
    {:else}<Voluntarios {ctx} />{/if}
  </main>
</div>

<nav class="tabs" aria-label="Principal (celular)">
  {#each abas as a}
    <button aria-current={aba === a.id ? 'page' : undefined} onclick={() => ir(a.id)}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={a.ic}/></svg>{a.nome}
    </button>
  {/each}
</nav>

<dialog bind:this={dlgDoacao} aria-labelledby="t1">
  <form class="dlg" onsubmit={salvaDoacao}>
    <h2 id="t1">Registrar doação</h2>
    <div class="f">
      <label>Doador
        <select bind:value={f.doadorId}><option value="">Selecione…</option>{#each db.doadores as d}<option value={d.id}>{d.nome}</option>{/each}</select></label>
      <label>Campanha
        <select bind:value={f.campanhaId}><option value="">Selecione…</option>{#each db.campanhas as c}<option value={c.id}>{c.nome}</option>{/each}</select></label>
      <div class="two">
        <label>Valor (R$)<input type="number" min="1" step="1" inputmode="numeric" bind:value={f.valor}></label>
        <label>Forma<select bind:value={f.forma}><option>Pix</option><option>Cartão</option><option>Boleto</option></select></label>
      </div>
      <p class="err" role="alert">{erro}</p>
      <div class="acts"><button type="button" class="btn ghost" onclick={() => dlgDoacao.close()}>Cancelar</button><button class="btn">Salvar doação</button></div>
    </div>
  </form>
</dialog>

<dialog bind:this={dlgDoador} aria-labelledby="t2">
  <form class="dlg" onsubmit={salvaDoador}>
    <h2 id="t2">Novo doador</h2>
    <div class="f">
      <label>Nome<input bind:value={g.nome} autocomplete="off"></label>
      <div class="two"><label>E-mail<input type="email" bind:value={g.email} autocomplete="off"></label><label>Cidade<input bind:value={g.cidade}></label></div>
      <label class="chk"><input type="checkbox" bind:checked={g.recorrente}> Doação mensal recorrente</label>
      <p class="err" role="alert">{erro}</p>
      <div class="acts"><button type="button" class="btn ghost" onclick={() => dlgDoador.close()}>Cancelar</button><button class="btn">Cadastrar</button></div>
    </div>
  </form>
</dialog>

{#if toast}<div class="toast" role="status">{toast}</div>{/if}
