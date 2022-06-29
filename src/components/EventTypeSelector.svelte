<script lang="ts">
  import Svelecte from 'svelecte';
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
