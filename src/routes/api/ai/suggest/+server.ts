import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');

	if (!platform?.env?.ANTHROPIC_API_KEY) {
		throw error(500, 'AI service not configured');
	}

	const { context, currentText } = await request.json();

	if (!currentText || typeof currentText !== 'string') {
		throw error(400, 'Current text is required');
	}

	try {
		const client = new Anthropic({ apiKey: platform.env.ANTHROPIC_API_KEY });

		const response = await client.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 500,
			messages: [
				{
					role: 'user',
					content: `Based on the following text, suggest a natural continuation (1-2 sentences).

Context: ${context || 'A technical blog post'}

Text so far:
${currentText}

Provide ONLY the suggested continuation, nothing else. Do not include any explanation or metadata.`
				}
			],
			system: `You are a writing assistant. Provide natural, contextual continuations for technical writing.
					Keep suggestions concise and maintain the same tone and style as the existing text.
					Do not repeat what was already written.`
		});

		const textContent = response.content.find((block) => block.type === 'text');
		const suggestion = textContent?.type === 'text' ? textContent.text : '';

		return json({ suggestion: suggestion.trim() });
	} catch (err) {
		console.error('AI suggestion failed:', err);
		throw error(500, 'Failed to generate suggestion');
	}
};
