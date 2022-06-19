<!-- svelte-ignore a11y-label-has-associated-control -->
<script context="module">
  import { BASE_URL } from '../modules/constants';
  export async function load({ fetch }) {
    const res = await fetch(`${BASE_URL}players`);
    const players = await res.json();
    const playerOptions =
      players?.map((p) => ({
        label: `${p.fname} ${p.lname}`,
        value: p.id,
        disabled: false
      })) || [];
    return {
      props: {
        playerOptions
      }
    };
  }
</script>

<script>
  import format from 'date-fns/format/index.js';
  import isAfter from 'date-fns/isAfter/index.js';
  import Chart from 'svelte-frappe-charts';
  import Select from 'svelte-select';
  import {
    CLICK,
    DEVICE_TYPES,
    FILTER_BY_DATE,
    FROM,
    GAME_BY_GAME_AVERAGES,
    GAMES_WON,
    HEAD_TO_HEAD_LABEL,
    MATCH_RESULTS,
    MATCH_STARTED,
    MATCHES_WON,
    POINTS_WON,
    SUBMIT,
    TAP,
    TO
  } from '../modules/constants';
  import {
    generateMatchStartAlert,
    getBestGuessDevice
  } from '../modules/helpers';
  import LocalStorage from '../modules/localStorage';
  import Rest from '../modules/rest';
  import WebSockets from '../modules/websockets';
  import Toggle from '../components/Toggle.svelte';
  import BoxScore from '../components/BoxScore.svelte';
  import HeadingWithExtenderLines from '../components/HeadingWithExtenderLines.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { addAlert } from '../modules/stores';
  import { goto } from '$app/navigation';
  export let playerOptions;

  const dateFormat = 'yyyy-MM-dd';
  let resultHR;

  let stats;
  let perGameData;
  let useDates = false;
  let startDate = format(new Date(), dateFormat);
  let endDate = format(new Date(), dateFormat);

  let player1 = playerOptions?.length > 0 ? playerOptions[0] : null;
  let player2 = playerOptions?.length > 1 ? playerOptions[1] : null;

  let device = LocalStorage.get('device');
  let deviceType = device?.type ? device.type : getBestGuessDevice();
  let clickOrTap = CLICK;

  if (
    deviceType === DEVICE_TYPES.MOBILE_DEVICE ||
    deviceType === DEVICE_TYPES.TABLET_DEVICE
  ) {
    clickOrTap = TAP;
  }

  $: submitEnabled = !!(player1 && player2);

  function onPlayer1Select({ detail }) {
    if (!detail?.disabled) {
      player1 = detail;
      if (player1?.value === player2?.value) {
        player2 = null;
      }
    }
  }

  function onPlayer2Select({ detail }) {
    if (!detail?.disabled) {
      player2 = detail;
      if (player1?.value === player2?.value) {
        player1 = null;
      }
    }
  }

  function toggleUseDates() {
    useDates = !useDates;
  }

  function onDateStartChange(e) {
    startDate = e.target.value;
  }

  function onDateEndChange(e) {
    endDate = e.target.value;
  }

  async function submit(e) {
    if (player1 && player2) {
      let dateQuery = '';
      if (useDates && startDate && (!endDate || !isAfter(startDate, endDate))) {
        dateQuery = `?from=${startDate}${endDate ? '&to=' + endDate : ''}`;
      }
      stats = await Rest.get(
        `stats/head-to-head/${player1.value}/${player2.value}${dateQuery}`
      );
      perGameData = stats.player1.perGame.map((pg) => {
        pg.player1 = stats.player1.player.fname;
        pg.player2 = stats.player2.player.fname;
        pg[stats.player1.player.fname] = pg.avgPointsFor;
        pg[stats.player2.player.fname] = pg.avgPointsAgainst;
        return pg;
      });

      window.smoothScroll(resultHR, 250);
    }
  }

  function onMatchStartedElsewhere(match) {
    addAlert({
      type: MATCH_STARTED,
      msg: generateMatchStartAlert(match, clickOrTap),
      timeout: 15000,
      clickable: true,
      action: () => goto('/')
    });
  }

  onMount(async () => {
    await WebSockets.init();
    WebSockets.subscribe(MATCH_STARTED, onMatchStartedElsewhere);
  });

  onDestroy(() => {
    WebSockets.unsubscribe(MATCH_STARTED, onMatchStartedElsewhere);
  });
