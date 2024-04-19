import { writable } from 'svelte/store';
import rest from '../rest';
import type { ConfigData } from '../types';

export const configData = writable<ConfigData>({
	submissionsDisabled: false,
	submissionsDeadline: ''
});

rest.get('config').then((data: ConfigData) => {
	configData.set(data);
});
