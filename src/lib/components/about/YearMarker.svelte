<script lang="ts">
	interface Props {
		year: number;
	}

	let { year }: Props = $props();
</script>

<div class="year-marker">
	<span class="year-text">{year}</span>
</div>

<style>
	.year-marker {
		position: relative;
		display: flex;
		justify-content: center;
		padding: var(--space-12) 0;
		z-index: 1;
	}

	.year-text {
		font-size: clamp(4rem, 15vw, 10rem);
		font-weight: 900;
		line-height: 1;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		backdrop-filter: blur(2px);
		text-shadow: 0 0 60px rgba(0, 180, 160, 0.3);
		user-select: none;
	}
</style>
