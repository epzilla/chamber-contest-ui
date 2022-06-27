<script lang="ts">
  import { pastEvents } from '../modules/stores/events';
  import Svelecte from 'svelecte';
  import format from 'date-fns/format';
  export let selected = null;

  function labelRenderer(option: ChamberEvent) {
    return `
        <span>
            ${format(new Date(option.startTime), 'MM/d')} - ${option.title}
      `;
  }
</script>

{#if $pastEvents.length > 0}
  <Svelecte
    options={$pastEvents}
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
