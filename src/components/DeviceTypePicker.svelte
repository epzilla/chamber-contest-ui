<script>
  import { DEVICE_TYPES } from '../modules/constants';
  import DeviceIcon from './DeviceIcon.svelte';
  export let callback;
  export let selectedType;

  function keyup(code, type) {
    if (code === 'Enter' || code === 'Space') {
      callback(DEVICE_TYPES[type]);
    }
  }
</script>

<div class="device-type-picker">
  {#each Object.keys(DEVICE_TYPES) as type, index}
    <button
      on:keyup={(e) => keyup(e.code, type)}
      tabindex={index + 3}
      class={`device-type-option ${
        DEVICE_TYPES[type] === selectedType ? 'selected' : ''
      }`}
      on:click|preventDefault={() => callback(DEVICE_TYPES[type])}
    >
      <DeviceIcon type={DEVICE_TYPES[type]} />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>{DEVICE_TYPES[type]}</label>
    </button>
  {/each}
</div>

<style lang="scss">
  .device-type-picker {
    display: flex;
    flex-wrap: wrap;

    .device-type-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: calc(33% - 2rem);
      width: calc(50% - 0.5rem);
      margin: 0 1rem 1rem 0;
      padding-top: 0.25rem;
      border: 1px solid var(--secondaryBtnBg);
      background-color: #fff;
      color: var(--primary);

      &:nth-child(even) {
        margin-right: 0;
      }

      &.selected {
        background-color: var(--primaryBtnBg);
        color: var(--primaryBtnText);
        box-shadow: 0 1px 16px rgba(0, 0, 0, 0.3) inset;

        label {
          color: var(--primaryBtnText);
        }
      }

      label {
        text-align: center;
      }
    }
  }
</style>
