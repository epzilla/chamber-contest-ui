<script lang="ts">
  import { user } from '../../modules/stores';
  if (typeof window !== 'undefined' && !$user?.isAdmin) {
    window.location.href = '/';
  }
</script>

<h2>Admin</h2>

<section class="admin-main">
  <a href="/admin/edit-members" class="style-as-button">
    <span class="fa fa-users" />
    <span>Edit Members</span>
  </a>
  <a href="/admin/edit-events" class="style-as-button">
    <span class="fa fa-calendar" />
    <span>Edit Events</span>
  </a>
  <a href="/admin/edit-event-types" class="style-as-button">
    <span class="fa fa-list" />
    <span>Edit Event Types</span>
  </a>
  <a href="/admin/feed" class="style-as-button">
    <span class="fa fa-feed" />
    <span>View Activity Feed</span>
  </a>
</section>

<style lang="scss">
  .admin-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    .style-as-button {
      width: 300px;
      display: grid;
      grid-template-columns: 90px 1fr;
      gap: 1rem;
      justify-content: start;

      span {
        text-align: left;

        &.fa {
          text-align: right;
        }
      }
    }
  }
</style>
