<script context="module">
  import { BASE_URL } from '../modules/constants';

  export async function load({ fetch }) {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const memberListResult = await fetch(`${BASE_URL}members`);
      const memberList = await memberListResult.json();
      return {
        props: {
          memberList,
          currentYear
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

  export let currentYear: number;
  export let memberList: Member[];
  let selectedMember: Member | null = null;

  members.subscribe(m => {
    memberList = m;
    selectedMember = selectedMember
      ? memberList.find(m => m.id === selectedMember.id)
      : null;
  });

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

<section class="welcome">
  <h1>Welcome to the {currentYear} Madison Chamber Home Run Challenge!</h1>

  <p>Select your name from our list of ambassadors below to get started:</p>

  <select name="member-select" class="member-select" on:change={onSelectChange}>
    <option value=""> -- Select your name -- </option>
    {#each memberList as member}
      <option value={member.id}>{member.name}</option>
    {/each}
  </select>

  <button class="primary" on:click={onSubmit} disabled={!selectedMember}
    ><span>Let's Go!</span></button
  >
</section>

<style lang="scss">
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
</style>
