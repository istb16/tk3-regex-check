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
    <div class="text-muted text-xs text-center py-10">{td.enterPattern}</div>
  {:else if error}
    <div class="text-danger text-xs p-3 bg-danger/10 rounded-lg border border-danger/40">
      <div class="font-semibold mb-1">⚠ {td.invalidPattern}</div>
      {error}
    </div>
  {:else}
    <!-- Legend -->
    <div class="flex flex-wrap gap-x-3 gap-y-1 mb-3">
      {#each td.legend as item}
        <span class="text-[9px] {item.color} flex items-center gap-0.5">
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
    <div class="mt-4 rounded bg-bg border border-line p-2">
      <div class="text-[10px] text-muted mb-1.5">{td.patternLabel}</div>
      <code class="text-xs text-ink break-all leading-relaxed">
        <span class="text-muted">/</span>{pattern}<span class="text-muted">/{flags}</span>
      </code>
    </div>
  {/if}
</div>
