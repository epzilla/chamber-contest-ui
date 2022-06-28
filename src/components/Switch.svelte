<script lang="ts">
  export let checked = false;
  export let onChange: (val: boolean) => void = null;

  function handleChange(e) {
    if (onChange) {
      onChange(e.target.value);
    }
  }
</script>

<label class="switch">
  <input type="checkbox" bind:checked on:change={handleChange} />
  <span class="slider" />
</label>

<style>
  .switch {
    cursor: pointer;
    text-indent: -9999px;
    width: 40px;
    height: 20px;
    background: var(--colorDisabledText);
    display: block;
    border-radius: 10px;
    position: relative;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.2s;
    transition: 0.2s;
    border-radius: 10px;
  }

  .slider:before {
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

  input:checked + .slider {
    background-color: var(--primary);
  }

  input:checked + .slider {
    box-shadow: 0 0 1px var(--primary);
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
</style>
