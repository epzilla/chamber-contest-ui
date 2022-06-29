<script lang="ts">
  import { isBefore } from 'date-fns';
  import { onMount } from 'svelte';
  import { toDatetimeLocal, validateEvent } from '../modules/helpers';
  import rest from '../modules/rest';
  import { user } from '../modules/stores';
  import EventTypeSelector from './EventTypeSelector.svelte';
  import Switch from './Switch.svelte';

  export let editMode = false;
  export let editingEvent: Partial<ChamberEvent>;
  export let onCancel: () => void;
  export let onSuccess: (newEvent: ChamberEvent) => void;
  export let onDeleteSuccess: () => void = null;

  let newEvent: Partial<ChamberEvent> = {
    title: '',
    address: '',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    notes: '',
    isAdHoc: false
  };
  let localStartTime = toDatetimeLocal(
    editingEvent?.startTime || newEvent.startTime
  );
  let localEndTime = toDatetimeLocal(editingEvent?.endTime || newEvent.endTime);
  let addToCal = true;
  let isSubmitting = false;
  let didSave = false;
  let firstField;
  let eventType =
    editMode && editingEvent?.eventType?.length
      ? editingEvent.eventType[0]
      : null;

  async function performSave(ev) {
    let newEv: ChamberEvent;
    if (addToCal) {
      ev.email = $user.email;
    }

    if (editMode) {
      newEv = await rest.put(`events/${ev.id}`, ev);
    } else {
      newEv = await rest.post('events', ev);
    }
    return newEv;
  }

  async function onSubmit() {
    try {
      const endTime = new Date(localEndTime).toISOString();
      const startTime = new Date(localStartTime).toISOString();
      const ev = {
        ...editingEvent,
        eventType: eventType ? [eventType] : null,
        startTime,
        endTime,
        addToCal
      };
      await validateEvent(ev);
      const res: ChamberEvent = await performSave({
        ...ev,
        eventType
      });
      didSave = true;
      isSubmitting = false;
      const newEv: ChamberEvent = { ...res, eventType: [eventType] };
      onSuccess(newEv);
      //TODO send success notification
    } catch (err) {
      console.error(err);
      isSubmitting = false;
      return;
    }
  }

  async function onDelete() {
    confirm('Are you sure you want to delete this event?') &&
      rest.del(`events/${editingEvent.id}`).then(() => {
        //TODO send success message
        onDeleteSuccess();
      });
  }

  onMount(() => {
    firstField.select();
  });

  $: {
    if (localEndTime && localStartTime) {
      const end = new Date(localEndTime);
      const start = new Date(localStartTime);
      if (isBefore(end, start)) {
        end.setTime(start.getTime());
        end.setHours(start.getHours() + 1);
        localEndTime = toDatetimeLocal(end.toISOString());
      }
    }
  }
</script>

<div class="main-outer">
  <div class="main-inner">
    <h3 class:header-with-btn={editMode}>
      <span>{`${editMode ? 'Edit' : 'Add'} Event`}</span>
      {#if editMode}
        <button class="danger" on:click={onDelete}>
          <span class="fa fa-trash" />
          <span>Delete Event</span>
        </button>
      {/if}
    </h3>
    <div class="form-group">
      <label for="title">Title</label>
      <input
        autofocus
        autocomplete="on"
        autocorrect="on"
        type="text"
        name="title"
        id="title"
        bind:this={firstField}
        bind:value={editingEvent.title}
      />
    </div>
    <div class="form-group">
      <label for="event-type">Type</label>
      <EventTypeSelector bind:selected={eventType} />
    </div>
    <div class="form-group">
      <label for="address">Address</label>
      <input
        type="text"
        name="address"
        id="address"
        bind:value={editingEvent.address}
      />
    </div>
    <div class="form-group">
      <label for="startTime">Start Time</label>
      <input
        type="datetime-local"
        name="startTime"
        id="startTime"
        step="60"
        bind:value={localStartTime}
      />
    </div>
    <div class="form-group">
      <label for="endTime">End Time (optional)</label>
      <input
        type="datetime-local"
        name="endTime"
        id="endTime"
        step="60"
        bind:value={localEndTime}
      />
    </div>
    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        name="description"
        id="description"
        contenteditable="true"
        cols={30}
        rows={10}
        bind:value={editingEvent.notes}
      />
    </div>
    <div class="form-group">
      <label for="add-to-cal"
        >{`${editMode ? 'Update Calendar?' : 'Add To Calendar?'}`}</label
      >
      <Switch bind:checked={addToCal} />
    </div>
  </div>
  <div class="bottom-row">
    <button class="primary" disabled={isSubmitting} on:click={onSubmit}>
      {isSubmitting ? 'Saving...' : 'Save'}</button
    >
    <button on:click={onCancel}>Cancel</button>
  </div>
</div>

<style lang="scss">
  @import '../styles/modal-form.scss';

  .header-with-btn {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
  }
</style>
