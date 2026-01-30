import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import Anthropic from '@anthropic-ai/sdk';

async function isAdmin(platform: App.Platform | undefined, locals: App.Locals): Promise<boolean> {
	if (!platform?.env?.DB || !locals.session?.user?.id) {
		return false;
	}

	const db = getDb(platform.env.DB as unknown as D1Database);
	const [user] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, locals.session.user.id))
		.limit(1);

	return user?.role === 'admin';
}

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!(await isAdmin(platform, locals))) {
		throw error(403, 'Unauthorized');
	}

	if (!platform?.env?.ANTHROPIC_API_KEY) {
		throw error(500, 'AI service not configured');
	}

	const { outline, type = 'blog' } = await request.json();

	if (!outline || typeof outline !== 'string') {
		throw error(400, 'Outline is required');
	}

	try {
		const client = new Anthropic({
			apiKey: platform.env.ANTHROPIC_API_KEY
		});

		const systemPrompt =
			type === 'blog'
				? `You are a skilled technical writer helping to create blog posts.
				   Write in a conversational but professional tone.
				   Use clear, concise language and include practical examples where appropriate.
				   Format the output as HTML with proper headings (h2, h3), paragraphs, code blocks, and lists.
				   Do not include a title (h1) - that will be added separately.`
				: `You are helping to write timeline entries for a personal portfolio.
				   Write in first person, keeping entries concise but engaging.
				   Focus on key achievements, learnings, or memorable moments.
				   Format as a brief paragraph or two, using HTML for any formatting.`;

		const userPrompt =
			type === 'blog'
				? `Write a blog post based on this outline:\n\n${outline}`
				: `Write a timeline entry description based on this outline:\n\n${outline}`;

		const response = await client.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 4000,
			messages: [
				{
					role: 'user',
					content: userPrompt
				}
			],
			system: systemPrompt
		});

		const textContent = response.content.find((block) => block.type === 'text');
		const generatedText = textContent?.type === 'text' ? textContent.text : '';

		return json({ content: generatedText });
	} catch (err) {
		console.error('AI generation failed:', err);
		throw error(500, 'Failed to generate content');
	}
};
