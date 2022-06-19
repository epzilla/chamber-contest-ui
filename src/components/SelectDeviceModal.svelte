<script>
  import LocalStorage from '../modules/localStorage';
  import DeviceListItem from './DeviceListItem.svelte';
  import Modal from './Modal.svelte';
  import SelectList from './SelectList.svelte';
  import { addAlert } from '../modules/stores';
  import {
    CHOOSE_DEVICES_PROMPT,
    NO_DEVICES_SELECTED_ERROR,
    SELECT_DEVICES_HEADER,
    SHARE
  } from '../modules/constants';
  export let devices = [];
  export let onSelect;
  export let dismiss;
  export let show;

  let device = LocalStorage.get('device');
  let deviceId = device?.id;
  let selectedDevices = [];

  $: filteredDevices = devices?.filter((d) => d.id !== deviceId);

  function toggleItemSelected(d) {
    let allSelected = [...selectedDevices];
    const i = allSelected.indexOf(d);
    if (i === -1) {
      allSelected.push(d);
    } else {
      allSelected.splice(i, 1);
    }

    selectedDevices = allSelected;
  }

  function submit() {
    if (selectedDevices && selectedDevices.length > 0) {
      onSelect(selectedDevices);
    } else {
      addAlert({ type: 'error', msg: NO_DEVICES_SELECTED_ERROR });
    }
  }
</script>

<Modal {dismiss} {show}>
  <svelte:fragment slot="header">
    <h2>{SELECT_DEVICES_HEADER}</h2>
    <p>{CHOOSE_DEVICES_PROMPT}</p>
  </svelte:fragment>
  <svelte:fragment slot="content">
    <div class="flex-1 flex-col margin-bottom-1rem">
      <div class="device-select-list-wrap flex-1 flex-col">
        <SelectList
          className="device-select-list"
          selectedItems={selectedDevices}
          items={filteredDevices}
          onSelect={toggleItemSelected}
          component={DeviceListItem}
        />
      </div>
    </div>
    <div class="btn-wrap margin-1rem flex-shrink-0 flex-col">
      <button class="btn big success" on:click={submit}>{SHARE}</button>
    </div>
  </svelte:fragment>
</Modal>
