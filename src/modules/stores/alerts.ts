import { derived, writable } from 'svelte/store';
import { generateGuid } from '../helpers';
import { attendanceUpdates } from '../websockets';
import { user } from './users';

let memberId;

user.subscribe(u => {
  memberId = u?.id;
});

export const alerts = writable<Alert[]>([]);

export const fixedAlerts = derived(alerts, $alerts => {
  return $alerts.filter(alert => alert.type !== 'pointsUpdate');
});

export const miniAlerts = derived(alerts, $alerts => {
  return $alerts.filter(alert => alert.type === 'pointsUpdate');
});

export const addAlert = (alert: Alert) => {
  alerts.update(n => {
    const id = generateGuid();
    setTimeout(() => {
      alerts.update(al => al.filter(a => a.id !== id));
    }, alert.timeout || 10000);

    return [...n, { ...alert, id }];
  });
};

export function dismissAlert(id: string) {
  alerts.update(n => n.filter(al => al.id !== id));
}

attendanceUpdates.subscribe(({ type, event }) => {
  if (type === 'add' && event.memberId !== memberId) {
    addAlert({
      type: 'pointsUpdate',
      msg: `${event.name} just earned ${
        event.points === 1 ? 'a point' : event.points + ' points'
      }!`,
      timeout: 5000,
      action: () => {
        window.location.href = `/contest`;
      },
      clickable: true
    });
  }
});
