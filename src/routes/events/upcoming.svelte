<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, page }) {
    try {
      const id = await page.params.id;
      const eventResult = await fetch(`${BASE_URL}upcoming-events`);
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
  import DateTime from '../../components/DateTime.svelte';
  import { ICalendar, GoogleCalendar, OutlookCalendar } from 'datebook';
  import type { CalendarOptions } from 'datebook';

  export let events: ChamberEvent[];

  function addToCalendar(e: ChamberEvent) {
    const config: CalendarOptions = {
      title: e.title,
      location: e.address,
      description: e.notes || e.title,
      start: new Date(e.startTime),
      end: new Date(e.endTime)
    };
    const googleCalendar = new GoogleCalendar(config);
    // const icalendar = new ICalendar(config);
    // icalendar.download();
    const url = googleCalendar.render();
    const win = window.open(url, '_blank');
  }
</script>

{#if events}
  <div class="main events">
    <h2 class="align-center primary-text">Upcoming Events</h2>
    <ul class="events-list">
      {#each events as event}
        <li class="event">
          <a href={`/events/${event.id}`}>
            <h3 class="event-title">{event.title}</h3>
          </a>
          <h5>
            {event.eventType[0].type} - {event.eventType[0].points} points
          </h5>
          <p class="event-date"><DateTime date={event.dateOfEvent} /></p>
          <button on:click={() => addToCalendar(event)}>Add to Calendar</button>
        </li>
      {/each}
    </ul>
  </div>
{/if}
