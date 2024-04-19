import { BASE_URL } from '$lib/modules/constants';
import type { Member } from '$lib/modules/types.js';

export async function load({ fetch }) {
	try {
		const memberListResult = await fetch(`${BASE_URL}members/include-inactive`);
		const memberList: Member[] = await memberListResult.json();
		return {
			memberList
		};
	} catch (err) {
		return {
			status: 500,
			error: err
		};
	}
}
