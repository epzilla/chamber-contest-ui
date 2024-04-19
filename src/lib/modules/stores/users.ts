import { writable } from 'svelte/store';
import { sortEventsByTime } from '../helpers';
import rest from '../rest';
import type { AttendedChamberEvent, EventsByMemberRsp, Member } from '../types';

let userObj: Member | null = null;

if (typeof window !== 'undefined') {
	const userString = localStorage.getItem('user');
	if (userString) {
		userObj = JSON.parse(userString);
	}

	if (userObj && !userObj.isActive) {
		localStorage.removeItem('user');
		window.location.href = '/welcome';
	} else if (!userObj?.isActive && window.location.pathname !== '/welcome') {
		window.location.href = '/welcome';
	} else if (userObj?.isActive && window.location.pathname === '/welcome') {
		window.location.href = '/';
	}
}

if (userObj) {
	rest
		.get(`members/member/${userObj.id}`)
		.then((data: Member) => {
			user.set(data);
			userObj = data;
			if (!data?.isActive) {
				window.localStorage.removeItem('user');
				window.location.href = '/welcome';
			} else {
				rest.get(`events-by-member/${data.id}`).then(({ attended }: EventsByMemberRsp) => {
					attended.sort(sortEventsByTime);
					userAttendedEvents.set(attended);
				});
			}
		})
		.catch((err) => {
			console.error(err);
		});
}

export const user = writable<Member | null>(userObj);
export const userAttendedEvents = writable<AttendedChamberEvent[]>([]);
export const editingAttendedEvent = writable<AttendedChamberEvent | null>(null);
