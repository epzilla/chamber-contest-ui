<script lang="ts">
  export let value: number;
  export let min: number = null;
  export let max: number = null;
  export let onChange;

  function onUp() {
    if ((onChange && max == null) || value + 1 <= max) {
      onChange(value + 1);
    }
  }

  function onDown() {
    if ((onChange && min == null) || value - 1 >= min) {
      onChange(value - 1);
    }
  }

  function onFocus(e) {
    e.target.select();
  }

  function onInputChange(e) {
    onChange(parseInt(e.target.value || 0));
  }
</script>

<div class="stepper">
  <button on:click={onDown} class="minus">–</button>
  <input type="text" {value} on:focus={onFocus} on:change={onInputChange} />
  <button on:click={onUp} class="plus">+</button>
</div>

<style lang="scss">
  .stepper {
    touch-action: manipulation;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;

    * {
      height: 34px;
    }

    input {
      width: 50px;
      font-size: 1.25rem;
      margin: 0;
      border-radius: 0;
      border: 1px solid var(--colorDisabledText);
      border-left: none;
      border-right: none;
      text-align: center;

      &:focus {
        outline: none;
        border: 2px solid var(--colorPrimary);
      }
    }

    button {
      width: 30px;
      background-color: #00a1cd;
      color: white;
      font-size: 16pt;

      &.plus {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      &.minus {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }
</style>
