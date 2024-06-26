<script lang="ts">
  import AdminEventForm from '$lib/components/AdminEventForm.svelte';
  import DateTime from '$lib/components/DateTime.svelte';
  import PopModal from '$lib/components/PopModal.svelte';
  import { sortEventsByTime } from '$lib/modules/helpers';
  import type { ChamberEvent } from '$lib/modules/types';
  import type { PageData } from './$types';

  export let data: PageData;
  let { events } = data;
  let isEditingEvent: ChamberEvent | null = null;
  let isAddingEvent: Partial<ChamberEvent> | null = null;

  function onAddSuccess(newEvent: ChamberEvent) {
    let allEvents = [...(events || []), newEvent];
    allEvents.sort(sortEventsByTime);
    events = allEvents;
    isAddingEvent = null;
  }

  function onEditSuccess(newEvent: ChamberEvent) {
    let allEvents = events!.map((ev) => {
      if (ev.id === newEvent.id) {
        return newEvent;
      }
      return ev;
    });
    allEvents.sort(sortEventsByTime);
    events = allEvents;
    isEditingEvent = null;
  }

  function onDeleteSuccess() {
    let allEvents = [...(events || [])];
    let i = allEvents.findIndex((e) => e.id === isEditingEvent?.id);
    if (i !== -1) {
      allEvents.splice(i, 1);
      isEditingEvent = null;
      events = allEvents;
    }
  }

  function onBeginAdd() {
    isAddingEvent = {
      title: '',
      address: '',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      notes: '',
      isAdHoc: false
    };
  }
</script>

<section class="add-edit-events-page">
  <h3>Add/Edit Events</h3>
  <button class="primary" style="margin-bottom: 10px;" on:click={onBeginAdd}
    ><span class="fa fa-plus" />Add New Event</button
  >
  {#if events && !isEditingEvent}
    <div class="events-table">
      <div class="table-header">
        <div class="table-header-cell">Title</div>
        <div class="table-header-cell large-screen">Address</div>
        <div class="table-header-cell">Date</div>
        <div class="table-header-cell">Edit</div>
      </div>
      <div class="table-body">
        {#each events as event, i}
          <div class={`table-row`}>
            <div class="table-cell">
              {event.title}
            </div>
            <div class="table-cell large-screen">
              {event.address}
            </div>
            <div class="table-cell">
              <DateTime date={event.startTime} dateFormat="MM/dd/yy, h:mm aaa" />
            </div>
            <div class="table-cell">
              <button class="edit-btn" on:click={() => (isEditingEvent = event)}>Edit</button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <PopModal show={!!isEditingEvent} onClose={() => (isEditingEvent = null)}>
    {#if isEditingEvent}
      <div class="pop-modal-form">
        <AdminEventForm
          editingEvent={isEditingEvent}
          editMode
          onCancel={() => (isEditingEvent = null)}
          onSuccess={onEditSuccess}
          {onDeleteSuccess}
        />
      </div>
    {/if}
  </PopModal>

  <PopModal show={!!isAddingEvent} onClose={() => (isAddingEvent = null)}>
    {#if isAddingEvent}
      <div class="pop-modal-form">
        <AdminEventForm
          editingEvent={isAddingEvent}
          onCancel={() => (isAddingEvent = null)}
          onSuccess={onAddSuccess}
        />
      </div>
    {/if}
  </PopModal>
</section>

<style lang="scss">
  @import '../styles';
  @import '$lib/styles/modal-form.scss';

  .add-edit-events-page {
    padding: 0 1rem 1rem 1rem;
    max-width: 1280px;
    margin: 0 auto;
  }

  .table-header,
  .table-row {
    grid-template-columns: 4fr 4fr 2fr 1fr;
    gap: 10px;
  }

  .table-row {
    min-height: 40px;
    padding: 10px 0;
    border-bottom: 1px solid var(--colorDefaultText);
  }

  .edit-btn {
    height: 24px;
  }
  @media screen and (max-width: 540px) {
    .table-header,
    .table-row {
      grid-template-columns: 10fr 5fr 3fr;
    }
  }
</style>
