<script lang="ts">
  import MiniAlerts from '../components/MiniAlerts.svelte';
  import FixedAlerts from '../components/FixedAlerts.svelte';
  import Nav from '../components/Nav.svelte';
  import SocketSub from '../components/SocketSub.svelte';
  import '../modules/errors';

  if (typeof window !== 'undefined' && window.location.href === '/welcome') {
    if (!localStorage.getItem('user')) {
      window.location.href = '/welcome';
    }
  }
</script>

<SocketSub>
  <Nav />
  <main>
    <MiniAlerts />
    <slot />
    <FixedAlerts />
  </main>
</SocketSub>
