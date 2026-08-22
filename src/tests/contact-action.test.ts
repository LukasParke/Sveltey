import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	env: {} as Record<string, string | undefined>,
	sendEmail: vi.fn()
}));

vi.mock('$env/dynamic/private', () => ({ env: mocks.env }));
vi.mock('$app/environment', () => ({ dev: false, browser: false }));
vi.mock('resend', () => ({
	Resend: vi.fn().mockImplementation(function () {
		return { emails: { send: mocks.sendEmail } };
	})
}));

function makeEvent(form: Record<string, string>, ip = '1.2.3.4') {
	const body = new FormData();
	for (const [k, v] of Object.entries(form)) body.set(k, v);
	return {
		request: new Request('http://localhost:5173/contact', { method: 'POST', body }),
		getClientAddress: () => ip
	};
}

const validForm = {
	name: 'Ada Lovelace',
	email: 'ada@example.dev',
	subject: 'Hello',
	message: 'A perfectly reasonable message.'
};

describe('contact form action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const key of Object.keys(mocks.env)) delete mocks.env[key];
		mocks.sendEmail.mockResolvedValue({ data: { id: 'email_1' }, error: null });
	});

	it('returns per-field errors for invalid input', async () => {
		const { actions } = await import('../routes/(marketing)/contact/+page.server');
		const res = await actions.send(makeEvent({}) as never);
		expect(res).toMatchObject({ status: 400 });
		const data = (res as { data: { fieldErrors: Record<string, string> } }).data;
		expect(Object.keys(data.fieldErrors)).toEqual(
			expect.arrayContaining(['name', 'email', 'subject', 'message'])
		);
		expect(mocks.sendEmail).not.toHaveBeenCalled();
	});

	it('drops honeypot submissions with a silent success', async () => {
		const { actions } = await import('../routes/(marketing)/contact/+page.server');
		const res = await actions.send(
			makeEvent({ ...validForm, website: 'http://spam.example' }) as never
		);
		expect(res).toMatchObject({ success: true });
		expect(mocks.sendEmail).not.toHaveBeenCalled();
	});

	it('logs instead of sending when RESEND_API_KEY is missing (dev mode)', async () => {
		const { actions } = await import('../routes/(marketing)/contact/+page.server');
		const res = await actions.send(makeEvent(validForm) as never);
		expect(res).toMatchObject({ success: true, devMode: true });
		expect(mocks.sendEmail).not.toHaveBeenCalled();
	});

	it('sends through Resend with escaped content when configured', async () => {
		mocks.env.RESEND_API_KEY = 're_test';
		mocks.env.CONTACT_FROM_EMAIL = 'Site <noreply@test.dev>';
		mocks.env.CONTACT_TO_EMAIL = 'inbox@test.dev';
		const { actions } = await import('../routes/(marketing)/contact/+page.server');
		const res = await actions.send(
			makeEvent({ ...validForm, message: 'Has <script>alert(1)</script> inside' }) as never
		);
		expect(res).toMatchObject({ success: true });
		expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
		const args = mocks.sendEmail.mock.calls[0][0];
		expect(args.from).toBe('Site <noreply@test.dev>');
		expect(args.to).toBe('inbox@test.dev');
		expect(args.replyTo).toBe('ada@example.dev');
		expect(args.text).toContain('Has <script>');
		expect(args.html).toContain('Has &lt;script&gt;');
	});

	it('returns a 500 failure when Resend rejects', async () => {
		mocks.env.RESEND_API_KEY = 're_test';
		mocks.sendEmail.mockResolvedValue({ data: null, error: { message: 'domain not verified' } });
		const { actions } = await import('../routes/(marketing)/contact/+page.server');
		const res = await actions.send(makeEvent(validForm) as never);
		expect(res).toMatchObject({ status: 500 });
	});

	it('rate limits repeated submissions per IP', async () => {
		const { actions } = await import('../routes/(marketing)/contact/+page.server');
		// Five pass (dev-mode successes), the sixth is limited.
		for (let i = 0; i < 5; i++) {
			await actions.send(makeEvent(validForm, '9.9.9.9') as never);
		}
		const limited = await actions.send(makeEvent(validForm, '9.9.9.9') as never);
		expect(limited).toMatchObject({ status: 429 });

		// A different IP is unaffected.
		const other = await actions.send(makeEvent(validForm, '8.8.8.8') as never);
		expect(other).toMatchObject({ success: true });
	});
});
