<script lang="ts">
  import format from 'date-fns/format';
  import { getFirstName } from '../modules/helpers';

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

<div class="results-table">
  <div class="table-header">
    <div class="table-header-cell">#</div>
    <div class="table-header-cell">Member</div>
    <div class="table-header-cell center">Events</div>
    <div class="table-header-cell center">Guests</div>
    <div class="table-header-cell large-screen center">Total Points</div>
    <div class="table-header-cell small-screen center">Pts</div>
    <div class="table-header-cell large-screen center">More</div>
    <div class="table-header-cell small-screen center">
      <span class="fa fa-chevron-down" />
    </div>
  </div>

  <div class="table-body">
    {#each totals as { name, total, events, guests, memberId, rank }}
      <div class={`expandable-row${expandedRows[memberId] ? ' expanded' : ''}`}>
        <div class="main-info">
          <span>{rank}</span>
          <span>{name}</span>
          <span class="center">{events.length}</span>
          <span class="center">{guests}</span>
          <span class="center">{total}</span>
          <button class="expander" on:click={() => toggleRow(memberId)}
            ><span class={`fa fa-chevron-down`} /></button
          >
        </div>
        <div
          class={`expanded-area${expandedRows[memberId] ? ' expanded' : ''}`}
        >
          {#if events.length}
            <div class="events-table">
              <div class="events-table-headers">
                <div class="events-table-header-cell">Event</div>
                <div class="events-table-header-cell center">Date</div>
                <div class="events-table-header-cell center">Guests</div>
                <div class="events-table-header-cell large-screen center">
                  Points
                </div>
                <div class="events-table-header-cell small-screen center">
                  Pts
                </div>
              </div>
              <div class="events-table-body">
                {#each events as { eventId, title, startTime, guests, points }}
                  <div class="events-table-row">
                    <div>{title}</div>
                    <div>{format(new Date(startTime), 'MM/d')}</div>
                    <div>{guests}</div>
                    <div>{points}</div>
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <em
              >{getFirstName(name)} did not attend any events in {currentMonth}</em
            >
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .small-screen {
    display: none;
  }

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
    font-size: 1rem;
  }

  .table-header,
  .main-info {
    grid-template-columns: 35px 3fr 1fr 1fr 100px 48px;
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

    &:first-of-type {
      text-align: center;
    }
  }

  .main-info {
    display: grid;
    align-items: center;

    > span {
      padding: 10px;
    }
  }

  button.expander {
    font-size: 10pt;
    padding: 0;
    height: 100%;
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
    padding: 20px;
    border-top: 1px solid #ccc;
    align-items: center;
    justify-content: center;

    .events-table {
      font-size: 10pt;
      width: 100%;

      .events-table-headers,
      .events-table-row {
        display: grid;
        grid-template-columns: 6fr 2fr 2fr 1fr;

        div {
          text-align: center;

          &:first-child {
            text-align: left;
          }
        }
      }

      .events-table-headers {
        font-weight: 700;
        border-bottom: 1px solid #ccc;
      }
    }

    &.expanded {
      display: flex;
    }
  }

  @media screen and (max-width: 540px) {
    .large-screen {
      display: none;
    }

    .small-screen {
      display: table-cell;
    }

    .results-table {
      width: 95%;

      .table-header-cell,
      .main-info > span {
        padding: 3px;
      }

      .table-header,
      .main-info {
        grid-template-columns: 35px 3fr 1fr 1fr 55px 48px;
      }

      .table-header-cell {
        font-size: 9pt;
      }

      .fa {
        font-size: 7pt;
      }
    }
  }
</style>