</script>

<div style="height: 100%; width: 100%;">
  <h2>{HEAD_TO_HEAD_LABEL}</h2>
  <div class="form-container">
    <div class="players-row">
      <div class="select-container">
        <Select
          items={playerOptions}
          value={player1}
          on:select={onPlayer1Select}
        />
      </div>
      <HeadingWithExtenderLines text="vs." align="center" />
      <div class="select-container">
        <Select
          items={playerOptions}
          value={player2}
          on:select={onPlayer2Select}
        />
      </div>
    </div>

    <div class="toggle-wrap">
      <label>{FILTER_BY_DATE}</label>
      <Toggle onOff={useDates} toggled={toggleUseDates} id="use-dates-toggle" />
    </div>
    {#if useDates}
      <div class="dates-wrapper">
        <div class="date-input-wrapper">
          <label>{FROM}</label>
          <input
            id="date1"
            type="date"
            value={startDate}
            on:change={onDateStartChange}
          />
        </div>
        <div class="date-input-wrapper">
          <label>{TO}</label>
          <input
            id="date2"
            type="date"
            value={endDate}
            on:change={onDateEndChange}
          />
        </div>
      </div>
    {/if}
    <button class="btn primary" on:click={submit} disabled={!submitEnabled}>
      {SUBMIT}
    </button>
  </div>
  <hr class="result-hr" bind:this={resultHR} />
  {#if stats}
    <div class="charts-container">
      <div class="chart-container">
        <h3 class="chart-header no-top-margin">{MATCHES_WON}</h3>
        <div class="pie-container">
          <Chart
            data={{
              labels: [
                stats.player1?.player.fname,
                stats.player2?.player.fname,
                'Draw'
              ],
              datasets: [
                {
                  values: [
                    stats.player1?.matchesWon,
                    stats.player2?.matchesWon,
                    stats.player1?.matchesDrawn
                  ]
                }
              ]
            }}
            type="pie"
          />
        </div>
      </div>
      <div class="chart-container">
        <h3 class="chart-header">{GAMES_WON}</h3>
        <div class="pie-container">
          <Chart
            data={{
              labels: [
                stats.player1?.player.fname,
                stats.player2?.player.fname
              ],
              datasets: [
                {
                  values: [stats.player1?.gamesWon, stats.player2?.gamesWon]
                }
              ]
            }}
            type="pie"
          />
        </div>
      </div>
      <div class="chart-container">
        <h3 class="chart-header">{POINTS_WON}</h3>
        <div class="pie-container">
          <Chart
            data={{
              labels: [
                stats.player1?.player.fname,
                stats.player2?.player.fname
              ],
              datasets: [
                {
                  values: [stats.player1?.pointsFor, stats.player2?.pointsFor]
                }
              ]
            }}
            type="pie"
          />
        </div>
      </div>
      <div class="chart-container full-width">
        <h3 class="chart-header">{GAME_BY_GAME_AVERAGES}</h3>
        <div class="pie-container line-chart-container">
          <Chart
            data={{
              labels: perGameData.map((pg, i) => `Game ${i + 1}`),
              datasets: [
                {
                  name: perGameData[0].player1,
                  values: perGameData.map((pg) => pg.avgPointsFor)
                },
                {
                  name: perGameData[0].player2,
                  values: perGameData.map((pg) => pg.avgPointsAgainst)
                }
              ]
            }}
            type="line"
            lineOptions={{
              regionFill: 1
            }}
          />
        </div>
      </div>
      <hr class="result-hr" />
      <div class="results-container">
        <h3 class="chart-header">{MATCH_RESULTS}</h3>
        {#each stats.matches as m}
          <BoxScore match={m} />
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .toggle-wrap {
    margin: 10px 0;
  }

  .date-input-wrapper {
    display: grid;
    grid-template-columns: 50px auto;
    margin-bottom: 10px;

    input {
      max-width: 400px;
    }
  }
</style>
