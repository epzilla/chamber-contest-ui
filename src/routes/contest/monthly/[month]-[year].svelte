<script context="module" lang="ts">
  import { BASE_URL, SITE_TITLE } from '../../../modules/constants';
  import { format } from 'date-fns';
  import { calculateTotalsForTimePeriod } from '../../../modules/helpers';

  export async function load({ fetch, params }) {
    try {
      const month = await params.month;
      const year = await params.year;
      const now = new Date();
      const date = new Date();
      date.setFullYear(year, month - 1, 1);
      const rsp = await fetch(`${BASE_URL}totals/${month}/${year}`);
      const json = await rsp.json();
      const totals = calculateTotalsForTimePeriod(json);
      const timePeriod = format(date, 'MMMM Y');
      const monthsRsp = await fetch(`${BASE_URL}valid-months`);
      const validMonths: ValidMonthEntry[] = await monthsRsp.json();
      const activeMonth: ValidMonthEntry = { month, year };
      return {
        props: {
          timePeriod,
          isCurrent:
            now.getMonth() === parseInt(month) - 1 &&
            now.getFullYear() === parseInt(year),
          totals,
          validMonths,
          activeMonth,
          month,
          year
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
  import MonthlyTotalsNav from '../../../components/MonthlyTotalsNav.svelte';
  import ResultsTable from '../../../components/ResultsTable.svelte';
  import { attendanceUpdates } from '../../../modules/websockets';

  export let month: string;
  export let year: string;
  export let timePeriod: string;
  export let totals: PointsTotalWithEvents[];
  export let isCurrent: boolean;
  export let validMonths: ValidMonthEntry[];
  export let activeMonth: ValidMonthEntry;

  function isThisMonth(timeString: string) {
    const time = new Date(timeString);
    return (
      time.getFullYear().toString() === year &&
      time.getMonth() + 1 === parseInt(month)
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

<ResultsTable {totals} {timePeriod} {isCurrent} />

<MonthlyTotalsNav {validMonths} {activeMonth} />
