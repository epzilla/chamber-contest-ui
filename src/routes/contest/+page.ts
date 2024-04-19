import { BASE_URL } from '$lib/modules/constants';
import { calculateTotalsForTimePeriod } from '$lib/modules/helpers';
import type { TimePeriodTotalRsp, ValidMonthEntry } from '$lib/modules/types';

export async function load({ fetch }) {
	try {
		const now = new Date();

		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth() + 1;
		const rsp = await fetch(`${BASE_URL}yearly-totals/${currentYear}`);
		const json: TimePeriodTotalRsp = await rsp.json();
		const monthsRsp = await fetch(`${BASE_URL}valid-months`);
		const validMonths: ValidMonthEntry[] = await monthsRsp.json();
		const totals = calculateTotalsForTimePeriod(json);
		return {
			timePeriod: currentYear,
			currentYear,
			currentMonth,
			totals,
			validMonths
		};
	} catch (err) {
		return {
			status: 500,
			error: err
		};
	}
}
