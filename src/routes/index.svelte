<script context="module">
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch, context }) {
    try {
      const eventResult = await fetch(`${BASE_URL}upcoming-events`);
      const events = await eventResult.json();
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
  import PopModal from '../components/PopModal.svelte';
  import EventBlock from '../components/EventBlock.svelte';
  import AttendanceFormLayout from '../components/AttendanceFormLayout.svelte';

  export let events: ChamberEvent[];
  let showAddEventForm = false;

  function onToggleEventForm() {
    showAddEventForm = !showAddEventForm;
  }
</script>

{#if events}
  <div class="main events">
    <h2 class="align-center primary-text">Upcoming Events</h2>
    <ul class="events-list">
      {#each events as event}
        <EventBlock {event} />
      {/each}
    </ul>
  </div>
{/if}

<button class="ad-hoc-event-btn primary" on:click={onToggleEventForm}>
  <span class="fa fa-plus-circle" />
  <span>Log an Activity</span></button
>

<PopModal show={showAddEventForm} onClose={onToggleEventForm}>
  <AttendanceFormLayout>
    Bitch here's yo shit!
    <button
      class="secondary"
      on:click={onToggleEventForm}
      style="margin-bottom: 8px"
    >
      <span class="fa fa-check" />Count Me!</button
    >
    <button on:click={onToggleEventForm}>Cancel</button>
  </AttendanceFormLayout>
</PopModal>

<style lang="scss">
  // .ad-hoc-event-btn {
  //   position: fixed;
  //   bottom: 0;
  //   right: 0;
  //   background: #fff;
  //   border: 1px solid #ccc;
  //   padding: 10px;
  //   border-radius: 5px;
  //   font-size: 1.2em;
  //   cursor: pointer;
  // }

  @media screen and (max-width: 700px) {
    .ad-hoc-event-btn {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      left: 1rem;
      // background: #fff;
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 5px;
      font-size: 1.2em;
      max-width: unset;
      cursor: pointer;
    }
  }
</style>
