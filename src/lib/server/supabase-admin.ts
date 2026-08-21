import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

/**
 * Service-role Supabase client for trusted server-side work that must bypass
 * RLS — e.g. persisting subscription rows from Stripe webhooks.
 *
 * NEVER import this module from client-side code; it lives under lib/server/
 * so SvelteKit enforces that.
 */
export function getSupabaseAdmin() {
	const url = env.SUPABASE_URL ?? env.PUBLIC_SUPABASE_URL;
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceRoleKey) return null;
	return createClient(url, serviceRoleKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
}

/** Row shape of the public.subscriptions table (see supabase/migrations). */
export interface SubscriptionRow {
	user_id: string;
	stripe_customer_id: string | null;
	stripe_subscription_id: string | null;
	status: string | null;
	price_id: string | null;
	plan_id: string | null;
	current_period_end: string | null;
	cancel_at_period_end: boolean | null;
}
