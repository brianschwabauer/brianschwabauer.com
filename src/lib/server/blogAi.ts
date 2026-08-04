import type { Ai } from '@cloudflare/workers-types';
import { applyAiFields, type BlogPost } from './blog';
import { generateAiSummary } from './aiSummary';
import { embedText, hashContent } from './embeddings';
import { rebuildIndex, rebuildVectorIndex } from './searchIndex';
import { refreshAdminTags } from './adminData';
import { invalidateFuzzyCache } from './fuzzyRedirect';

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
	input: AiAugmentInput,
): Promise<AiAugmentResult> {
	const newHash = await hashContent(input.content);
	const existing = input.existing;

	const summaryReason =
		!existing?.aiSummary ||
		existing.contentHash !== newHash ||
		(existing.contentText &&
			lengthDrift(existing.contentText, input.content) >= DRIFT_THRESHOLD);

	let aiSummary = existing?.aiSummary ?? null;
	if (summaryReason && env.ANTHROPIC_API_KEY) {
		try {
			aiSummary = await generateAiSummary(
				env.ANTHROPIC_API_KEY,
				input.title,
				input.content,
			);
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

/**
 * Run AI augmentation + index rebuilds after the response has been sent
 * (via `platform.context.waitUntil`). The editor doesn't consume any of
 * this data, so making every save wait on an Anthropic call plus three
 * index rebuilds only slows the UI down.
 */
export function finishSaveInBackground(
	platform: App.Platform,
	saved: BlogPost,
	userSummary: string | null,
): void {
	const env = platform.env;
	const work = (async () => {
		try {
			const ai = await augmentWithAi(env, {
				title: saved.title,
				content: saved.contentText,
				userSummary,
				existing: saved,
			});
			const changed =
				ai.aiSummary !== saved.aiSummary ||
				ai.embedding !== saved.embedding ||
				ai.contentHash !== saved.contentHash;
			if (changed) await applyAiFields(env.KV, saved.slug, ai);
			await Promise.all([
				rebuildIndex(env.KV),
				rebuildVectorIndex(env.KV),
				refreshAdminTags(env.KV),
			]);
			invalidateFuzzyCache();
		} catch (err) {
			console.error('Background post-save work failed:', err);
		}
	})();
	platform.context?.waitUntil(work);
}
