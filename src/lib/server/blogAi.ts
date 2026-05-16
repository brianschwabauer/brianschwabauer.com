import type { Ai } from '@cloudflare/workers-types';
import type { BlogPost } from './blog';
import { generateAiSummary } from './aiSummary';
import { embedText, hashContent } from './embeddings';

const DRIFT_THRESHOLD = 0.05;

function lengthDrift(a: string, b: string): number {
	const max = Math.max(a.length, b.length, 1);
	return Math.abs(a.length - b.length) / max;
}

export interface AiAugmentInput {
	title: string;
	content: string;
	userSummary: string | null;
	existing: BlogPost | null;
}

export interface AiAugmentResult {
	aiSummary: string | null;
	embedding: number[] | null;
	contentHash: string;
}

export async function augmentWithAi(
	env: { AI: Ai; ANTHROPIC_API_KEY: string },
	input: AiAugmentInput
): Promise<AiAugmentResult> {
	const newHash = await hashContent(input.content);
	const existing = input.existing;

	const summaryReason =
		!existing?.aiSummary ||
		existing.contentHash !== newHash ||
		(existing.content && lengthDrift(existing.content, input.content) >= DRIFT_THRESHOLD);

	let aiSummary = existing?.aiSummary ?? null;
	if (summaryReason && env.ANTHROPIC_API_KEY) {
		try {
			aiSummary = await generateAiSummary(env.ANTHROPIC_API_KEY, input.title, input.content);
		} catch (err) {
			console.error('aiSummary generation failed:', err);
		}
	}

	let embedding = existing?.embedding ?? null;
	const embeddingStale = !embedding || existing?.contentHash !== newHash;
	if (embeddingStale && env.AI) {
		try {
			embedding = await embedText(env.AI, `${input.title}\n\n${input.content}`);
		} catch (err) {
			console.error('embedding generation failed:', err);
		}
	}

	return { aiSummary, embedding, contentHash: newHash };
}
