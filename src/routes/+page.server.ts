import type { Member } from '$lib/modules/types';
import { BASE_URL } from '../lib/modules/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const upcomingEventResult = await fetch(`${BASE_URL}upcoming-events`);
		const upcomingEvents = await upcomingEventResult.json();
		const pastEventResult = await fetch(`${BASE_URL}past-events`);
		const pastEvents = await pastEventResult.json();
		const memberListResult = await fetch(`${BASE_URL}members`);
		const memberList: Member[] = await memberListResult.json();
		return {
			pastEvents,
			upcomingEvents,
			memberList
		};
	} catch (err) {
		return {
			status: 500,
			error: err
		};
	}
};
