<script>
  import { SELECT_PLAYER_OR_PARTNER } from '../modules/constants';
  import Avatar from './Avatar.svelte';
  export let player;
  export let num;
  export let selectCallback;
  export let selectBtnText;
  export let isPartner;
</script>

<div
  class={`player-selected-block flex${player ? '' : ' empty'}`}
  on:click={() => !player && selectCallback(num)}
>
  <div class="avatar-wrap">
    <Avatar empty={!player} fname={player?.fname} lname={player?.lname} />
  </div>
  <div class="player-name-wrap">
    {#if player}
      <h3>{player.fname} {player.lname}</h3>
      <button class="btn primary" on:click={() => selectCallback(num)}
        >{selectBtnText}</button
      >
    {:else}
      <h3>{SELECT_PLAYER_OR_PARTNER(isPartner)}</h3>
    {/if}
  </div>
</div>

<style lang="scss">
  .player-selected-block {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    &.empty {
      border: 1px dashed #aaa;
      cursor: pointer;
      opacity: 0.5;
    }
  }
  .player-name-wrap {
    flex: 1;
    margin-right: 1rem;
  }
</style>
