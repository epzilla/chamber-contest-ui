import { BASE_URL } from '$lib/modules/constants';
import type { EventType } from '$lib/modules/types.js';

export async function load({ fetch }) {
	try {
		const typesResult = await fetch(`${BASE_URL}event-types`);
		const typeList: EventType[] = await typesResult.json();
		return {
			typeList
		};
	} catch (err) {
		return {
			status: 500,
			error: err
		};
	}
}
