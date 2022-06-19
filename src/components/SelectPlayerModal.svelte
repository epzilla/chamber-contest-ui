<script lang="ts">
  import { scale } from 'svelte/transition';
  import SelectList from './SelectList.svelte';
  import PlayerListItem from './PlayerListItem.svelte';
  import AddPlayerModal from './AddPlayerModal.svelte';
  import { ADD_NEW_PLAYER, SELECT_PLAYER_NUM } from '../modules/constants';
  import { onDestroy, onMount } from 'svelte';

  export let isSelectingPlayer: number;
  export let dismiss: () => void;
  export let doubles: boolean = false;
  export let player1: Player = null;
  export let player2: Player = null;
  export let partner1: Player = null;
  export let partner2: Player = null;
  export let players: Player[] = [];
  export let select;

  let isAddingPlayer = 0;

  $: selectablePlayers =
    players?.filter(p => {
      switch (isSelectingPlayer) {
        case 1:
          if (doubles) {
            return p?.id !== player1?.id && p?.id !== partner1?.id;
          }
          return p?.id !== player1?.id;
        case 2:
          if (doubles) {
            return p?.id !== player2?.id && p?.id !== partner2?.id;
          }
          return p?.id !== player2?.id;
        case 3:
          if (doubles) {
            return p?.id !== player1?.id && p?.id !== partner1?.id;
          }
          return p?.id !== partner1?.id;
        case 4:
          if (doubles) {
            return p?.id !== player2?.id && p?.id !== partner2?.id;
          }
          return p?.id !== partner2?.id;
        default:
          return true;
      }
    }) || [];

  function addPlayer(newPlayer) {
    players.push(newPlayer);
    select(newPlayer);
  }

  function onKeyUp({ target, key }) {
    if (key === 'Escape' && !isAddingPlayer) {
      dismiss();
    }
  }

  onMount(() => document.addEventListener('keyup', onKeyUp));
  onDestroy(() => document.removeEventListener('keyup', onKeyUp));
</script>

<div
  in:scale={{ duration: 200 }}
  out:scale={{ duration: 200 }}
  class="modal-wrapper select-player-modal-wrapper"
>
  <div class="modal-backdrop select-player-modal-backdrop" />
  <div class="modal select-player-modal-main">
    <div class="modal-header">
      <h2>{SELECT_PLAYER_NUM(isSelectingPlayer)}</h2>
      <button class="dismiss-btn" on:click={() => dismiss()}>&times;</button>
    </div>
    <div class="modal-body flex-1">
      <div class="flex-1 flex-col">
        <div class="player-select-list-wrap flex-1 flex-col">
          <SelectList
            className="player-select-list"
            selectedItems={[]}
            items={selectablePlayers}
            onSelect={p => select(p)}
            component={PlayerListItem}
          />
        </div>
        <div class="btn-wrap margin-1rem flex-shrink-0 flex-col">
          <button
            class="btn primary big add-player"
            on:click={() => (isAddingPlayer = isSelectingPlayer)}
          >
            <i class="fa fa-plus-circle" />
            <span>{ADD_NEW_PLAYER}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<AddPlayerModal
  show={isAddingPlayer > 0}
  dismiss={() => (isAddingPlayer = 0)}
  add={addPlayer}
  {players}
/>

<style lang="scss">
  .modal {
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 56px;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 7;
    background-color: white;
  }

  .modal-header {
    width: 100%;
    min-height: 4rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 1rem;
  }

  .modal-backdrop {
    position: fixed;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    background-color: rgba(0, 0, 0, 0.8);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
  }
</style>
