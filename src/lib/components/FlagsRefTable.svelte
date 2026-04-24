<script lang="ts">
  import { langStore } from '../i18n.svelte';

  const { flags }: { flags: string } = $props();
  const t = $derived(langStore.t);

  const FLAG_ROWS = [
    { flag: 'g', es: 'ES3'    },
    { flag: 'i', es: 'ES3'    },
    { flag: 'm', es: 'ES3'    },
    { flag: 's', es: 'ES2018' },
    { flag: 'u', es: 'ES2015' },
    { flag: 'y', es: 'ES2015' },
    { flag: 'd', es: 'ES2022' },
    { flag: 'v', es: 'ES2024' },
  ] as const;
</script>

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
      {#each FLAG_ROWS as { flag, es }}
        <tr class="border-t border-[#1e2030]/50 {flags.includes(flag) ? 'bg-violet-500/5' : ''}">
          <td class="py-1.5 pr-4">
            <code class="text-violet-300 font-bold text-sm">{flag}</code>
          </td>
          <td class="py-1.5 pr-4">
            <span class="text-[10px] {parseInt(es.slice(2)) >= 2022 ? 'text-emerald-400/80' : 'text-slate-600'}">{es}</span>
          </td>
          <td class="py-1.5 text-slate-400 text-[11px]">{t.flagsRef.descs[flag]}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
