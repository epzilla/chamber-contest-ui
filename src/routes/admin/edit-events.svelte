<script context="module" lang="ts">
  import { sortEventsByTime } from '../../modules/helpers';
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, context }) {
    try {
      const eventResult = await fetch(`${BASE_URL}events`);
      const events: ChamberEvent[] = await eventResult.json();
      events.sort(sortEventsByTime);
      return {
        props: {
          events
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
  import Loader from '../../components/Loader.svelte';
  import DateTime from '../../components/DateTime.svelte';
  import PopModal from '../../components/PopModal.svelte';
  import SuccessAnimation from '../../components/SuccessAnimation.svelte';
  import Switch from '../../components/Switch.svelte';
  import AdminEventForm from '../../components/AdminEventForm.svelte';
  import { toDatetimeLocal } from '../../modules/helpers';

  export let events: ChamberEvent[];
  let isEditingEvent: ChamberEvent | null = null;
  let isAddingEvent: Partial<ChamberEvent> | null = null;
  let isSubmitting = false;
  let didSave = false;
  let addToCal = true;

  function onSubmit() {
    isSubmitting = true;
    console.log({ isEditingEvent, isAddingEvent });
    setTimeout(() => {
      isSubmitting = false;
      didSave = true;
    }, 3000);
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
  {#if !isEditingEvent}
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
              <DateTime
                date={event.startTime}
                dateFormat="MM/dd/yy, h:mm aaa"
              />
            </div>
            <div class="table-cell">
              <button class="edit-btn" on:click={() => (isEditingEvent = event)}
                >Edit</button
              >
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <PopModal show={!!isEditingEvent} onClose={() => (isEditingEvent = null)}>
    <div class="pop-modal-form">
      <AdminEventForm
        editingEvent={isEditingEvent}
        editMode
        onCancel={() => (isEditingEvent = null)}
      />
    </div>
  </PopModal>

  <PopModal show={!!isAddingEvent} onClose={() => (isAddingEvent = null)}>
    <div class="pop-modal-form">
      <AdminEventForm
        editingEvent={isAddingEvent}
        onCancel={() => (isAddingEvent = null)}
      />
    </div>
  </PopModal>
</section>

<style lang="scss">
  @import './styles';
  @import '../../styles/modal-form.scss';

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

  .loading-overlay {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  @media screen and (max-width: 540px) {
    .table-header,
    .table-row {
      grid-template-columns: 10fr 5fr 3fr;
    }
  }
</style>
