<script lang="ts">
  import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

  export let date: string;
  export let dateFormat: string = 'MMM do, yyyy @ h:mm aaa';
  let dateObj = new Date(date);

  function getSpecificFormat(date: Date, dateFormat: string) {
    if (dateFormat.includes('@')) {
      const lastPart = dateFormat.split('@')[1];
      if (isToday(date)) {
        return 'Today @ ' + format(dateObj, lastPart);
      } else if (isTomorrow(date)) {
        return 'Tomorrow @ ' + format(dateObj, lastPart);
      } else if (isYesterday(date)) {
        return 'Yesterday @ ' + format(dateObj, lastPart);
      }
      return format(dateObj, dateFormat);
    } else if (dateFormat === 'MM/dd/yy, h:mm aaa') {
      const lastPart = dateFormat.split(',')[1];
      if (isToday(date)) {
        return 'Today, ' + format(dateObj, lastPart);
      } else if (isTomorrow(date)) {
        return 'Tomorrow, ' + format(dateObj, lastPart);
      } else if (isYesterday(date)) {
        return 'Yesterday, ' + format(dateObj, lastPart);
      }
    } else {
      return format(dateObj, dateFormat);
    }

    return format(dateObj, dateFormat);
  }

  $: formattedDate = getSpecificFormat(dateObj, dateFormat);
</script>

<span>{formattedDate}</span>
