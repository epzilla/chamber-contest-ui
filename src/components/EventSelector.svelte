<script lang="ts">
  import {
    myEvents,
    myUnattendedEvents,
    pastEvents
  } from '../modules/stores/events';
  import Svelecte from 'svelecte';
  import { format } from 'date-fns';
  export let selected: ChamberEvent | null = null;
  export let useAttended = false;
  export let useUnattended = false;
  export let hideAdHoc = false;
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
</script>

{#if $pastEvents.length > 0}
  <div style="width: 350px; max-width: 85vw !important; display: inline-block;">
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
  </div>
{/if}
