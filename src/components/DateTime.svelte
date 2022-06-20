<script lang="ts">
  import { format } from 'date-fns';

  export let date: string;
  $: formattedDate = format(new Date(date), 'MMM. do, yyyy @ h:mm aaa');
</script>

<span>{formattedDate}</span>
