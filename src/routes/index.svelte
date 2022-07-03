<script context="module">
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch }) {
    try {
      const upcomingEventResult = await fetch(`${BASE_URL}upcoming-events`);
      const upcomingEvents = await upcomingEventResult.json();
      const pastEventResult = await fetch(`${BASE_URL}past-events`);
      const pastEvents = await pastEventResult.json();
      return {
        props: {
          pastEvents,
          upcomingEvents
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
  import { generateGuid, toDatetimeLocal } from '../modules/helpers';
  import PopModal from '../components/PopModal.svelte';
  import EventBlock from '../components/EventBlock.svelte';
  import RadioButtons from '../components/RadioButtons.svelte';
  import EventSelector from '../components/EventSelector.svelte';
  import Stepper from '../components/Stepper.svelte';
  import Switch from '../components/Switch.svelte';
  import rest from '../modules/rest';
  import { user } from '../modules/stores/users';
  import { myEvents, myUnattendedEvents } from '../modules/stores/events';
  import { ActivityTypes, SubActivityTypes } from '../modules/constants';
  import { onDestroy, onMount } from 'svelte';
  import { eventTypes } from '../modules/stores/eventTypes';

  export let upcomingEvents: ChamberEvent[];
  export let pastEvents: ChamberEvent[];

  let activityOptions: KVP[] = [
    { key: ActivityTypes.CALL_EMAIL, value: 'I called/emailed someone' },
    { key: ActivityTypes.DELIVERY, value: 'I made a delivery' },
    { key: ActivityTypes.EVENT, value: 'I attended an event' }
  ];
  let subActivityOptions: KVP[] = [
    { key: SubActivityTypes.CALL, value: 'Call' },
    { key: SubActivityTypes.EMAIL, value: 'Email' },
    { key: SubActivityTypes.CALL_AND_EMAIL, value: 'Both!' }
  ];
  let chosenActivity: ActivityTypes | null = null;
  let subActivity: SubActivityTypes | null = null;
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
  let now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);
  let startTime = toDatetimeLocal(now.toISOString());
  let isSmallScreen = true;

  function genEndTimeFromStartTime() {
    const date = new Date(startTime);
    date.setMinutes(date.getMinutes() + 30);
    return date.toISOString();
  }

  function genDeliveryTitle() {
    return `Delivered to ${org}: ${deliveryNotes}`;
  }

  function genCallEmailTitle() {
    switch (subActivity) {
      case SubActivityTypes.CALL:
        return `Called ${callee}`;
      case SubActivityTypes.EMAIL:
        return `Emailed ${callee}`;
      case SubActivityTypes.CALL_AND_EMAIL:
        return `Called and emailed ${callee}`;
    }
  }

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
    if (formIsValid) {
      submitting = true;
      try {
        switch (chosenActivity) {
          case ActivityTypes.CALL_EMAIL:
            selectedEvent = await rest.post(`events/ad-hoc`, {
              memberId: $user?.id,
              guestNames: [callee],
              guestCount: 0,
              phone,
              email,
              eventType: $eventTypes.find(e => e.id == 6),
              dateEntered: new Date(),
              startTime,
              endTime: genEndTimeFromStartTime(),
              title: genCallEmailTitle(),
              address: org,
              notes: '',
              org,
              isAdHoc: true
            });
            break;
          case ActivityTypes.DELIVERY:
            selectedEvent = await rest.post(`events/ad-hoc`, {
              memberId: $user?.id,
              guestNames: [callee],
              guestCount: 0,
              eventType: $eventTypes.find(e => e.id == 5),
              dateEntered: new Date(),
              startTime,
              endTime: genEndTimeFromStartTime(),
              title: genDeliveryTitle(),
              address: org,
              org,
              notes: deliveryNotes,
              isAdHoc: true
            });
            break;
          case ActivityTypes.EVENT:
            await rest.post(`events/mark-attendance`, {
              memberId: $user?.id,
              eventId: selectedEvent.id,
              guests: guestCount,
              guestNames: guestNames?.map(e => e.value) || [],
              org: ''
            });
            break;
        }
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
        return (
          subActivity != null &&
          !!callee &&
          (!phone || phoneIsValid()) &&
          (!email || emailIsValid())
        );
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
    isSmallScreen = window.innerWidth < 768 && window.innerHeight < 768;
  }

  $: {
    formIsValid = addEventFormIsValid();
  }
</script>

<div class="home-main">
  <div class="events-main">
    {#if upcomingEvents}
      <div class="main events">
        <h2 class="align-center primary-text">Upcoming Events</h2>
        <ul class="events-list">
          {#each upcomingEvents as event}
            <EventBlock {event} />
          {/each}
        </ul>
      </div>
    {/if}

    {#if pastEvents}
      <div class="main events">
        <h2 class="align-center primary-text">Recent Events</h2>
        <ul class="events-list">
          {#each pastEvents as event}
            <EventBlock {event} />
          {/each}
        </ul>
      </div>
    {/if}
  </div>
  <div class="float-wrapper">
    <button class="ad-hoc-event-btn primary" on:click={onToggleEventForm}>
      <span class="fa fa-plus-circle" />
      <span>Log an Activity</span></button
    >
  </div>
</div>

<PopModal show={showAddEventForm} onClose={onToggleEventForm}>
  <div class="pop-modal-form">
    <div
      class="main-outer"
      class:with-spacer={!!chosenActivity &&
        (isSmallScreen ||
          (chosenActivity === ActivityTypes.CALL_EMAIL && subActivity != null))}
    >
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
              <label>Which did you do?</label>
              <RadioButtons
                id="choose-sub-activity"
                options={subActivityOptions}
                value={subActivity}
                onSelect={v => {
                  subActivity = v.key;
                  formIsValid = addEventFormIsValid();
                }}
              />
            </div>
            {#if subActivity != null}
              <div class="form-group">
                <label class="with-sublabel">Who did you contact?</label>
                <small
                  >{`Please fill in the name. ${
                    subActivity === SubActivityTypes.CALL
                      ? 'Phone number is'
                      : subActivity === SubActivityTypes.EMAIL
                      ? 'Email is'
                      : 'Phone number and email are '
                  } optional.`}</small
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
                {#if subActivity === SubActivityTypes.CALL || subActivity === SubActivityTypes.CALL_AND_EMAIL}
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
                {/if}
                {#if subActivity === SubActivityTypes.EMAIL || subActivity === SubActivityTypes.CALL_AND_EMAIL}
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
                {/if}
              </div>
              <div class="form-group">
                <label for="start-time">When?</label>
                <input
                  type="datetime-local"
                  bind:value={startTime}
                  name="start-time"
                  id="start-time"
                  step="300"
                />
              </div>
            {/if}
          </div>
        {:else if chosenActivity === ActivityTypes.DELIVERY}
          <div class="delivery-form">
            <div class="form-group">
              <label for="where-delivered">Where to?</label>
              <input
                type="text"
                placeholder="Organization/Company"
                bind:value={org}
                name="where-delivered"
                id="where-delivered"
              />
            </div>
            <div class="form-group">
              <label for="start-time">When?</label>
              <input
                type="datetime-local"
                bind:value={startTime}
                name="start-time"
                id="start-time"
                step="300"
              />
            </div>
            <div class="form-group">
              <label for="delivery-desc">Desribe what you delivered:</label>
              <input
                type="text"
                placeholder="Describe your delivery"
                bind:value={deliveryNotes}
                name="delivery-desc"
                id="delivery-desc"
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
        <button on:click={onToggleEventForm} class="bottom-button"
          >Cancel</button
        >
      </div>
    </div>
  </div>
</PopModal>

<style lang="scss">
  @import '../styles/modal-form.scss';

  main {
    height: 100%;
  }
  .home-main {
    display: grid;
    grid-template-rows: 1fr 50px;
    height: 100%;
    width: 100%;
  }

  .events-main {
    overflow: auto;
  }

  .float-wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 0 10px;
  }

  @media screen and (max-width: 768px) {
    .ad-hoc-event-btn {
      width: 100%;
      max-width: unset;
    }
  }
</style>
