<script lang="ts">
  import {
    myEvents,
    myUnattendedEvents,
    myUnattendedPastEvents,
    pastEvents
  } from '../modules/stores/events';
  import Svelecte from 'svelecte';
  import { format } from 'date-fns';
  export let selected: ChamberEvent | null = null;
  export let useAttended = false;
  export let useUnattended = false;
  export let onlyPastEvents = false;
  export let onSelect: ((event: ChamberEvent) => void) | null = null;

  function labelRenderer(option: ChamberEvent) {
    return `
        <span>
            ${format(new Date(option.startTime), 'MM/d')} - ${option.title}
      `;
  }

  $: {
    onSelect(selected);
  }

  function getOptions() {
    if (useAttended) {
      return $myEvents;
    }

    if (useUnattended) {
      if (onlyPastEvents) {
        return $myUnattendedPastEvents;
      }
      return $myUnattendedEvents;
    }

    if (onlyPastEvents) {
      return $pastEvents;
    }
  }
</script>

{#if $pastEvents.length > 0}
  <div style="width: 350px; max-width: 85vw !important; display: inline-block;">
    <Svelecte
      options={getOptions()}
      bind:value={selected}
      valueField="id"
      valueAsObject
      labelField="title"
      placeholder="Select an Event"
      clearable
      searchable
      renderer={labelRenderer}
    />
  </div>
{/if}
