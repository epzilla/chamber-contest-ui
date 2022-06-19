<script>
  import { alerts } from '../modules/stores';
  import Alert from './Alert.svelte';
  export let device = '';
</script>

<div class="fixed-alerts">
  {#each $alerts as al}
    <Alert alert={al} {device} />
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
