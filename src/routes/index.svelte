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
  import { generateGuid } from '../modules/helpers';
  import PopModal from '../components/PopModal.svelte';
  import EventBlock from '../components/EventBlock.svelte';
  import AttendanceFormLayout from '../components/AttendanceFormLayout.svelte';
  import RadioButtons from '../components/RadioButtons.svelte';
  import EventSelector from '../components/EventSelector.svelte';
  import Stepper from '../components/Stepper.svelte';
  import Toggle from '../components/Toggle.svelte';

  export let events: ChamberEvent[];

  let activityOptions: KVP[] = [
    { key: 'call-email', value: 'I called/emailed someone' },
    { key: 'delivery', value: 'I made a delivery' },
    { key: 'event', value: 'I attended an event' }
  ];
  let chosenActivity: string | null = null;
  let selectedEvent: string | null = null;
  let showAddEventForm = false;
  let guestCount = 0;
  let addNames = false;
  let guestNames = [];

  $: {
    console.info(`SELECTED EVENT:`, selectedEvent);
  }

  function onToggleEventForm() {
    showAddEventForm = !showAddEventForm;
  }

  function onGuestCountChange(count: number) {
    guestCount = count;
  }

  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = generateGuid();
      localStorage.setItem('deviceId', deviceId);
    }
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
    <div class="main-outer">
      <div class="main-inner">
        <h3>Let's give you some credit!</h3>
        <div class="form-group">
          <label>What did you do?</label>
          <RadioButtons
            id="choose-activity"
            options={activityOptions}
            value={chosenActivity}
            onSelect={v => (chosenActivity = v.key)}
          />
        </div>
        {#if chosenActivity === 'event'}
          <div class="event-form">
            <div class="form-group">
              <label>Which event did you attend?</label>
              <EventSelector bind:selected={selectedEvent} />
            </div>
            {#if selectedEvent}
              <div class="form-group">
                <label for="">Did you bring any guests?</label>
                <Stepper
                  min={0}
                  onChange={onGuestCountChange}
                  value={guestCount}
                />
              </div>
              {#if guestCount}
                <div class="form-group">
                  <label for="add-names">Add guests names? (optional)</label>
                  <Toggle
                    id="add-names"
                    value={addNames}
                    onChange={v => (addNames = v)}
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
            {/if}
          </div>
        {:else if chosenActivity === 'call-email'}
          <div class="call-email-form">
            <h4>Who did you call/email?</h4>
            <input type="text" placeholder="Name" />
            <input type="text" placeholder="Email" />
          </div>
        {:else if chosenActivity === 'delivery'}
          <div class="delivery-form">
            <h4>What did you deliver?</h4>
            <input type="text" placeholder="Item" />
            <input type="text" placeholder="Location" />
          </div>
        {/if}
      </div>
      <div class="bottom-row">
        <button class="primary" on:click={onToggleEventForm}>
          <span class="fa fa-check" />Count Me!</button
        >
        <button on:click={onToggleEventForm}>Cancel</button>
      </div>
    </div>
  </AttendanceFormLayout>
</PopModal>

<style lang="scss">
  .main-outer {
    height: 100%;
    display: grid;
    grid-template-rows: auto 100px;
  }
  .bottom-row {
    display: grid;
    grid-template: 1fr 1fr / 100%;
    gap: 1rem;
    justify-content: center;
    align-items: center;

    button {
      margin: 0;
      max-width: unset;
      height: 100%;
      width: 100%;
    }
  }

  @media screen and (max-width: 700px) {
    .ad-hoc-event-btn {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      left: 1rem;
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 5px;
      font-size: 1.2em;
      max-width: unset;
      cursor: pointer;
    }
  }
</style>
