<script lang="ts">
  import RadioButtons from '../../components/RadioButtons.svelte';
  import PopModal from '../../components/PopModal.svelte';
  import Stepper from '../../components/Stepper.svelte';
  let value = 0;
  let show = false;

  function onChange(n) {
    value = n;
  }

  let options: KVP[] = [
    { key: '1', value: 'Option 1' },
    { key: '2', value: 'Option 2' },
    { key: '3', value: 'Option 3' }
  ];

  let selected = options[0].key;

  function onSelect(option: KVP) {
    selected = option.key;
  }
</script>

<input type="checkbox" checked={show} on:change={() => (show = !show)} />

<PopModal {show} onClose={() => (show = false)}>
  Dear sir or madam, how many guests did you invite?

  <RadioButtons id="test" {options} value={selected} {onSelect} />
</PopModal>
