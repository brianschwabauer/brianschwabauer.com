/**
 * Normalize a single tag string. Tags are alphanumeric + space + hyphen, with
 * each space-separated word's first letter capitalized.
 *
 *   "  video   production  " → "Video Production"
 *   "vfx"                    → "Vfx"
 *   "Behind-the-scenes!"     → "Behind-the-scenes"
 */
export function normalizeTag(input: string): string {
	const stripped = input.replace(/[^A-Za-z0-9\- ]+/g, '');
	const collapsed = stripped.replace(/\s+/g, ' ').trim();
	if (!collapsed) return '';
	return collapsed
		.split(' ')
		.map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
		.join(' ');
}

/** Normalize + dedupe a list of tags, preserving the first occurrence's casing. */
export function normalizeTagList(input: readonly string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const raw of input) {
		const tag = normalizeTag(raw);
		if (!tag) continue;
		const key = tag.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(tag);
	}
	return out;
}

/** Strip characters not allowed in a tag (used to filter live input). */
export function sanitizeTagInputChar(char: string): string {
	return char.replace(/[^A-Za-z0-9\- ]/g, '');
}
