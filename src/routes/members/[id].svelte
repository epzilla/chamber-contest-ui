<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, page }) {
    try {
      const id = await page.params.id;
      const [playersResult, statsResult] = await Promise.all([
        fetch(`${BASE_URL}players`),
        fetch(`${BASE_URL}stats/by-player/${id}`)
      ]);
      const players = await playersResult.json();
      const stats = await statsResult.json();
      const player = players.find(p => p.id.toString() === id.toString());
      return {
        props: {
          player,
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
  export let player;
  export let stats;
</script>

<!-- {#if player}
  <div class="main player-profile">
    <h2 class="align-center primary-text">{getFullPlayerName(player)}</h2>
    {#if stats}
      {#each stats as match}
        <BoxScore {match} />
      {/each}
    {/if}
  </div>
{/if} -->
