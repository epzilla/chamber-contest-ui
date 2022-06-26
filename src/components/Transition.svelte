<!-- Transition.svelte -->
<script>
  import { fly, fade, crossfade } from 'svelte/transition';
  import { expoIn, expoOut } from 'svelte/easing';
  //   export let show: boolean;
  //   export let onClose: () => void;

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
  export let refresh = ``;
</script>

{#key refresh}
  <!-- You can modify the in:fly and out:fly attributes to your liking! -->
  <div in:popIn={{ duration: 2000 }} out:popOut={{ duration: 2000 }}>
    <slot />
  </div>
{/key}
