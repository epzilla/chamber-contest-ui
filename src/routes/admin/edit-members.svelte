<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch }) {
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
  import isEqual from 'fast-deep-equal';

  export let memberList: Member[];

  let data: [number, string, string, boolean, boolean][];
  let initialData: [number, string, string, boolean, boolean][];
  let hasChanges = false;
  let newRow = [getNextId(), 'Enter Name', '', false, true];
  let keyListener;
  let editableCells = [];
  let isAdding = false;

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
    data = [...data, [...newRow]] as typeof data;
    newRow = [getNextId(), 'Enter Name', '', false, true];
    isAdding = true;
    setTimeout(() => {
      selectAllTextInCell(editableCells[editableCells.length - 1]);
    }, 0);
  }

  function cancelChanges() {
    isAdding = false;
    newRow = [getNextId(), 'Enter Name', '', false, true];
    data = [...initialData.map(d => [...d])] as typeof data;
  }

  async function toggleAdmin(rowIndex: number) {
    data[rowIndex][3] = !data[rowIndex][3];
  }

  async function toggleActive(rowIndex: number) {
    data[rowIndex][4] = !data[rowIndex][4];
  }

  function isValidEntry(entry: (string | number | boolean)[]) {
    return entry[1] != '' && entry[2] != '';
  }

  function mergeUpdatesIntoMemberList(updated: Member[]) {
    memberList = [
      ...memberList.map(member => {
        const updatedMember = updated.find(m => m.id == member.id);
        if (updatedMember) {
          return updatedMember;
        }
        return member;
      })
    ] as typeof memberList;
  }

  async function save() {
    let newMember: Member;
    if (isAdding) {
      const addedData = data[data.length - 1];
      if (isValidEntry(addedData)) {
        newMember = {
          id: addedData[0],
          name: addedData[1],
          email: addedData[2],
          isAdmin: addedData[3],
          isActive: addedData[4]
        };
        memberList = memberList.concat(newMember);
      } else {
        // Do some error handling
        return;
      }
    }

    let changeList: Member[] = [];
    data.forEach((row, i) => {
      if (isValidEntry(row)) {
        const member = memberList.find(m => m.id == row[0]);
        if (member) {
          if (
            member.name != row[1] ||
            member.email != row[2] ||
            member.isAdmin != row[3] ||
            member.isActive != row[4]
          ) {
            changeList.push({
              ...member,
              name: row[1],
              email: row[2],
              isAdmin: row[3],
              isActive: row[4]
            });
          }
        }
      }
    });

    await rest.put('members', { updated: changeList, added: newMember });
    mergeUpdatesIntoMemberList(changeList);
    resetDataAfterSave();
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      keyListener = document.addEventListener('keyup', e => {
        const target = (e.target as HTMLElement)?.closest(
          '.table-row'
        ) as HTMLElement;
        if (e.key == 'Enter') {
          if (target?.classList.contains('new-row')) {
            addRow();
          }
        } else if (e.key === 'Escape') {
          if (isAdding) {
            data.pop();
            data = [...data];
            isAdding = false;
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

  function isDirty(oldData: typeof data, newData: typeof data) {
    for (let i = 0; i < oldData.length; i++) {
      for (let j = 0; j < oldData[i].length; j++) {
        if (oldData[i][j] != newData[i][j]) {
          if (
            (typeof newData[i][j] === 'string' &&
              oldData[i][j] == null &&
              newData[i][j] == '') ||
            (typeof oldData[i][j] === 'string' &&
              newData[i][j] == null &&
              oldData[i][j] == '')
          ) {
            continue;
          } else {
            return true;
          }
        }
      }
    }
    return false;
  }

  function resetDataAfterSave() {
    data = [
      ...memberList.map(member => [
        member.id,
        member.name,
        member.email,
        member.isAdmin,
        member.isActive
      ])
    ] as [number, string, string, boolean, boolean][];
    initialData = [...data.map(d => [...d])] as typeof data;
    hasChanges = false;
    isAdding = false;
  }

  resetDataAfterSave();

  $: {
    hasChanges = isDirty(initialData, data);
  }
</script>

<h2>Edit Members</h2>

<div class="member-table">
  <div class="table-header">
    <div class="table-header-cell">Name</div>
    <div class="table-header-cell">Email</div>
    <div class="table-header-cell switch-cell">Admin?</div>
    <div class="table-header-cell switch-cell">Active?</div>
  </div>
  <div class="table-body">
    {#each data as row, i}
      <div
        class="table-row"
        class:existing-row={!isAdding || i < data.length - 1}
        class:inactive-row={!row[4]}
        class:new-row={isAdding && i == data.length - 1}
        data-row={i}
      >
        {#if !isAdding || i === data.length - 1}
          <input
            type="text"
            bind:value={row[1]}
            disabled={!row[4] || (isAdding && i < data.length - 1)}
            placeholder={isAdding && i === data.length - 1
              ? 'Jim Chamberman'
              : ''}
            autocapitalize="words"
            autocorrect="off"
            autocomplete="off"
          />
        {:else}
          <div class="table-cell">
            {row[1]}
          </div>
        {/if}
        <div class="table-cell">
          <input
            type="email"
            bind:value={row[2]}
            disabled={!row[4] || (isAdding && i < data.length - 1)}
            placeholder={isAdding && i === data.length - 1
              ? 'ambassador@mychamber.com'
              : ''}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          />
        </div>
        <div class="table-cell switch-cell">
          <Switch
            checked={!!row[3]}
            disabled={!row[4] || (isAdding && i < data.length - 1)}
            onChange={val => {
              toggleAdmin(i);
            }}
          />
        </div>
        <div class="table-cell switch-cell">
          <Switch
            checked={!!row[4]}
            disabled={isAdding && i < data.length - 1}
            onChange={val => {
              toggleActive(i);
            }}
          />
        </div>
      </div>
    {/each}
  </div>
  <div class="button-row">
    <button on:click={addRow} disabled={isAdding} class="primary">
      <span class="fa fa-plus" />
      <span>Add Member</span>
    </button>
    <div>
      <button on:click={save} class="secondary">Save</button>
      <button on:click={cancelChanges} disabled={!hasChanges && !isAdding}>
        <span>Cancel</span>
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  @import './styles';

  .member-table {
    width: 95%;
    max-width: 700px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 3fr 4fr 70px 60px;
    gap: 10px;

    &.inactive-row * {
      font-style: italic;
      color: #999;
    }
  }

  .table-header {
    margin-bottom: 5px;
    padding-bottom: 3px;
  }

  .table-header-cell,
  .table-cell {
    padding: 5px;

    &.switch-cell {
      display: flex;
      justify-content: center;
    }
  }

  div[contenteditable] {
    background-color: white;
    border: 1px solid #ccc;
  }

  input[type='email'] {
    width: 100%;
  }

  .button-row {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    padding-top: 15px;
    border-top: 1px solid var(--colorDefaultText);
    width: 100%;

    button {
      width: 135px;
    }
  }
</style>
