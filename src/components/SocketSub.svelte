<script lang="ts">
  import { get } from 'svelte/store';

  import { user, userUpdates } from '../modules/stores';

  function onUserUpdated(newUser: Member) {
    const userId = get(user)?.id;
    if (typeof window !== 'undefined' && userId && userId === newUser.id) {
      if (!newUser.isActive) {
        localStorage.removeItem('user');
        window.location.href = '/welcome';
      } else {
        localStorage.setItem('user', JSON.stringify(newUser));
      }
      user.set(newUser);
    }
  }

  userUpdates.subscribe(onUserUpdated);
</script>

<slot />
