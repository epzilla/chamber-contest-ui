<script lang="ts">
  export let id;
  export let options: KVP[];
  export let value: string;
  export let onSelect: (option: KVP) => void;
</script>

{#if options?.length > 0}
  {#each options as option}
    <button
      id={`${id}-${option.key}`}
      class:secondary={value === option.key}
      on:click={() => onSelect(option)}
    >
      {#if value === option.key}
        <span class="fa fa-check" />
      {/if}
      <span>{option.value}</span></button
    >
  {/each}
{/if}
