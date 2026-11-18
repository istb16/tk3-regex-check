<script lang="ts">
  import type { MatchResult } from '../types';
  import { groupColor, tint } from '../highlighter';
  import { langStore } from '../i18n.svelte';

  const { matches, flags }: { matches: MatchResult[]; flags: string } = $props();

  const t = $derived(langStore.t);

  let selected = $state(0);
  const hasIndices = $derived(flags.includes('d'));
  const current    = $derived(matches[selected] ?? null);

  // Reset selection whenever the match list changes (e.g. new pattern entered).
  $effect(() => { if (matches) selected = 0; });
</script>

{#if matches.length === 0}
  <div class="flex items-center justify-center h-full text-muted text-sm">
    {t.matches.noMatchesFound}
  </div>
{:else}
  <div class="flex flex-col h-full min-h-0">
    <!-- Match selector tabs -->
    <div class="flex gap-1 px-2 py-1.5 overflow-x-auto border-b border-line shrink-0">
      {#each matches as m, i}
        <button
          onclick={() => selected = i}
          class="shrink-0 px-2 py-0.5 rounded text-xs font-mono transition-all {selected === i
            ? 'bg-accent text-on-accent border border-accent'
            : 'text-muted hover:text-ink border border-transparent hover:border-line'}"
        >
          #{i + 1}
        </button>
      {/each}
      {#if matches.length >= 500}
        <span class="text-[10px] text-rx-amber flex items-center px-2">{t.matches.limit}</span>
      {/if}
    </div>

    <!-- Match detail -->
    {#if current}
      <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        <!-- Full match -->
        <div>
          <div class="text-[10px] uppercase tracking-wider text-muted mb-1">{t.matches.fullMatch(selected + 1)}</div>
          <div class="rounded bg-bg border border-line p-2 flex items-start gap-3">
            <code class="text-sm text-rx-violet flex-1 break-all">{current.value || t.matches.empty}</code>
            {#if hasIndices}
              <span class="text-[10px] text-muted shrink-0">[{current.start}…{current.end}]</span>
            {:else}
              <span class="text-[10px] text-muted shrink-0">@{current.index}</span>
            {/if}
          </div>
        </div>

        <!-- Groups -->
        {#if current.groups.length > 0}
          <div>
            <div class="text-[10px] uppercase tracking-wider text-muted mb-1">{t.matches.captureGroups}</div>
            <div class="flex flex-col gap-1">
              {#each current.groups as g}
                {@const c = groupColor(g.index)}
                <div class="rounded border border-line p-2 flex items-center gap-2 bg-bg">
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0"
                    style="background: {tint(c)}; color: {c}"
                  >
                    {g.name ? `«${g.name}»` : `#${g.index}`}
                  </span>
                  <code class="text-sm flex-1 break-all" style="color: {c}">
                    {g.value || t.matches.empty}
                  </code>
                  {#if hasIndices}
                    <span class="text-[10px] text-muted shrink-0">[{g.start}…{g.end}]</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}
