import { BASE_URL } from '$lib/modules/constants';
import { sortEventsByTime } from '$lib/modules/helpers';
import type { ChamberEvent } from '$lib/modules/types';

export async function load({ fetch }) {
	try {
		const eventResult = await fetch(`${BASE_URL}events`);
		const events: ChamberEvent[] = await eventResult.json();
		events.sort(sortEventsByTime);
		return {
			events
		};
	} catch (err) {
		return {
			status: 500,
			error: err
		};
	}
}
