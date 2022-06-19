<script context="module">
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch, context }) {
    try {
      const matchResult = await fetch(`${BASE_URL}matches/current`);
      const match = await matchResult.json();
      return {
        props: {
          match,
          matchInProgress: match
        },
        context: {
          matchInProgress: match
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
  import { onMount } from 'svelte';
  import { MATCH_FINISHED } from '../modules/constants';
  import { currentMatch } from '../modules/stores';
  import { isEmpty } from '../modules/helpers';
  import WebSockets from '../modules/websockets';
  import FixedAlerts from '../components/FixedAlerts.svelte';
  import Nav from '../components/Nav.svelte';

  export let match;
  export let matchInProgress;

  $: {
    if (!isEmpty(match)) {
      currentMatch.set(match);
      matchInProgress = match;
    }
  }
  currentMatch.subscribe((m) => {
    matchInProgress = m;
  });

  if (
    typeof Notification !== 'undefined' &&
    Notification.permission !== 'granted' &&
    Notification.permission !== 'denied'
  ) {
    Notification.requestPermission();
  }

  function onMatchFinish(finishedMatch) {
    currentMatch.set(null);
    matchInProgress = null;
  }

  onMount(async () => {
    await WebSockets.init();
    WebSockets.subscribe(MATCH_FINISHED, onMatchFinish);
  });
</script>

<Nav match={matchInProgress} />
<main>
  <slot />
  <FixedAlerts />
</main>
