<script context="module">
  import { isEmpty } from '../modules/helpers';
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch, context }) {
    try {
      console.log(`${BASE_URL}events/current-month`);
      const eventsRsp = await fetch(`${BASE_URL}events`);
      const events = await eventsRsp.json();
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
  import EventBlock from '../components/EventBlock.svelte';

  export let events: ChamberEvent[];
</script>

{#if events}
  <div class="main events">
    <h2 class="align-center primary-text">Events</h2>
    <ul class="events-list">
      {#each events as event}
        <EventBlock {event} />
      {/each}
    </ul>
  </div>
{/if}
