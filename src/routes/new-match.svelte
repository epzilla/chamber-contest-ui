<script context="module" lang="ts">
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch }) {
    try {
      const res = await fetch(`${BASE_URL}players`);
      const players: Player[] = await res.json();
      return {
        props: {
          players
        }
      };
    } catch (err) {
      return {
        status: 500,
        error: new Error(`Error doing stuff`)
      };
    }
  }
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    AFTER_EACH_GAME,
    BEGIN,
    BEST_OF,
    CHANGE,
    DOUBLES,
    FIRST_SERVE_PROMPT,
    FLIP_COIN,
    GAMES,
    HERE_GOES,
    MATCH_STARTED,
    NO,
    OTHER,
    PLAY_ALL_GAMES,
    PLAY_TO,
    POINT_BY_POINT,
    SINGLES,
    START_A_NEW_MATCH,
    UPDATE_SCORES,
    VS_ABBREV,
    YES
  } from '../modules/constants';
  import LocalStorage from '../modules/localStorage';
  import Rest from '../modules/rest';
  import WebSockets from '../modules/websockets';
  import Avatar from '../components/Avatar.svelte';
  import Stepper from '../components/Stepper.svelte';
  import SegmentedControl from '../components/SegmentedControl.svelte';
  import PlayerSelectBlock from '../components/PlayerSelectBlock.svelte';
  import SelectPlayerModal from '../components/SelectPlayerModal.svelte';
  import { currentMatch } from '../modules/stores';
  import AddPlayerModal from '../components/AddPlayerModal.svelte';

  export let players: Player[];
  let doubles = false;
  $: player1 = players?.length >= 2 ? players[0] : null;
  $: player2 = players?.length >= 2 ? players[1] : null;
  let partner1 = null;
  let partner2 = null;
  let isSelectingPlayer = 0;
  let isAddingNewPlayer = 0;
  let playTo = 21;
  let selectedPlayToOption = 21;
  let winByTwo = true;
  let bestOf = 3;
  let updateEveryPoint = 1;
  let playAllGames = 0;
  let showPlayToInput = false;
  let flipping = false;
  let showCoinToss = false;
  let showCoinReverse = false;
  let firstServe = null;
  let flippingToP2 = false;
  let p2winsToss = false;

  let device = LocalStorage.get('device');
  let deviceId = device?.id || null;
  let toggledOn = false;

  function onMatchStartedElsewhere(match) {
    currentMatch.set(match);
    goto('/');
  }

  function setAndCacheState() {
    LocalStorage.set('start-match-state', {
      player1,
      player2,
      partner1,
      partner2
    });
  }

  function selectPlayer(p) {
    switch (isSelectingPlayer) {
      case 1:
        player1 = p;
        break;
      case 2:
        player2 = p;
        break;
      case 3:
        partner1 = p;
        break;
      default:
        partner2 = p;
        break;
    }

    // Check to make sure there aren't any duplicates
    let dupeIndex = [player1, player2, partner1, partner2].findIndex(
      (player, i) => player && p.id === player.id && isSelectingPlayer !== i + 1
    );
    switch (dupeIndex) {
      case 0:
        player1 = null;
        break;
      case 1:
        player2 = null;
        break;
      case 2:
        partner1 = null;
        break;
      case 3:
        partner2 = null;
        break;
    }
    isSelectingPlayer = -1;
    setAndCacheState();
  }

  function onBestOfChange({ amount }) {
    bestOf = amount;
  }

  function onPlayToOptionChange(p) {
    if (p === 11 || p === 21) {
      selectedPlayToOption = p;
      playTo = p;
      showPlayToInput = false;
    } else {
      selectedPlayToOption = -1;
      showPlayToInput = true;
    }
  }

  function onPlayToInputChange(e) {
    playTo = parseInt(e.target.value);
  }

  function onScoringTypeChange(u) {
    updateEveryPoint = u;
  }

  function onPlayAllChange(p) {
    playAllGames = p;
  }

  function dismissModal() {
    isSelectingPlayer = -1;
  }

  function beginMatch() {
    let packet = {
      deviceId,
      player1Id: player1.id,
      player2Id: player2.id,
      partner1Id: partner1?.id || null,
      partner2Id: partner2?.id || null,
      doubles,
      updateEveryPoint,
      bestOf,
      playTo,
      winByTwo,
      playAllGames
    };
    Rest.post('matches/create', packet).then(({ match }) => {
      LocalStorage.delete('start-match-state');
      let matchIds = LocalStorage.get('match-ids');
      if (!matchIds || matchIds.length === 0) {
        matchIds = [match.id];
      } else {
        matchIds.push(match.id);
      }
      LocalStorage.set('match-ids', matchIds);
      currentMatch.set(match);
      goto('/update-score');
    });
  }

  function addNewPlayer(num) {
    if (player1 || player2 || partner1 || partner2) {
      LocalStorageService.set('start-match-state', {
        player1,
        player2,
        partner1,
        partner2
      });
    }
    isAddingNewPlayer = isSelectingPlayer;
  }

  function onCoinFlipAnimationEnd(e) {
    if (e.animationName.indexOf('coin-flip') !== -1) {
      document.removeEventListener('animationend', onCoinFlipAnimationEnd);
      flipping = false;
      flippingToP2 = false;
      if (p2winsToss) {
        firstServe = player2;
        showCoinReverse = true;
      } else {
        firstServe = player1;
        showCoinReverse = false;
      }
    }
  }

  function flipCoin() {
    firstServe = null;
    showCoinToss = true;
    showCoinReverse = false;

    p2winsToss = Math.floor(Math.random() * 101) >= 50 ? true : false;
    setTimeout(() => {
      flipping = !p2winsToss;
      flippingToP2 = p2winsToss;
      setTimeout(() => {
        document.addEventListener(
          'animationend',

          onCoinFlipAnimationEnd
        );
      }, 200);
    }, 500);
  }

  onMount(async () => {
    await WebSockets.init();
    WebSockets.subscribe(MATCH_STARTED, onMatchStartedElsewhere);
    let cachedState = LocalStorage.get('start-match-state');
    player1 = cachedState?.player1 || player1;
    player2 = cachedState?.player2 || player2;
    if (cachedState?.doubles) {
      partner1 = cachedState?.partner1;
      partner2 = cachedState?.partner2;
    }
  });

  onDestroy(() => {
    WebSockets.unsubscribe(MATCH_STARTED, onMatchStartedElsewhere);
  });
