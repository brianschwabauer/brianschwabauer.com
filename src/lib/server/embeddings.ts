import type { Ai } from '@cloudflare/workers-types';

export const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
export const EMBEDDING_DIM = 768;

interface EmbeddingResponse {
	data: number[][];
}

export async function embedText(ai: Ai, text: string): Promise<number[]> {
	const trimmed = text.replace(/\s+/g, ' ').trim().slice(0, 4000);
	const result = (await ai.run(EMBEDDING_MODEL, { text: [trimmed] })) as EmbeddingResponse;
	const vector = result.data?.[0];
	if (!vector || vector.length !== EMBEDDING_DIM) {
		throw new Error(`Embedding response missing or wrong dimension (${vector?.length})`);
	}
	return vector;
}

export async function hashContent(text: string): Promise<string> {
	const data = new TextEncoder().encode(text);
	const digest = await crypto.subtle.digest('SHA-256', data);
	const bytes = new Uint8Array(digest);
	let hex = '';
	for (const b of bytes) hex += b.toString(16).padStart(2, '0');
	return hex;
}
