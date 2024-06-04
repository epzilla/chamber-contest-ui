<script lang="ts">
  import ResultsTable from '$lib/components/ResultsTable.svelte';
  import { SITE_TITLE } from '$lib/modules/constants';
  import type { PointsTotalWithEvents } from '$lib/modules/types';
  import { attendanceUpdates } from '$lib/modules/websockets';
  import type { PageData } from './$types';
  export let data: PageData;
  const { totals: initialTotals, timePeriod, currentYear } = data;

  $: totals = initialTotals;

  function isThisYear(timeString: string) {
    const time = new Date(timeString);
    return time.getFullYear() === currentYear;
  }

  function recalculate(newTotals: PointsTotalWithEvents[]) {
    newTotals.sort((a, b) => b.total - a.total);
    for (let i = 0; i < newTotals.length; i++) {
      const current = newTotals[i];
      if (i > 0) {
        const previous = newTotals[i - 1];
        if (previous && current.total === previous.total) {
          current.rank = previous.rank;
        } else {
          current.rank = i + 1;
        }
      } else {
        current.rank = 1;
      }
      totals = newTotals;
    }
  }

  attendanceUpdates.subscribe(({ type, event }) => {
    if (isThisYear(event.startTime)) {
      let i = totals ? totals.findIndex((t) => t.memberId === event.memberId) : -1;
      if (i !== -1) {
        if (type === 'add') {
          const newTotals = [...(totals || [])];
          const newTotal = { ...newTotals[i] };
          newTotal.total = parseInt(newTotal.total as unknown as string) + event.points;
          newTotal.events = [...newTotal.events, event];
          newTotal.guests = newTotal.guests + event.guests;
          newTotals[i] = newTotal;
          recalculate(newTotals);
        }
      }
    }
  });
</script>

<section class="main">
  <h2>{timePeriod} {SITE_TITLE} Standings</h2>

  {#if totals && timePeriod}
    <ResultsTable {totals} {timePeriod} isCurrent />
  {/if}
</section>
