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
      const rsp = await fetch(`${BASE_URL}totals/current-month`);
      const json: TimePeriodTotalRsp = await rsp.json();
      const totals = calculateTotalsForTimePeriod(json);
      return {
        props: {
          timePeriod,
          currentYear,
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
  export let timePeriod: string;
  export let currentYear: number;
  export let totals: PointsTotalWithEvents[];
</script>

<h2>{timePeriod} Chamber Points Contest Results</h2>

<ResultsTable {totals} {timePeriod} />

<hr />
<a href={`/contest/yearly/${currentYear}`} class="style-as-button"
  ><h4>View Year-to-date Totals</h4></a
>
<h4>View Previous Months:</h4>
<button><h5>May 2022</h5></button>
