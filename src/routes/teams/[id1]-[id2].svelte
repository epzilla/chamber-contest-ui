<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, page }) {
    try {
      const p1 = await page.params.id1;
      const p2 = await page.params.id2;
      const [playersResult, statsResult] = await Promise.all([
        fetch(`${BASE_URL}players`),
        fetch(`${BASE_URL}stats/by-team/${p1}-${p2}`)
      ]);
      const players = await playersResult.json();
      const stats = await statsResult.json();
      const team = players.filter((p) => {
        const pid = p.id.toString();
        return pid === p1 || pid === p2;
      });
      return {
        props: {
          players,
          team,
          stats
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
  import BoxScore from '../../components/BoxScore.svelte';
  export let players;
  export let team;
  export let stats;
</script>

{#if team?.length > 1}
  <div class="main player-profile">
    <h2 class="align-center primary-text">
      <a href={`/players/${team[0].id}`}>{team[0].lname}</a>/<a
        href={`/players/${team[1].id}`}>{team[1].lname}</a
      >
    </h2>
    {#if stats}
      {#each stats as match}
        <BoxScore {match} />
      {/each}
    {/if}
  </div>
{/if}

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
</style>
