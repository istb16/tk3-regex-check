<script lang="ts">
  import DiagramNode from './DiagramNode.svelte';
  import type { RegexNode } from '../types';
  import { langStore } from '../i18n.svelte';

  const td = $derived(langStore.t.diagram);
  const { node, depth = 0 }: { node: RegexNode; depth?: number } = $props();

  // border/background/text, badge background/text, short label — all in one place
  const NODE_STYLES: Record<string, { border: string; badge: string; label: string }> = {
    group:         { border: 'border-rx-blue/70 bg-rx-blue/10 text-rx-blue',          badge: 'bg-rx-blue/10 text-rx-blue',       label: 'group'   },
    nonCapturing:  { border: 'border-rx-slate/70 bg-rx-slate/10 text-rx-slate',       badge: 'bg-rx-slate/10 text-rx-slate',     label: 'ncg'     },
    lookahead:     { border: 'border-rx-violet/70 bg-rx-violet/10 text-rx-violet',    badge: 'bg-rx-violet/10 text-rx-violet',   label: 'look→'   },
    lookbehind:    { border: 'border-rx-purple/70 bg-rx-purple/10 text-rx-purple',    badge: 'bg-rx-purple/10 text-rx-purple',   label: '←look'   },
    atomic:        { border: 'border-rx-orange/70 bg-rx-orange/10 text-rx-orange',    badge: 'bg-rx-orange/10 text-rx-orange',   label: 'atom'    },
    charClass:     { border: 'border-rx-emerald/70 bg-rx-emerald/10 text-rx-emerald', badge: 'bg-rx-emerald/10 text-rx-emerald', label: 'set'     },
    escape:        { border: 'border-rx-cyan/70 bg-rx-cyan/10 text-rx-cyan',          badge: 'bg-rx-cyan/10 text-rx-cyan',       label: 'esc'     },
    anchor:        { border: 'border-rx-rose/70 bg-rx-rose/10 text-rx-rose',          badge: 'bg-rx-rose/10 text-rx-rose',       label: 'anchor'  },
    wildcard:      { border: 'border-rx-yellow/70 bg-rx-yellow/10 text-rx-yellow',    badge: 'bg-rx-yellow/10 text-rx-yellow',   label: 'any'     },
    literal:       { border: 'border-line bg-transparent text-body',        badge: '',                                   label: 'lit'     },
    backreference: { border: 'border-rx-pink/70 bg-rx-pink/10 text-rx-pink',          badge: 'bg-rx-pink/10 text-rx-pink',       label: 'backref' },
    alternation:   { border: 'border-rx-amber/70 bg-rx-amber/10 text-rx-amber',       badge: 'bg-rx-amber/10 text-rx-amber',     label: 'alt'     },
    sequence:      { border: 'border-transparent bg-transparent text-body',         badge: '',                                   label: ''        },
    error:         { border: 'border-danger/70 bg-danger/10 text-danger',             badge: 'bg-danger/10 text-danger',         label: 'ERR'     },
  };

  const CONTAINER_KINDS = new Set([
    'group', 'nonCapturing', 'lookahead', 'lookbehind', 'atomic', 'alternation', 'sequence',
  ]);

  const styles      = $derived(NODE_STYLES[node.kind] ?? NODE_STYLES.error);
  const isContainer = $derived(CONTAINER_KINDS.has(node.kind));

  let collapsed = $state(false);
  $effect(() => { collapsed = depth > 2; });
</script>

{#if node.kind === 'sequence' && !node.quantifier}
  <div class="flex flex-wrap gap-1 items-start">
    {#each node.children ?? [] as child}
      <DiagramNode node={child} depth={depth} />
    {/each}
  </div>

{:else if node.kind === 'alternation'}
  <div class="flex flex-col gap-0.5 border rounded {styles.border} px-2 py-1">
    <div class="flex items-center gap-1 text-xs mb-1">
      <span class="px-1 py-0.5 rounded text-[10px] font-bold {styles.badge}">{styles.label}</span>
      <span class="text-rx-amber text-[10px]">{node.label}</span>
      {#if node.quantifier}
        <span class="ml-auto text-[10px] bg-rx-amber/10 text-rx-amber px-1 rounded">{node.quantifier.raw}</span>
      {/if}
    </div>
    {#each node.children ?? [] as branch, i}
      {#if i > 0}
        <div class="text-center text-[10px] text-rx-amber select-none">{td.or}</div>
      {/if}
      <div class="pl-2 border-l border-rx-amber/50">
        <DiagramNode node={branch} depth={depth + 1} />
      </div>
    {/each}
  </div>

{:else if isContainer && (node.children?.length ?? 0) > 0}
  <div class="border rounded {styles.border} px-2 py-1 flex flex-col gap-1">
    <div class="flex items-center gap-1.5">
      <span class="text-[10px] font-bold px-1 py-0.5 rounded {styles.badge}">{styles.label}</span>
      <span class="text-[11px] truncate max-w-[180px]">{node.label}</span>
      {#if node.negative}
        <span class="text-[10px] bg-danger/10 text-danger px-1 rounded">{td.neg}</span>
      {/if}
      {#if node.quantifier}
        <span class="ml-auto text-[10px] bg-rx-amber/10 text-rx-amber px-1 rounded shrink-0">{node.quantifier.raw}</span>
      {/if}
      {#if (node.children?.length ?? 0) > 0}
        <button
          onclick={() => (collapsed = !collapsed)}
          class="ml-1 text-[10px] text-muted hover:text-ink shrink-0 leading-none"
          title={collapsed ? td.expand : td.collapse}
        >{collapsed ? '▶' : '▼'}</button>
      {/if}
    </div>
    {#if !collapsed}
      <div class="pl-2 border-l border-current/30 flex flex-col gap-1">
        {#each node.children ?? [] as child}
          <DiagramNode node={child} depth={depth + 1} />
        {/each}
      </div>
    {/if}
  </div>

{:else}
  <!-- Leaf node -->
  <div class="inline-flex flex-col items-start border rounded px-1.5 py-0.5 {styles.border}" title={node.label}>
    <div class="flex items-center gap-1">
      {#if styles.label && node.kind !== 'literal'}
        <span class="text-[9px] font-bold {styles.badge} px-0.5 rounded">{styles.label}</span>
      {/if}
      <code class="text-[12px] font-mono">{node.raw}</code>
      {#if node.quantifier}
        <span class="text-[10px] bg-rx-amber/10 text-rx-amber px-1 rounded">{node.quantifier.raw}</span>
      {/if}
    </div>
    {#if node.kind !== 'literal'}
      <span class="text-[9px] text-muted truncate max-w-[140px]">{node.label}</span>
    {/if}
  </div>
{/if}
