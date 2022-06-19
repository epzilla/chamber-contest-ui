<!-- svelte-ignore a11y-label-has-associated-control -->
<script context="module">
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch, context }) {
    try {
      const { matchInProgress } = context;
      const devicesResult = await fetch(`${BASE_URL}devices`);
      const devices = await devicesResult.json();
      return {
        props: {
          match: matchInProgress,
          devices
        }
      };
    } catch (err) {
      return {
        status: 500,
        error: err
      };
    }
  }
</script>

<script>
  import Rest from '../modules/rest';
  import WebSockets from '../modules/websockets';
  import LocalStorage from '../modules/localStorage';
  import {
    ADDED_DEVICES_TO_MATCH,
    CONFIRM_END_MATCH,
    DEVICE_CANNOT_UPDATE_MATCH,
    END_MATCH,
    END_MATCH_AFFIRMATIVE,
    END_MATCH_CONFIRMATION_PROMPT,
    END_MATCH_NEGATIVE,
    FINAL_TOGGLE_LABEL,
    GAME_FINISHED,
    GAME_STARTED,
    LET_OTHERS_UPDATE,
    MATCH_FINISHED,
    NO_MATCH_IN_PROGRESS,
    PLAYING_TO_AND_BEST_OF_PROMPT,
    SCORE_UPDATE,
    START_NEW_ONE,
    UPDATE_SCORE
  } from '../modules/constants';

  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import Modal from '../components/Modal.svelte';
  import SelectDeviceModal from '../components/SelectDeviceModal.svelte';
  import Expandable from '../components/Expandable.svelte';
  import Stepper from '../components/Stepper.svelte';
  import Toggle from '../components/Toggle.svelte';
  import {
    generateSharedDevicesAlert,
    getScoreHeaderLine,
    getTeamName,
    isEmpty
  } from '../modules/helpers';
  import { addAlert, currentMatch } from '../modules/stores';

  const device = LocalStorage.get('device');
  const deviceId = device?.id || null;
  export let devices;
  export let match;
  let gamesCollapsed = {};
  let showChooseOtherDevice = false;
  let showConfirmEndMatch = false;
  let notAuthorized = true;

  async function selectDevices(devices) {
    if (devices?.length > 0) {
      showChooseOtherDevice = false;
      try {
        await Rest.post('matches/add-devices', {
          deviceId,
          match,
          devices
        });
        addAlert({
          type: 'info',
          msg: generateSharedDevicesAlert(devices),
          timeout: 10000
        });
      } catch (e) {
        addAlert({ type: 'error', msg: e });
      }
    }
  }

  function onScoreUpdateFromElsewhere({ game, scorer }) {
    let i = match.games.findIndex((g) => g.id === game.id);
    if (i !== -1) {
      let games = [...match.games];
      games[i] = game;
      match.games = games;
      match = match;
    }
  }

  function onGameStartedElsewhere(game) {
    let i = match.games.findIndex((g) => g.id === game.id);
    if (i === -1) {
      match.games.push(game);
    } else {
      match.games[i] = game;
    }

    match = match;
    if (game.gameFinished) {
      gamesCollapsed[game.id] = true;
      gamesCollapsed = gamesCollapsed;
    }
  }

  function onMatchFinishedFromElsewhere(m) {
    if (m.id === match.id) {
      goto(`/match-summary/${match.id}`);
    }
  }

  function onGameFinishedFromElsewhere({ game }) {
    onGameStartedElsewhere(game);
  }

  function onDevicesAdded({ match, deviceIds }) {
    if (notAuthorized) {
      notAuthorized = deviceIds.every((d) => d !== deviceId);
    }
  }

  function confirmEndMatch() {
    showConfirmEndMatch = true;
  }

  function dismissEndMatchModal() {
    showConfirmEndMatch = false;
  }

  function checkIfMatchFinished() {
    let wins1 = 0;
    let wins2 = 0;
    match.games.forEach((g) => {
      if (g.score1 > g.score2 && g.gameFinished) {
        wins1++;
      } else if (g.score2 > g.score1 && g.gameFinished) {
        wins2++;
      }
    });
    if (
      match.bestOf &&
      (wins1 + wins2 === match.bestOf ||
        (wins1 > match.bestOf / 2 && !match.playAllGames) ||
        (wins2 > match.bestOf / 2 && !match.playAllGames))
    ) {
      confirmEndMatch();
    } else {
      addGame();
    }
  }

  function addGame() {
    Rest.post('games/add', { match, deviceId }).then((g) => {
      match.games.push(g);
      Object.keys(gamesCollapsed).forEach((gc) => {
        gamesCollapsed[gc] = true;
      });
      gamesCollapsed[g.id] = false;
      match = match;
      gamesCollapsed = gamesCollapsed;
    });
  }

  async function scoreChange(game, playerNum, { amount }) {
    let { games } = match;
    let i = games.findIndex((g) => g.id === game.id);
    if (i !== -1) {
      let checkForFinishedMatch = false;
      games[i][`score${playerNum}`] = amount;
      if (
        match.updateEveryPoint &&
        amount >= match.playTo &&
        (!match.winByTwo || Math.abs(games[i].score1 - games[i].score2) > 1)
      ) {
        games[i].gameFinished = 1;
        gamesCollapsed[games[i].id] = true;
        checkForFinishedMatch = true;
        gamesCollapsed = gamesCollapsed;
      }
      await Rest.post('games/update', {
        game: games[i],
        scorer: playerNum,
        deviceId
      });
      match = { ...match, games };
      if (checkForFinishedMatch) {
        checkIfMatchFinished();
      }
    }
  }

  function chooseOtherDevice() {
    showChooseOtherDevice = true;
  }

  function dismissDeviceModal() {
    showChooseOtherDevice = false;
  }

  function endMatch() {
    if (match && deviceId) {
      match.finished = 1;
      Rest.post('matches/finish', { match, deviceId }).then(() => {
        let matchIds = LocalStorage.get('match-ids');
        if (matchIds) {
          let i = matchIds.indexOf(match.id);
          if (i !== -1) {
            matchIds.splice(i, 1);
            LocalStorage.set('match-ids', matchIds);
          }
        }
        currentMatch.set({});
        goto(`/match-summary/${match.id}`);
      });
    }
  }

  function getTitle(g, i) {
    let title = `Game ${i + 1}`;
    if (g.gameFinished) {
      title += ` — ${getScoreHeaderLine(match, g)}`;
    }
    return title;
  }

  function toggleExpanded(id) {
    gamesCollapsed[id] = !gamesCollapsed[id];
    gamesCollapsed = gamesCollapsed;
  }

  function toggleFinished(id) {
    let i = match.games.findIndex((g) => g.id === id);
    if (i !== -1) {
      match.games[i].gameFinished = !match.games[i].gameFinished;
      Rest.post('games/update', { game: match.games[i], deviceId }).then(() => {
        match = match;
        if (match.games[i].gameFinished) {
          gamesCollapsed[match.games[i].id] = true;
          gamesCollapsed = gamesCollapsed;
          checkIfMatchFinished();
        }
      });
    }
  }

  onMount(async () => {
    if (isEmpty(match)) {
      match = $currentMatch;
    }
    if (!isEmpty(match) && deviceId && devices) {
      WebSockets.subscribe(SCORE_UPDATE, onScoreUpdateFromElsewhere);
      WebSockets.subscribe(GAME_STARTED, onGameStartedElsewhere);
      WebSockets.subscribe(MATCH_FINISHED, onMatchFinishedFromElsewhere);
      WebSockets.subscribe(GAME_FINISHED, onGameFinishedFromElsewhere);
      WebSockets.subscribe(ADDED_DEVICES_TO_MATCH, onDevicesAdded);
      const canUpdateScore = await Rest.get(
        `matches/can-update-score/${deviceId}`
      );
      notAuthorized = !canUpdateScore;
      if (canUpdateScore) {
        match.games.forEach((g) => (gamesCollapsed[g.id] = !!g.gameFinished));
      } else {
        console.warn(DEVICE_CANNOT_UPDATE_MATCH);
      }
    } else {
      console.warn(NO_MATCH_IN_PROGRESS);
    }
  });

  onDestroy(() => {
    WebSockets.unsubscribe(SCORE_UPDATE, onScoreUpdateFromElsewhere);
    WebSockets.unsubscribe(GAME_STARTED, onGameStartedElsewhere);
    WebSockets.unsubscribe(MATCH_FINISHED, onMatchFinishedFromElsewhere);
    WebSockets.unsubscribe(GAME_FINISHED, onGameFinishedFromElsewhere);
    WebSockets.unsubscribe(ADDED_DEVICES_TO_MATCH, onDevicesAdded);
  });
