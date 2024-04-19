<script lang="ts">
  import { user } from '$lib/modules/stores';
  user.set(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    window.location.href = '/welcome';
  }
</script>

``
