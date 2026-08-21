import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// The authGuard hook guarantees a session for everything under /app.
	const user = locals.user!;

	const { data: subscription } = await locals.supabase
		.from('subscriptions')
		.select('plan_id, status, current_period_end, cancel_at_period_end')
		.eq('user_id', user.id)
		.maybeSingle();

	return { subscription };
};
