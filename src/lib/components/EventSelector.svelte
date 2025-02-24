<script lang="ts">
  import {
    myEvents,
    myUnattendedEvents,
    myUnattendedPastEvents,
    pastEvents,
    thisYearsPastEvents
  } from '../modules/stores/events';
  import Svelecte from 'svelecte';
  import { format } from 'date-fns';
  import type { ChamberEvent } from '$lib/modules/types';
  export let selected: ChamberEvent | null = null;
  export let useAttended = false;
  export let useUnattended = false;
  export let onlyPastEvents = false;
  export let allThisYearsEvents = false;
  export let onSelect: ((event: ChamberEvent) => void) | null = null;

  const labelRenderer: any = (option: ChamberEvent) => {
    return `
        <span>
            ${format(new Date(option.startTime!), 'MM/d')} - ${option.title}
      `;
  };

  $: {
    onSelect && onSelect(selected!);
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

    if (allThisYearsEvents) {
      return $thisYearsPastEvents;
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
