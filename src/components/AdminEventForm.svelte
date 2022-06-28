<script lang="ts">
  import isBefore from 'date-fns/isBefore';
  import { onMount } from 'svelte';
  import { toDatetimeLocal } from '../modules/helpers';
  import Switch from './Switch.svelte';

  export let editMode = false;
  export let editingEvent: Partial<ChamberEvent>;
  export let onCancel: () => void;
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

  function onSubmit() {
    isSubmitting = true;
    editingEvent.startTime = new Date(localStartTime).toISOString();
    editingEvent.endTime = localEndTime
      ? new Date(localEndTime).toISOString()
      : null;
    console.log(editingEvent);
    setTimeout(() => {
      isSubmitting = false;
      didSave = true;
    }, 3000);
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
    <h3>Edit Event</h3>
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
        bind:value={localStartTime}
      />
    </div>
    <div class="form-group">
      <label for="endTime">End Time (optional)</label>
      <input
        type="datetime-local"
        name="endTime"
        id="endTime"
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
</style>
