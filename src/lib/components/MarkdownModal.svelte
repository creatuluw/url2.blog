<script lang="ts">
	import { NotebookPen } from '@lucide/svelte';

	interface Props {
		open?: boolean;
		title?: string;
		content?: string;
		onclose?: () => void;
	}

	let {
		open = false,
		title = '',
		content = '',
		onclose,
	}: Props = $props();

	function handleClose() {
		onclose?.();
	}
</script>

{#if open}
	<div class="modal-overlay open" role="dialog" aria-modal="true" onclick={handleClose}>
		<div class="modal" onclick={(e) => e.stopPropagation()} style="max-width: 800px;">
			<div class="modal-header">
				<h2 class="modal-title">{title || 'Stored Markdown'}</h2>
				<button
					class="modal-close"
					aria-label="Close modal"
					onclick={handleClose}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<div class="modal-body">
				{#if content}
					<pre class="markdown-content"><code>{content}</code></pre>
				{:else}
					<p class="text-center text-[var(--fg-muted)]">No markdown content stored for this URL.</p>
				{/if}
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-outline" onclick={handleClose}>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-header {
		padding-left: 1.5rem;
		padding-right: 1.5rem;
	}

	.modal-footer {
		padding-left: 1.5rem;
		padding-right: 1.5rem;
	}

	.markdown-content {
		white-space: pre-wrap;
		word-wrap: break-word;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		padding: 1rem;
		border-radius: 0.5rem;
		max-height: 60vh;
		overflow-y: auto;
	}
</style>
