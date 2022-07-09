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
          isCurrent: now.getMonth() === month - 1 && now.getFullYear() === year,
          totals,
          validMonths,
          activeMonth
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

  export let timePeriod: string;
  export let totals: PointsTotalWithEvents[];
  export let isCurrent: boolean;
  export let validMonths: ValidMonthEntry[];
  export let activeMonth: ValidMonthEntry;
</script>

<h2>{timePeriod} {SITE_TITLE} Standings</h2>

<ResultsTable {totals} {timePeriod} {isCurrent} />

<MonthlyTotalsNav {validMonths} {activeMonth} />
