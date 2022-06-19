<script lang="ts">
  import {
    FINAL,
    GAMES_PLAYED_TO_AMOUNT,
    LIVE_SCORING_UPDATES_DISABLED,
    PLAYING_ALL_OR_BEST_OF,
    STARTED_TIME_AGO
  } from '../modules/constants';
  import {
    getFormattedMatchDate,
    getMatchTimeAgo,
    getTeamName,
    getStatsForMatch,
    calculateExpectedPointsPerMatch,
    shouldFlashScore
  } from '../modules/helpers';
  export let match: Match;
  let stats: MatchStats;
  let headerRowNums: number[] = [];
  let matchFlash: boolean;
  let gameFlash: boolean;
  let scoreFlash: boolean;
  let jumbotron: boolean;
  let numCols = 0;
  let currentGame: number;
  let classes = 'scoreboard ';

  $: {
    if (match) {
      numCols = match.finished ? match.games.length : match.bestOf;
      headerRowNums = [];
      if (!jumbotron) {
        classes += ' box-score';
      } else if (matchFlash) {
        classes += ' flash-final';
      }

      for (let i = 0; i < numCols; i++) {
        headerRowNums.push(i);
        let game = match.games[i];
        if (game && !game.gameFinished) {
          currentGame = i;
        }
      }

      if (match.finished) {
        stats = getStatsForMatch(match);
      }
    }
  }

  function getClassesForGameBox(match, i, gameFlash) {
    let g = match.games[i];
    let classes = 'score-number-box';
    if (g.gameFinished) {
      classes += ' finished';
    } else {
      classes += ' current';
    }

    if (gameFlash !== null && gameFlash !== undefined && gameFlash === i) {
      classes += ' game-flash';
    }

    return classes;
  }

  function getClassesForScoreBox(match, i, scoreFlash, teamNum) {
    let g = match?.games[i];
    let classes = 'score-number-box';
    if (g?.gameFinished) {
      if (
        (g.score1 > g.score2 && teamNum === 1) ||
        (g.score2 > g.score1 && teamNum === 2)
      ) {
        classes += ' win';
      } else {
        classes += ' loss';
      }
    }

    if (scoreFlash && shouldFlashScore(scoreFlash, g, i, teamNum)) {
      classes += ' flash';
    }

    return classes;
  }

  function getScoreToDisplay(match, game, teamNum) {
    if (match?.updateEveryPoint || game?.gameFinished) {
      return game[`score${teamNum}`];
    }

    return '-';
  }

  function getHourGlassIcon(match, currentGame) {
    if (!match) return '';
    let game = match.games[currentGame];
    let previousPoints =
      match.games
        .filter(g => g?.gameFinished)
        .reduce((sum, current) => sum + (current.score1 + current.score2), 0) ||
      0;
    let totalPoints = previousPoints + (game ? game.score1 + game.score2 : 0);
    let expectedTotalPoints = calculateExpectedPointsPerMatch(match);
    let pct = totalPoints / expectedTotalPoints;
    if (pct < 0.25) {
      return 'start';
    } else if (pct < 0.8) {
      return 'half';
    }

    return 'end';
  }
</script>

