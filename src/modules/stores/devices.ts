import { writable } from 'svelte/store';
import { generateGuid } from '../helpers';
import rest from '../rest';

let devId: string;

if (typeof window !== 'undefined') {
  const devIdString = localStorage.getItem('deviceId');
  if (devIdString) {
    devId = devIdString;
  } else {
    devId = generateGuid();
    localStorage.setItem('deviceId', devId);
    rest.post('device', { deviceId: devId });
  }
}

export const deviceId = writable<string>(devId);
