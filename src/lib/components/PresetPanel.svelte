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
    class="w-full bg-surface border border-line-strong rounded px-2.5 py-1.5 text-xs text-ink focus:border-accent placeholder:text-muted"
  />

  <!-- Category filter -->
  <div class="flex flex-wrap gap-1">
    {#each ['All', ...categories] as cat}
      <button
        onclick={() => filterCategory = cat}
        class="text-[10px] px-2 py-0.5 rounded border transition-all {filterCategory === cat
          ? 'border-accent bg-accent text-on-accent'
          : 'border-line text-muted hover:text-ink hover:border-muted'}"
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
          ? 'border-accent bg-accent/10'
          : 'border-line bg-bg hover:border-muted hover:bg-surface-2'}"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-semibold text-ink">{p.name}</span>
          {#if p.aiGenerated}
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-rx-amber/10 text-rx-amber border border-rx-amber/40 ml-auto">AI⚠</span>
          {/if}
        </div>
        <p class="text-[10px] text-muted leading-relaxed">{p.description}</p>
        <div class="mt-1.5 flex items-center gap-1">
          <code class="text-[9px] text-rx-violet truncate max-w-[200px]">{p.pattern.slice(0, 40)}{p.pattern.length > 40 ? '…' : ''}</code>
          <span class="ml-auto text-[9px] text-muted">/{p.flags}</span>
        </div>
      </button>
    {/each}
    {#if filtered.length === 0}
      <div class="text-center text-muted text-xs py-6">{t.presets.noPresetsFound}</div>
    {/if}
  </div>
</div>
