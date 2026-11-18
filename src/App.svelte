<script lang="ts">
  import { parseRegex } from './lib/regex-parser';
  import { buildMatches, buildSegments } from './lib/highlighter';
  import type { Preset } from './lib/types';
  import { langStore } from './lib/i18n.svelte';
  import { loadAppState, saveAppState } from './lib/storage';
  import RegexInput from './lib/components/RegexInput.svelte';
  import TestArea from './lib/components/TestArea.svelte';
  import MatchTable from './lib/components/MatchTable.svelte';
  import PresetPanel from './lib/components/PresetPanel.svelte';
  import TabBar from './lib/components/TabBar.svelte';
  import FlagsRefTable from './lib/components/FlagsRefTable.svelte';
  import RegexDiagram from './lib/components/RegexDiagram.svelte';

  // ─── State ───────────────────────────────────────────────────
  const s = loadAppState();
  let pattern        = $state(s.pattern);
  let flags          = $state(s.flags);
  let testText       = $state(s.testText);
  let activePresetId = $state(s.activePresetId);
  let rightTab       = $state(s.rightTab);
  let bottomTab      = $state(s.bottomTab);

  $effect(() => saveAppState({ pattern, flags, testText, activePresetId, rightTab, bottomTab }));

  // ─── Derived ─────────────────────────────────────────────────
  const t = $derived(langStore.t);
  const { matches, error, elapsed } = $derived.by(() => buildMatches(pattern, flags, testText));
  const segments = $derived(buildSegments(testText, matches));
  const ast      = $derived(parseRegex(pattern));

  const rightTabs  = $derived([
    { id: 'diagram', label: t.tabs.diagram },
    { id: 'presets', label: t.tabs.presets },
  ]);
  const bottomTabs = $derived([
    { id: 'matches',   label: t.tabs.matches(matches.length) },
    { id: 'reference', label: t.tabs.flagsRef },
  ]);

  function loadPreset(p: Preset) {
    pattern        = p.pattern;
    flags          = p.flags;
    testText       = p.testText;
    activePresetId = p.id;
  }
</script>

<div class="min-h-screen bg-surface text-ink flex flex-col font-mono">

  <!-- Header -->
  <header class="tk-header font-sans shrink-0">
    <a class="tk-header__home" href="/">
      <img src="/icon.svg" alt="" class="tk-header__icon" />
      <h1 class="tk-header__name">Regex Check</h1>
      <span class="text-xs text-muted whitespace-nowrap">{t.header.subtitle}</span>
    </a>
    <div class="tk-header__end text-xs">
      {#each (['en', 'ja'] as const) as l}
        <button
          onclick={() => langStore.set(l)}
          aria-pressed={langStore.current === l}
          class="px-2 py-0.5 rounded border transition-colors {langStore.current === l
            ? 'border-accent bg-accent text-on-accent'
            : 'border-line text-muted hover:text-ink hover:border-muted'}"
        >{l.toUpperCase()}</button>
      {/each}
    </div>
  </header>

  <!-- Regex input bar -->
  <div class="border-b border-line px-4 py-3 shrink-0">
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

    <!-- Left: test area + bottom tabs -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden border-r border-line">
      <div class="flex flex-col border-b border-line" style="height: 55%">
        <TestArea text={testText} {segments} {matches} onTextChange={(v) => (testText = v)} />
      </div>
      <div class="flex flex-col" style="height: 45%">
        <TabBar
          tabs={bottomTabs}
          active={bottomTab}
          onSelect={(id) => (bottomTab = id as typeof bottomTab)}
        />
        <div class="flex-1 min-h-0 overflow-hidden">
          {#if bottomTab === 'matches'}
            <MatchTable {matches} {flags} />
          {:else}
            <FlagsRefTable {flags} />
          {/if}
        </div>
      </div>
    </div>

    <!-- Right: diagram / presets -->
    <div class="w-[380px] shrink-0 flex flex-col overflow-hidden">
      <TabBar
        tabs={rightTabs}
        active={rightTab}
        onSelect={(id) => (rightTab = id as typeof rightTab)}
      />
      <div class="flex-1 min-h-0 overflow-y-auto">
        {#if rightTab === 'diagram'}
          <RegexDiagram {pattern} {flags} {error} {ast} />
        {:else}
          <PresetPanel onSelect={loadPreset} activeId={activePresetId} />
        {/if}
      </div>
    </div>

  </div>

  <footer class="tk-footer app-footer font-sans shrink-0">
    <a href="https://tk3.biz/">tk3.biz</a>
  </footer>
</div>