</script>

<div class="main update-score">
  {#if isEmpty(match)}
    <h3>{NO_MATCH_IN_PROGRESS}</h3>
    <button class="btn big primary" on:click={() => goto('/new-match')}
      >{START_NEW_ONE}</button
    >
  {:else if notAuthorized}
    <h3>{DEVICE_CANNOT_UPDATE_MATCH}</h3>
  {:else}
    <h2 class="align-center">{UPDATE_SCORE}</h2>
    <p class="match-update-info">
      <i class="fa fa-info-circle" />
      <span> {PLAYING_TO_AND_BEST_OF_PROMPT(match)}</span>
    </p>
    <ul class="games-list select-list">
      {#if match?.games}
        {#each match.games as game, i}
          <li>
            <Expandable
              title={getTitle(game, i)}
              forceCollapsed={gamesCollapsed[game.id]}
              id={game.id}
              toggle={(id) => toggleExpanded(id)}
            >
              <div class="game-update-row">
                <div class="flex-col flex-center">
                  <h4>{getTeamName(match, 1)}</h4>
                  <Stepper
                    full
                    min={0}
                    onChange={(e) => scoreChange(game, 1, e)}
                    initialValue={game.score1}
                  />
                </div>
                <div class="flex-col flex-justify-end">
                  <div class="stepper-separator">
                    <h4 class="vs-symbol align-center">vs</h4>
                  </div>
                </div>
                <div class="flex-col flex-center">
                  <h4>{getTeamName(match, 2)}</h4>
                  <Stepper
                    full
                    min={0}
                    onChange={(e) => scoreChange(game, 2, e)}
                    initialValue={game.score2}
                  />
                </div>
              </div>
              <div class="flex final-score-toggle">
                <label>{FINAL_TOGGLE_LABEL}</label>
                <Toggle
                  id={`game-${i}-finished`}
                  toggled={toggleFinished}
                  onOff={game.gameFinished}
                  property={game.id}
                />
              </div>
            </Expandable>
          </li>
        {/each}
      {/if}
    </ul>
    <button class="btn big success" on:click={confirmEndMatch}>
      <i class="fa fa-check" />
      <span>{END_MATCH}</span>
    </button>
    {#if devices?.length > 0}
      <button
        class="btn big primary change-device-btn"
        on:click={chooseOtherDevice}
      >
        <div class="exchange-btns">
          <i class="fa fa-mobile" />
          <i class="fa fa-exchange" />
          <i class="fa fa-mobile" />
        </div>
        <span>{LET_OTHERS_UPDATE}</span>
      </button>
    {/if}
    <Modal
      header={CONFIRM_END_MATCH}
      show={showConfirmEndMatch}
      content={END_MATCH_CONFIRMATION_PROMPT}
      confirmText={END_MATCH_AFFIRMATIVE}
      cancelText={END_MATCH_NEGATIVE}
      confirm={endMatch}
      dismiss={dismissEndMatchModal}
    />
    <SelectDeviceModal
      show={showChooseOtherDevice}
      onSelect={selectDevices}
      {devices}
      dismiss={dismissDeviceModal}
    />
  {/if}
</div>

<style lang="scss">
  .games-list {
    li {
      list-style-type: none;
    }
  }
</style>
