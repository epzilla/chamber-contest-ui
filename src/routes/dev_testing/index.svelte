<script>
  import PopModal from '../../components/PopModal.svelte';
  import Stepper from '../../components/Stepper.svelte';
  let value = 0;
  let show = false;

  function onChange(n) {
    value = n;
  }
</script>

<input type="checkbox" checked={show} on:change={() => (show = !show)} />

<PopModal {show} onClose={() => (show = false)}>
  Dear sir or madam, how many guests did you invite?
  <Stepper {value} {onChange} min={0} />
</PopModal>
