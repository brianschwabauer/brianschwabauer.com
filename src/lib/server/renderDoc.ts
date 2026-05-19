/**
 * Lightweight TipTap JSON → HTML renderer.
 *
 * Walks a ProseMirror document and emits HTML strings directly. Zero deps
 * (no jsdom / zeed-dom), small bundle, fast in Workers. Designed for the
 * specific extension set used by our blog editor — adding a new node type
 * means adding a case here.
 *
 * The blogImage node renders the full optimized <figure><img></figure>
 * markup with srcset, sizes, inline style for the background placeholder,
 * width-mode classes for breakout, etc. — so the public blog post can just
 * {@html} the result with no further processing.
 */

export interface TipTapDoc {
	type: string;
	content?: TipTapNode[];
}

export interface TipTapNode {
	type: string;
	attrs?: Record<string, unknown>;
	content?: TipTapNode[];
	marks?: TipTapMark[];
	text?: string;
}

export interface TipTapMark {
	type: string;
	attrs?: Record<string, unknown>;
}

// ── public API ──────────────────────────────────────────────────────────────

export function renderDoc(doc: TipTapDoc | TipTapNode | null | undefined): string {
	if (!doc) return '';
	return renderChildren(doc.content);
}

export function extractText(doc: TipTapDoc | TipTapNode | null | undefined): string {
	if (!doc) return '';
	const out: string[] = [];
	walkText(doc, out);
	return out.join('').trim();
}

// ── escape helpers ──────────────────────────────────────────────────────────

