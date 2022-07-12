<script context="module">
  import { BASE_URL } from '../../../modules/constants';
  import { calculateTotalsForTimePeriod } from '../../../modules/helpers';

  export async function load({ fetch, params }) {
    try {
      const year = await params.year;
      const rsp = await fetch(`${BASE_URL}yearly-totals/${year}`);
      const json = await rsp.json();
      const totals = calculateTotalsForTimePeriod(json);
      return {
        props: {
          timePeriod: year,
          isCurrent: year === new Date().getFullYear().toString(),
          totals
        }
      };
    } catch (err) {
      return {
        status: 500,
        error: err
      };
    }
  }
</script>

<script lang="ts">
  import ResultsTable from '../../../components/ResultsTable.svelte';
  import { attendanceUpdates } from '../../../modules/websockets';

  export let timePeriod: string;
  export let totals: PointsTotalWithEvents[];
  export let isCurrent: boolean;

  function isThisYear(timeString: string) {
    const time = new Date(timeString);
    return time.getFullYear().toString() === timePeriod;
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
      let i = totals.findIndex(t => t.memberId === event.memberId);
      if (i !== -1) {
        if (type === 'add') {
          const newTotals = [...totals];
          const newTotal = { ...newTotals[i] };
          newTotal.total =
            parseInt(newTotal.total as unknown as string) + event.points;
          newTotal.events = [...newTotal.events, event];
          newTotal.guests = newTotal.guests + event.guests;
          newTotals[i] = newTotal;
          recalculate(newTotals);
        }
      }
    }
  });
</script>

<h2>{timePeriod} Chamber Points Contest Results</h2>

<ResultsTable {totals} {timePeriod} {isCurrent} />
