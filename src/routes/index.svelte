<script context="module">
  import { ActivityTypes, BASE_URL } from '../modules/constants';

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
  import rest from '../modules/rest';
  import { user } from '../modules/stores/users';
  import { myEvents, myUnattendedEvents } from '../modules/stores/events';

  export let events: ChamberEvent[];

  let activityOptions: KVP[] = [
    { key: ActivityTypes.CALL_EMAIL, value: 'I called/emailed someone' },
    { key: ActivityTypes.DELIVERY, value: 'I made a delivery' },
    { key: ActivityTypes.EVENT, value: 'I attended an event' }
  ];
  let chosenActivity: ActivityTypes | null = null;
  let selectedEvent: ChamberEvent | null = null;
  let guestCount = 0;
  let guestNames = [];
  let addNames = false;
  let showAddEventForm = false;
  let submitting = false;

  function onToggleEventForm() {
    showAddEventForm = !showAddEventForm;
  }

  function onGuestCountChange(count: number) {
    guestCount = count;
  }

  async function onSubmit() {
    switch (chosenActivity) {
      case ActivityTypes.CALL_EMAIL:
      case ActivityTypes.DELIVERY:
      case ActivityTypes.EVENT:
        console.log({
          activity: chosenActivity,
          event: selectedEvent,
          guestCount,
          addNames,
          guestNames: guestNames.map(g => g.value)
        });
        submitting = true;
        try {
          await rest.post(`events/mark-attendance`, {
            memberId: $user?.id,
            eventId: selectedEvent.id,
            guests: guestCount,
            guestNames: guestNames?.map(e => e.value) || [],
            org: ''
          });
          myEvents.update(current => {
            return [...current, selectedEvent];
          });
          myUnattendedEvents.update(current => {
            return current.filter(e => e.id !== selectedEvent.id);
          });
          showAddEventForm = false;
          selectedEvent = null;
          submitting = false;
        } finally {
          submitting = false;
        }
    }
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
        {#if chosenActivity === ActivityTypes.EVENT}
          <div class="event-form">
            <div class="form-group">
              <label>Which event did you attend?</label>
              <EventSelector bind:selected={selectedEvent} useUnattended />
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
        {:else if chosenActivity === ActivityTypes.CALL_EMAIL}
          <div class="call-email-form">
            <div class="form-group">
              <label class="with-sublabel">Who did you call/email?</label>
              <small
                >Enter a name, and then either a phone number, email, or both if
                you prefer!</small
              >
              <div class="form-group-inline">
                <label for="name-input">Name:</label>
                <input
                  type="text"
                  placeholder="Name"
                  id="name-input"
                  name="name-input"
                />
              </div>
              <div class="form-group-inline">
                <label for="phone-input">Phone:</label>
                <input
                  type="tel"
                  placeholder="e.g. (256) 555-5555"
                  id="phone-input"
                  name="phone-input"
                />
              </div>
              <div class="form-group-inline">
                <label for="email-input">Email:</label>
                <input
                  type="email"
                  placeholder="e.g. chamberperson@madison.rocks"
                  id="email-input"
                  name="email-input"
                />
              </div>
            </div>
          </div>
        {:else if chosenActivity === ActivityTypes.DELIVERY}
          <div class="delivery-form">
            <div class="form-group">
              <label>Where to?</label>
              <input type="text" placeholder="Organization/Company" />
            </div>
            <div class="form-group">
              <label>Desribe what you delivered:</label>
              <input type="text" placeholder="Describe your delivery" />
            </div>
          </div>
        {/if}
      </div>
      <div class="bottom-row">
        <button class="primary" on:click={onSubmit} disabled={submitting}>
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

  .form-group {
    label.with-sublabel {
      margin-bottom: 3px;
      + small {
        font-size: 10pt;
        font-style: italic;
        margin-bottom: 0.5rem;
      }
    }
  }

  .form-group-inline {
    display: grid;
    grid-template-columns: 60px auto;
    align-items: center;
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
