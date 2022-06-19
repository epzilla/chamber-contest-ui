<script>
  import { DEVICE_TYPES } from '../modules/constants';
  export let type;
  let icon;

  switch (type) {
    case DEVICE_TYPES.MOBILE_DEVICE:
      icon = 'mobile';
      break;
    case DEVICE_TYPES.TABLET_DEVICE:
      icon = 'tablet';
      break;
    case DEVICE_TYPES.LAPTOP_DEVICE:
      icon = 'laptop';
      break;
    case DEVICE_TYPES.DESKTOP_DEVICE:
      icon = 'desktop';
      break;
    case DEVICE_TYPES.GAME_SYSTEM:
      icon = 'gamepad';
      break;
    case DEVICE_TYPES.TV_DEVICE:
      icon = 'television';
      break;
    default:
      icon = 'cube';
  }
</script>

<div class="device-icon">
  <i class={`fa fa-${icon}`} />
</div>

<style>
  .fa {
    font-size: 1.5rem;
  }
</style>
