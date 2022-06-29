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
  import Switch from '../../components/Switch.svelte';
  import { user } from '../../modules/stores';
  import { getFirstName } from '../../modules/helpers';
  import rest from '../../modules/rest';

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
  let selectedAttendee = $user?.id ?? null;
  let guestCount = 0;
  let addNames = false;
  let futureEventInterval;
  let guestNames = [];

  $: isFutureEvent = new Date(event.startTime) >= new Date();

  $: userDidAttend = liveAttendeeList.find(a => a.id === $user?.id);

  $: {
    if (liveMemberList?.length && liveAttendeeList && event && !listInitted) {
      listInitted = true;
      selectedAttendee = nonAttendees?.length ? nonAttendees[0].id : null;
    }

    if (isFutureEvent && !futureEventInterval) {
      futureEventInterval = setInterval(() => {
        isFutureEvent = new Date(event.startTime) >= new Date();
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

  async function onSubmit() {
    submitting = true;
    try {
      await rest.post(`events/mark-attendance`, {
        memberId: selectedAttendee,
        eventId: event.id,
        guests: guestCount,
        guestNames: guestNames?.map(e => e.value) || [],
        org: ''
      });
      showAttendanceForm = false;
      const m = memberList.find(m => m.id === selectedAttendee);
      liveAttendeeList = [...liveAttendeeList, m];
      selectedAttendee = null;
      listInitted = false;
    } catch (e) {
      debugger;
    } finally {
      submitting = false;
    }
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
</script>

{#if event}
  <div class="main player-profile">
    <h2 class="align-center primary-text">{event.title}</h2>
    <p>{event.address}</p>
    {#if event.startTime}
      <p><DateTime date={event.startTime} /></p>
    {/if}
    {#if event.notes}
      <p>{event.notes}</p>
    {/if}

    {#if !isFutureEvent}
      <h4>Chamber Attendees:</h4>
      {#each liveAttendeeList as attendee}
        <p>
          <span class="fa fa-check-circle" />
          <span class={attendee.id === $user?.id ? 'my-user' : ''}
            >{attendee.name}</span
          >
        </p>
      {/each}

      {#if userDidAttend}
        <p class="attendance-highlight">Your attendance earned you X points!</p>
      {/if}
      <button on:click={() => (showAttendanceForm = true)}
        >{userDidAttend ? 'Edit Attendance' : 'Mark Attended'}</button
      >
      <PopModal show={showAttendanceForm} onClose={onAttendanceFormToggle}>
        <div class="pop-modal-form">
          <h3>
            {getFirstName($user?.name)}, claim your contest points for attending {event.title}!
          </h3>
          <div class="form-group">
            <label for="">Did you bring any guests?</label>
            <Stepper min={0} onChange={onGuestCountChange} value={guestCount} />
          </div>
          {#if guestCount > 0}
            <div class="form-group">
              <label for="add-names">Add Guest Names? (optional)</label>
              <Switch bind:checked={addNames} />
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
  @import '../../styles/modal-form.scss';

  .member-select {
    min-width: 250px;
    height: 40px;
    font-size: 1rem;
  }

  .my-user {
    font-weight: bold;
  }

  .attendance-highlight {
    font-weight: bold;
    width: 100%;
    padding: 10px;
    background-color: rgb(33, 162, 93);
    border-radius: 3px;
    color: white;
  }
</style>
