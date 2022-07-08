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

  attendanceUpdates.subscribe(console.log);
</script>

<h2>{timePeriod} Chamber Points Contest Results</h2>

<ResultsTable {totals} {timePeriod} {isCurrent} />
