<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, page }) {
    try {
      const id = await page.params.id;
      const eventResult = await fetch(`${BASE_URL}past-events`);
      const events = await eventResult.json();
      return {
        props: {
          events
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

<script lang="ts">
  export let events: ChamberEvent[];
</script>

{#if events}
  <div class="main events">
    <h2 class="align-center primary-text">Past Events</h2>
    <ul class="events-list">
      {#each events as { id, title, eventType, dateEntered }}
        <li class="event">
          <a href={`/events/${id}`}>
            <h3 class="event-title">{title}</h3>
          </a>
          <h5>{eventType[0].type} - {eventType[0].points} points</h5>
          <p class="event-date">{dateEntered}</p>
        </li>
      {/each}
    </ul>
  </div>
{/if}
