<script context="module" lang="ts">
  import { BASE_URL } from '../../modules/constants';
  import { format } from 'date-fns';

  export async function load({ fetch, page }) {
    try {
      const now = new Date();
      const currentMonth = format(now, 'MMMM Y');
      const rsp = await fetch(`${BASE_URL}totals/current-month`);
      const json: MonthTotalRsp = await rsp.json();
      const { allEventsAttendance, pointTotals } = json;
      const totals: PointsTotalWithEvents[] = [];
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
              events: [att],
              guests: att.guests
            };
            totals.push(memberTotal);
          }
        }
      });
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

<div class="results-table">
  <div class="table-header">
    <div class="table-header-cell">#</div>
    <div class="table-header-cell">Member</div>
    <div class="table-header-cell">Events</div>
    <div class="table-header-cell">Guests</div>
    <div class="table-header-cell">Total Points</div>
    <div class="table-header-cell">More</div>
  </div>

  <div class="table-body">
    {#each totals as { name, total, events, guests, memberId }}
      <div class={`expandable-row${expandedRows[memberId] ? ' expanded' : ''}`}>
        <div class="main-info">
          <span>1</span>
          <span>{name}</span>
          <span class="pad-left-20">{events.length}</span>
          <span class="pad-left-20">{guests}</span>
          <span class="center">{total}</span>
          <button class="expander" on:click={() => toggleRow(memberId)}
            ><span class={`fa fa-chevron-down`} /></button
          >
        </div>
        <div
          class={`expanded-area${expandedRows[memberId] ? ' expanded' : ''}`}
        >
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Guests</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {#each events as { eventId, title, startTime, guests, points }}
                <tr>
                  <td>{title}</td>
                  <td>{format(new Date(startTime), 'MM/d')}</td>
                  <td>{guests}</td>
                  <td>{points}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/each}
  </div>
</div>

<hr />
<button><h4>View Year-to-date Totals</h4></button>
<h4>View Previous Months:</h4>
<button><h5>May 2022</h5></button>

<style lang="scss">
  .center {
    text-align: center;
  }

  .pad-left-20 {
    padding-left: 10px;
  }

  .results-table {
    width: 75%;
    display: block;
    background-color: white;
    border: 1px solid #ccc;
  }

  .table-header,
  .table-body {
    width: 100%;
    font-size: 20px;
  }

  .table-header,
  .main-info {
    grid-template-columns: 40px 1fr 1fr 1fr 100px 48px;
  }

  .table-header {
    font-size: 1rem;
    font-weight: 700;
    display: grid;
    border-bottom: 1px solid;
  }

  .table-header-cell,
  .main-info > span {
    padding: 5px;

    &.pad-left-20 {
      padding-left: 20px;
    }
  }

  .main-info {
    display: grid;
    align-items: center;
  }

  button.expander {
    font-size: 10pt;
    padding: 0;
    height: 34px;
    width: 48px;
    display: flex;
    align-items: center;
    border-right: none;
    border-top: none;
    border-bottom: none;
    border-radius: 0;
    transition: background-color 0.2s ease-in-out;

    .fa {
      margin-right: 0;
      transition: all 0.2s ease-in-out;
    }

    &:hover {
      background: #ff2882;
      color: white;
    }

    .expanded & {
      background: #37003c;
      color: white;

      .fa {
        transform: rotate(180deg);
      }
    }
  }

  .expandable-row {
    border-bottom: 1px solid #ccc;

    &.expanded {
      background: linear-gradient(245deg, #28ffc8, #5f3cb1 50%);
      color: white;

      .expanded-area {
        background: linear-gradient(245deg, #e5f5f5, #efe6ff 50%);
        color: var(--colorDefaultText);
      }
    }
  }

  .expanded-area {
    display: none;
    background: #f1efef;
    padding: 20px 0;
    border-top: 1px solid #ccc;
    align-items: center;
    justify-content: center;

    table {
      font-size: 10pt;
      width: 80%;
      td,
      th {
        text-align: center;
        &:first-child {
          text-align: left;
        }
      }
    }

    &.expanded {
      display: flex;
    }
  }
</style>
