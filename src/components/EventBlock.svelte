<script lang="ts">
  import AddToCalendarButton from './AddToCalendarButton.svelte';
  import DateTime from './DateTime.svelte';

  export let event: ChamberEvent;
  export let isUpcomingEvent: boolean = false;
</script>

<li class="event">
  <a href={`/events/${event.id}`}>
    <h3 class="event-title">{event.title}</h3>
  </a>
  <h5>{event.eventType[0].type} - {event.eventType[0].points} points</h5>
  <p class="event-date"><DateTime date={event.startTime} /></p>
  {#if isUpcomingEvent}
    <AddToCalendarButton {event} />
  {/if}
</li>
