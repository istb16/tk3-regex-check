<script lang="ts">
  import type { TextSegment, MatchResult } from '../types';
  import { getMatchColor, GROUP_COLORS } from '../highlighter';
  import { langStore, translations } from '../i18n.svelte';

  interface Props {
    text: string;
    segments: TextSegment[];
    matches: MatchResult[];
    onTextChange: (v: string) => void;
  }

  const { text, segments, matches, onTextChange }: Props = $props();

  const t = $derived(translations[langStore.current]);

  let showRaw = $state(false);

  const MAX_HIGHLIGHT_CHARS = 50_000;
  const tooLarge = $derived(text.length > MAX_HIGHLIGHT_CHARS);
</script>

<div class="flex flex-col gap-0 h-full">
  <div class="flex items-center justify-between px-3 py-2 border-b border-[#1e2030]">
    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.test.title}</span>
    <div class="flex items-center gap-2">
      <span class="text-xs text-slate-600">{text.length.toLocaleString()} {t.test.chars}</span>
      <button
        onclick={() => showRaw = !showRaw}
        class="text-xs px-2 py-0.5 rounded border border-[#1e2030] hover:border-[#2d3050] transition-colors {showRaw ? 'text-violet-400' : 'text-slate-500'}"
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
      class="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-violet-400 font-mono text-sm leading-6 p-3 outline-none placeholder:text-slate-700 z-10 selection:bg-violet-500/30"
    ></textarea>

    <!-- Highlight overlay (behind textarea) -->
    {#if !showRaw && !tooLarge && segments.length > 0}
      <div
        aria-hidden="true"
        class="absolute inset-0 font-mono text-sm leading-6 p-3 overflow-hidden pointer-events-none whitespace-pre-wrap break-words z-0 text-[#c8d0e0]"
      >
        {#each segments as seg}
          {#if seg.matchIndex === -1}
            <span class="text-slate-500">{seg.text}</span>
          {:else if seg.groupIndex !== -1}
            <span
              style="background: {GROUP_COLORS[(seg.groupIndex - 1) % GROUP_COLORS.length]}22; border-bottom: 2px solid {GROUP_COLORS[(seg.groupIndex - 1) % GROUP_COLORS.length]}; color: {GROUP_COLORS[(seg.groupIndex - 1) % GROUP_COLORS.length]}"
            >{seg.text}</span>
          {:else}
            <span style="background: {getMatchColor(seg.matchIndex)}; color: #f0f4ff">{seg.text}</span>
          {/if}
        {/each}
      </div>
    {:else}
      <div
        aria-hidden="true"
        class="absolute inset-0 font-mono text-sm leading-6 p-3 pointer-events-none whitespace-pre-wrap break-words z-0 text-[#c8d0e0]"
      >
        {text}
      </div>
    {/if}
  </div>

  {#if tooLarge}
    <div class="px-3 py-1.5 text-xs text-amber-400/70 border-t border-[#1e2030]">
      {t.test.tooLarge(text.length.toLocaleString())}
    </div>
  {/if}
</div>
