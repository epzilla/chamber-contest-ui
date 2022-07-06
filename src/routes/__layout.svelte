<script lang="ts">
  import FixedAlerts from '../components/FixedAlerts.svelte';
  import Nav from '../components/Nav.svelte';
  import SocketSub from '../components/SocketSub.svelte';

  if (typeof window !== 'undefined' && window.location.href === '/welcome') {
    if (!localStorage.getItem('user')) {
      window.location.href = '/welcome';
    }
  }
</script>

<SocketSub>
  <Nav />
  <main>
    <slot />
    <FixedAlerts />
  </main>
</SocketSub>
