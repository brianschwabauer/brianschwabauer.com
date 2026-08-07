/**
 * Format a blog post timestamp for public display: month name + year only.
 *
 *   1742828400000 → "March 2026"
 *
 * The full date is still stored in the database for sorting/filtering; we just
 * don't surface the exact day to readers.
 */
export function formatPostDate(date: number | null | undefined): string {
	if (!date) return '';
	return new Date(date).toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
	});
}

/**
 * The 4-digit year a post belongs to, as a string (`"2026"`), or `''` when
 * there's no date. Read in local time to match `formatPostDate` — a post shown
 * as "January 2026" must land in the 2026 bucket even if it's still 2025 UTC.
 * Used by the `?year=` filter on /blog.
 */
export function postYear(date: number | null | undefined): string {
	if (!date) return '';
	return String(new Date(date).getFullYear());
}

/**
 * ISO date (YYYY-MM-DD) suitable for the `datetime` attribute of a <time>
 * element. Keeps the full date machine-readable for SEO, RSS aggregators and
 * assistive tech, even when the visible label is abbreviated.
 */
export function isoPostDate(date: number | null | undefined): string {
	if (!date) return '';
	return new Date(date).toISOString().slice(0, 10);
}
