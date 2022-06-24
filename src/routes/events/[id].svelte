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
  import PopModal from '../../components/PopModal.svelte';
  import Stepper from '../../components/Stepper.svelte';

  export let event: ChamberEvent;
  export let attendees: Member[];
  export let memberList: Member[];

  let liveMemberList = [...memberList];
  let liveAttendeeList = [...attendees];
  $: nonAttendees = liveMemberList.filter(
    m => !liveAttendeeList.find(a => a.id === m.id)
  );

  let showAttendanceForm = false;
  let submitting = false;
  let listInitted = false;
  let selectedAttendee = null;
  let guestCount = 0;
  let addNames = false;
  let futureEventInterval;
  let guestNames = [];

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
        eventId: event.id,
        guestCount,
        guests: guestNames?.map(e => e.value) || []
      })
    }).then(() => {
      submitting = false;
      showAttendanceForm = false;
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

  function onAttendanceFormToggle() {
    showAttendanceForm = !showAttendanceForm;
    guestCount = 0;
    addNames = false;
  }

  function onGuestCountChange(n: number) {
    guestCount = n;
    if (n === 0) {
      addNames = false;
    }
  }

  function onAddNamesToggle() {
    addNames = !addNames;
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
      <button on:click={() => (showAttendanceForm = true)}>Mark Attended</button
      >
      <PopModal show={showAttendanceForm} onClose={onAttendanceFormToggle}>
        <div class="attendance-form">
          <h3>Claim your contest points for attending {event.title}!</h3>
          <div class="form-group">
            <label for="member-select">Attendee:</label>
            <select
              name="member-select"
              class="member-select"
              on:change={onSelectChange}
            >
              {#each nonAttendees as attendee}
                <option value={attendee.id}>{attendee.name}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label for="">Guests:</label>
            <Stepper min={0} onChange={onGuestCountChange} value={guestCount} />
          </div>
          {#if guestCount > 0}
            <div class="form-group">
              <label for="add-names">Add Guest Names? (optional)</label>
              <input
                type="checkbox"
                name="add-names"
                value={addNames}
                on:change={onAddNamesToggle}
              />
            </div>
            {#if addNames}
              <div class="form-group">
                {#each [...Array(guestCount)] as x, i}
                  <label for={`guest-name-${i}`}>Guest {i + 1}:</label>
                  <input
                    class="name-input"
                    type="text"
                    name={`guest-name-${i}`}
                    bind:this={guestNames[i]}
                  />
                {/each}
              </div>
            {/if}
          {/if}
          <button
            class="secondary"
            on:click={onSubmit}
            disabled={submitting || !selectedAttendee}
            style="margin-bottom: 8px"
          >
            <span class="fa fa-check" />Count Me!</button
          >
          <button
            on:click={onAttendanceFormToggle}
            disabled={submitting || !selectedAttendee}>Cancel</button
          >
        </div>
      </PopModal>
    {:else}
      <h4>
        Once this event begins, you can visit this page to mark your attendance
      </h4>
      <AddToCalendarButton {event} />
    {/if}
  </div>
{/if}

<style lang="scss">
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
  .attendance-form {
    display: flex;
    flex-direction: column;
    border: 8px solid;
    border-image: linear-gradient(to left, #743ad5, #d53a9d) 1;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
    height: 100%;
    width: 100%;
    padding: 20px;
    overflow: auto;

    .form-group {
      margin-bottom: 25px;

      label {
        margin-bottom: 5px;
      }
      input {
        height: unset;

        &[type='checkbox'] {
          height: 24px;
          width: 24px;
        }

        &.name-input {
          border: 1px solid #ccc;
          height: 30px;
        }
      }
    }
  }
</style>
