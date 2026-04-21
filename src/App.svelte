<script lang="ts">
  import { parseRegex } from './lib/regex-parser';
  import { buildMatches, buildSegments } from './lib/highlighter';
  import type { Preset } from './lib/types';
  import { langStore, translations } from './lib/i18n.svelte';
  import RegexInput from './lib/components/RegexInput.svelte';
  import DiagramNode from './lib/components/DiagramNode.svelte';
  import TestArea from './lib/components/TestArea.svelte';
  import MatchTable from './lib/components/MatchTable.svelte';
  import PresetPanel from './lib/components/PresetPanel.svelte';

  // ─── State ───────────────────────────────────────────────────
  let pattern = $state('(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})');
  let flags = $state('gd');
  let testText = $state('Today is 2026-04-21\nRelease: 2025-12-31\nInvalid: 2026/01/01');
  let activePresetId = $state('named-groups-date');
  let rightTab = $state<'diagram' | 'presets'>('diagram');
  let bottomTab = $state<'matches' | 'reference'>('matches');

  // ─── i18n ────────────────────────────────────────────────────
  const t = $derived(translations[langStore.current]);

  // ─── Derived ─────────────────────────────────────────────────
  const { matches, error, elapsed } = $derived.by(() => buildMatches(pattern, flags, testText));
  const segments = $derived(buildSegments(testText, matches));
  const ast = $derived(parseRegex(pattern));

  function loadPreset(p: Preset) {
    pattern = p.pattern;
    flags = p.flags;
    testText = p.testText;
    activePresetId = p.id;
  }

  const flagsRef = $derived([
    { flag: 'g', es: 'ES3',    desc: t.flagsRef.descs['g'] },
    { flag: 'i', es: 'ES3',    desc: t.flagsRef.descs['i'] },
    { flag: 'm', es: 'ES3',    desc: t.flagsRef.descs['m'] },
    { flag: 's', es: 'ES2018', desc: t.flagsRef.descs['s'] },
    { flag: 'u', es: 'ES2015', desc: t.flagsRef.descs['u'] },
    { flag: 'y', es: 'ES2015', desc: t.flagsRef.descs['y'] },
    { flag: 'd', es: 'ES2022', desc: t.flagsRef.descs['d'] },
    { flag: 'v', es: 'ES2024', desc: t.flagsRef.descs['v'] },
  ]);
</script>

