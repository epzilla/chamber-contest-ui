<script lang="ts">
  import { user } from '../../modules/stores';
  if (typeof window !== 'undefined' && !$user?.isAdmin) {
    window.location.href = '/';
  }
</script>

<h2>Admin</h2>

<a href="/admin/edit-members" class="style-as-button">Edit Members</a>
<a href="/admin/edit-events" class="style-as-button">Edit Events</a>
