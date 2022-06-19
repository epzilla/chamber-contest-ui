<script lang="ts">
  import Modal from './Modal.svelte';
  import {
    ADD,
    ADD_NEW_PLAYER,
    ADDED_AS_PLAYER_PROMPT,
    NAME,
    PLAYER_NAME_ALREADY_EXISTS
  } from '../modules/constants';
  import { getFullPlayerName } from '../modules/helpers';
  import Rest from '../modules/rest';
  import { onDestroy } from 'svelte';
  export let dismiss: () => void;
  export let show: boolean;
  export let add: (newPlayer: any) => void;
  export let players: Player[];

  let name = '';
  let error;
  let disableSubmit = true;
  let submittedPlayer;

  $: playerNames = players.map(getFullPlayerName);
  $: {
    if (name.length > 0) {
      error = playerNames.some(p => p.toLowerCase() === name.toLowerCase())
        ? PLAYER_NAME_ALREADY_EXISTS
        : '';
      disableSubmit = !!error;
    } else {
      disableSubmit = true;
    }

    if (show) {
      document.addEventListener('keyup', onKeyUp);
    } else {
      document.removeEventListener('keyup', onKeyUp);
    }
  }
  $: disableSubmit = name.length === 0 || error;

  async function submit(e) {
    e.preventDefault();
    disableSubmit = true;
    try {
      const newPlayer = await Rest.post('players', { name });
      add(newPlayer);
    } catch (err) {
      error = err;
    } finally {
      disableSubmit = false;
    }
  }

  function onKeyUp({ target, key }: KeyboardEvent) {
    if (key === 'Escape') {
      if ((target as HTMLElement).id === 'name' && !!name) {
        name = '';
      } else {
        dismiss();
      }
    }
  }

  onDestroy(() => document.removeEventListener('keyup', onKeyUp));
</script>

<Modal {dismiss} {show}>
  <svelte:fragment slot="header">
    <h2>{ADD_NEW_PLAYER}</h2>
  </svelte:fragment>
  <svelte:fragment slot="content">
    <form
      class="flex-1 flex-col full-width-small-screen pad-1rem"
      on:submit={submit}
    >
      <div class="form-group big">
        <label for="name">{NAME}</label>
        <input type="text" id="name" name="name" bind:value={name} />
      </div>
      <input
        class="btn big success"
        type="submit"
        disabled={disableSubmit}
        value={ADD}
      />
      {#if error}
        <p class="alert alert-error">{error}</p>
      {/if}
      {#if submittedPlayer && !error}
        <p class="alert alert-info">
          {ADDED_AS_PLAYER_PROMPT(submittedPlayer)}
        </p>
      {/if}
    </form>
  </svelte:fragment>
</Modal>
