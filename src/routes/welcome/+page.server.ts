import { Members } from '$lib/modules/dbModels';
import { error } from '@sveltejs/kit';
import type { Actions } from '../$types';

export const actions: Actions = {
	addMember: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const name = data.get('name');
		const org = data.get('org');

		try {
			const newMember = await Members.create({
				email: email as string,
				name: name as string,
				org: org as string,
				isActive: true,
				isAdmin: false
			});
			return { member: newMember.get({ plain: true }) };
		} catch (err) {
			throw error(500, err as string);
		}
	}
};
