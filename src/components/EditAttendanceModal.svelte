<script lang="ts">
  import {
    user,
    editingAttendedEvent,
    userAttendedEvents
  } from '../modules/stores';
  import rest from '../modules/rest';

  import PopModal from './PopModal.svelte';
  import Stepper from './Stepper.svelte';
  import Switch from './Switch.svelte';

  let event: AttendedChamberEvent;
  let initialized = false;
  let showAttendanceForm = false;
  let addNames = false;
  let submitting = false;
  let guestNameSlots = [];
  let guestCount = event?.guests || 0;
  let names = event?.names ?? [];

  editingAttendedEvent.subscribe(e => {
    event = e;
    guestCount = e?.guests ?? 0;
    addNames = false;
    showAttendanceForm = true;
  });

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

  async function onSubmit() {
    submitting = true;
    try {
      let guests = guestCount;
      let guestNames = guestNameSlots?.filter(e => !!e).map(e => e.value) || [];
      await rest.put(`update-attendance`, {
        memberId: $user.id,
        eventId: event.id,
        guests,
        guestNames,
        org: ''
      });
      editingAttendedEvent.set({ ...event, guests, names: guestNames });
      const updatedEvents = [...$userAttendedEvents];
      const i = updatedEvents.findIndex(e => e.id === event.id);
      if (i !== -1) {
        updatedEvents[i] = { ...event, guests, names: guestNames };
        userAttendedEvents.set(updatedEvents);
      }
      showAttendanceForm = false;
    } catch (e) {
      debugger;
    } finally {
      submitting = false;
    }
  }

  async function onDelete() {
    submitting = true;
    try {
      await rest.del(`remove-attendance`, {
        memberId: $user.id,
        eventId: event.id
      });
      const updatedEvents = [...$userAttendedEvents];
      const i = updatedEvents.findIndex(e => e.id === event.id);
      if (i !== -1) {
        updatedEvents.splice(i, 1);
        userAttendedEvents.set(updatedEvents);
      }
      showAttendanceForm = false;
    } catch (e) {
      debugger;
    } finally {
      submitting = false;
    }
  }

  $: {
    if (event && !initialized) {
      guestNameSlots = Array.from({ length: guestCount }, (_, i) => ({
        value: names[i] ?? ''
      }));
      guestCount = event.guests ?? 0;
      names = event.names ?? [];
      addNames = !!names.length;
      initialized = true;
    }
  }
</script>

{#if event}
  <PopModal show={showAttendanceForm} onClose={onAttendanceFormToggle}>
    <div class="pop-modal-form">
      <h3>
        Update your attendance information for {event.title}
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
                bind:this={guestNameSlots[i]}
                bind:value={names[i]}
              />
            {/each}
          </div>
        {/if}
      {/if}
      <button
        class="secondary"
        on:click={onSubmit}
        disabled={submitting}
        style="margin-bottom: 8px"
      >
        Update</button
      >
      <button on:click={onAttendanceFormToggle} disabled={submitting}
        >Cancel</button
      >
      <button class="danger" on:click={onDelete} style="margin-top: auto">
        <span class="fa fa-trash" />
        <span>Remove Attendance</span>
      </button>
    </div>
  </PopModal>
{/if}

<style lang="scss">
  @import '../styles/modal-form.scss';
</style>
