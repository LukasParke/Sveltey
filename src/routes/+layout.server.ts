// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	// The authGuard hook has already validated the session (JWT checked via getUser()).
	// Reuse it instead of hitting the Supabase Auth server a second time per request.
	return {
		session: locals.session,
		user: locals.user,
		cookies: cookies.getAll()
	};
};
