import { writable } from 'svelte/store';
import rest from '../rest';
import type { EventType } from '../types';

export const eventTypes = writable<EventType[]>([]);

rest.get('event-types').then((types: EventType[]) => {
	eventTypes.set(types);
});
