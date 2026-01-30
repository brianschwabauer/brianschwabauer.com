<script lang="ts">
	let { data } = $props();

	function formatDate(date: Date | number | null | undefined) {
		if (!date) return '';
		const d = date instanceof Date ? date : new Date(date);
		return d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	async function markAsRead(id: string) {
		// In a full implementation, this would call an API endpoint
		console.log('Mark as read:', id);
	}
</script>

<svelte:head>
	<title>Messages - Admin</title>
</svelte:head>

<div class="messages-admin">
	<div class="page-header">
		<h1>Contact Messages</h1>
		<span class="message-count">{data.messages.length} messages</span>
	</div>

	{#if data.messages.length > 0}
		<div class="messages-list">
			{#each data.messages as message (message.id)}
				<article class="message-item" class:unread={message.status === 'new'}>
					<div class="message-header">
						<div class="sender-info">
							<span class="sender-name">{message.name}</span>
							<a href="mailto:{message.email}" class="sender-email">{message.email}</a>
						</div>
						<time class="message-date">{formatDate(message.createdAt)}</time>
					</div>
					<p class="message-content">{message.message}</p>
					{#if message.status === 'new'}
						<button class="mark-read-btn" onclick={() => markAsRead(message.id)}>
							Mark as read
						</button>
					{/if}
				</article>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p>No messages yet.</p>
		</div>
	{/if}
</div>

<style>
	.messages-admin {
		max-width: 800px;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-8);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
	}

	.message-count {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.messages-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.message-item {
		padding: var(--space-5);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.message-item.unread {
		border-left: 4px solid var(--color-accent);
	}

	.message-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.sender-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.sender-name {
		font-weight: 600;
	}

	.sender-email {
		font-size: var(--text-sm);
		color: var(--color-accent);
	}

	.message-date {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.message-content {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		white-space: pre-wrap;
		margin-bottom: var(--space-4);
	}

	.mark-read-btn {
		font-size: var(--text-sm);
		color: var(--color-accent);
		font-weight: 500;
	}

	.mark-read-btn:hover {
		text-decoration: underline;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-16);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-secondary);
	}
</style>
