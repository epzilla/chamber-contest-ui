<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, params }) {
    try {
      const id = await params.id;
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
  import { user, userAttendedEvents, configData } from '../../modules/stores';
  import { getFirstName } from '../../modules/helpers';
  import rest from '../../modules/rest';
  import AttendanceNotice from '../../components/AttendanceNotice.svelte';

  export let event: AttendedChamberEvent;
  export let attendees: Attendee[];
  export let memberList: Member[];

  const { submissionsDisabled } = $configData;
  let liveMemberList = [...memberList];
  let liveAttendeeList = [...attendees];
  $: nonAttendees = liveMemberList.filter(
    m => !liveAttendeeList.find(a => a.id === m.id)
  );

  let showAttendanceForm = false;
  let submitting = false;
  let listInitted = false;
  let addNames = false;
  let futureEventInterval;
  let guestNames = [];

  $: selectedAttendee = $user?.id ?? null;
  $: isFutureEvent = event ? new Date(event.startTime) >= new Date() : false;
  $: userDidAttend = liveAttendeeList.find(a => a.id === $user?.id);
  $: guestCount = userDidAttend?.guests ?? 0;
  $: userAttendedEvent = userDidAttend
    ? { ...event, names: userDidAttend.names, guests: userDidAttend.guests }
    : null;

  $: {
    if (liveMemberList?.length && liveAttendeeList && event && !listInitted) {
      listInitted = true;
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

  userAttendedEvents.subscribe(evs => {
    const updatedDidAttend = evs.find(e => e.id === event.id);
    if (updatedDidAttend) {
      let myUser = liveMemberList.find(m => m.id === $user?.id);
      liveAttendeeList = [
        ...liveAttendeeList.filter(a => a.id !== $user?.id),
        {
          id: myUser?.id,
          name: myUser?.name,
          guests: updatedDidAttend.guests,
          names: updatedDidAttend.names
        }
      ];
    } else if (!updatedDidAttend) {
      liveAttendeeList = liveAttendeeList.filter(
        a => a.id !== userDidAttend?.id
      );
    }
  });

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
      liveAttendeeList = [
        ...liveAttendeeList,
        { ...m, guests: guestCount, names: guestNames }
      ];
      selectedAttendee = null;
      listInitted = false;
      let updatedEvents = [...$userAttendedEvents];
      updatedEvents.push(event);
      userAttendedEvents.set(updatedEvents);
    } catch (e) {
      debugger;
    } finally {
      submitting = false;
    }
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
  <div class="main single-event-details">
    <h2 class="align-center primary-text">{event.title}</h2>
    <p>{@html event.address || ''}</p>
    {#if event.startTime}
      <p><DateTime date={event.startTime} /></p>
    {/if}
    {#if event.notes}
      <p>
        {@html event.notes.replace(/\n/g, '<br>')}
      </p>
      <p />{/if}

    {#if !isFutureEvent}
      <h4>Chamber Attendees:</h4>
      {#each liveAttendeeList as attendee}
        <p class:my-user={attendee.id === $user?.id}>
          <span
            class="fa"
            class:fa-check-circle={attendee.id === $user?.id}
            class:fa-check-circle-o={attendee.id !== $user?.id}
          />
          <span>{attendee.name}</span>
        </p>
      {/each}

      {#if userDidAttend}
        <AttendanceNotice event={userAttendedEvent} />
      {:else if !submissionsDisabled}
        <button on:click={() => (showAttendanceForm = true)}
          >Mark Your Attendance</button
        >
      {/if}
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

  .single-event-details {
    h2 {
      text-align: left;
    }
  }

  .member-select {
    min-width: 250px;
    height: 40px;
    font-size: 1rem;
  }

  .my-user,
  .my-user * {
    font-weight: bold;
    color: var(--colorAttendedEvent);
  }

  .attendance-highlight {
    font-weight: bold;
    width: 100%;
    padding: 10px;
    background-color: var(--colorAttendedEvent);
    border-radius: 3px;
    color: white;
  }
</style>
