<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    DEVICE_NAME,
    DEVICE_TYPE,
    DEVICE_NAME_ALREADY_EXISTS,
    NO_NAME_ENTERED,
    SET_DEVICE_NAME_PROMPT,
    WELCOME_EXCLAM
  } from '../modules/constants';
  import { getBestGuessDevice } from '../modules/helpers';
  import Rest from '../modules/rest';
  import LocalStorage from '../modules/localStorage';
  import { addAlert } from '../modules/stores';
  import DeviceTypePicker from '../components/DeviceTypePicker.svelte';

  let error = '';
  let addedDevice;
  let disableSubmit = true;
  let isSubmitting = false;
  let type;
  let name;
  let devices = [];
  let inputRef;

  onMount(() => {
    type = getBestGuessDevice();
  });

  function setDeviceType(val) {
    type = val;
    window.smoothScroll(inputRef, 500);
    setTimeout(() => inputRef.focus(), 500);
  }

  function onKeyup(e) {
    disableSubmit = !name;
    if (error && e.target.value.trim() !== name) {
      error = null;
    }
  }

  function validate() {
    return new Promise((resolve, reject) => {
      if (!name) {
        return reject(NO_NAME_ENTERED);
      }

      let existingDevice = devices.find(
        (d) => d.name.toLowerCase() === name.toLowerCase()
      );
      if (existingDevice) {
        return reject(DEVICE_NAME_ALREADY_EXISTS);
      }

      return resolve();
    });
  }

  async function submit(e) {
    e.preventDefault();
    if (!isSubmitting) {
      isSubmitting = true;
      error = null;
      disableSubmit = true;
      await validate();
      try {
        const dev = await Rest.post('devices', { name, type });
        devices = [...devices, dev];
        disableSubmit = false;
        isSubmitting = false;
        LocalStorage.set('device', dev);
        goto('/');
        addAlert({ type: 'success', msg: `Registered ${dev.name}!` });
      } catch (e) {
        console.error(e);
        error = e;
        disableSubmit = false;
        isSubmitting = false;
      }
    }
  }
</script>

<div class="main set-device">
  <h2>{WELCOME_EXCLAM}</h2>
  <p>{SET_DEVICE_NAME_PROMPT}</p>
  <form
    class="set-device flex-1 flex-col pad-1rem"
    on:submit={(e) => submit(e)}
  >
    <div class="form-group big">
      <label for="name">{DEVICE_NAME}</label>
      <!-- svelte-ignore a11y-positive-tabindex -->
      <input
        type="text"
        id="name"
        name="name"
        on:keyup={onKeyup}
        tabindex="2"
        bind:this={inputRef}
        bind:value={name}
      />
      {#if error}
        <p class="alert alert-error">{error}</p>
      {/if}
    </div>
    <div class="form-group big">
      <label for="name">{DEVICE_TYPE}</label>
      <DeviceTypePicker selectedType={type} callback={setDeviceType} />
    </div>
    <!-- svelte-ignore a11y-positive-tabindex -->
    <input
      tabindex="10"
      class="btn big success"
      type="submit"
      disabled={disableSubmit}
      value="Add"
    />
  </form>
</div>

<style>
  .main.set-device {
    margin: 0 auto;
  }
  .set-device {
    max-width: 800px;
  }
  .set-device h2,
  .set-device p {
    padding: 0 1rem;
  }
  .set-device h2 {
    margin: 1rem 0;
  }
  .set-device p {
    margin: 0;
  }
  .set-device .alert {
    padding: 1rem;
  }
  @media screen and (max-height: 600px) {
    .set-device .form-group.big label {
      font-size: 1rem;
    }
    .set-device .form-group.big input {
      font-size: 1.25rem;
      height: 3rem;
    }
  }
  .form-group.big label {
    font-size: 1.25rem;
  }
  .form-group.big input {
    font-size: 2rem;
    height: 4rem;
    padding: 0.5rem;
  }
</style>
