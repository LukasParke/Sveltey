import { dev } from '$app/environment';
import { fail } from '@sveltejs/kit';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

/**
 * Simple in-memory rate limiter (sliding window). Adequate for a single server
 * instance; swap for Redis/upstash or a platform-level limiter when scaling out.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const submissions = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
	// The limiter protects production inboxes; local dev and e2e runs stay open.
	if (dev) return false;
	const now = Date.now();
	const hits = (submissions.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
	if (hits.length >= MAX_PER_WINDOW) {
		return true;
	}
	hits.push(now);
	submissions.set(key, hits);
	return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: FormDataEntryValue | null): string {
	return typeof value === 'string' ? value.trim() : '';
}

export const actions: Actions = {
	send: async ({ request, getClientAddress }) => {
		const formData = await request.formData();

		// Honeypot: bots fill every field. Pretend success and drop the message.
		if (str(formData.get('website')) !== '') {
			return { success: true as const };
		}

		if (isRateLimited(getClientAddress())) {
			return fail(429, {
				error: 'Too many messages sent. Please try again later.'
			});
		}

		const name = str(formData.get('name'));
		const email = str(formData.get('email'));
		const subject = str(formData.get('subject'));
		const message = str(formData.get('message'));

		const fieldErrors: Record<string, string> = {};
		if (!name || name.length > 100)
			fieldErrors.name = 'Please enter your name (max 100 characters).';
		if (!EMAIL_RE.test(email)) fieldErrors.email = 'Please enter a valid email address.';
		if (!subject || subject.length > 200)
			fieldErrors.subject = 'Please enter a subject (max 200 characters).';
		if (!message || message.length > 5000)
			fieldErrors.message = 'Please enter a message (max 5000 characters).';

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { error: 'Please fix the highlighted fields.', fieldErrors });
		}

		const text = `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
		const html = [
			'<h2>New contact form submission</h2>',
			`<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
			`<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
			`<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>`,
			`<hr><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>`
		].join('\n');

		const apiKey = env.RESEND_API_KEY;
		if (!apiKey) {
			// No API key configured: log instead of silently pretending delivery.
			console.warn(
				'[contact] RESEND_API_KEY not set — logging submission instead of sending email:\n' + text
			);
			return { success: true as const, devMode: true as const };
		}

		try {
			const resend = new Resend(apiKey);
			const from = env.CONTACT_FROM_EMAIL || 'Sveltey Contact <onboarding@resend.dev>';
			const to = env.CONTACT_TO_EMAIL || 'noreply@example.com';

			const { error } = await resend.emails.send({
				from,
				to,
				replyTo: email,
				subject: `Contact form: ${subject}`,
				text,
				html
			});
			if (error) throw new Error(error.message);

			return { success: true as const };
		} catch (error) {
			console.error('[contact] Failed to send email:', error);
			return fail(500, {
				error: 'We could not send your message right now. Please try again later.'
			});
		}
	}
};

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
