<script lang="ts">
  import {
    myEvents,
    myUnattendedEvents,
    pastEvents
  } from '../modules/stores/events';
  import Svelecte from 'svelecte';
  import format from 'date-fns/format';
  import { eventTypes } from '../modules/stores/eventTypes';

  export let selected: EventType = null;
</script>

<Svelecte
  options={$eventTypes}
  bind:value={selected}
  valueAsObject
  valueField="id"
  labelField="type"
  placeholder="Select an Event Type"
  clearable
  searchable
/>
