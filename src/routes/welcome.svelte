<script context="module">
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch, page }) {
    try {
      const memberListResult = await fetch(`${BASE_URL}members`);
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
  import { members } from '../modules/stores';

  export let memberList: Member[];
  members.subscribe(m => {
    memberList = m;
  });

  let selectedMember: Member | null = memberList[0];
  function onSelectChange(e) {
    selectedMember = memberList.find(m => m.id.toString() === e.target.value);
  }
  function onSubmit() {
    if (selectedMember) {
      localStorage.setItem('user', JSON.stringify(selectedMember));
      window.location.href = '/';
    }
  }
</script>

<h1>Welcome to the 2022 Madison Chamber Home Run Challenge!</h1>

<p>Select your name from our list of ambassadors below to get started:</p>

<select name="member-select" class="member-select" on:change={onSelectChange}>
  {#each memberList as member}
    <option value={member.id}>{member.name}</option>
  {/each}
</select>

<button class="primary" on:click={onSubmit}>Lets' Go!</button>

<style lang="scss">
  .member-select {
    font-size: 16px;
    width: calc(100% - 40px);
    height: 40px;
    margin-bottom: 20px;
  }
</style>
