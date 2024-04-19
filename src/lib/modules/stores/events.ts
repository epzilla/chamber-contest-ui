import { writable } from 'svelte/store';
import rest from '../rest';
import { user } from './users';
import { sortEventsByTime } from '../helpers';
import type { ChamberEvent } from '../types';

type myEventsRsp = {
	attended: ChamberEvent[];
	unattended: ChamberEvent[];
	attendedAdHoc: ChamberEvent[];
	attendedNonAdHoc: ChamberEvent[];
};

export const pastEvents = writable<ChamberEvent[]>([]);
export const myEvents = writable<ChamberEvent[]>([]);
export const myUnattendedEvents = writable<ChamberEvent[]>([]);
export const myUnattendedPastEvents = writable<ChamberEvent[]>([]);

rest.get('past-events').then((events: ChamberEvent[]) => {
	events.sort(sortEventsByTime);
	pastEvents.set(events);
});

user.subscribe((u) => {
	if (u) {
		rest.get(`events-by-member/${u.id}`).then(({ attended, unattended }: myEventsRsp) => {
			attended.sort(sortEventsByTime);
			unattended.sort(sortEventsByTime);
			myEvents.set(attended);
			myUnattendedEvents.set(unattended);
		});
	}
});

pastEvents.subscribe((past) => {
	myUnattendedEvents.subscribe((unattended) => {
		myUnattendedPastEvents.set(past.filter((e) => !!unattended.find((ue) => ue.id === e.id)));
	});
});