function escapeHTML(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ── walker ──────────────────────────────────────────────────────────────────

function renderChildren(content: TipTapNode[] | undefined): string {
	if (!content) return '';
	return content.map(renderNode).join('');
}

function renderNode(node: TipTapNode): string {
	switch (node.type) {
		case 'doc':
			return renderChildren(node.content);

		case 'paragraph':
			return `<p>${renderChildren(node.content)}</p>`;

		case 'heading': {
			const level = clamp(Number(node.attrs?.level) || 2, 1, 6);
			return `<h${level}>${renderChildren(node.content)}</h${level}>`;
		}

		case 'bulletList':
			return `<ul>${renderChildren(node.content)}</ul>`;

		case 'orderedList': {
			const start = Number(node.attrs?.start);
			const startAttr = Number.isFinite(start) && start !== 1 ? ` start="${start}"` : '';
			return `<ol${startAttr}>${renderChildren(node.content)}</ol>`;
		}

		case 'listItem':
			return `<li>${renderChildren(node.content)}</li>`;

		case 'blockquote':
			return `<blockquote>${renderChildren(node.content)}</blockquote>`;

		case 'codeBlock': {
			const lang = node.attrs?.language;
			const cls = typeof lang === 'string' ? ` class="language-${escapeAttr(lang)}"` : '';
			return `<pre><code${cls}>${renderChildren(node.content)}</code></pre>`;
		}

		case 'horizontalRule':
			return '<hr>';

		case 'hardBreak':
			return '<br>';

		case 'text':
			return wrapMarks(escapeHTML(node.text ?? ''), node.marks);

		case 'blogImage':
			return renderBlogImage(node);

		default:
			// Unknown node — render children if any, otherwise drop
			return renderChildren(node.content);
	}
}

function wrapMarks(html: string, marks: TipTapMark[] | undefined): string {
	if (!marks || marks.length === 0) return html;
	let wrapped = html;
	// Apply outer-to-inner so the resulting HTML matches TipTap's storage order.
	for (let i = marks.length - 1; i >= 0; i--) {
		wrapped = wrapMark(wrapped, marks[i]);
	}
	return wrapped;
}

function wrapMark(html: string, mark: TipTapMark): string {
	switch (mark.type) {
		case 'bold':
		case 'strong':
			return `<strong>${html}</strong>`;
		case 'italic':
		case 'em':
			return `<em>${html}</em>`;
		case 'strike':
		case 's':
			return `<s>${html}</s>`;
		case 'code':
			return `<code>${html}</code>`;
		case 'underline':
			return `<u>${html}</u>`;
		case 'link': {
			const href = String(mark.attrs?.href ?? '');
			const target = mark.attrs?.target;
			const rel = mark.attrs?.rel ?? (target ? 'noopener noreferrer' : null);
			const attrs = [
				`href="${escapeAttr(href)}"`,
				target ? `target="${escapeAttr(String(target))}"` : '',
				rel ? `rel="${escapeAttr(String(rel))}"` : '',
			]
				.filter(Boolean)
				.join(' ');
			return `<a ${attrs}>${html}</a>`;
		}
		default:
			return html;
	}
}

// ── blogImage renderer ──────────────────────────────────────────────────────

interface VariantInfo {
	name: string;
	width: number;
	height: number;
	mime_type: string;
}

function renderBlogImage(node: TipTapNode): string {
	const attrs = node.attrs ?? {};
	const src = String(attrs.src ?? '');
	const path = String(attrs.path ?? '');
	const alt = String(attrs.alt ?? '');
	const width = Number(attrs.width) || 0;
	const height = Number(attrs.height) || 0;
	const widthMode = (attrs.widthMode as string) || 'normal';
	const widthPct = Number(attrs.widthPct) || 100;
	const thumbhash = attrs.thumbhash ? String(attrs.thumbhash) : '';
	const bgColor = attrs.bgColor ? String(attrs.bgColor) : '';
	const caption = typeof attrs.caption === 'string' ? attrs.caption.trim() : '';
	const cropAspectRaw = Number(attrs.cropAspect);
	const cropAspect = Number.isFinite(cropAspectRaw) && cropAspectRaw > 0 ? cropAspectRaw : 0;
	const focalX = Number(attrs.focalX);
	const focalY = Number(attrs.focalY);

	let variants: VariantInfo[] = [];
	try {
		const raw = attrs.variants;
		if (typeof raw === 'string') variants = JSON.parse(raw);
		else if (Array.isArray(raw)) variants = raw as VariantInfo[];
	} catch {
		variants = [];
	}

	const cdnBase = path ? `/cdn/image/${path}` : src.replace(/\/[^/]+$/, '');
	const srcsetEntries = variants
		.slice()
		.sort((a, b) => a.width - b.width)
		.map((v) => `${cdnBase}/${v.name} ${v.width}w`);
	const srcsetAttr = srcsetEntries.length > 0 ? ` srcset="${escapeAttr(srcsetEntries.join(', '))}"` : '';

	// `sizes` is keyed to the chosen width mode so the browser picks an
	// appropriately-sized variant from the srcset.
	let sizes = '100vw';
	if (widthMode === 'normal') sizes = `(max-width: 768px) 100vw, ${Math.round((widthPct / 100) * 720)}px`;
	else if (widthMode === 'wide') sizes = '(max-width: 1100px) 100vw, 1100px';

	const styleParts: string[] = [];
	if (bgColor) styleParts.push(`--blog-img-bg: ${bgColor}`);
	if (widthMode === 'normal') styleParts.push(`--blog-img-pct: ${widthPct}%`);
	if (cropAspect) {
		styleParts.push(`--blog-img-crop-aspect: ${cropAspect}`);
		const fx = Number.isFinite(focalX) ? focalX : 50;
		const fy = Number.isFinite(focalY) ? focalY : 50;
		styleParts.push(`--blog-img-focal-x: ${fx}%`);
		styleParts.push(`--blog-img-focal-y: ${fy}%`);
	}
	const styleAttr = styleParts.length > 0 ? ` style="${escapeAttr(styleParts.join('; '))}"` : '';

	const classes = ['blog-img'];
	if (caption) classes.push('has-caption');
	if (cropAspect) classes.push('is-cropped');
	const figureClass = classes.join(' ');
	const figureAttrs = [
		`class="${figureClass}"`,
		`data-width-mode="${escapeAttr(widthMode)}"`,
		widthMode === 'normal' ? `data-width-pct="${widthPct}"` : '',
		thumbhash ? `data-thumbhash="${escapeAttr(thumbhash)}"` : '',
		path ? `data-path="${escapeAttr(path)}"` : '',
		styleAttr.trim(),
	]
		.filter(Boolean)
		.join(' ');

	const imgAttrs = [
		`src="${escapeAttr(src)}"`,
		`alt="${escapeAttr(alt)}"`,
		width ? `width="${width}"` : '',
		height ? `height="${height}"` : '',
		srcsetAttr.trim(),
		`sizes="${escapeAttr(sizes)}"`,
		`loading="lazy"`,
		`decoding="async"`,
	]
		.filter(Boolean)
		.join(' ');

	const captionHTML = caption ? `<figcaption>${escapeHTML(caption)}</figcaption>` : '';
	return `<figure ${figureAttrs}><img ${imgAttrs}>${captionHTML}</figure>`;
}

// ── plain text walker (for AI summary + search index) ───────────────────────

function walkText(node: TipTapDoc | TipTapNode, out: string[]): void {
	if (node.type === 'text' && typeof (node as TipTapNode).text === 'string') {
		out.push((node as TipTapNode).text!);
		return;
	}
	if (node.type === 'hardBreak') {
		out.push(' ');
		return;
	}
	if (node.type === 'blogImage') {
		const attrs = (node as TipTapNode).attrs;
		const caption = attrs?.caption;
		if (typeof caption === 'string' && caption) out.push(` ${caption} `);
		else {
			const alt = attrs?.alt;
			if (typeof alt === 'string' && alt) out.push(` ${alt} `);
		}
		return;
	}
	const content = (node as TipTapNode).content;
	if (content) {
		for (const child of content) walkText(child, out);
		// Add a paragraph break between block-level nodes
		if (BLOCK_TYPES.has(node.type)) out.push('\n\n');
	}
}

const BLOCK_TYPES = new Set([
	'paragraph',
	'heading',
	'blockquote',
	'codeBlock',
	'listItem',
	'horizontalRule',
]);

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}
