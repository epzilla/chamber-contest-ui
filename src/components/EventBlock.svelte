<script lang="ts">
  import AddToCalendarButton from './AddToCalendarButton.svelte';
  import DateTime from './DateTime.svelte';

  export let event: ChamberEvent;
  export let isUpcomingEvent: boolean = false;
</script>

<li class="event">
  <a href={`/events/${event.id}`}>
    <h3 class="event-title">{event.title}</h3>
    <h5>
      {event.eventType[0].type} - {event.eventType[0].points}
      {event.eventType[0].points > 1 ? 'points' : 'point'}
    </h5>
    <p class="event-date"><DateTime date={event.startTime} /></p>
    {#if isUpcomingEvent}
      <AddToCalendarButton {event} />
    {/if}
  </a>
</li>

<style lang="scss">
  .event {
    background-color: white;
    border: 1px solid #ddd;
    box-shadow: var(--subtle-shadow);
    width: 100%;
    margin: 1rem 0;
    a {
      display: block;
      text-decoration: none;
      color: var(--colorDefaultText);
      padding: 1rem;

      h3 {
        margin: 5px;
      }

      h5 {
        margin: 5px;
      }
    }
  }
</style>
