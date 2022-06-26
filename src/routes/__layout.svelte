<script lang="ts">
  // import FixedAlerts from '../components/FixedAlerts.svelte';
  import Nav from '../components/Nav.svelte';

  let user: Member;
  if (typeof window !== 'undefined') {
    let userString = localStorage.getItem('user');
    if (userString) {
      user = JSON.parse(userString);
    }
    if (!user && window.location.pathname !== '/welcome') {
      window.location.href = '/welcome';
    } else if (user && window.location.pathname === '/welcome') {
      window.location.href = '/';
    }
  }
</script>

<Nav {user} />
<main>
  <slot />
  <!-- <FixedAlerts /> -->
</main>
