<script lang="ts">
  import {
    myEvents,
    myUnattendedEvents,
    pastEvents
  } from '../modules/stores/events';
  import Svelecte from 'svelecte';
  import { format } from 'date-fns';
  export let selected = null;
  export let useAttended = false;
  export let useUnattended = false;
  export let hideAdHoc = false;

  function labelRenderer(option: ChamberEvent) {
    return `
        <span>
            ${format(new Date(option.startTime), 'MM/d')} - ${option.title}
      `;
  }
</script>

{#if $pastEvents.length > 0}
  <Svelecte
    options={useAttended
      ? $myEvents
      : useUnattended
      ? $myUnattendedEvents
      : $pastEvents}
    bind:value={selected}
    valueField="id"
    valueAsObject
    labelField="title"
    placeholder="Select an Event"
    clearable
    searchable
    renderer={labelRenderer}
  />
{/if}
