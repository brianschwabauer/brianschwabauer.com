<script lang="ts">
	import PostEditor from '$lib/components/editor/PostEditor.svelte';

	let { data } = $props();
</script>

<PostEditor mode="new" tagSuggestions={data.adminData?.tags ?? []} />
