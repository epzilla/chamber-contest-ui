<script lang="ts">
  import EventBlock from '$lib/components/EventBlock.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  const { events } = data;
</script>

{#if events}
  <div class="main events">
    <h2 class="align-center primary-text">Upcoming Events</h2>
    <ul class="events-list">
      {#each events as event}
        <EventBlock {event} isUpcomingEvent />
      {/each}
    </ul>
  </div>
{/if}
