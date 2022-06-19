<script lang="ts">
  import { fly } from 'svelte/transition';
  import { dismissAlert } from '../modules/stores';

  export let alert: Alert;
</script>

<div
  in:fly={{ y: 200, duration: 200 }}
  out:fly={{ y: 200, duration: 500 }}
  class={`alert alert-${alert.type}${alert.clickable ? ' clickable' : ''}`}
  on:click={() => {
    if (alert.action) {
      alert.action();
      dismissAlert(alert.id);
    }
  }}
>
  <span>{alert.msg}</span>
  <button
    class="close-button"
    on:click={e => {
      e.preventDefault();
      e.stopPropagation();
      dismissAlert(alert.id);
    }}>&times;</button
  >
</div>

<style lang="scss">
  .alert {
    display: flex;
    background-color: #b4d3f2;
    border: 1px solid #a6c0da;
    color: #003e7b;
    padding: 1rem;
    border-radius: 4px;

    &:not(:last-of-type) {
      margin-bottom: 0.25rem;
    }

    &.alert-error {
      background-color: #c22f3d;
      border-color: #a80817;
      color: #fff;
    }

    &.alert-warning {
      background-color: #ffeb85;
      border-color: #e6cf5a;
      color: #655606;
    }

    &.alert-success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }

    &.clickable {
      cursor: pointer;
    }

    .close-button {
      background: transparent;
      border: none;
      color: #003e7b;
      cursor: pointer;
      font-size: 1.5rem;
      line-height: 0;
      margin-left: auto;
      padding-left: 1rem;

      &:focus {
        outline: none;
      }
    }
  }
</style>
