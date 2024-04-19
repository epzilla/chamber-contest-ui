import { writable } from 'svelte/store';
import rest from '../rest';
import { userUpdates } from './updates';
import type { Member } from '../types';

export const members = writable<Member[]>([]);

rest.get('members').then((data) => {
	members.set(data);
});

function onUserUpdated(newUser: Member) {
	members.update((members) => {
		const index = members.findIndex((member) => member.id === newUser.id);
		if (index !== -1) {
			members[index] = newUser;
		} else {
			members.push(newUser);
		}
		if (!newUser.isActive) {
			members.splice(index, 1);
		}
		return members;
	});
}

userUpdates.subscribe(onUserUpdated);
