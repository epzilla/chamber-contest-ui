<script lang="ts">
  import PopModal from '$lib/components/PopModal.svelte';
  import { members, user } from '$lib/modules/stores';
  import type { Member } from '$lib/modules/types';
  import type { PageData } from './$types';

  export let data: PageData;
  const { currentYear, memberList } = data;
  let selectedMember: Member | null = null;
  let isAddingMember = false;
  let isSubmittingAddMember = false;
  let addingMemberName = '';
  let addingMemberOrg = '';
  let addingMemberEmail = '';

  $: mutableMemberList = [...(memberList || [])];

  members.subscribe((m) => {
    mutableMemberList = m;
    selectedMember = selectedMember
      ? mutableMemberList.find((m) => m.id === selectedMember!.id) ?? null
      : null;
  });

  function onSelectChange(e: any) {
    selectedMember = mutableMemberList.find((m) => m.id.toString() === e.target.value) ?? null;
  }
  function onSubmitLogin() {
    if (selectedMember) {
      localStorage.setItem('user', JSON.stringify(selectedMember));
      window.location.href = '/';
    }
  }
  async function onSubmitAddMember() {
    isSubmittingAddMember = true;
    const data = new FormData();
    data.append('name', addingMemberName);
    data.append('org', addingMemberOrg);
    data.append('email', addingMemberEmail);
    try {
      const res = await fetch('/welcome?/addMember', {
        method: 'POST',
        body: data
      });
      if (res.ok) {
        const { data: newMemberDataString } = await res.json();
        const json = JSON.parse(newMemberDataString);
        const id: number = json[2];
        const newMember: Member = {
          id,
          name: addingMemberName,
          email: addingMemberEmail,
          isActive: true,
          isAdmin: false
        };
        members.update((m) => [...m, newMember]);
        selectedMember = newMember;
        localStorage.setItem('user', JSON.stringify(newMember));
        user.set(newMember);
        window.location.href = '/';
      }
    } catch (e) {
      console.error(e);
    } finally {
      isSubmittingAddMember = false;
      isAddingMember = false;
    }
  }
</script>

<section class="welcome">
  <h1>Welcome to the {currentYear} Madison Chamber Home Run Challenge!</h1>

  <p>Select your name from our list of ambassadors below to get started:</p>

  <select name="member-select" class="member-select" on:change={onSelectChange}>
    <option value=""> -- Select your name -- </option>
    {#each mutableMemberList as member}
      <option value={member.id}>{member.name}</option>
    {/each}
  </select>

  <button class="primary" on:click={onSubmitLogin} disabled={!selectedMember}
    ><span>Let's Go!</span></button
  >

  <hr />
  <a href="#" on:click={() => (isAddingMember = true)}>I don't see my name listed</a>
</section>

<PopModal show={isAddingMember} onClose={() => (isAddingMember = false)}>
  <div class="pop-modal-form">
    <div class="main-outer">
      <div class="main-inner">
        <h3>Let's get you added to the contest!</h3>
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" name="name" id="name" bind:value={addingMemberName} />
        </div>
        <div class="form-group">
          <label for="org">Organization</label>
          <input type="text" name="org" id="org" bind:value={addingMemberOrg} />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" name="email" id="email" bind:value={addingMemberEmail} />
        </div>
      </div>
      <div class="bottom-row">
        <button on:click={onSubmitAddMember} class="primary" disabled={isSubmittingAddMember}
          >Submit</button
        >
        <button on:click={() => (isAddingMember = false)} class="bottom-button">Cancel</button>
      </div>
    </div>
  </div>
</PopModal>

<style lang="scss">
  @import '$lib/styles/modal-form.scss';

  .welcome {
    padding: 2rem;
    text-align: center;

    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
  }

  .member-select {
    font-size: 16px;
    width: calc(100% - 40px);
    height: 40px;
    margin-bottom: 20px;
  }

  .primary {
    font-size: 1.2rem;
    width: 200px;
    height: 50px;
  }

  hr {
    margin-top: 2rem;
    margin-bottom: 2rem;
    border-top: 1px solid #d1d1d1;
  }

  a {
    color: #da3fe9;
    cursor: pointer;
    text-decoration: none;
    text-underline-offset: 0.333em;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
