<script lang="ts">
  import { langStore } from '../i18n.svelte';

  interface Props {
    pattern: string;
    flags: string;
    error: string | null;
    matchCount: number;
    elapsed: number;
    onPatternChange: (v: string) => void;
    onFlagsChange: (v: string) => void;
  }

  const {
    pattern, flags, error, matchCount, elapsed,
    onPatternChange, onFlagsChange,
  }: Props = $props();

  const t = $derived(langStore.t);

  const FLAG_KEYS = ['g', 'i', 'm', 's', 'u', 'v', 'd', 'y'] as const;
  const flagDefs  = $derived(FLAG_KEYS.map(flag => ({ flag, title: t.flagTooltips[flag] })));

  function toggleFlag(f: string) {
    if (flags.includes(f)) {
      onFlagsChange(flags.replace(f, ''));
    } else {
      // u and v are mutually exclusive — switching one removes the other
      const base = (f === 'u' || f === 'v') ? flags.replace(/[uv]/g, '') : flags;
      onFlagsChange(base + f);
    }
  }
</script>

<div class="flex flex-col gap-2">
  <!-- Pattern bar -->
  <div class="flex items-stretch rounded-lg overflow-hidden border {error ? 'border-red-500/60' : 'border-[#1e2030] focus-within:border-violet-500/60'} transition-colors">
    <span class="flex items-center px-3 text-violet-400/80 text-lg font-mono bg-[#13141e] select-none">/</span>
    <input
      type="text"
      value={pattern}
      oninput={(e) => onPatternChange((e.target as HTMLInputElement).value)}
      placeholder={t.regex.placeholder}
      spellcheck="false"
      autocomplete="off"
      class="flex-1 bg-[#0f1018] text-[#f0f4ff] font-mono text-sm px-2 py-2.5 outline-none placeholder:text-slate-600"
    />
    <span class="flex items-center px-1 text-violet-400/80 text-lg font-mono bg-[#13141e] select-none">/</span>
    <div class="flex items-center gap-0.5 px-2 bg-[#13141e]">
      {#each flagDefs as { flag, title }}
        <button
          onclick={() => toggleFlag(flag)}
          {title}
          class="w-6 h-6 rounded text-xs font-mono font-bold transition-all {flags.includes(flag)
            ? 'bg-violet-500/30 text-violet-300 shadow-[0_0_6px_rgba(124,58,237,0.4)]'
            : 'text-slate-600 hover:text-slate-400'}"
        >{flag}</button>
      {/each}
    </div>
  </div>

  <!-- Status bar -->
  <div class="flex items-center gap-3 text-xs px-1">
    {#if error}
      <span class="text-red-400 flex items-center gap-1">
        <span class="text-red-500">✕</span>
        {error}
      </span>
    {:else if pattern}
      <span class="text-emerald-400/80">
        {matchCount === 0 ? t.regex.noMatches : t.regex.matchCount(matchCount)}
      </span>
      {#if elapsed > 0.5}
        <span class="text-slate-600">{elapsed.toFixed(2)}ms</span>
      {/if}
    {:else}
      <span class="text-slate-600">{t.regex.typePattern}</span>
    {/if}

    {#if flags.includes('v')}
      <span class="ml-auto text-violet-400/60 text-[10px] border border-violet-500/30 rounded px-1.5 py-0.5">ES2024 v-flag</span>
    {:else if flags.includes('d')}
      <span class="ml-auto text-cyan-400/60 text-[10px] border border-cyan-500/30 rounded px-1.5 py-0.5">ES2022 d-flag</span>
    {/if}
  </div>
</div>
