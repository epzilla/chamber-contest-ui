import { writable } from 'svelte/store';
import rest from '../rest';

export const configData = writable<ConfigData>({
  submissionsDisabled: false,
  submissionsDeadline: null
});

rest.get('config').then((data: ConfigData) => {
  console.log('config data', data);
  configData.set(data);
});
