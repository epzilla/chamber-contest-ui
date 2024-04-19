import { BASE_URL } from '$lib/modules/constants';
import type { ChamberEvent, Member } from '$lib/modules/types.js';

export async function load({ fetch, params }) {
	try {
		const id = await params.id;
		const eventResult = await fetch(`${BASE_URL}events/${id}`);
		const memberListResult = await fetch(`${BASE_URL}members`);
		const memberList: Member[] = await memberListResult.json();
		const { event, attendees } = (await eventResult.json()) as {
			event: ChamberEvent;
			attendees: Member[];
		};
		return {
			event,
			attendees,
			memberList: memberList || []
		};
	} catch (err) {
		return {
			status: 500,
			error: err
		};
	}
}
