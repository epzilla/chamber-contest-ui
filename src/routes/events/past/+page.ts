import { BASE_URL } from '$lib/modules/constants';
import type { ChamberEvent } from '$lib/modules/types.js';

export async function load({ fetch }) {
	try {
		const eventResult = await fetch(`${BASE_URL}past-events`);
		const events: ChamberEvent[] = await eventResult.json();
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
