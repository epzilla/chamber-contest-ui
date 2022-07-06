import { writable } from 'svelte/store';
import { generateGuid } from '../helpers';

export const alerts = writable([]);

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
