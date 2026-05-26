import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rateLimit } from '$lib/server/rateLimit';

function escapeHeader(value: string): string {
	return value.replace(/[\r\n]/g, ' ').trim();
}

function buildMime(opts: {
	from: string;
	to: string;
	replyTo: string;
	subject: string;
	body: string;
}): string {
	const date = new Date().toUTCString();
	const messageId = `<${crypto.randomUUID()}@brianschwabauer.com>`;
	return [
		`From: ${escapeHeader(opts.from)}`,
		`To: ${escapeHeader(opts.to)}`,
		`Reply-To: ${escapeHeader(opts.replyTo)}`,
		`Subject: ${escapeHeader(opts.subject)}`,
		`Message-ID: ${messageId}`,
		`Date: ${date}`,
		'MIME-Version: 1.0',
		'Content-Type: text/plain; charset=utf-8',
		'',
		opts.body,
	].join('\r\n');
}

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const env = platform?.env;
	if (!env?.SEND_EMAIL || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) {
		console.error('Email binding or addresses not configured');
		throw error(500, 'Email service not configured');
	}

	// The contact form is unauthenticated — throttle by client IP so it can't
	// be scripted to flood the destination inbox. 5 messages per 10 minutes.
	if (env.KV) {
		const { ok } = await rateLimit(env.KV, `contact:${getClientAddress()}`, 5, 600);
		if (!ok) throw error(429, 'Too many messages sent. Please try again later.');
	}

	const { name, email, message } = await request.json();

	if (!name || typeof name !== 'string' || name.length > 100)
		throw error(400, 'Invalid name');
	if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 200) {
		throw error(400, 'Invalid email');
	}
	if (!message || typeof message !== 'string' || message.length > 5000) {
		throw error(400, 'Invalid message');
	}

	const cleanName = name.trim();
	const cleanEmail = email.trim().toLowerCase();
	const cleanMessage = message.trim();

	const mime = buildMime({
		from: env.CONTACT_FROM_EMAIL,
		to: env.CONTACT_TO_EMAIL,
		replyTo: cleanEmail,
		subject: `Portfolio contact from ${cleanName}`,
		body: `From: ${cleanName} <${cleanEmail}>\n\n${cleanMessage}`,
	});

	try {
		// @ts-expect-error cloudflare:email is a Workers runtime module
		const { EmailMessage } = await import(/* @vite-ignore */ 'cloudflare:email');
		const msg = new EmailMessage(env.CONTACT_FROM_EMAIL, env.CONTACT_TO_EMAIL, mime);
		await env.SEND_EMAIL.send(msg);
		return json({ success: true });
	} catch (err) {
		console.error('Failed to send contact email:', err);
		throw error(500, 'Failed to send message');
	}
};
