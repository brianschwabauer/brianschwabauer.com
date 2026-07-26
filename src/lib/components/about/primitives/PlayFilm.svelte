<script lang="ts">
	import { ripple } from '@delightstack/utilities';

	/**
	 * A compact "play" trigger that stands in for an inline video poster.
	 *
	 * Most films on this page already have stills, posters, or a gallery beside
	 * the copy — a second 16:9 poster underneath it only repeats the image and
	 * costs a screen of height. This button ends the copy instead, and opens the
	 * section's `LightboxGallery` at the film's slide, where it autoplays.
	 *
	 * The feel is delightstack's `Button`: squircle corners, a ripple from the
	 * pointer, and the same 3D press that pushes the face back into the page.
	 * The colour is this page's own — `color` is the section's accent (the hex
	 * its `YearMark` uses), and the text tone is derived from it so it stays
	 * legible on every backdrop.
	 */
	let {
		label = 'Play film',
		/** Trailing detail after a hairline — a year, a runtime, "full show". */
		meta = '',
		/** Film title, used for the accessible name when the label is generic. */
		title = '',
		color = '#00e0ff',
		onclick,
	}: {
		label?: string;
		meta?: string;
		title?: string;
		color?: string;
		onclick: (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
	} = $props();
</script>

<!-- The perspective lives on the wrapper, not the button: an element's own
     `perspective` doesn't apply to its own transform, and the press depends on
     a z-translate reading as depth. -->
<span class="play-film-wrap" style:--accent={color}>
	<button
		type="button"
		class="play-film"
		aria-label={title ? `${label} — ${title}` : label}
		{@attach ripple({ zIndex: 1 })}
		{onclick}>
		<span class="disc" aria-hidden="true">
			<!-- Centred on the triangle's centroid, not its bounding box: a
			     right-pointing triangle carries its mass in the left third
			     ((2·9 + 18) / 3 = 12, the viewBox centre), so these points put
			     the weight — rather than the frame — in the middle of the disc. -->
			<svg viewBox="0 0 24 24">
				<polygon points="9,6 18,12 9,18" fill="currentColor" />
			</svg>
		</span>
		<span class="label">{label}</span>
		{#if meta}
			<span class="meta">{meta}</span>
		{/if}
	</button>
</span>

<style>
	.play-film-wrap {
		display: inline-flex;
		/* Set --play-film-offset from the section to drop the end-of-copy gap
		   when the button sits in a row of its own rather than under prose. */
		margin-top: var(--play-film-offset, 1.25rem);
		perspective: 100px;
	}

	.play-film {
		--tone: oklch(from var(--accent) max(l, 0.82) calc(c * 0.9) h);
		/* Squircle corners, matching delightstack's Button: the radius doubles
		   inside the @supports so browsers without `corner-shape` keep the plain
		   rounded rectangle rather than a comically large one. */
		--radius: var(--radius-lg, 10px);
		appearance: none;
		position: relative;
		overflow: hidden;
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		margin: 0;
		padding: 0.45rem 1.1rem 0.45rem 0.45rem;
		border: 1px solid oklch(from var(--accent) l c h / 0.4);
		border-radius: var(--radius);
		background: oklch(from var(--accent) l c h / 0.08);
		color: var(--tone);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		line-height: normal;
		cursor: pointer;
		transition:
			background 300ms ease,
			border-color 300ms ease,
			color 300ms ease,
			translate 200ms ease;

		@supports (corner-shape: squircle) {
			corner-shape: squircle;
			border-radius: calc(var(--radius) * var(--squircle-ratio, 2));
		}

		&:hover {
			transition-duration: 0s; /* instant on hover-in; animates on hover-out */
			/* …but not for `translate`: the press happens while hovered, so a
			   blanket 0s would snap the depress in too. Re-declaring the
			   shorthand keeps translate animating and leaves every colour
			   property untransitioned (instant) for as long as :hover matches. */
			transition: translate 200ms ease;
			background: oklch(from var(--accent) l c h / 0.16);
			border-color: oklch(from var(--accent) l c h / 0.8);
		}
		&:active {
			translate: 0px 1px clamp(-10px, calc(0.2em - 12px), -2px);
		}
		&:focus-visible {
			outline: 2px solid var(--tone);
			outline-offset: 3px;
		}
	}

	.disc {
		display: grid;
		place-items: center;
		width: 1.9rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: oklch(from var(--accent) l c h / 0.22);
		color: var(--tone);
		transition:
			background 300ms ease,
			color 300ms ease,
			scale 200ms var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
	}
	.play-film:hover .disc {
		transition-duration: 0s; /* instant on hover-in; animates on hover-out */
		background: var(--accent);
		color: #08060f;
		scale: 1.08;
	}
	.disc svg {
		width: 55%;
		height: 55%;
	}

	.meta {
		padding-left: 0.7rem;
		border-left: 1px solid oklch(from var(--accent) l c h / 0.35);
		color: oklch(from var(--tone) l calc(c * 0.5) h / 0.7);
		letter-spacing: 0.1em;
	}

	@media (prefers-reduced-motion: reduce) {
		.play-film,
		.disc {
			transition-property: background, border-color, color;
		}
		.play-film:active {
			translate: none;
		}
		.play-film:hover .disc {
			scale: none;
		}
	}
</style>
