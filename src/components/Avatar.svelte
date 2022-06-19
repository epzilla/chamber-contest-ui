<script lang="ts">
  import Rest from '../modules/rest';
  import { CLICK_TO_CHANGE } from '../modules/constants';

  export let avatar = '';
  export let avatarUpdatedCallback: (updatedAvi: string) => void = null;
  export let big = false;
  export let coin = false;
  export let editable = false;
  export let fname = '';
  export let newAvatar = '';
  export let lname = '';
  export let empty = false;

  function edit(e) {
    let input = e.currentTarget.querySelector('input');
    if (input) {
      input.click();
    }
  }

  function processChange(e) {
    uploadFile(e.target.files[0]);
  }

  function uploadFile(file) {
    if (file.type.includes('image')) {
      let reader = new FileReader();
      reader.onload = async () => {
        newAvatar = reader.result as string;
        await Rest.put('avatar', { avatar: newAvatar });
        if (avatarUpdatedCallback) {
          avatarUpdatedCallback(newAvatar);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDragenter(e) {
    e.preventDefault();
  }

  function handleDragleave(e) {
    e.target.classList.remove('can-drop');
  }

  function handleDragover(e) {
    if ([...e.dataTransfer.types].includes('Files')) {
      e.preventDefault();
      e.target.classList.add('can-drop');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  let classes = 'avatar';
  if (big) {
    classes += ' big';
  }

  if (empty) {
    classes += ' empty';
  }

  if (coin) {
    classes += ' coin';
  }

  if (editable) {
    classes += ' editable';
  }
</script>

{#if editable}
  <div
    class="avatar editable"
    class:big
    on:click={edit}
    on:dragenter={handleDragenter}
    on:dragover={handleDragover}
    on:dragleave={handleDragleave}
    on:drop={handleDrop}
    style={avatar ? `background-image: url(${avatar})` : ''}
  >
    <input type="file" value={newAvatar} onChange={processChange} />
    <div class="edit-overlay">
      <span>{CLICK_TO_CHANGE}</span>
    </div>
  </div>
{:else}
  <div
    class="avatar"
    class:big
    class:coin
    class:empty
    style={avatar ? `background-image: url(${avatar})` : ''}
  >
    {#if fname || lname}
      <span class="avatar-initials"
        >{fname ? fname[0] : ''}{lname ? lname[0] : ''}</span
      >
    {:else if empty}
      <span class="avatar-empty">
        <i class="fa fa-user-circle" />
      </span>
    {/if}
  </div>
{/if}

<style lang="scss">
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    width: 2rem;
    position: relative;
    background-position: center;
    background-size: cover;
    border: 1px solid var(--primary);
    border-radius: 50%;
    margin: 0 1rem;

    &.big {
      height: 6rem;
      width: 6rem;
      &:not(.coin) {
        margin: 0 2rem;
      }

      .avatar-initials {
        font-size: 3rem;
      }
    }

    &.editable {
      cursor: pointer;
    }

    &.empty {
      border: none;

      .avatar-empty {
        .fa {
          font-size: 2rem;
        }
      }
    }

    .edit-overlay {
      display: none;
    }

    &:hover .edit-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.5);
      color: var(--primary);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;

      span {
        text-align: center;
      }
    }

    input {
      visibility: hidden;
    }
  }

  .coin {
    content: '';
    width: 52px;
    height: 52px;
    position: relative;
    margin: 5px;
    border-radius: 3rem;
    z-index: 500;
    box-shadow: 0px 0px 0px 1px rgba(146, 146, 146, 0.49),
      0px 0px 0px 4px #d3d3d3, 0px 0px 0px 5px rgba(146, 146, 146, 0.65),
      2px 2px 5px 5px rgba(146, 146, 146, 0.65);
    background: linear-gradient(
      45deg,
      rgba(181, 181, 181, 1) 0%,
      rgba(252, 252, 252, 1) 56%,
      rgba(232, 232, 232, 1) 96%
    );
    border: 1px solid #c8c8c8;

    .avatar-initials {
      color: #eee;
      text-shadow: 1px 1px 2px #b3b3b3, -1px 1px 2px #b3b3b3,
        1px -1px 2px #b3b3b3, -1px -1px 2px #b3b3b3;
      z-index: 3;
    }

    * {
      pointer-events: none;
      user-select: none;
    }
  }

  @media (max-width: 500px) {
    .avatar.big {
      height: 4rem;
      width: 4rem;
      margin: 0 0.5rem;

      .avatar-initials {
        font-size: 2rem;
      }
    }
  }
</style>
