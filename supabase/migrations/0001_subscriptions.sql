-- Subscription state persisted from Stripe webhooks.
-- Apply in the Supabase SQL editor or via `supabase db push`.

create table if not exists public.subscriptions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null unique references auth.users (id) on delete cascade,
	stripe_customer_id text,
	stripe_subscription_id text,
	status text,
	price_id text,
	plan_id text,
	current_period_end timestamptz,
	cancel_at_period_end boolean default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

comment on table public.subscriptions is
	'One row per user; mirrored from Stripe by the /api/stripe/webhook endpoint.';

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
	on public.subscriptions
	for select
	using (auth.uid() = user_id);

create policy "Users can create their own subscription row"
	on public.subscriptions
	for insert
	with check (auth.uid() = user_id);

create policy "Users can update their own subscription row"
	on public.subscriptions
	for update
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

-- Keep updated_at fresh on every mutation.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
	before update on public.subscriptions
	for each row execute function public.set_updated_at();

-- Webhooks run with the service role key and bypass RLS, so no policies are
-- needed for them. Users can read their own row for billing UI.
