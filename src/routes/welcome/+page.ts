import { BASE_URL } from '$lib/modules/constants';
import type { Member } from '$lib/modules/types';

export const load = async () => {
	try {
		const now = new Date();
		const currentYear = now.getFullYear();
		const memberListResult = await fetch(`${BASE_URL}members`);
		const memberList: Member[] = await memberListResult.json();
		return {
			memberList,
			currentYear
		};
	} catch (err) {
		console.log(err);
		return {
			status: 500,
			error: err
		};
	}
};
