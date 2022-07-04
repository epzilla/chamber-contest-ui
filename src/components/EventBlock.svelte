<script lang="ts">
  import { userAttendedEvents } from '../modules/stores';

  import AddToCalendarButton from './AddToCalendarButton.svelte';
  import DateTime from './DateTime.svelte';

  export let event: ChamberEvent;
  export let isUpcomingEvent: boolean = false;
  $: didAttend = $userAttendedEvents.find(e => e.id === event.id);
  $: evType = event?.eventType[0];

  function getUrlForContest() {
    const now = new Date();
    const start = new Date(event.startTime);
    if (
      now.getFullYear() === start.getFullYear() &&
      now.getMonth() === start.getMonth()
    ) {
      return '/contest';
    } else {
      return `/contest/monthly/${start.getMonth() + 1}-${start.getFullYear()}`;
    }
  }
</script>

<li class="event" class:attended={didAttend}>
  <a href={`/events/${event.id}`}>
    <h3 class="event-title" class:with-att-mark={didAttend}>
      <span>{event.title}</span>
      <span class="fa fa-check-circle" />
    </h3>
    <h5>
      {#if didAttend}
        <a class="attendance-highlight" href={getUrlForContest()}
          ><span>
            Your attendance earned you {evType.points}
            {evType.points > 1 ? 'points' : 'point'}!
          </span>
          <span class="fa fa-circle-arrow-right" />
        </a>
      {:else}
        <span>{evType.type} - {evType.points}</span>
        <span>{evType.points > 1 ? 'points' : 'point'}</span>
      {/if}
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

        .fa {
          display: none;
          color: var(--colorAttendedEvent);
        }
      }

      h5 {
        margin: 5px;
      }
    }

    &.attended {
      h3 {
        display: grid;
        grid-template-columns: 1fr 20px;
        .fa {
          display: inline-block;
        }
      }

      h5 {
        margin: 1rem 0;
        padding: 0 5px;
      }
    }
  }

  a.attendance-highlight {
    padding: 8px;
    color: white;
  }

  @media screen and (max-width: 600px) {
    .event {
      h5 {
        width: 100%;
      }
      a.attendance-highlight {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1rem;
        align-items: center;
      }
    }
  }

  @media screen and (min-width: 600px) {
    .event {
      a .attendance-highlight {
        color: white;
        display: inline;
        padding: 0.5rem;
        span:first-child {
          margin-right: 10px;
        }
      }
    }
  }
</style>
