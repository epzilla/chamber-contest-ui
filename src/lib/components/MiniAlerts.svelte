<script lang="ts">
  import { miniAlerts } from '../modules/stores';
  import Alert from './Alert.svelte';
</script>

<section class="mini-alerts">
  {#each $miniAlerts as al}
    <Alert alert={al} />
  {/each}
</section>

<style lang="scss">
  .mini-alerts {
    position: fixed;
    top: 70px;
    right: 10px;
    width: 300px;
    z-index: 9;
    max-width: 45vw;

    :global(.alert.alert-pointsUpdate) {
      background-color: var(--accentColor);
      border-color: var(--accentColorDarker);
      box-shadow: var(--subtle-shadow);
      color: white;
    }
  }
</style>
