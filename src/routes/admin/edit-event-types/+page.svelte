<script lang="ts">
  import rest from '$lib/modules/rest';
  import type { EventType } from '$lib/modules/types';
  import type { PageData } from './$types';

  export let data: PageData;
  let { typeList } = data;
  let hasChanges = false;
  let isAdding = false;
  let editableCells: any[] = [];
  let cellData: [number, string, number][];
  let initialData: typeof cellData;
  let newRow = [getNextId(), 'Enter Type', 1];

  function getNextId() {
    const ids = typeList!.map((t) => t.id);
    const maxId = Math.max(...ids);
    return maxId + 1;
  }

  function selectAllTextInCell(cell: HTMLDivElement) {
    cell.focus();
    let selection = window.getSelection();
    let range = document.createRange();
    if (range && selection) {
      range.selectNodeContents(cell);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  function addRow() {
    isAdding = true;
    cellData = [...cellData, [...newRow]] as typeof cellData;
    newRow = [getNextId(), 'Enter Type', 1];
    setTimeout(() => {
      selectAllTextInCell(editableCells[editableCells.length - 1]);
    }, 0);
  }

  async function deleteRow(row: [number, string, number]) {
    if (confirm(`Are you sure you want to delete ${row[1]}?`)) {
      await rest.del(`event-types/${row[0]}`);
      typeList = typeList!.filter((t) => t.id !== row[0]);
      resetDataAfterSave();
    }
  }

  function mergeUpdatesIntoTypeList(updated: EventType[]) {
    typeList = [
      ...typeList!.map((t) => {
        const updatedType = updated.find((m) => m.id == t.id);
        if (updatedType) {
          return updatedType;
        }
        return t;
      })
    ] as typeof typeList;
  }

  function isValidEntry(entry: (typeof cellData)[0]) {
    return entry[1] != '' && entry[2] != null;
  }

  async function save() {
    let newType: EventType;
    if (isAdding) {
      const addedData = cellData[cellData.length - 1];
      if (isValidEntry(addedData)) {
        newType = {
          id: addedData[0],
          type: addedData[1],
          label: addedData[1],
          points: addedData[2],
          isAdHoc: false
        };
        typeList = typeList!.concat(newType);
      } else {
        // Do some error handling
        return;
      }
    }

    let changeList: EventType[] = [];
    cellData.forEach((row, i) => {
      if (isValidEntry(row)) {
        const updatedType = typeList!.find((m) => m.id == row[0]);
        if (updatedType) {
          if (updatedType.type != row[1] || updatedType.points != row[2]) {
            changeList.push({
              ...updatedType,
              type: row[1],
              points: row[2]
            });
          }
        }
      }
    });

    // @ts-ignore
    await rest.put('event-types', { updated: changeList, added: newType });
    mergeUpdatesIntoTypeList(changeList);
    resetDataAfterSave();
  }

  function cancel() {
    cellData = initialData;
    isAdding = false;
  }

  async function saveType(rowIndex: number) {
    try {
      const evType = typeList!.find((t) => t.id == cellData[rowIndex][0]);
      if (evType) {
        if (evType.type != cellData[rowIndex][1]) {
          evType.type = cellData[rowIndex][1] as string;
          evType.label = cellData[rowIndex][1] as string;
          await rest.put(`event-types/${evType.id}`, evType);
        }
      } else {
        const newType: EventType = {
          id: parseInt(cellData[rowIndex][0] as unknown as string),
          type: cellData[rowIndex][1] as string,
          label: cellData[rowIndex][1] as string,
          isAdHoc: false,
          points: parseInt(cellData[rowIndex][2] as unknown as string)
        };
        await rest.post(`event-types`, newType);
        typeList = typeList!.concat(newType);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function resetDataAfterSave() {
    cellData = [...typeList!.map((type) => [type.id, type.type, type.points])] as typeof cellData;
    initialData = [...cellData.map((d) => [...d])] as typeof cellData;
    hasChanges = false;
    isAdding = false;
  }

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

  resetDataAfterSave();

  $: {
    hasChanges = isDirty(initialData, cellData);
  }
</script>

<h2>Edit Event Types</h2>

<div class="editable-table">
  <div class="table-header">
    <div class="table-header-cell">Type</div>
    <div class="table-header-cell">Points</div>
    <div class="table-header-cell">Delete</div>
  </div>
  <div class="table-body">
    {#each cellData as row, i}
      <div class="table-row">
        <div class="table-cell existing-name">
          <input type="text" bind:value={row[1]} />
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
  <div class="button-row">
    <button on:click={addRow} class="primary" disabled={isAdding}>
      <span class="fa fa-plus" />
      <span>Add Type</span>
    </button>
    <div>
      <button on:click={save} class="secondary">
        <span>Save</span>
      </button>
      <button on:click={cancel} disabled={!hasChanges}>
        <span>Cancel</span>
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  @import '../styles';

  .editable-table {
    width: 80%;
    max-width: 500px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 3fr 50px 50px;
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

  input[type='text'] {
    width: 100%;
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
