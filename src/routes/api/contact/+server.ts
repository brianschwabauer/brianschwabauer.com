import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { contactSubmissions } from '$lib/server/db/schema';
import type { D1Database } from '@cloudflare/workers-types';

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const { name, email, message } = await request.json();

	// Validate input
	if (!name || typeof name !== 'string' || name.length > 100) {
		throw error(400, 'Invalid name');
	}
	if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 200) {
		throw error(400, 'Invalid email');
	}
	if (!message || typeof message !== 'string' || message.length > 5000) {
		throw error(400, 'Invalid message');
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);

		await db.insert(contactSubmissions).values({
			name: name.trim(),
			email: email.trim().toLowerCase(),
			message: message.trim()
		});

		return json({ success: true });
	} catch (err) {
		console.error('Failed to save contact submission:', err);
		throw error(500, 'Failed to save message');
	}
};
