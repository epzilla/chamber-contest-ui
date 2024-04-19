import { BASE_URL } from '$lib/modules/constants';

export async function load({ fetch }) {
	try {
		const feedResult = await fetch(`${BASE_URL}feed`);
		const feed = await feedResult.json();
		return {
			initialFeed: feed
		};
	} catch (err) {
		return {
			status: 500,
			error: err
		};
	}
}
