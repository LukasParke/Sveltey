// src/routes/auth/logout/+page.server.ts

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Sign-out happens via the POST action below; GETs just go home.
export const load: PageServerLoad = async () => {
	redirect(303, '/');
};

export const actions = {
	default: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		throw redirect(303, '/');
	}
};
