<script lang="ts">
  import { scale, fade } from 'svelte/transition';
  import { CANCEL, OK } from '../modules/constants';

  export let show = false;
  export let confirm: () => void = null;
  export let confirmText: string = '';
  export let cancelText: string = '';
  export let dismiss: () => void = null;
</script>

<div class="modal-wrapper generic-modal-wrapper">
  {#if show}
    <div
      class="modal-backdrop generic-modal-backdrop"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
    />
    <div
      class="modal generic-modal-main"
      in:scale={{ duration: 200 }}
      out:scale={{ duration: 200 }}
    >
      <div class="modal-header">
        <slot name="header" />
        <button class="dismiss-btn" on:click={() => dismiss()}>&times;</button>
      </div>
      <div class="modal-body flex"><slot name="content" /></div>
      <div class="modal-btn-container flex">
        {#if confirm}
          <button class="btn secondary" on:click={() => confirm()}
            >{confirmText || OK}</button
          >
          <button class="btn" on:click={() => dismiss()}
            >{cancelText || CANCEL}</button
          >
        {/if}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .modal {
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 56px;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 7;
    background-color: white;
  }

  .modal-header {
    width: 100%;
    min-height: 4rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 1rem;
  }

  .modal-btn-container {
    margin: 1rem auto;
    .btn:not(:last-of-type) {
      margin-right: 1rem;
    }
  }

  .modal-backdrop {
    position: fixed;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    background-color: rgba(0, 0, 0, 0.8);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
  }
</style>
