<script lang="ts">
  import { expoIn, expoOut } from 'svelte/easing';
  export let show: boolean;
  export let onClose: () => void;

  function popIn(node, { duration }) {
    return {
      duration,
      css: t => {
        const eased = expoOut(t);

        return `
            transform: scale(${eased})`;
      }
    };
  }

  function popOut(node, { duration }) {
    return {
      duration,
      css: t => {
        const eased = expoIn(t);

        return `
            transform: scale(${eased})`;
      }
    };
  }
</script>

{#if show}
  <div
    class={`pop-modal${show ? ' show' : ''}`}
    in:popIn={{ duration: 300 }}
    out:popOut={{ duration: 300 }}
  >
    <slot />
  </div>
{/if}

<style lang="scss">
  .pop-modal {
    position: fixed;
    background-color: white;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: 5;
  }
</style>
