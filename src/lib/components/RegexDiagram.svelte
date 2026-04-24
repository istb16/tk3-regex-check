<script lang="ts">
  import type { RegexNode } from '../types';
  import { langStore } from '../i18n.svelte';
  import DiagramNode from './DiagramNode.svelte';

  const {
    pattern,
    flags,
    error,
    ast,
  }: { pattern: string; flags: string; error: string | null; ast: RegexNode } = $props();

  const td = $derived(langStore.t.diagram);
</script>

<div class="p-3">
  {#if !pattern}
    <div class="text-slate-600 text-xs text-center py-10">{td.enterPattern}</div>
  {:else if error}
    <div class="text-red-400 text-xs p-3 bg-red-500/10 rounded-lg border border-red-500/30">
      <div class="font-semibold mb-1">⚠ {td.invalidPattern}</div>
      {error}
    </div>
  {:else}
    <!-- Legend -->
    <div class="flex flex-wrap gap-x-3 gap-y-1 mb-3">
      {#each td.legend as item}
        <span class="text-[9px] {item.color} opacity-70 flex items-center gap-0.5">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
          {item.key}
        </span>
      {/each}
    </div>

    <!-- AST diagram -->
    <div class="text-sm flex flex-wrap gap-1.5 items-start">
      <DiagramNode node={ast} depth={0} />
    </div>

    <!-- Raw pattern display -->
    <div class="mt-4 rounded bg-[#13141e] border border-[#1e2030] p-2">
      <div class="text-[10px] text-slate-600 mb-1.5">{td.patternLabel}</div>
      <code class="text-xs text-[#f0f4ff] break-all leading-relaxed">
        <span class="text-slate-600">/</span>{pattern}<span class="text-slate-600">/{flags}</span>
      </code>
    </div>
  {/if}
</div>
