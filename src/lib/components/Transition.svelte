<!-- Transition.svelte -->
<script lang="ts">
	import { expoIn, expoOut } from 'svelte/easing';

	/**
	 * @param {HTMLDivElement} _node
	 */
	function popIn(_node: HTMLDivElement, { duration }: { duration: number }) {
		return {
			duration,
			css: (/** @type {number} */ t: number) => {
				const eased = expoOut(t);

				return `
            transform: scale(${eased})`;
			}
		};
	}

	/**
	 * @param {HTMLDivElement} _node
	 */
	function popOut(_node: HTMLDivElement, { duration }: { duration: number }) {
		return {
			duration,
			css: (/** @type {number} */ t: number) => {
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
