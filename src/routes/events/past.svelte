<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, params }) {
    try {
      const id = await params.id;
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
  import EventBlock from '../../components/EventBlock.svelte';

  export let events: ChamberEvent[];
</script>

{#if events}
  <div class="main events">
    <h2 class="align-center primary-text">Past Events</h2>
    <ul class="events-list">
      {#each events as event}
        <EventBlock {event} />
      {/each}
    </ul>
  </div>
{/if}
