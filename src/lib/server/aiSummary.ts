import Anthropic from '@anthropic-ai/sdk';

export async function generateAiSummary(
	apiKey: string,
	title: string,
	plainTextContent: string,
): Promise<string> {
	const client = new Anthropic({ apiKey });
	const response = await client.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 220,
		system:
			"You write concise blog post summaries. Return ONLY the summary — no preamble, quotes, or labels. Aim for one or two sentences that capture the post's main point and would entice a reader to click. Use the same voice as the post.",
		messages: [
			{
				role: 'user',
				content: `Title: ${title}\n\nContent:\n${plainTextContent.slice(0, 8000)}`,
			},
		],
	});

	const block = response.content.find((b) => b.type === 'text');
	return block?.type === 'text' ? block.text.trim() : '';
}
