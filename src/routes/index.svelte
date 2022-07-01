<script context="module">
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch }) {
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
  import RadioButtons from '../components/RadioButtons.svelte';
  import EventSelector from '../components/EventSelector.svelte';
  import Stepper from '../components/Stepper.svelte';
  import Switch from '../components/Switch.svelte';
  import rest from '../modules/rest';
  import { user } from '../modules/stores/users';
  import { myEvents, myUnattendedEvents } from '../modules/stores/events';
  import { ActivityTypes } from '../modules/constants';
  import { onDestroy, onMount } from 'svelte';

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
  let formIsValid = false;
  let keyListener;
  let org = '';
  let deliveryNotes = '';
  let callee = '';
  let phone = '';
  let email = '';

  function phoneIsValid() {
    return !!phone && phone.length >= 10;
  }

  function emailIsValid() {
    return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function onToggleEventForm() {
    showAddEventForm = !showAddEventForm;
    if (!showAddEventForm) {
      selectedEvent = null;
      phone = '';
      email = '';
      callee = '';
      org = '';
      deliveryNotes = '';
      guestCount = 0;
      guestNames = [];
      chosenActivity = null;
      addNames = false;
      formIsValid = false;
    }
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
          onToggleEventForm();
        } finally {
          submitting = false;
        }
    }
  }

  function addEventFormIsValid() {
    if (!chosenActivity) {
      return false;
    }
    switch (chosenActivity) {
      case ActivityTypes.CALL_EMAIL:
        return !!callee && (phoneIsValid() || emailIsValid());
      case ActivityTypes.DELIVERY:
        return !!org && !!deliveryNotes;
      case ActivityTypes.EVENT:
        return !!selectedEvent;
    }
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      keyListener = document.addEventListener('keyup', e => {
        if (showAddEventForm) {
          if (e.key === 'Escape') {
            onToggleEventForm();
            return;
          }

          formIsValid = addEventFormIsValid();

          if (e.key === 'Enter' && formIsValid) {
            onSubmit();
          }
        }
      });
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keyup', keyListener);
    }
  });

  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = generateGuid();
      localStorage.setItem('deviceId', deviceId);
    }
  }

  $: {
    formIsValid = addEventFormIsValid();
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
  <div class="pop-modal-form">
    <div class="main-outer">
      <div class="main-inner">
        <h3>Let's give you some credit!</h3>
        <div class="form-group">
          <label>What did you do?</label>
          <RadioButtons
            id="choose-activity"
            options={activityOptions}
            value={chosenActivity}
            onSelect={v => {
              chosenActivity = v.key;
              formIsValid = addEventFormIsValid();
            }}
          />
        </div>
        {#if chosenActivity === ActivityTypes.EVENT}
          <div class="event-form">
            <div class="form-group">
              <label>Which event did you attend?</label>
              <EventSelector
                bind:selected={selectedEvent}
                useUnattended
                onSelect={e => {
                  formIsValid = addEventFormIsValid();
                }}
              />
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
                  bind:value={callee}
                />
              </div>
              <div class="form-group-inline">
                <label for="phone-input">Phone:</label>
                <input
                  type="tel"
                  placeholder="e.g. (256) 555-5555"
                  id="phone-input"
                  name="phone-input"
                  bind:value={phone}
                />
              </div>
              <div class="form-group-inline">
                <label for="email-input">Email:</label>
                <input
                  type="email"
                  placeholder="e.g. chamberperson@madison.rocks"
                  id="email-input"
                  name="email-input"
                  bind:value={email}
                />
              </div>
            </div>
          </div>
        {:else if chosenActivity === ActivityTypes.DELIVERY}
          <div class="delivery-form">
            <div class="form-group">
              <label>Where to?</label>
              <input
                type="text"
                placeholder="Organization/Company"
                bind:value={org}
              />
            </div>
            <div class="form-group">
              <label>Desribe what you delivered:</label>
              <input
                type="text"
                placeholder="Describe your delivery"
                bind:value={deliveryNotes}
              />
            </div>
          </div>
        {/if}
      </div>
      <div class="bottom-row">
        <button
          class="primary"
          on:click={onSubmit}
          disabled={submitting || !formIsValid}
        >
          <span class="fa fa-check" />{!chosenActivity
            ? 'Submit'
            : chosenActivity === ActivityTypes.EVENT
            ? 'Count Me!'
            : 'Log it!'}</button
        >
        <button on:click={onToggleEventForm}>Cancel</button>
      </div>
    </div>
  </div>
</PopModal>

<style lang="scss">
  @import '../styles/modal-form.scss';
</style>
