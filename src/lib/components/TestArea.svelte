<script lang="ts">
  import type { TextSegment, MatchResult } from '../types';
  import { getMatchColor, groupColor, tint } from '../highlighter';
  import { langStore } from '../i18n.svelte';

  interface Props {
    text: string;
    segments: TextSegment[];
    matches: MatchResult[];
    onTextChange: (v: string) => void;
  }

  const { text, segments, matches, onTextChange }: Props = $props();

  const t = $derived(langStore.t);

  let showRaw = $state(false);

  const MAX_HIGHLIGHT_CHARS = 50_000;
  const tooLarge = $derived(text.length > MAX_HIGHLIGHT_CHARS);
</script>

<div class="flex flex-col gap-0 h-full">
  <div class="flex items-center justify-between px-3 py-2 border-b border-line">
    <span class="text-xs font-semibold text-muted uppercase tracking-wider">{t.test.title}</span>
    <div class="flex items-center gap-2">
      <span class="text-xs text-muted">{text.length.toLocaleString()} {t.test.chars}</span>
      <button
        onclick={() => showRaw = !showRaw}
        class="text-xs px-2 py-0.5 rounded border border-line hover:border-muted transition-colors {showRaw ? 'text-accent' : 'text-muted'}"
      >
        {showRaw ? t.test.highlightsOn : t.test.raw}
      </button>
    </div>
  </div>

  <div class="relative flex-1 min-h-0">
    <!-- Invisible mirror textarea for sizing -->
    <textarea
      value={text}
      oninput={(e) => onTextChange((e.target as HTMLTextAreaElement).value)}
      spellcheck="false"
      placeholder={t.test.placeholder}
      class="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-ink font-mono text-sm leading-6 p-3 outline-none placeholder:text-muted z-10 selection:bg-accent/30"
    ></textarea>

    <!-- Highlight overlay (behind textarea) -->
    {#if !showRaw && !tooLarge && segments.length > 0}
      <div
        aria-hidden="true"
        class="absolute inset-0 font-mono text-sm leading-6 p-3 overflow-hidden pointer-events-none whitespace-pre-wrap break-words z-0 text-body"
      >
        {#each segments as seg}
          {#if seg.matchIndex === -1}
            <span class="text-muted">{seg.text}</span>
          {:else if seg.groupIndex !== -1}
            {@const c = groupColor(seg.groupIndex)}
            <span style="background: {tint(c)}; border-bottom: 2px solid {c}; color: {c}">{seg.text}</span>
          {:else}
            <span style="background: {getMatchColor(seg.matchIndex)}; color: var(--tk-ink)">{seg.text}</span>
          {/if}
        {/each}
      </div>
    {:else}
      <div
        aria-hidden="true"
        class="absolute inset-0 font-mono text-sm leading-6 p-3 pointer-events-none whitespace-pre-wrap break-words z-0 text-body"
      >
        {text}
      </div>
    {/if}
  </div>

  {#if tooLarge}
    <div class="px-3 py-1.5 text-xs text-rx-amber border-t border-line">
      {t.test.tooLarge(text.length.toLocaleString())}
    </div>
  {/if}
</div>