<div class={classes}>
  {#if match}
    {#if match.finished}
      <h4 class="date-time-header">
        <a href={`/match-summary/${match.id}`}>{getFormattedMatchDate(match)}</a
        >
      </h4>
    {/if}
    <div class="header-row flex">
      <span class="player-name" />
      {#each headerRowNums as i}
        {#if match.games.length >= i + 1}
          <span class={getClassesForGameBox(match, i, gameFlash)}>{i + 1}</span>
        {:else}
          <span class={`score-number-box future`}>{i + 1}</span>
        {/if}
      {/each}
    </div>
    <div class="score-row flex">
      <a
        href={match.doubles
          ? `/teams/${match.player1Id}-${match.partner1Id}`
          : `/players/${match.player1Id}`}
        class={`player-name ${
          stats?.winner && stats.winner === match.player1Id ? 'winner' : ''
        }`}>{getTeamName(match, 1)}</a
      >
      {#each headerRowNums as i}
        {#if match.games.length >= i + 1}
          <span class={getClassesForScoreBox(match, i, scoreFlash, 1)}
            >{getScoreToDisplay(match, match.games[i], 1)}</span
          >
        {:else}
          <span class={`score-number-box future`}>0</span>
        {/if}
      {/each}
    </div>
    <div class="score-row flex">
      <a
        href={match.doubles
          ? `/teams/${match.player2Id}-${match.partner2Id}`
          : `/players/${match.player2Id}`}
        class={`player-name ${
          stats?.winner && stats.winner === match.player2Id ? 'winner' : ''
        }`}>{getTeamName(match, 2)}</a
      >
      {#each headerRowNums as i}
        {#if match.games.length >= i + 1}
          <span class={getClassesForScoreBox(match, i, scoreFlash, 2)}
            >{getScoreToDisplay(match, match.games[i], 2)}</span
          >
        {:else}
          <span class={`score-number-box future`}>0</span>
        {/if}
      {/each}
    </div>
    <div class="score-row stats-row flex-center">
      {#if match.finished}
        <div class="flex-col flex-center">
          <p class="final flex-center">{FINAL}</p>
          <p class="font-small center">{stats?.resultString}</p>
          <p class="font-small center">{stats?.pointsWonString}</p>
        </div>
      {:else}
        <p class="flex-col" />
        <p class="match-info-block">
          <i class="fa fa-clock-o" />
          <span class="match-info"
            >{STARTED_TIME_AGO(getMatchTimeAgo(match))}</span
          >
        </p>
        <p class="match-info-block">
          <i class="fa fa-bullseye" />
          <span class="match-info">{GAMES_PLAYED_TO_AMOUNT(match.playTo)}</span>
        </p>
        <p class="match-info-block">
          <i
            class={`fa fa-hourglass-${getHourGlassIcon(match, currentGame)}`}
          />
          <span class="match-info">{PLAYING_ALL_OR_BEST_OF(match)}</span>
        </p>
        {#if match.updateEveryPoint}
          <p class="match-info-block align-top">
            <i class="fa fa-asterisk" />
            <span class="match-info">{LIVE_SCORING_UPDATES_DISABLED}</span>
          </p>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  a {
    color: var(----colorDefaultText);
    cursor: pointer;
    text-decoration: none;

    &:hover,
    &:focus,
    &:active {
      text-decoration: underline;
    }
  }

  .scoreboard {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    padding: 1rem;
    background-color: white;
    border: 3px solid #aaa;
    border-radius: 5px;
    min-width: 40vw;
    max-width: calc(100vw - 1rem);

    @media screen and (max-width: 700px) {
      min-width: 65vw;
    }

    > .score-row:not(.stats-row) {
      align-items: center;
    }
  }

  .player-name,
  .score-number-box {
    padding: 0.25rem;

    @media screen and (max-width: 400px) {
      padding: 0.25rem 0;
    }

    @media screen and (min-width: 550px) {
      font-size: 1.5rem;
      padding: 0.5rem;
    }

    @media screen and (min-width: 700px) {
      font-size: 1.75rem;
      padding: 1rem;
    }

    @media screen and (min-width: 1000px) {
      font-size: 3rem;
      padding: 1rem;
    }
  }

  .player-name {
    flex: 1;
  }

  .player-name.winner {
    position: relative;
    font-weight: 700;

    &:before {
      content: '';
      position: absolute;
      left: -0.66rem;
      top: 0.55em;
      border-top: 0.4em solid transparent;
      border-bottom: 0.4em solid transparent;
      border-left: 0.4em solid var(--colorDefaultText);
      border-right: 0.4em solid transparent;

      @media screen and (min-width: 700px) {
        top: 0.8em;
        left: -0.2em;
      }

      @media screen and (min-width: 1000px) {
        left: -0.66rem;
        top: 0.55em;
      }
    }
  }

  .score-number-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 0.25rem;
    padding: 0.25rem 0;
    width: 2rem;

    &.win {
      font-weight: 900;
    }

    &.loss {
      color: var(--colorMediumText);
    }

    &.future {
      color: var(--colorMediumText);
      opacity: 0.5;
    }

    &.flash {
      background-color: var(--scoreFlashColor);
      font-weight: 700;
    }

    &.game-flash {
      background-color: var(--scoreFlashColor);
      position: relative;

      &:after {
        position: absolute;
        animation: flash 1s ease-in-out infinite;
        content: '';
        position: absolute;
        width: 2.1em;
        height: 5.5em;
        top: 0;
        left: 0;
        background-color: var(--scoreFlashColor);

        @media screen and (min-width: 550px) {
          left: -0.15em;
        }

        @media screen and (min-width: 700px) {
          height: 6.25em;
          left: 0;
          width: 2.3em;
        }

        @media screen and (min-width: 1000px) {
          height: 5em;
          left: -0.1em;
          width: 1.5em;
        }
      }
    }

    @media screen and (min-width: 550px) {
      margin: 0 1rem;
      width: 2.75rem;
    }

    @media screen and (min-width: 700px) {
      width: 4rem;
    }
  }

  .score-row {
    display: flex;
    align-items: flex-start;
    .match-info-block {
      margin: 0.5em;
    }
    .match-info-block .fa {
      margin: 0 0.5em;
    }

    &.stats-row {
      flex-direction: column;
      align-items: center;
    }
  }

  .header-row {
    font-weight: 600;

    .score-number-box {
      border-bottom: 1px solid var(--primaryBtnBg);

      &.current {
        background-image: linear-gradient(#fff, #eee);
        font-weight: 900;
        border-bottom-width: 3px;
      }
    }
  }

  .stats-row {
    margin-top: 0.5rem;

    .final,
    .match-info-block {
      margin: 0;
    }

    .final {
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .match-info-block {
      color: #aaa;
      font-size: 0.75rem;
      width: 100%;

      &.align-top {
        align-items: flex-start;

        .fa {
          margin-top: 2px;
        }
      }
    }

    p {
      margin: 0;
    }
  }

  .date-time-header {
    margin: 0 0 0.5rem 0;
    font-style: italic;
    color: #aaa;
    text-decoration: underline;
    text-align: center;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  .scoreboard.box-score {
    margin-bottom: 2rem;
  }

  .jumbotron {
    background-color: #eee;
    border-radius: 4px;
    margin: 1rem;
    padding: 0.5rem 1.5rem;

    .lede {
      color: var(--primary);
      font-size: 1rem;
      margin: 0.5rem 0;
    }
  }

  @media (min-width: 800px) {
    .jumbotron {
      padding: 1rem 2rem;

      .lede {
        margin: 1rem 0;
        font-size: 1.5rem;
      }
    }
  }
</style>
