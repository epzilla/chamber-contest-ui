<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch, page }) {
    try {
      const memberListResult = await fetch(
        `${BASE_URL}members/include-inactive`
      );
      const memberList = await memberListResult.json();
      return {
        props: {
          memberList
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
  import rest from '../../modules/rest';
  import Switch from '../../components/Switch.svelte';
  import { onDestroy, onMount } from 'svelte';

  export let memberList: Member[];

  let keyListener;
  let editableCells = [];

  function getNextId() {
    const ids = memberList.map(m => m.id);
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

  async function toggleAdmin(rowIndex: number) {
    data[rowIndex][2] = !data[rowIndex][2];
    try {
      const member = memberList.find(m => m.id == data[rowIndex][0]);
      if (member) {
        await rest.put(`members/toggle-admin`, {
          id: member.id
        });
      }
    } catch (err) {
      console.log(err);
      data[rowIndex][2] = !data[rowIndex][2];
    }
  }

  async function toggleActive(rowIndex: number) {
    data[rowIndex][3] = !data[rowIndex][3];
    try {
      const member = memberList.find(m => m.id == data[rowIndex][0]);
      if (member) {
        await rest.put(`members/toggle-active`, {
          id: member.id
        });
      }
    } catch (err) {
      console.log(err);
      data[rowIndex][3] = !data[rowIndex][3];
    }
  }

  async function saveUser(rowIndex: number) {
    try {
      const member = memberList.find(m => m.id == data[rowIndex][0]);
      if (member) {
        if (member.name != data[rowIndex][1]) {
          member.name = data[rowIndex][1] as string;
          await rest.put(`members/edit-member`, member);
        }
      } else {
        const newMember = {
          id: parseInt(data[rowIndex][0] as string),
          name: data[rowIndex][1] as string,
          admin: !!data[rowIndex][2],
          active: !!data[rowIndex][3]
        };
        await rest.post(`members`, newMember);
        memberList = memberList.concat(newMember);
      }
    } catch (err) {
      console.log(err);
      data[rowIndex][2] = !data[rowIndex][2];
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
            saveUser(rowIndex);
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

  let columns = ['ID', 'Name', 'Admin?', 'Active?'];

  let data = [
    ...memberList.map(member => [
      member.id,
      member.name,
      member.isAdmin,
      member.isActive
    ])
  ];

  let newRow = [getNextId(), 'Enter Name', false, true];
</script>

<h2>Edit Members</h2>

<div class="member-table">
  <div class="table-header">
    <div class="table-header-cell">ID</div>
    <div class="table-header-cell">Name</div>
    <div class="table-header-cell">Admin?</div>
    <div class="table-header-cell">Active?</div>
  </div>
  <div class="table-body">
    {#each data as row, i}
      <div class={`table-row ${!row[3] ? 'inactive' : ''}`}>
        <div class="table-cell">
          {row[0]}
        </div>
        <div
          class="table-cell existing-name"
          data-row={i}
          contenteditable="true"
          bind:this={editableCells[i]}
          bind:innerHTML={row[1]}
          on:blur={() => saveUser(i)}
        >
          {row[1]}
        </div>
        <div class="table-cell">
          <Switch
            checked={!!row[2]}
            onChange={val => {
              toggleAdmin(i);
            }}
          />
        </div>
        <div class="table-cell">
          <Switch
            checked={!!row[3]}
            onChange={val => {
              toggleActive(i);
            }}
          />
        </div>
      </div>
    {/each}
  </div>
</div>

<button on:click={addRow}>
  <span class="fa fa-plus" />
  <span>Add Member</span>
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