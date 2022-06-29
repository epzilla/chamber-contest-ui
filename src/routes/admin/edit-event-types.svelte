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

  export let typeList: EventType[];

  let keyListener;
  let editableCells = [];

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

  function deleteRow(rowToBeDeleted) {
    data = data.filter(row => row != rowToBeDeleted);
  }

  async function saveType(rowIndex: number) {
    //   try {
    //     const member = memberList.find(m => m.id == data[rowIndex][0]);
    //     if (member) {
    //       if (member.name != data[rowIndex][1]) {
    //         member.name = data[rowIndex][1] as string;
    //         await rest.put(`members/edit-member`, member);
    //       }
    //     } else {
    //       const newMember = {
    //         id: parseInt(data[rowIndex][0] as string),
    //         name: data[rowIndex][1] as string,
    //         admin: !!data[rowIndex][2],
    //         active: !!data[rowIndex][3]
    //       };
    //       await rest.post(`members`, newMember);
    //       memberList = memberList.concat(newMember);
    //     }
    //   } catch (err) {
    //     console.log(err);
    //     data[rowIndex][2] = !data[rowIndex][2];
    //   }
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

  let columns = ['ID', 'Type'];

  let data = [...typeList.map(type => [type.id, type.type])];

  let newRow = [getNextId(), 'Enter Type'];
</script>

<h2>Edit Event Types</h2>

<div class="member-table">
  <div class="table-header">
    <div class="table-header-cell">ID</div>
    <div class="table-header-cell">Type</div>
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
  .table-header,
  .table-row {
    grid-template-columns: 50px 1fr 70px 60px;
  }

  .table-header-cell,
  .table-cell {
    padding: 5px;

    &:first-of-type {
      text-align: center;
    }
  }
</style>
