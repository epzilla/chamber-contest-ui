<script lang="ts">
	export let altColor = '';
	export let checked = false;
	export let onChange: ((val: boolean) => void) | null = null;
	export let id = '';
	export let style = '';
</script>

<div class={`toggle ${altColor ? 'alt-color' : ''}`} {style}>
	<input type="checkbox" bind:checked />
	<label>toggle</label>
</div>

<style lang="scss">
	.toggle {
		input[type='checkbox'] {
			height: 0;
			width: 0;
			position: absolute;
			visibility: hidden;
		}

		label {
			cursor: pointer;
			text-indent: -9999px;
			width: 40px;
			height: 20px;
			background: var(--colorDisabledText);
			display: block;
			border-radius: 10px;
			position: relative;
		}

		label:after {
			content: '';
			position: absolute;
			top: 2px;
			left: 2px;
			width: 16px;
			height: 16px;
			background: #fff;
			border-radius: 50%;
			transition: 0.3s;
		}

		input:checked + label {
			background: var(--primary);
		}

		&.alt-color input:checked + label {
			background: var(--primaryBtnBg);
		}

		input:checked + label:after {
			left: calc(100% - 2px);
			transform: translateX(-100%);
		}

		label:active:after {
			width: 26px;
		}
	}

	:global(.form-group) {
		.toggle {
			label {
				margin-bottom: 0;
			}
		}
	}
</style>
