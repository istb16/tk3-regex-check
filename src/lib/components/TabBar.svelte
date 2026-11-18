<script lang="ts">
  interface Tab { id: string; label: string }
  interface Props {
    tabs: Tab[];
    active: string;
    onSelect: (id: string) => void;
  }
  const { tabs, active, onSelect }: Props = $props();
</script>

<div class="flex shrink-0 border-b border-line">
  {#each tabs as { id, label }}
    <button
      onclick={() => onSelect(id)}
      class="px-4 py-2 text-xs font-semibold transition-colors {active === id
        ? 'text-accent border-b-2 border-accent -mb-px'
        : 'text-muted hover:text-ink'}"
    >{label}</button>
  {/each}
</div>
