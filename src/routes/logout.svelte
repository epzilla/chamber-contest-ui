<script lang="ts">
  import { user } from '../modules/stores';
  user.set(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    window.location.href = '/welcome';
  }
</script>
