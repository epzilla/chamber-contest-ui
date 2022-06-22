<script context="module">
  import { BASE_URL } from '../../../modules/constants';
  import format from 'date-fns/format';
  import { calculateTotalsForTimePeriod } from '../../../modules/helpers';

  export async function load({ fetch, page }) {
    try {
      const month = await page.params.month;
      const year = await page.params.year;
      const date = new Date();
      date.setFullYear(year, month - 1, 1);
      const rsp = await fetch(`${BASE_URL}totals/${month}/${year}`);
      const json = await rsp.json();
      const totals = calculateTotalsForTimePeriod(json);
      const timePeriod = format(date, 'MMMM Y');
      return {
        props: {
          timePeriod,
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

  export let timePeriod: string;
  export let totals: PointsTotalWithEvents[];
</script>

<h2>{timePeriod} Chamber Points Contest Results</h2>

<ResultsTable {totals} {timePeriod} />
