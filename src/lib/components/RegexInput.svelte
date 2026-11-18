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
  <!-- Pattern bar. Below md the flags move to their own row under the pattern. -->
  <div class="pattern-bar flex flex-wrap md:flex-nowrap items-stretch rounded-lg overflow-hidden border {error ? 'border-danger' : 'border-line-strong focus-within:border-accent'} transition-colors">
    <span class="flex items-center px-3 text-rx-violet text-lg font-mono bg-surface-2 select-none">/</span>
    <input
      type="text"
      value={pattern}
      oninput={(e) => onPatternChange((e.target as HTMLInputElement).value)}
      placeholder={t.regex.placeholder}
      spellcheck="false"
      autocomplete="off"
      class="flex-1 min-w-0 bg-surface text-ink font-mono text-sm px-2 py-2.5 outline-none placeholder:text-muted"
    />
    <span class="flex items-center px-1 text-rx-violet text-lg font-mono bg-surface-2 select-none">/</span>
    <div class="flex items-center justify-end gap-0.5 px-2 py-1 md:py-0 bg-surface-2 basis-full md:basis-auto border-t md:border-t-0 border-line">
      {#each flagDefs as { flag, title }}
        <button
          onclick={() => toggleFlag(flag)}
          {title}
          class="w-6 h-6 rounded text-xs font-mono font-bold transition-all {flags.includes(flag)
            ? 'bg-accent text-on-accent'
            : 'text-muted hover:text-ink'}"
        >{flag}</button>
      {/each}
    </div>
  </div>

  <!-- Status bar -->
  <div class="flex items-center gap-3 text-xs px-1">
    {#if error}
      <span class="text-danger flex items-center gap-1">
        <span>✕</span>
        {error}
      </span>
    {:else if pattern}
      <span class="text-success">
        {matchCount === 0 ? t.regex.noMatches : t.regex.matchCount(matchCount)}
      </span>
      {#if elapsed > 0.5}
        <span class="text-muted">{elapsed.toFixed(2)}ms</span>
      {/if}
    {:else}
      <span class="text-muted">{t.regex.typePattern}</span>
    {/if}

    {#if flags.includes('v')}
      <span class="ml-auto text-rx-violet text-[10px] border border-rx-violet/50 rounded px-1.5 py-0.5">ES2024 v-flag</span>
    {:else if flags.includes('d')}
      <span class="ml-auto text-rx-cyan text-[10px] border border-rx-cyan/50 rounded px-1.5 py-0.5">ES2022 d-flag</span>
    {/if}
  </div>
</div>
