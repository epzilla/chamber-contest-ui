<script context="module" lang="ts">
  import { BASE_URL } from '../../modules/constants';
  import { calculateTotalsForTimePeriod } from '../../modules/helpers';
  import { format } from 'date-fns';
  import ResultsTable from '../../components/ResultsTable.svelte';

  export async function load({ fetch, page }) {
    try {
      const now = new Date();
      const timePeriod = format(now, 'MMMM Y');
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const rsp = await fetch(`${BASE_URL}totals/current-month`);
      const monthsRsp = await fetch(`${BASE_URL}valid-months`);
      const totalsJson: TimePeriodTotalRsp = await rsp.json();
      const validMonths: ValidMonthEntry[] = await monthsRsp.json();
      const totals = calculateTotalsForTimePeriod(totalsJson);
      return {
        props: {
          timePeriod,
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
  import { getMonth } from '../../modules/helpers';
  export let timePeriod: string;
  export let currentYear: number;
  export let currentMonth: number;
  export let totals: PointsTotalWithEvents[];
  export let validMonths: ValidMonthEntry[];
</script>

<h2>{timePeriod} Chamber Points Contest Results</h2>

<ResultsTable {totals} {timePeriod} isCurrent />

<hr />
<a href={`/contest/yearly/${currentYear}`} class="style-as-button"
  ><h4>View Year-to-date Totals</h4></a
>
<h4>View Previous Months:</h4>
{#each validMonths as { month, year }}
  {#if month !== currentMonth || year !== currentYear}
    <a href={`/contest/monthly/${month}-${year}`} class="style-as-button"
      ><h4>{getMonth(month)} {year}</h4></a
    >
  {/if}
{/each}
