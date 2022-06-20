<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, page }) {
    try {
      const id = await page.params.id;
      const eventResult = await fetch(`${BASE_URL}events/${id}`);
      const memberListResult = await fetch(`${BASE_URL}members`);
      const memberList = await memberListResult.json();
      const { event, attendees } = await eventResult.json();
      return {
        props: {
          event,
          attendees,
          memberList
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
  import { onDestroy } from 'svelte';
  import AddToCalendarButton from '../../components/AddToCalendarButton.svelte';
  import DateTime from '../../components/DateTime.svelte';

  export let event: ChamberEvent;
  export let attendees: Member[];
  export let memberList: Member[];

  let liveMemberList = [...memberList];
  let liveAttendeeList = [...attendees];
  $: nonAttendees = liveMemberList.filter(
    m => !liveAttendeeList.find(a => a.id === m.id)
  );

  let showingSelector = false;
  let submitting = false;
  let listInitted = false;
  let selectedAttendee = null;
  let futureEventInterval;

  $: isFutureEvent = new Date(event.dateOfEvent) >= new Date();

  $: {
    if (liveMemberList?.length && liveAttendeeList && event && !listInitted) {
      listInitted = true;
      selectedAttendee = nonAttendees?.length ? nonAttendees[0].id : null;
    }

    if (isFutureEvent && !futureEventInterval) {
      futureEventInterval = setInterval(() => {
        isFutureEvent = new Date(event.dateOfEvent) >= new Date();
        if (!isFutureEvent) {
          clearInterval(futureEventInterval);
        }
      }, 10000);
    }
  }

  onDestroy(() => {
    if (futureEventInterval) {
      clearInterval(futureEventInterval);
    }
  });

  function onSubmit() {
    submitting = true;
    fetch(`${BASE_URL}events/mark-attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        memberId: selectedAttendee,
        eventId: event.id
      })
    }).then(() => {
      submitting = false;
      showingSelector = false;
      const m = memberList.find(m => m.id === selectedAttendee);
      liveAttendeeList = [...liveAttendeeList, m];
      selectedAttendee = null;
      listInitted = false;
    });
  }

  function onSelectChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    selectedAttendee = parseInt(select.value);
  }
</script>

{#if event}
  <div class="main player-profile">
    <h2 class="align-center primary-text">{event.title}</h2>
    <p>{event.address}</p>
    {#if event.dateOfEvent}
      <p><DateTime date={event.dateOfEvent} /></p>
    {/if}
    {#if event.notes}
      <p>{event.notes}</p>
    {/if}

    {#if !isFutureEvent}
      <h4>Chamber Attendees:</h4>
      {#each liveAttendeeList as attendee}
        <p>{attendee.name}</p>
      {/each}

      {#if showingSelector}
        <div class="member-select-control">
          <select class="member-select" on:change={onSelectChange}>
            {#each nonAttendees as attendee}
              <option value={attendee.id}>{attendee.name}</option>
            {/each}
          </select>
          <button
            class="primary"
            on:click={onSubmit}
            disabled={submitting || !selectedAttendee}
            style="margin: 5px">✔ Count Me!</button
          >
          <button class="x-btn" on:click={() => (showingSelector = false)}
            >&times;</button
          >
        </div>
      {:else}
        <button on:click={() => (showingSelector = true)}>Mark Attended</button>
      {/if}
    {:else}
      <h4>
        Once this event begins, you can visit this page to mark your attendance
      </h4>
      <AddToCalendarButton {event} />
    {/if}
  </div>
{/if}

<style lang="scss">
  .member-select-control {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .member-select {
    min-width: 250px;
    height: 40px;
    font-size: 1rem;
  }
  .x-btn {
    border-radius: 50%;
    height: 30px;
    width: 30px;
    background-color: #00000036;
    color: white;
    font-weight: 900;
    font-size: 22px;
    padding-bottom: 11px;
  }
</style>
