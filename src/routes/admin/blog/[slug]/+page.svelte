<script lang="ts">
	import { Button } from '@delightstack/components/actions';
	import PostEditor from '$lib/components/editor/PostEditor.svelte';

	let { data } = $props();
</script>

{#if data.post}
	<PostEditor mode="edit" initialPost={data.post} />
{:else}
	<div class="not-found">
		<h1>Post Not Found</h1>
		<p>The post you're looking for doesn't exist.</p>
		<Button href="/admin">Back to Posts</Button>
	</div>
{/if}

<style>
	.not-found {
		max-width: var(--measure);
		margin: 0 auto;
		text-align: center;
		padding: var(--space-24) var(--space-4);
	}
	.not-found h1 {
		margin-bottom: var(--space-4);
	}
	.not-found p {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-8);
	}
</style>
