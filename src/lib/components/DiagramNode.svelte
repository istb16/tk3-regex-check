<script lang="ts">
  import DiagramNode from './DiagramNode.svelte';
  import type { RegexNode } from '../types';
  import { langStore, translations } from '../i18n.svelte';

  const td = $derived(translations[langStore.current].diagram);
  const { node, depth = 0 }: { node: RegexNode; depth?: number } = $props();

  // border/background/text, badge background/text, short label — all in one place
  const NODE_STYLES: Record<string, { border: string; badge: string; label: string }> = {
    group:         { border: 'border-blue-500/60 bg-blue-500/10 text-blue-300',       badge: 'bg-blue-500/20 text-blue-400',       label: 'group'   },
    nonCapturing:  { border: 'border-slate-500/60 bg-slate-500/10 text-slate-300',    badge: 'bg-slate-500/20 text-slate-400',     label: 'ncg'     },
    lookahead:     { border: 'border-violet-500/60 bg-violet-500/10 text-violet-300', badge: 'bg-violet-500/20 text-violet-400',   label: 'look→'   },
    lookbehind:    { border: 'border-purple-500/60 bg-purple-500/10 text-purple-300', badge: 'bg-purple-500/20 text-purple-400',   label: '←look'   },
    atomic:        { border: 'border-orange-500/60 bg-orange-500/10 text-orange-300', badge: 'bg-orange-500/20 text-orange-400',   label: 'atom'    },
    charClass:     { border: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-400', label: 'set'  },
    escape:        { border: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300',       badge: 'bg-cyan-500/20 text-cyan-400',       label: 'esc'     },
    anchor:        { border: 'border-rose-500/60 bg-rose-500/10 text-rose-300',       badge: 'bg-rose-500/20 text-rose-400',       label: 'anchor'  },
    wildcard:      { border: 'border-yellow-500/60 bg-yellow-500/10 text-yellow-300', badge: 'bg-yellow-500/20 text-yellow-400',   label: 'any'     },
    literal:       { border: 'border-slate-700/40 bg-transparent text-slate-400',     badge: '',                                   label: 'lit'     },
    backreference: { border: 'border-pink-500/60 bg-pink-500/10 text-pink-300',       badge: 'bg-pink-500/20 text-pink-400',       label: 'backref' },
    alternation:   { border: 'border-amber-500/60 bg-amber-500/10 text-amber-300',    badge: 'bg-amber-500/20 text-amber-400',     label: 'alt'     },
    sequence:      { border: 'border-transparent bg-transparent text-slate-400',      badge: '',                                   label: ''        },
    error:         { border: 'border-red-500/60 bg-red-500/10 text-red-300',          badge: 'bg-red-500/20 text-red-400',         label: 'ERR'     },
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
      <span class="text-amber-300/70 text-[10px]">{node.label}</span>
      {#if node.quantifier}
        <span class="ml-auto text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded">{node.quantifier.raw}</span>
      {/if}
    </div>
    {#each node.children ?? [] as branch, i}
      {#if i > 0}
        <div class="text-center text-[10px] text-amber-500/60 select-none">{td.or}</div>
      {/if}
      <div class="pl-2 border-l border-amber-500/30">
        <DiagramNode node={branch} depth={depth + 1} />
      </div>
    {/each}
  </div>

{:else if isContainer && (node.children?.length ?? 0) > 0}
  <div class="border rounded {styles.border} px-2 py-1 flex flex-col gap-1">
    <div class="flex items-center gap-1.5">
      <span class="text-[10px] font-bold px-1 py-0.5 rounded {styles.badge}">{styles.label}</span>
      <span class="text-[11px] opacity-80 truncate max-w-[180px]">{node.label}</span>
      {#if node.negative}
        <span class="text-[10px] bg-red-500/20 text-red-400 px-1 rounded">{td.neg}</span>
      {/if}
      {#if node.quantifier}
        <span class="ml-auto text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded shrink-0">{node.quantifier.raw}</span>
      {/if}
      {#if (node.children?.length ?? 0) > 0}
        <button
          onclick={() => (collapsed = !collapsed)}
          class="ml-1 text-[10px] opacity-40 hover:opacity-100 shrink-0 leading-none"
          title={collapsed ? td.expand : td.collapse}
        >{collapsed ? '▶' : '▼'}</button>
      {/if}
    </div>
    {#if !collapsed}
      <div class="pl-2 border-l border-current/20 flex flex-col gap-1">
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
        <span class="text-[9px] font-bold {styles.badge} px-0.5 rounded opacity-80">{styles.label}</span>
      {/if}
      <code class="text-[12px] font-mono">{node.raw}</code>
      {#if node.quantifier}
        <span class="text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded">{node.quantifier.raw}</span>
      {/if}
    </div>
    {#if node.kind !== 'literal'}
      <span class="text-[9px] opacity-60 truncate max-w-[140px]">{node.label}</span>
    {/if}
  </div>
{/if}
