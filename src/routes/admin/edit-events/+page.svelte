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
  let search = '';

  $: filteredEvents = search
    ? events?.filter((e) => {
        return (
          e.title?.toLowerCase().includes(search.toLowerCase()) ||
          e.address?.toLowerCase().includes(search.toLowerCase())
        );
      })
    : events;

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
  <div class="top-btns-row">
    <button class="primary" on:click={onBeginAdd}><span class="fa fa-plus" />Add New Event</button>
    <!-- search bar -->
    <div class="search-bar">
      <span class="fa fa-search" />
      <input type="search" class="search-bar" placeholder="Search..." bind:value={search} />
    </div>
  </div>
  {#if filteredEvents && !isEditingEvent}
    <div class="events-table">
      <div class="table-header">
        <div class="table-header-cell"></div>
        <div class="table-header-cell">Title</div>
        <div class="table-header-cell">Date</div>
        <div class="table-header-cell large-screen">Address</div>
      </div>
      <div class="table-body">
        {#each filteredEvents as event, i}
          <div class={`table-row`}>
            <div class="table-cell edit-cell">
              <button class="edit-btn" on:click={() => (isEditingEvent = event)}>Edit</button>
            </div>
            <div class="table-cell">
              {event.title}
            </div>
            <div class="table-cell">
              <DateTime
                date={event.startTime || new Date().toISOString()}
                dateFormat="MM/dd/yy, h:mm aaa"
              />
            </div>
            <div class="table-cell large-screen">
              {event.address || ''}
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

  .top-btns-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .search-bar {
    position: relative;
    input {
      padding: 0.5rem 0.5rem 0.5rem 2.25rem;
      border: 1px solid var(--colorDisabledText);
      border-radius: 5px;
      width: 300px;
    }

    .fa {
      position: absolute;
      left: 0.8rem;
      top: 0.66rem;
      z-index: 1;
      opacity: 0.5;
    }
  }

  .table-header,
  .table-row {
    grid-template-columns: 70px 400px 180px auto;
    gap: 10px;

    .table-header-cell,
    .table-cell {
      padding: 0 10px;
    }

    .table-header-cell {
      padding: 10px;
    }
  }

  .table-header {
    background: #f0f0f0;
    border-bottom: 1px solid var(--colorDisabledText);
  }

  .table-row {
    min-height: 40px;
    padding: 10px 0;
    border-bottom: 1px solid var(--colorDisabledText);
  }

  .edit-btn {
    height: 24px;
    background-color: #5f3cb1;
    color: white;
  }

  .events-table {
    background: white;
    padding: 0;
    border: 1px solid var(--colorDisabledText);
  }

  @media screen and (max-width: 540px) {
    .table-header,
    .table-row {
      grid-template-columns: 10fr 5fr 3fr;
    }
  }
</style>
