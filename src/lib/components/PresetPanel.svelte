<script lang="ts">
  import { presets, categories } from '../presets';
  import type { Preset } from '../types';
  import { langStore } from '../i18n.svelte';

  const {
    onSelect,
    activeId,
  }: { onSelect: (p: Preset) => void; activeId: string } = $props();

  const t = $derived(langStore.t);

  let filterCategory = $state('All');
  let search = $state('');

  const filtered = $derived(
    presets.filter(p =>
      (filterCategory === 'All' || p.category === filterCategory) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    )
  );
</script>

<div class="flex flex-col h-full min-h-0 gap-2 p-3">
  <input
    type="search"
    placeholder={t.presets.searchPlaceholder}
    bind:value={search}
    class="w-full bg-[#13141e] border border-[#1e2030] rounded px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-violet-500/50 placeholder:text-slate-600"
  />

  <!-- Category filter -->
  <div class="flex flex-wrap gap-1">
    {#each ['All', ...categories] as cat}
      <button
        onclick={() => filterCategory = cat}
        class="text-[10px] px-2 py-0.5 rounded border transition-all {filterCategory === cat
          ? 'border-violet-500/60 bg-violet-500/20 text-violet-300'
          : 'border-[#1e2030] text-slate-600 hover:text-slate-400 hover:border-[#2d3050]'}"
      >
        {t.categories[cat] ?? cat}
      </button>
    {/each}
  </div>

  <!-- Preset list -->
  <div class="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
    {#each filtered as p}
      <button
        onclick={() => onSelect(p)}
        class="text-left rounded-lg border p-2.5 transition-all w-full {activeId === p.id
          ? 'border-violet-500/60 bg-violet-500/10'
          : 'border-[#1e2030] bg-[#13141e] hover:border-[#2d3050] hover:bg-[#1a1b26]'}"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-semibold text-[#f0f4ff]">{p.name}</span>
          {#if p.aiGenerated}
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 ml-auto">AI⚠</span>
          {/if}
        </div>
        <p class="text-[10px] text-slate-500 leading-relaxed">{p.description}</p>
        <div class="mt-1.5 flex items-center gap-1">
          <code class="text-[9px] text-violet-400/60 truncate max-w-[200px]">{p.pattern.slice(0, 40)}{p.pattern.length > 40 ? '…' : ''}</code>
          <span class="ml-auto text-[9px] text-slate-600">/{p.flags}</span>
        </div>
      </button>
    {/each}
    {#if filtered.length === 0}
      <div class="text-center text-slate-600 text-xs py-6">{t.presets.noPresetsFound}</div>
    {/if}
  </div>
</div>