</script>

<h2>{START_A_NEW_MATCH}</h2>
<div class="doubles-switch">
  <SegmentedControl
    options={[
      { label: SINGLES, value: false },
      { label: DOUBLES, value: true }
    ]}
    value={doubles}
    onChange={() => (doubles = !doubles)}
  />
</div>
<hr />
<div class="player-selection-area">
  <div class="team-select-block">
    <PlayerSelectBlock
      {doubles}
      isPartner={false}
      player={player1}
      num={1}
      selectCallback={() => (isSelectingPlayer = 1)}
      selectBtnText={CHANGE}
    />
    {#if doubles}
      <PlayerSelectBlock
        doubles={true}
        isPartner={true}
        player={partner1}
        num={3}
        selectCallback={() => (isSelectingPlayer = 3)}
        selectBtnText={CHANGE}
      />
    {/if}
  </div>
  <div class="player-selected-block flex-center">
    <div class="versus-separator">{VS_ABBREV}</div>
  </div>
  <div class="team-select-block">
    <PlayerSelectBlock
      {doubles}
      isPartner={false}
      player={player2}
      num={2}
      selectCallback={() => (isSelectingPlayer = 2)}
      selectBtnText={CHANGE}
    />
    {#if doubles}
      <PlayerSelectBlock
        doubles={true}
        isPartner={true}
        player={partner2}
        num={4}
        selectCallback={() => (isSelectingPlayer = 4)}
        selectBtnText={CHANGE}
      />
    {/if}
  </div>
</div>
<hr />
<div class="match-settings flex-col">
  <div class="flex-col margin-bottom-1rem">
    <div class="stepper-wrap flex-center">
      <span class="label">{BEST_OF}</span>
      <Stepper
        full
        onChange={onBestOfChange}
        initialValue={bestOf}
        min={1}
        max={7}
      />
      <span class="label">{GAMES}</span>
    </div>
    <hr />
    <div class="flex-center flex-col controls-col">
      <span class="label">{PLAY_TO}</span>
      <SegmentedControl
        options={[
          { label: '11', value: 11 },
          { label: '21', value: 21 },
          { label: OTHER, value: -1 }
        ]}
        value={selectedPlayToOption}
        onChange={onPlayToOptionChange}
      />
      {#if showPlayToInput}
        <input
          type="number"
          inputmode="numeric"
          pattern="[0-9]*"
          name="play-to-input"
          id="play-to-input"
          value={playTo}
          onChange={onPlayToInputChange}
        />
      {/if}
    </div>
    <hr />
    <div class="flex-center flex-col controls-col">
      <span class="label">{PLAY_ALL_GAMES}</span>
      <SegmentedControl
        options={[
          { label: YES, value: 1 },
          { label: NO, value: 0 }
        ]}
        value={playAllGames}
        onChange={onPlayAllChange}
      />
    </div>
    <hr />
    <div class="flex-center flex-col controls-col">
      <span class="label">{UPDATE_SCORES}</span>
      <SegmentedControl
        options={[
          { label: AFTER_EACH_GAME, value: 0 },
          { label: POINT_BY_POINT, value: 1 }
        ]}
        value={updateEveryPoint}
        onChange={onScoringTypeChange}
      />
    </div>
  </div>
  <hr />
</div>
{#if player1 && player2}
  <div class="coin-flip-area">
    <div
      class={`flip-container ${flipping ? 'flipping' : ''} ${
        flippingToP2 ? 'flipping-extra' : ''
      } ${showCoinReverse ? 'reversed' : ''}`}
    >
      <div class="flipper">
        <div class="front">
          <Avatar coin big fname={player1.fname} lname={player1.lname} />
        </div>
        <div class="back">
          <Avatar coin big fname={player2.fname} lname={player2.lname} />
        </div>
      </div>
    </div>
  </div>
{/if}
{#if !firstServe && !showCoinToss}
  <div class="match-settings">
    <button class="btn secondary big" on:click={() => flipCoin()}
      >{FLIP_COIN}</button
    >
  </div>
{/if}
{#if firstServe || showCoinToss}
  <div class="match-settings first-serve">
    <div class="flex-center flex-col controls-col">
      {#if firstServe}
        <span class="label">{FIRST_SERVE_PROMPT(firstServe)}</span>
      {:else}
        <span class="label">{HERE_GOES}</span>
      {/if}
    </div>
  </div>
{/if}
<hr />
<div class="start-btn-wrap margin-bottom-1rem">
  <button class="btn success big begin-match-btn" on:click={() => beginMatch()}
    >{BEGIN}</button
  >
</div>

{#if isSelectingPlayer > 0}
  <SelectPlayerModal
    {isSelectingPlayer}
    dismiss={() => (isSelectingPlayer = -1)}
    {doubles}
    {player1}
    {player2}
    {partner1}
    {partner2}
    {players}
    select={selectPlayer}
  />
{/if}

<style lang="scss">
  .main.new-match {
    display: flex;
    flex-direction: column;
    align-items: center;

    .match-settings {
      .label {
        font-size: 1.35rem;
        max-width: calc(100vw - 2rem);

        &:first-of-type {
          text-align: right;
        }
      }

      .controls-col {
        .label {
          text-align: center;
          margin-bottom: 0.5rem;
        }

        input {
          margin-top: 0.5rem;
          font-size: 1.5rem;
          height: 3rem;
          width: 5rem;
          padding: 0.5rem;
        }
      }

      &.first-serve {
        .controls-col .label {
          padding: 1rem;
          margin-bottom: 0;
        }
      }
    }
  }

  .team-select-block {
    display: flex;
    flex-direction: column;
  }

  .player-selected-block,
  .versus-separator {
    margin-bottom: 1rem;
  }

  .player-selection-area {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  }

  .player-selected-block {
    display: flex;
    align-items: center;

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

  .and-separator,
  .versus-separator {
    font-size: 1.5rem;
  }

  .and-separator {
    margin-bottom: 1rem;
  }

  .versus-separator {
    margin-bottom: 0;
    position: relative;

    &:before,
    &:after {
      content: '';
      width: 5rem;
      position: absolute;
      top: 1.25rem;
      border: 1px solid #eee;
    }

    &:before {
      left: -6rem;
    }

    &:after {
      left: 2.75rem;
    }
  }

  .coin-flip-area {
    height: 10rem;
    z-index: 15;
  }

  .coin-flip-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .flip-container {
    display: block !important;
    perspective: 1000px;
  }

  .flip-container.flipping,
  .flip-container.flipping-extra {
    animation: coin-toss 2s ease-in-out;

    .front {
      z-index: 0;
    }
  }

  .flip-container.flipping .flipper {
    animation: coin-flip 2s ease-out;
  }

  .flip-container.flipping-extra .flipper {
    animation: coin-flip-reverse 2s ease-out;
  }

  .flip-container.reversed {
    .flipper {
      transform: rotateX(180deg);
      transition: 0.2s ease;
    }
  }

  .flip-container,
  .flipper,
  .front,
  .back {
    width: 8rem;
    height: 8rem;
  }

  /* flip speed goes here */
  .flipper {
    transition: all 0.6s;
    position: relative;
    transform-style: preserve-3d;
  }

  .front {
    z-index: 2;
  }

  /* hide back of pane during swap */
  .front,
  .back {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 8rem;
    height: 8rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* back, initially hidden pane */
  .back {
    transform: rotateY(180deg) rotateZ(180deg);
  }
</style>
