<script lang="ts">
  import { format } from 'date-fns';

  export let date: string;
  export let dateFormat: string = 'MMM. do, yyyy @ h:mm aaa';
  $: formattedDate = format(new Date(date), dateFormat);
</script>

<span>{formattedDate}</span>
