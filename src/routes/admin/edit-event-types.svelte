<script context="module">
  import { BASE_URL } from '../../modules/constants';

  export async function load({ fetch }) {
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
  import rest from '../../modules/rest';

  export let typeList: EventType[];

  let hasChanges = false;
  let isAdding = false;
  let editableCells = [];
  let data: [number, string, number][];
  let initialData: typeof data;
  let newRow = [getNextId(), 'Enter Type', 1];

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
    isAdding = true;
    data = [...data, [...newRow]] as typeof data;
    newRow = [getNextId(), 'Enter Type', 1];
    setTimeout(() => {
      selectAllTextInCell(editableCells[editableCells.length - 1]);
    }, 0);
  }

  async function deleteRow(row) {
    if (confirm(`Are you sure you want to delete ${row[1]}?`)) {
      await rest.del(`event-types/${row[0]}`);
      typeList = typeList.filter(t => t.id !== row[0]);
      resetDataAfterSave();
    }
  }

  function mergeUpdatesIntoTypeList(updated: EventType[]) {
    typeList = [
      ...typeList.map(t => {
        const updatedType = updated.find(m => m.id == t.id);
        if (updatedType) {
          return updatedType;
        }
        return t;
      })
    ] as typeof typeList;
  }

  function isValidEntry(entry: typeof data[0]) {
    return entry[1] != '' && entry[2] != null;
  }

  async function save() {
    let newType: EventType;
    if (isAdding) {
      const addedData = data[data.length - 1];
      if (isValidEntry(addedData)) {
        newType = {
          id: addedData[0],
          type: addedData[1],
          label: addedData[1],
          points: addedData[2],
          isAdHoc: false
        };
        typeList = typeList.concat(newType);
      } else {
        // Do some error handling
        return;
      }
    }

    let changeList: EventType[] = [];
    data.forEach((row, i) => {
      if (isValidEntry(row)) {
        const updatedType = typeList.find(m => m.id == row[0]);
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

    await rest.put('event-types', { updated: changeList, added: newType });
    mergeUpdatesIntoTypeList(changeList);
    resetDataAfterSave();
  }

  function cancel() {
    data = initialData;
    isAdding = false;
  }

  async function saveType(rowIndex: number) {
    try {
      const evType = typeList.find(t => t.id == data[rowIndex][0]);
      if (evType) {
        if (evType.type != data[rowIndex][1]) {
          evType.type = data[rowIndex][1] as string;
          evType.label = data[rowIndex][1] as string;
          await rest.put(`event-types/${evType.id}`, evType);
        }
      } else {
        const newType: EventType = {
          id: parseInt(data[rowIndex][0] as unknown as string),
          type: data[rowIndex][1] as string,
          label: data[rowIndex][1] as string,
          isAdHoc: false,
          points: parseInt(data[rowIndex][2] as unknown as string)
        };
        await rest.post(`event-types`, newType);
        typeList = typeList.concat(newType);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function resetDataAfterSave() {
    data = [
      ...typeList.map(type => [type.id, type.type, type.points])
    ] as typeof data;
    initialData = [...data.map(d => [...d])] as typeof data;
    hasChanges = false;
    isAdding = false;
  }

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

  resetDataAfterSave();

  $: {
    hasChanges = isDirty(initialData, data);
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
    {#each data as row, i}
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
  @import './styles';

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
