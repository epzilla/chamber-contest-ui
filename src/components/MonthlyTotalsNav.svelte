<!-- <script context="module" lang="ts">
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch }) {
    try {
      const monthsRsp = await fetch(`${BASE_URL}valid-months`);
      const validMonths: ValidMonthEntry[] = await monthsRsp.json();
      return {
        props: {
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
</script> -->
<script lang="ts">
  import { getMonth } from '../modules/helpers';

  export let validMonths: ValidMonthEntry[];
  export let activeMonth: ValidMonthEntry = null;
</script>

<hr />

<h4 class="monthly-totals-header">View Monthly Totals:</h4>
{#each validMonths as { month, year }}
  <a
    href={`/contest/monthly/${month}-${year}`}
    class="style-as-button"
    class:active={activeMonth?.month == month && activeMonth?.year == year}
    ><h4>{getMonth(month)} {year}</h4></a
  >
{/each}

<style>
  hr {
    margin: 2.5rem 2rem 2rem 2rem;
    border: 1px solid #cecece;
    border-top: none;
  }
  .monthly-totals-header {
    margin: 0 0 10px;
  }

  .style-as-button {
    width: 225px;
    margin-bottom: 5px;
  }

  .active {
    background-color: var(--primaryBtnBg);
    color: white;
  }
</style>
