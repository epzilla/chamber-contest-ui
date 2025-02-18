<script lang="ts">
  import { generateGuid, getRandomExclam, toDatetimeLocal } from '$lib/modules/helpers';
  import PopModal from '$lib/components/PopModal.svelte';
  import EventBlock from '$lib/components/EventBlock.svelte';
  import RadioButtons from '$lib/components/RadioButtons.svelte';
  import EventSelector from '$lib/components/EventSelector.svelte';
  import rest from '../lib/modules/rest';
  import { user } from '../lib/modules/stores/users';
  import { myEvents, myUnattendedEvents } from '../lib/modules/stores/events';
  import { ActivityTypes, SubActivityTypes } from '../lib/modules/constants';
  import { onDestroy, onMount } from 'svelte';
  import { eventTypes } from '../lib/modules/stores/eventTypes';
  import { addAlert } from '../lib/modules/stores/alerts';
  import { logCaughtError } from '../lib/modules/errors';
  import { configData } from '../lib/modules/stores';
  import type { ChamberEvent, KVP, Member } from '$lib/modules/types';
  import type { PageData } from './$types';
  import Svelecte from 'svelecte';
  import Stepper from '$lib/components/Stepper.svelte';

  export let data: PageData;
  const { upcomingEvents, pastEvents, memberList } = data;

  let activityOptions: KVP[] = [
    {
      key: ActivityTypes.SPONSORSHIP_YOUR_COMPANY,
      value: 'I referred my company for a sponsorship'
    },
    {
      key: ActivityTypes.SPONSORSHIP_OUTSIDE_REFERRAL,
      value: 'I referred another company for a sponsorship'
    },
    { key: ActivityTypes.RIBBON_CUTTING, value: 'I attended a ribbon cutting' },
    { key: ActivityTypes.BRING_GUEST, value: 'I brought a guest to an event' },
    { key: ActivityTypes.REJOIN, value: 'I renewed my chamber membership' },
    { key: ActivityTypes.GIFT_DELIVERY, value: 'I delivered a gift' },
    {
      key: ActivityTypes.REFER_AMBASSADOR,
      value: 'I referred a new ambassador'
    },
    { key: ActivityTypes.REFER_MEMBER, value: 'I referred a new member' },
    { key: ActivityTypes.SUPPLIER_REFERRAL, value: 'I referred a supplier' },
    { key: ActivityTypes.EVENT_HELP, value: 'I helped with an event' },
    {
      key: ActivityTypes.APPEARED_IN_MEDIA,
      value: 'I appeared in chamber-produced media'
    }
  ];
  let chosenActivity: ActivityTypes | null | string = null;
  let selectedEvent: ChamberEvent | null = null;
  let guestCount = 0;
  let guestNames: any[] = [];
  let addNames = false;
  let showAddEventForm = false;
  let showAddPointsForm = false;
  let selectedAwardee: Member | null = null;
  let pointsAwarded = 5;
  let pointAwardNotes = '';
  let submitting = false;
  let formIsValid = false;
  let keyListener: any;
  let org = '';
  let deliveryNotes = '';
  let callee = '';
  let phone = '';
  let email = '';
  let otherActivity = '';
  let otherActivityPoints = 5;
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

  function genSuccessMsg(ev: ChamberEvent, activity: ActivityTypes) {
    const pts = otherActivityPoints;
    const ptsStr = pts > 1 ? `${pts} points` : `1 point`;
    switch (activity) {
      case ActivityTypes.EVENT:
        return `${getRandomExclam()} You earned ${ptsStr} for attending ${ev.title}.`;
      default:
        return `${getRandomExclam()} You earned ${ptsStr}.`;
    }
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

  function onToggleAddPointsForm() {
    showAddPointsForm = !showAddPointsForm;
  }

  function onGuestCountChange(count: number) {
    guestCount = count;
  }

  function onPointAwardChange(n: number) {
    pointsAwarded = n;
  }

  async function onSubmit() {
    if (formIsValid) {
      submitting = true;
      try {
        switch (chosenActivity) {
          case ActivityTypes.EVENT:
          case ActivityTypes.RIBBON_CUTTING:
          case ActivityTypes.BRING_GUEST:
          case ActivityTypes.EVENT_HELP:
            await rest.post(`events/mark-attendance`, {
              memberId: $user?.id,
              eventId: selectedEvent?.id,
              guests: guestCount,
              guestNames: guestNames?.map((e) => e.value) || [],
              org: ''
            });
            break;
          default:
            selectedEvent = await rest.post(`events/ad-hoc`, {
              memberId: $user?.id,
              guestNames: [],
              guestCount: 0,
              eventType: $eventTypes.find((e) => e.id == 7),
              dateEntered: new Date(),
              startTime,
              endTime: genEndTimeFromStartTime(),
              title: otherActivity,
              address: '',
              notes: '',
              org: '',
              isAdHoc: true,
              isNewEventType: true,
              points: otherActivityPoints
            });
            break;
        }
        myEvents.update((current) => {
          return [...current, selectedEvent];
        });
        myUnattendedEvents.update((current) => {
          return current.filter((e) => e.id !== selectedEvent?.id);
        });
        addAlert({
          type: 'success',
          msg: genSuccessMsg(selectedEvent!, chosenActivity! as ActivityTypes),
          timeout: 5000,
          clickable: true
        });
        onToggleEventForm();
      } catch (e) {
        logCaughtError(e as Error);
      } finally {
        submitting = false;
      }
    }
  }

  async function onSubmitAddPoints() {
    submitting = true;
    console.log({
      memberId: selectedAwardee?.id,
      points: pointsAwarded,
      notes: pointAwardNotes,
      eventId: selectedEvent?.id,
      org: ''
    });
    try {
      await rest.post(`events/award-points`, {
        memberId: selectedAwardee!.id,
        pointsAwarded,
        eventId: selectedEvent?.id,
        notes: pointAwardNotes,
        org: ''
      });
    } finally {
      submitting = false;
      showAddPointsForm = false;
    }
  }

  function addEventFormIsValid() {
    if (!chosenActivity) {
      return false;
    }
    switch (chosenActivity) {
      case ActivityTypes.EVENT:
        return !!selectedEvent;
      case ActivityTypes.OTHER:
        return !!otherActivity;
      default:
        return true;
    }
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      keyListener = document.addEventListener('keyup', (e: KeyboardEvent) => {
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
            <EventBlock {event} isUpcomingEvent />
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
    {#if $configData.submissionsDeadline}
      <p class="deadline-notice">
        {#if $configData.submissionsDisabled}
          <span>
            Note: the deadline for submissions has ended as of {$configData.submissionsDeadline}
          </span>
        {:else}
          <span>
            Reminder: the deadline for submissions is {$configData.submissionsDeadline}
          </span>
        {/if}
      </p>
    {/if}
    <button class="ad-hoc-event-btn primary" on:click={onToggleEventForm}>
      <span class="fa fa-circle-plus" />
      <span>Log an Activity</span></button
    >
    {#if $user?.isSuperuser}
      <button class="ad-hoc-event-btn secondary" on:click={onToggleAddPointsForm}>
        <span class="fa fa-trophy" />
        <span>Award Someone Points</span></button
      >
    {/if}
  </div>
</div>

<PopModal show={showAddEventForm} onClose={onToggleEventForm}>
  <div class="pop-modal-form">
    <div class="main-outer" class:with-spacer={!!chosenActivity && isSmallScreen}>
      <div class="main-inner">
        <h3>Let's give you some credit!</h3>
        <div class="form-group">
          <label>What did you do?</label>
          <RadioButtons
            id="choose-activity"
            options={activityOptions}
            value={chosenActivity || ''}
            onSelect={(v) => {
              chosenActivity = v.key;
              formIsValid = addEventFormIsValid();
            }}
          />
        </div>
        {#if chosenActivity === ActivityTypes.RIBBON_CUTTING || chosenActivity === ActivityTypes.BRING_GUEST || chosenActivity === ActivityTypes.EVENT_HELP}
          <div class="event-form">
            <div class="form-group">
              <label>Which event?</label>
              <EventSelector
                bind:selected={selectedEvent}
                useUnattended
                onlyPastEvents
                onSelect={(e) => {
                  formIsValid = addEventFormIsValid();
                }}
              />
            </div>
          </div>
        {:else}
          <div class="other-actiivity-form">
            <div class="form-group">
              <label for="other-activity-desc">Additional details:</label>
              <input
                type="text"
                bind:value={otherActivity}
                name="other-activity-desc"
                id="other-activity-desc"
              />
            </div>
            <div class="form-group">
              <label for="start-time">When did you do it?</label>
              <input
                type="datetime-local"
                bind:value={startTime}
                name="start-time"
                id="start-time"
                step="300"
              />
            </div>
          </div>
        {/if}
      </div>
      <div class="bottom-row">
        <button class="primary" on:click={onSubmit} disabled={submitting || !formIsValid}>
          <span class="fa fa-check" />{!chosenActivity
            ? 'Submit'
            : chosenActivity === ActivityTypes.EVENT
              ? 'Count Me!'
              : 'Log it!'}</button
        >
        <button on:click={onToggleEventForm} class="bottom-button">Cancel</button>
      </div>
    </div>
  </div>
</PopModal>

<PopModal show={showAddPointsForm} onClose={onToggleAddPointsForm}>
  <div class="pop-modal-form">
    <h3>Award Someone Points!</h3>
    <div class="form-group">
      <label for="">Who would you like to award points to?</label>
      <Svelecte
        options={memberList}
        bind:value={selectedAwardee}
        valueField="id"
        valueAsObject
        placeholder="Select or begin typing..."
        clearable
        searchable
        labelField="name"
      />
    </div>
    <div class="form-group">
      <label for="">Which event is this for?</label>
      <EventSelector bind:selected={selectedEvent} allThisYearsEvents onSelect={(e) => {}} />
    </div>
    <div class="form-group">
      <label for="">How many points would you like to award?</label>
      <Stepper min={1} onChange={onPointAwardChange} value={pointsAwarded} />
    </div>
    <div class="form-group">
      <label for="add-names">Notes (optional)</label>
      <textarea name="notes" id="notes" bind:value={pointAwardNotes} />
    </div>
    <button
      class="secondary"
      on:click={onSubmitAddPoints}
      disabled={submitting || !selectedAwardee}
      style="margin-bottom: 8px"
    >
      <span class="fa fa-check" />Submit</button
    >
    <button on:click={onToggleAddPointsForm} disabled={submitting}>Cancel</button>
  </div>
</PopModal>

<style lang="scss">
  @import '$lib/styles/modal-form.scss';

  main {
    height: 100%;
  }
  .home-main {
    display: grid;
    grid-template-rows: 1fr 50px;
    height: 100%;
    width: 100%;
    max-width: 800px;
  }

  .events-main {
    overflow: auto;
  }

  .float-wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 0 10px;
    background-color: var(--pageBg);
    box-shadow:
      6px 0px 0px 0px var(--pageBg),
      -6px 0px 0px 0px var(--pageBg),
      0 -8px 12px 0px rgb(0 0 0 / 15%);
    z-index: 1;
  }

  .deadline-notice {
    margin: 0;
    height: 40px;
    font-size: 10pt;
    padding-right: 0.5rem;
    font-style: italic;
    color: #888;
    display: flex;
    align-items: center;
  }

  @media screen and (max-width: 768px) {
    .ad-hoc-event-btn {
      width: 100%;
      max-width: unset;
    }
  }
</style>
