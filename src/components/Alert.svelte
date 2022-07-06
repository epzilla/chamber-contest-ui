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
    }}><span class="fa fa-times" /></button
  >
</div>

<style lang="scss">
  .alert {
    display: grid;
    grid-template-columns: 1fr 24px;
    background-color: #b4d3f2;
    border: 1px solid #a6c0da;
    color: #003e7b;
    font-weight: 600;
    padding: 10px;
    border-radius: 4px;
    z-index: 6;

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
      background-color: var(--successGreen);
      border-color: var(--successGreenDarker);
      color: white;

      .close-button {
        color: white;
      }
    }

    &.clickable {
      cursor: pointer;
    }

    .close-button {
      background: transparent;
      border: none;
      cursor: pointer;
      margin: 0;
      padding: 0;
      height: initial;

      .fa {
        margin: 0;
      }

      &:focus {
        outline: none;
      }
    }
  }
</style>
