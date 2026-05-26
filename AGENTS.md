# Project conventions

## Hover transitions: instant in, animated out

Every CSS rule whose selector contains `:hover` must include `transition-duration: 0s;` as the first declaration in the block. This applies to direct hover selectors (`.foo:hover { … }`), descendant hover selectors (`.parent:hover .child { … }`), and nested `&:hover` rules.

Effect: hover-in is instant (no transition while `:hover` is matched, since duration is 0), but hover-out animates back via the element's default `transition` (because once `:hover` no longer matches, the override disappears and the normal transition takes over). The UI feels snappy on entry and leaves a "trail" on exit.

```css
.card {
	transition:
		transform 200ms ease,
		box-shadow 200ms ease;
}
.card:hover {
	transition-duration: 0s; /* instant on hover-in; default transition animates on hover-out */
	transform: translateY(-4px);
	box-shadow: var(--shadow-lg);
}
```

When adding any new `:hover` rule anywhere in this repo, include this line. Existing rules across `src/` already follow this pattern.
