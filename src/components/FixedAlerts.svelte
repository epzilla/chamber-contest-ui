<script>
  import { fixedAlerts } from '../modules/stores';
  import Alert from './Alert.svelte';
</script>

<div class="fixed-alerts">
  {#each $fixedAlerts as al}
    <Alert alert={al} />
  {/each}
</div>

<style>
  .fixed-alerts {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 56px - 2rem);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    z-index: 8;
  }
</style>
