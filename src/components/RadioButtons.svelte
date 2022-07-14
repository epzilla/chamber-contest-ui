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
      class="radio-btn"
      class:secondary={value === option.key}
      on:click={() => onSelect(option)}
    >
      <span
        class="fa"
        class:fa-check-circle={value === option.key}
        class:fa-circle-o={value !== option.key}
      />
      <span>{option.value}</span></button
    >
  {/each}
{/if}

<style lang="scss">
  .radio-btn {
    display: grid;
    margin-right: 10px;
    padding: 0 1rem;
    text-align: left;
    grid-template-columns: 20px 1fr;
    gap: 8px;
    align-items: center;
    width: 100%;
    max-width: 300px;
  }
</style>
