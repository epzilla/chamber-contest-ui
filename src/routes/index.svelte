<script context="module">
  import { isEmpty } from '../modules/helpers';
  import { BASE_URL, MATCH_FINISHED } from '../modules/constants';

  export async function load({ fetch, context }) {
    try {
      const recentMatchesResult = await fetch(
        `${BASE_URL}matches/most-recent/5`
      );

      const recentMatches = await recentMatchesResult.json();
      const { matchInProgress } = context;
      return {
        props: {
          recentMatches,
          matchInProgress
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

<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import LocalStorage from '../modules/localStorage';
  import WebSockets from '../modules/websockets';
  import Rest from '../modules/rest';
  import BoxScore from '../components/BoxScore.svelte';
  import LiveScoreboard from '../components/LiveScoreboard.svelte';
  import {
    ADDED_DEVICES_TO_MATCH,
    CLICK,
    DEVICE_TYPES,
    GRANTED_ACCESS_TO_UPDATE_SCORE,
    MATCH_STARTED,
    RECENT_MATCHES,
    START_A_NEW_MATCH,
    TAP,
    UPDATE_SCORE
  } from '../modules/constants';
  import { getBestGuessDevice } from '../modules/helpers';
  import { addAlert, currentMatch } from '../modules/stores';

  export let recentMatches = [];
  export let matchInProgress;

  let canUpdateScore = false;
  $: matchStatus = matchInProgress ? 'Match in Progress' : 'Latest Match';
  let device = LocalStorage.get('device');
  let devMode = LocalStorage.get('dev-mode');
  let deviceId = device?.id;
  let clickOrTap = CLICK;

  function onMatchStartedElsewhere(m) {
    currentMatch.set(m);
    matchInProgress = m;
  }

  function onMatchFinishedElsewhere(m) {
    if (m?.id && !recentMatches.some((rm) => rm.id === m.id)) {
      recentMatches = [m, ...recentMatches];
    }
  }

  function onDevicesAdded({ match, deviceIds }) {
    if (!canUpdateScore && deviceIds.indexOf(deviceId) !== -1) {
      canUpdateScore = true;
      addAlert({
        type: 'success',
        msg: GRANTED_ACCESS_TO_UPDATE_SCORE(clickOrTap),
        timeout: 10000,
        clickable: true,
        action: () => goto('/update-score')
      });
    }
  }

  currentMatch.subscribe((m) => (matchInProgress = m));

  onMount(async () => {
    if (deviceId) {
      await WebSockets.init(deviceId, !!devMode);
      canUpdateScore = await Rest.get(`matches/can-update-score/${deviceId}`);
      matchInProgress = $currentMatch;
      WebSockets.subscribe(MATCH_STARTED, onMatchStartedElsewhere);
      WebSockets.subscribe(MATCH_FINISHED, onMatchFinishedElsewhere);
      WebSockets.subscribe(ADDED_DEVICES_TO_MATCH, onDevicesAdded);
    } else {
      goto('/set-device');
    }

    let type = device?.type ? device.type : getBestGuessDevice();
    if (
      type === DEVICE_TYPES.MOBILE_DEVICE ||
      type === DEVICE_TYPES.TABLET_DEVICE
    ) {
      clickOrTap = TAP;
    }
  });

  onDestroy(() => {
    WebSockets.unsubscribe(MATCH_STARTED, onMatchStartedElsewhere);
    WebSockets.subscribe(ADDED_DEVICES_TO_MATCH, onDevicesAdded);
    WebSockets.subscribe(MATCH_FINISHED, onMatchFinishedElsewhere);
  });
</script>

{#if !isEmpty(matchInProgress)}
  <h2 class="align-center primary-text">{matchStatus}</h2>
  <LiveScoreboard match={matchInProgress} />
  {#if canUpdateScore}
    <a href="/update-score" class="btn big success update-score"
      >{UPDATE_SCORE}</a
    >
  {/if}
{:else if deviceId}
  <div class="flex-row flex-center pad-1rem">
    <a href="/new-match" class="btn big primary center margin-top-1rem"
      >{START_A_NEW_MATCH}</a
    >
  </div>
{/if}

{#if recentMatches.length > 0}
  <hr />
  <h3 class="align-center primary-text">{RECENT_MATCHES}</h3>
  <ul>
    {#each recentMatches as m}
      {#if !m || m.id !== matchInProgress?.id}
        <BoxScore match={m} />
      {/if}
    {/each}
  </ul>
{/if}
