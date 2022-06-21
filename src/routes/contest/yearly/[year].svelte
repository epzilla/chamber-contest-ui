<script context="module">
  import { BASE_URL } from '../../../modules/constants';
  import { calculateTotalsForTimePeriod } from '../../../modules/helpers';

  export async function load({ fetch, page }) {
    try {
      const year = await page.params.year;
      const rsp = await fetch(`${BASE_URL}yearly-totals/${year}`);
      const json = await rsp.json();
      const totals = calculateTotalsForTimePeriod(json);
      return {
        props: {
          year,
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
  export let year: number;
  export let totals: PointsTotalWithEvents[];
</script>

<span>It's {year} and here are your totals:</span>

<pre>{JSON.stringify(totals, null, 2)}</pre>
