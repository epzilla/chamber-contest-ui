<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, page }) {
    try {
      const typesResult = await fetch(`${BASE_URL}event-types`);
      const typeList = await typesResult.json();
      return {
        props: {
          typeList
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
  import { onDestroy, onMount } from 'svelte';
  import rest from '../../modules/rest';

  export let typeList: EventType[];

  let keyListener;
  let editableCells = [];
  let columns = ['ID', 'Type', 'Points', 'Delete'];
  let data = [...typeList.map(type => [type.id, type.type, type.points, ''])];
  let newRow = [getNextId(), 'Enter Type', 1, ''];

  function getNextId() {
    const ids = typeList.map(t => t.id);
    const maxId = Math.max(...ids);
    return maxId + 1;
  }

  function selectAllTextInCell(cell: HTMLDivElement) {
    cell.focus();
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(cell);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function addRow() {
    data = [...data, [...newRow]];
    newRow = columns;
    setTimeout(() => {
      selectAllTextInCell(editableCells[editableCells.length - 1]);
    }, 0);
  }

  function deleteRow(row) {
    if (confirm(`Are you sure you want to delete ${row[1]}?`)) {
      data = data.filter(r => row != r);
    }
  }

  async function saveType(rowIndex: number) {
    try {
      const evType = typeList.find(t => t.id == data[rowIndex][0]);
      if (evType) {
        if (evType.type != data[rowIndex][1]) {
          evType.type = data[rowIndex][1] as string;
          await rest.put(`event-types/${evType.id}`, evType);
        }
      } else {
        const newType = {
          id: parseInt(data[rowIndex][0] as string),
          type: data[rowIndex][1] as string,
          points: parseInt(data[rowIndex][2] as string)
        };
        await rest.post(`event-types`, newType);
        typeList = typeList.concat(newType);
      }
    } catch (err) {
      console.log(err);
    }
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      keyListener = document.addEventListener('keydown', e => {
        if (e.key == 'Enter') {
          const target = e.target as HTMLElement;
          if (target.classList.contains('new-row')) {
            addRow();
          } else if (target.classList.contains('existing-name')) {
            e.preventDefault();
            const rowIndex = parseInt(target.dataset.row);
            saveType(rowIndex);
            if (editableCells.length > rowIndex + 1) {
              selectAllTextInCell(editableCells[rowIndex + 1]);
            }
          }
        }
      });
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', keyListener);
    }
  });
</script>

<h2>Edit Event Types</h2>

<div class="editable-table">
  <div class="table-header">
    <div class="table-header-cell">ID</div>
    <div class="table-header-cell">Type</div>
    <div class="table-header-cell">Points</div>
    <div class="table-header-cell">Delete</div>
  </div>
  <div class="table-body">
    {#each data as row, i}
      <div class="table-row">
        <div class="table-cell">
          {row[0]}
        </div>
        <div
          class="table-cell existing-name"
          data-row={i}
          contenteditable="true"
          bind:this={editableCells[i]}
          bind:innerHTML={row[1]}
          on:blur={() => saveType(i)}
        >
          {row[1]}
        </div>
        <div class="table-cell">
          <input type="number" step="1" min="0" bind:value={row[2]} />
        </div>
        <div class="table-cell">
          <button class="del-btn" on:click={() => deleteRow(row)}>
            <i class="fa fa-trash" />
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<button on:click={addRow}>
  <span class="fa fa-plus" />
  <span>Add Type</span>
</button>

<style lang="scss">
  @import './styles';

  .editable-table {
    width: 80%;
    max-width: 400px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 40px 3fr 1fr 40px;
    gap: 10px;
  }

  .table-header-cell,
  .table-cell {
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: left;

    &:first-of-type,
    &:last-of-type {
      text-align: center;
      justify-content: center;
    }

    &:last-of-type {
      padding: 0;
    }
  }

  input[type='number'] {
    width: 45px;
  }

  .del-btn {
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    width: 40px;

    .fa {
      margin: 0;
    }
  }
</style>
