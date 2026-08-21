// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

if (!PUBLIC_SUPABASE_URL) {
	throw new Error('PUBLIC_SUPABASE_URL is required!');
}
if (!PUBLIC_SUPABASE_ANON_KEY) {
	throw new Error('PUBLIC_SUPABASE_ANON_KEY is required!');
}

export const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: { flowType: 'pkce' }
});
