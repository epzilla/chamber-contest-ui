<script lang="ts">
	import type { KVP } from '$lib/modules/types';

	export let id: string;
	export let options: KVP[];
	export let value: string = '';
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
		min-width: 400px;

		@media screen and (max-width: 455px) {
			min-width: unset;
			max-width: unset;
		}
	}
</style>
