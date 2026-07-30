<script lang="ts">
	// The stand-in for content the page isn't showing yet: a strip of cut film,
	// sprocket holes and all, that reveals what's behind it.
	//
	// Usually you want `DeletedScenes`, which pairs this with the content it
	// hides. Reach for the strip directly when the hidden thing has to stay
	// mounted — a `LightboxGallery` whose `?media=` deep links must resolve even
	// while collapsed can only drop its *thumbnails*, so it renders headless and
	// puts this strip beside it instead.

	let {
		scenes = 1,
		label,
		onclick,
	}: {
		/** How many scenes the strip claims to be hiding. */
		scenes?: number;
		/** Overrides the "View N deleted scenes" text entirely. */
		label?: string;
		onclick: (event: MouseEvent) => void;
	} = $props();

	const marker_text = $derived(
		(label ?? `View ${scenes} deleted scene${scenes === 1 ? '' : 's'}`).toUpperCase(),
	);
</script>

<button type="button" class="marker" {onclick}>
	<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
		<rect
			x="2.2"
			y="10.2"
			width="19.6"
			height="9.6"
			rx="1.4"
			stroke="currentColor"
			stroke-width="1.6" />
		<g fill="currentColor">
			<path d="m3.4 4.9 3.2.4-2 3.9-3.2-.4z" />
			<path d="m9 5.6 3.2.4-2 3.9-3.2-.4z" />
			<path d="m14.6 6.3 3.2.4-2 3.9-3.2-.4z" />
			<path d="m20.2 7 2.4.3-2 3.9-2.4-.3z" />
		</g>
	</svg>
	<span class="count">{marker_text}</span>
	<span class="arrow" aria-hidden="true">↓</span>
</button>

<style>
	.marker {
		appearance: none;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		/* min 44px hit target, and the strip's own ~3.5rem presence */
		min-height: 3.5rem;
		padding: 0 clamp(0.75rem, 2vw, 1.25rem);
		font: inherit;
		color: inherit;
		cursor: pointer;
		text-align: left;
		border: 0;
		border-block: 1px dashed rgba(255, 255, 255, 0.35);
		border-radius: 0;
		/* A length of film: flat stock, sprocket holes punched along both edges. */
		background-color: rgba(255, 255, 255, 0.03);
		background-image:
			repeating-linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.16) 0 7px,
				transparent 7px 18px
			),
			repeating-linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.16) 0 7px,
				transparent 7px 18px
			);
		background-size: 100% 5px;
		background-position:
			0 5px,
			0 calc(100% - 5px);
		background-repeat: no-repeat;
		transition: background-color 250ms ease;

		svg {
			flex-shrink: 0;
			opacity: 0.7;
		}
	}
	.marker:hover {
		transition-duration: 0s;
		background-color: rgba(255, 255, 255, 0.07);
	}
	.marker:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: -4px;
	}
	.marker:active {
		transition-duration: 0s;
		background-color: rgba(255, 255, 255, 0.1);
	}

	.count {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		opacity: 0.75;
		transition: opacity 250ms ease;
	}
	/* Down, not right: the scenes drop in below the strip rather than taking the
	   reader somewhere else. */
	.arrow {
		margin-left: auto;
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		opacity: 0.55;
		transition:
			opacity 250ms ease,
			translate 200ms cubic-bezier(0.25, 1, 0.5, 1);
	}
	.marker:hover .count {
		transition-duration: 0s;
		opacity: 1;
	}
	.marker:hover .arrow {
		transition-duration: 0s;
		opacity: 1;
		translate: 0 3px;
	}

	/* At phone width the strip tightens up; the label is the whole point, so it
	   shrinks rather than truncating. */
	@media (max-width: 620px) {
		.marker {
			gap: 0.5rem;
			padding-inline: 0.7rem;
		}
		.count {
			font-size: 0.62rem;
			letter-spacing: 0.08em;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.arrow {
			transition: opacity 250ms ease;
		}
	}
</style>
