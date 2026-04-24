<script lang="ts">
  interface Tab { id: string; label: string }
  interface Props {
    tabs: Tab[];
    active: string;
    onSelect: (id: string) => void;
  }
  const { tabs, active, onSelect }: Props = $props();
</script>

<div class="flex shrink-0 border-b border-[#1e2030]">
  {#each tabs as { id, label }}
    <button
      onclick={() => onSelect(id)}
      class="px-4 py-2 text-xs font-semibold transition-colors {active === id
        ? 'text-violet-300 border-b-2 border-violet-500 -mb-px'
        : 'text-slate-600 hover:text-slate-400'}"
    >{label}</button>
  {/each}
</div>
