<script context="module" lang="ts">
  import { BASE_URL, SITE_TITLE } from '../../modules/constants';
  import { calculateTotalsForTimePeriod } from '../../modules/helpers';
  import ResultsTable from '../../components/ResultsTable.svelte';

  export async function load({ fetch }) {
    try {
      const now = new Date();

      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const rsp = await fetch(`${BASE_URL}yearly-totals/${currentYear}`);
      const json: TimePeriodTotalRsp = await rsp.json();
      const monthsRsp = await fetch(`${BASE_URL}valid-months`);
      const validMonths: ValidMonthEntry[] = await monthsRsp.json();
      const totals = calculateTotalsForTimePeriod(json);
      return {
        props: {
          timePeriod: currentYear,
          currentYear,
          currentMonth,
          totals,
          validMonths
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
  import MonthlyTotalsNav from '../../components/MonthlyTotalsNav.svelte';
  import { attendanceUpdates } from '../../modules/websockets';
  export let timePeriod: string;
  export let currentYear: number;
  export let currentMonth: number;
  export let totals: PointsTotalWithEvents[];
  export let validMonths: ValidMonthEntry[];

  function isThisMonth(timeString: string) {
    const time = new Date(timeString);
    return (
      time.getFullYear() === currentYear && time.getMonth() + 1 === currentMonth
    );
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
    if (isThisMonth(event.startTime)) {
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

<h2>{timePeriod} {SITE_TITLE} Standings</h2>

<ResultsTable {totals} {timePeriod} isCurrent />

<MonthlyTotalsNav {validMonths} />