<div class="min-h-screen bg-[#09090f] flex flex-col font-mono">
  <!-- Header -->
  <header class="border-b border-[#1e2030] px-4 py-2.5 flex items-center gap-4 shrink-0">
    <div class="flex items-center gap-2.5">
      <span class="text-violet-400 text-lg font-bold select-none">/.*?/</span>
      <div>
        <h1 class="text-sm font-bold text-[#f0f4ff] leading-none m-0 p-0">RegexCheck</h1>
        <p class="text-[10px] text-slate-600 leading-none mt-0.5 m-0">{t.header.subtitle}</p>
      </div>
    </div>
    <!-- Language toggle -->
    <div class="ml-auto flex items-center gap-1 text-[11px]">
      {#each (['en', 'ja'] as const) as l}
        <button
          onclick={() => langStore.set(l)}
          class="px-2 py-0.5 rounded border transition-colors {langStore.current === l
            ? 'border-violet-500/60 bg-violet-500/20 text-violet-300'
            : 'border-[#1e2030] text-slate-600 hover:text-slate-400 hover:border-[#2d3050]'}"
        >{l.toUpperCase()}</button>
      {/each}
    </div>
  </header>

  <!-- Regex Input -->
  <div class="border-b border-[#1e2030] px-4 py-3 shrink-0">
    <RegexInput
      {pattern} {flags} {error}
      matchCount={matches.length}
      {elapsed}
      onPatternChange={(v) => (pattern = v)}
      onFlagsChange={(v) => (flags = v)}
    />
  </div>

  <!-- Main 2-column layout -->
  <div class="flex flex-1 min-h-0 overflow-hidden">

    <!-- Left column: test area + match detail -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden border-r border-[#1e2030]">

      <!-- Test text (top ~60%) -->
      <div class="flex flex-col border-b border-[#1e2030]" style="height: 55%">
        <TestArea
          text={testText}
          {segments}
          {matches}
          onTextChange={(v) => (testText = v)}
        />
      </div>

      <!-- Bottom panel (40%) -->
      <div class="flex flex-col" style="height: 45%">
        <div class="flex shrink-0 border-b border-[#1e2030]">
          {#each [['matches', t.tabs.matches(matches.length)], ['reference', t.tabs.flagsRef]] as [id, label]}
            <button
              onclick={() => (bottomTab = id as typeof bottomTab)}
              class="px-4 py-2 text-xs font-semibold transition-colors {bottomTab === id
                ? 'text-violet-300 border-b-2 border-violet-500 -mb-px'
                : 'text-slate-600 hover:text-slate-400'}"
            >
              {label}
            </button>
          {/each}
        </div>

        <div class="flex-1 min-h-0 overflow-hidden">
          {#if bottomTab === 'matches'}
            <MatchTable {matches} {flags} />
          {:else}
            <div class="p-3 overflow-y-auto h-full">
              <table class="w-full text-xs border-collapse">
                <thead>
                  <tr class="text-[10px] uppercase tracking-wider text-slate-600">
                    <th class="text-left pb-2 pr-4 font-medium">{t.flagsRef.colFlag}</th>
                    <th class="text-left pb-2 pr-4 font-medium">{t.flagsRef.colSince}</th>
                    <th class="text-left pb-2 font-medium">{t.flagsRef.colDesc}</th>
                  </tr>
                </thead>
                <tbody>
                  {#each flagsRef as ref}
                    <tr class="border-t border-[#1e2030]/50 {flags.includes(ref.flag) ? 'bg-violet-500/5' : ''}">
                      <td class="py-1.5 pr-4">
                        <code class="text-violet-300 font-bold text-sm">{ref.flag}</code>
                      </td>
                      <td class="py-1.5 pr-4">
                        <span class="text-[10px] {ref.es >= 'ES2022' ? 'text-emerald-400/80' : 'text-slate-600'}">{ref.es}</span>
                      </td>
                      <td class="py-1.5 text-slate-400 text-[11px]">{ref.desc}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Right column: diagram / presets (fixed width) -->
    <div class="w-[380px] shrink-0 flex flex-col overflow-hidden">
      <div class="flex shrink-0 border-b border-[#1e2030]">
        {#each [['diagram', t.tabs.diagram], ['presets', t.tabs.presets]] as [id, label]}
          <button
            onclick={() => (rightTab = id as typeof rightTab)}
            class="px-4 py-2 text-xs font-semibold transition-colors {rightTab === id
              ? 'text-violet-300 border-b-2 border-violet-500 -mb-px'
              : 'text-slate-600 hover:text-slate-400'}"
          >
            {label}
          </button>
        {/each}
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto">
        {#if rightTab === 'diagram'}
          <div class="p-3">
            {#if !pattern}
              <div class="text-slate-600 text-xs text-center py-10">
                {t.diagram.enterPattern}
              </div>
            {:else if error}
              <div class="text-red-400 text-xs p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <div class="font-semibold mb-1">⚠ {t.diagram.invalidPattern}</div>
                {error}
              </div>
            {:else}
              <!-- Legend -->
              <div class="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                {#each t.diagram.legend as item}
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
                <div class="text-[10px] text-slate-600 mb-1.5">{t.diagram.patternLabel}</div>
                <code class="text-xs text-[#f0f4ff] break-all leading-relaxed">
                  <span class="text-slate-600">/</span>{pattern}<span class="text-slate-600">/{flags}</span>
                </code>
              </div>
            {/if}
          </div>
        {:else}
          <PresetPanel onSelect={loadPreset} activeId={activePresetId} />
        {/if}
      </div>
    </div>
  </div>
</div>
