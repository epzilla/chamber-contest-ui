<script lang="ts">
  import MiniAlerts from '$lib/components/MiniAlerts.svelte';
  import FixedAlerts from '$lib/components/FixedAlerts.svelte';
  import Nav from '$lib/components/Nav.svelte';
  import SocketSub from '$lib/components/SocketSub.svelte';
  import EditAttendanceModal from '$lib/components/EditAttendanceModal.svelte';

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
    <EditAttendanceModal />
  </main>
</SocketSub>
