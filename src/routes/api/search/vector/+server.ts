import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchVector } from '@orama/orama';
import { readPersistedVectorIndex, restoreVectorIndex } from '$lib/server/searchIndex';
import { embedText } from '$lib/server/embeddings';

export const GET: RequestHandler = async ({ url, platform }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q) return json({ results: [] });

	if (!platform?.env?.KV) throw error(500, 'KV not available');
	if (!platform.env.AI) throw error(500, 'AI binding not available');

	const persisted = await readPersistedVectorIndex(platform.env.KV);
	if (!persisted) return json({ results: [] });

	const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '10', 10) || 10, 50);
	const similarity = Math.min(
		Math.max(parseFloat(url.searchParams.get('similarity') ?? '0.6') || 0.6, 0),
		1
	);

	const queryVector = await embedText(platform.env.AI, q);
	const db = restoreVectorIndex(persisted);

	const results = await searchVector(db, {
		mode: 'vector',
		vector: { value: queryVector, property: 'embedding' },
		similarity,
		limit,
		includeVectors: false
	});

	return json({
		count: results.count,
		elapsed: results.elapsed,
		results: results.hits.map((h) => ({ id: h.id, score: h.score, doc: h.document }))
	});
};
