<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import Switch from '$lib/components/Switch.svelte';
  import rest from '$lib/modules/rest';
  import type { Member } from '$lib/modules/types';
  import type { PageData } from './$types';

  export let data: PageData;
  let { memberList } = data;

  let cellData: [number, string, string, boolean, boolean, boolean][];
  let initialData: [number, string, string, boolean, boolean, boolean][];
  let hasChanges = false;
  let newRow = [getNextId(), 'Enter Name', '', false, true];
  let keyListener: any;
  let editableCells: any[] = [];
  let isAdding = false;
  let isDraggingFile = false;

  function getNextId() {
    const ids = memberList!.map((m) => m.id);
    const maxId = Math.max(...ids);
    return maxId + 1;
  }

  function selectAllTextInCell(cell?: HTMLDivElement) {
    cell?.focus();
    let selection = window.getSelection();
    let range = document.createRange();
    if (selection && range && cell) {
      range.selectNodeContents(cell);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  function addRow() {
    cellData = [...cellData, [...newRow]] as typeof cellData;
    newRow = [getNextId(), 'Enter Name', '', false, true];
    isAdding = true;
    setTimeout(() => {
      selectAllTextInCell(editableCells[editableCells.length - 1]);
    }, 0);
  }

  function cancelChanges() {
    isAdding = false;
    newRow = [getNextId(), 'Enter Name', '', false, true];
    cellData = [...initialData.map((d) => [...d])] as typeof cellData;
  }

  async function toggleAdmin(rowIndex: number) {
    cellData[rowIndex][3] = !cellData[rowIndex][3];
  }

  async function toggleActive(rowIndex: number) {
    cellData[rowIndex][4] = !cellData[rowIndex][4];
  }

  async function toggleSuperuser(rowIndex: number) {
    cellData[rowIndex][5] = !cellData[rowIndex][5];
  }

  function isValidEntry(entry: (string | number | boolean)[]) {
    return entry[1] != '' && entry[2] != '';
  }

  function mergeUpdatesIntoMemberList(updated: Member[]) {
    memberList = [
      ...memberList!.map((member) => {
        const updatedMember = updated.find((m) => m.id == member.id);
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
      const addedData = cellData[cellData.length - 1];
      if (isValidEntry(addedData)) {
        newMember = {
          id: addedData[0],
          name: addedData[1],
          email: addedData[2],
          isAdmin: addedData[3],
          isSuperuser: addedData[4],
          isActive: addedData[5]
        };
        memberList = memberList!.concat(newMember);
      } else {
        // Do some error handling
        return;
      }
    }

    let changeList: Member[] = [];
    cellData.forEach((row, i) => {
      if (isValidEntry(row)) {
        const member = memberList!.find((m) => m.id == row[0]);
        if (member) {
          if (
            member.name != row[1] ||
            member.email != row[2] ||
            member.isAdmin != row[3] ||
            member.isSuperuser !== row[4] ||
            member.isActive != row[5]
          ) {
            changeList.push({
              ...member,
              name: row[1],
              email: row[2],
              isAdmin: row[3],
              isSuperuser: row[4],
              isActive: row[5]
            });
          }
        }
      }
    });

    // @ts-ignore
    await rest.put('members', { updated: changeList, added: newMember });
    mergeUpdatesIntoMemberList(changeList);
    resetDataAfterSave();
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      keyListener = document.addEventListener('keyup', (e) => {
        const target = (e.target as HTMLElement)?.closest('.table-row') as HTMLElement;
        if (e.key == 'Enter') {
          if (target?.classList.contains('new-row')) {
            addRow();
          }
        } else if (e.key === 'Escape') {
          if (isAdding) {
            cellData.pop();
            cellData = [...cellData];
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

  function isDirty(oldData: typeof cellData, newData: typeof cellData) {
    for (let i = 0; i < oldData.length; i++) {
      for (let j = 0; j < oldData[i].length; j++) {
        if (oldData[i][j] != newData[i][j]) {
          if (
            (typeof newData[i][j] === 'string' && oldData[i][j] == null && newData[i][j] == '') ||
            (typeof oldData[i][j] === 'string' && newData[i][j] == null && oldData[i][j] == '')
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
    cellData = [
      ...memberList!.map((member) => [
        member.id,
        member.name,
        member.email,
        member.isAdmin,
        member.isSuperuser,
        member.isActive
      ])
    ] as [number, string, string, boolean, boolean, boolean][];
    initialData = [...cellData.map((d) => [...d])] as typeof cellData;
    hasChanges = false;
    isAdding = false;
  }

  function onFileDragenter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDraggingFile = true;
  }

  function onFileDragover(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onFileDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDraggingFile = false;
  }

  function onFileDragEnd(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDraggingFile = false;
  }

  function onFileDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDraggingFile = false;
    rest.uploadFile('members-file', e.dataTransfer!.files[0]);
  }

  resetDataAfterSave();

  $: {
    hasChanges = isDirty(initialData, cellData);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<h2>Edit Members</h2>

<div class="member-table">
  <div class="table-header">
    <div class="table-header-cell">Name</div>
    <div class="table-header-cell">Email</div>
    <div class="table-header-cell switch-cell">Admin?</div>
    <div class="table-header-cell switch-cell">SuperUser?</div>
    <div class="table-header-cell switch-cell">Active?</div>
  </div>
  <div class="table-body">
    {#each cellData as row, i}
      <div
        class="table-row"
        class:existing-row={!isAdding || i < cellData.length - 1}
        class:inactive-row={!row[5]}
        class:new-row={isAdding && i == cellData.length - 1}
        data-row={i}
      >
        {#if !isAdding || i === cellData.length - 1}
          <input
            type="text"
            bind:value={row[1]}
            disabled={!row[5] || (isAdding && i < cellData.length - 1)}
            placeholder={isAdding && i === cellData.length - 1 ? 'Jim Chamberman' : ''}
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
            disabled={!row[5] || (isAdding && i < cellData.length - 1)}
            placeholder={isAdding && i === cellData.length - 1 ? 'ambassador@mychamber.com' : ''}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          />
        </div>
        <div class="table-cell switch-cell">
          <Switch
            checked={!!row[3]}
            disabled={!row[5] || (isAdding && i < cellData.length - 1)}
            onChange={(val) => {
              toggleAdmin(i);
            }}
          />
        </div>
        <div class="table-cell switch-cell">
          <Switch
            checked={!!row[4]}
            disabled={isAdding && i < cellData.length - 1}
            onChange={(val) => {
              toggleActive(i);
            }}
          />
        </div>
        <div class="table-cell switch-cell">
          <Switch
            checked={!!row[5]}
            disabled={isAdding && i < cellData.length - 1}
            onChange={(val) => {
              toggleSuperuser(i);
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

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class={`file-drop ${isDraggingFile ? 'dragging' : ''}`}
  on:dragover={onFileDragover}
  on:drop={onFileDrop}
  on:dragenter={onFileDragenter}
  on:dragend={onFileDragEnd}
  on:dragleave={onFileDragLeave}
>
  Drop Excel File Here to Add Members
</div>

<style lang="scss">
  @import '../styles';

  .file-drop {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    min-height: 300px;
    width: 100%;
    border: 3px dashed #ccc;
    border-radius: 5px;
    margin-top: 20px;

    &.dragging {
      background-color: #888;
      border: 3px dashed green;
    }
  }

  .member-table {
    width: 95%;
    max-width: 700px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 3fr 4fr 75px 75px 75px;
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
