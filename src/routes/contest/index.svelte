<script context="module" lang="ts">
  import { BASE_URL } from '../../modules/constants';
  import { format } from 'date-fns';
  import ResultsTable from '../../components/ResultsTable.svelte';

  export async function load({ fetch, page }) {
    try {
      const now = new Date();
      const currentMonth = format(now, 'MMMM Y');
      const rsp = await fetch(`${BASE_URL}totals/current-month`);
      const json: MonthTotalRsp = await rsp.json();
      const { allEventsAttendance, pointTotals } = json;
      const emptyTotals: PointsTotalWithEvents[] = pointTotals
        .filter(t => t.total === 0)
        .map(t => ({
          ...t,
          events: [],
          guests: 0
        }));
      let totals: PointsTotalWithEvents[] = [];
      allEventsAttendance.forEach(att => {
        const mem = pointTotals.find(pt => pt.memberId === att.memberId);
        if (mem) {
          const i = totals.findIndex(t => t.memberId === att.memberId);
          if (i !== -1) {
            totals[i].events.push(att);
            totals[i].guests += att.guests;
          } else {
            const memberTotal: PointsTotalWithEvents = {
              memberId: mem.memberId,
              name: mem.name,
              total: mem.total,
              rank: mem.rank,
              events: [att],
              guests: att.guests
            };
            totals.push(memberTotal);
          }
        }
      });
      totals = totals.concat(emptyTotals);
      return {
        props: {
          currentMonth,
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
  export let currentMonth: string;
  export let totals: PointsTotalWithEvents[];

  let expandedRows: { [id: number]: boolean } = {};

  function toggleRow(memberId: number) {
    if (expandedRows[memberId]) {
      expandedRows[memberId] = false;
    } else {
      expandedRows[memberId] = true;
    }
  }
</script>

<h2>{currentMonth} Chamber Points Contest Results</h2>

<ResultsTable {totals} {currentMonth} />

<hr />
<button><h4>View Year-to-date Totals</h4></button>
<h4>View Previous Months:</h4>
<button><h5>May 2022</h5></button>
