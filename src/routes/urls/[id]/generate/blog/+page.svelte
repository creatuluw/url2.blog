<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	interface Props {
		data: {
			savedUrl: {
				id: string;
				url: string;
				title: string | null;
				description: string | null;
			};
			formData: {
				title: string;
				blogReason: string;
				tone: string;
				format: string;
				tags: string[];
				category: string;
				additionalInstructions: string;
			};
		};
	}

	let { data }: Props = $props();

	let isGenerating = $state(true);
	let hasError = $state(false);
	let errorMessage = $state('');
	let generatedContent = $state('');
	let generatedTitle = $state('');
	let streamProgress = $state(0);
	let streamMessage = $state('Initializing generation...');

	const {
		title: formTitle,
		blogReason: formBlogReason,
		tone: formTone,
		format: formFormat,
		tags: tagsArray,
		category: formCategory,
		additionalInstructions: formAdditionalInstructions,
	} = data.formData;

	async function startGeneration(appendContent: boolean = false) {
		if (!formTitle || !formBlogReason) {
			toast.error('Missing required fields');
			window.location.href = `/urls/${data.savedUrl.id}/generate`;
			return;
		}

		isGenerating = true;
		hasError = false;
		errorMessage = '';

		if (!appendContent) {
			generatedContent = '';
			generatedTitle = '';
			streamProgress = 0;
		}
		streamMessage = appendContent ? 'Continuing generation...' : 'Initializing generation...';

		const formData = new FormData();
		formData.append('savedUrlId', data.savedUrl.id);
		formData.append('title', formTitle);
		formData.append('blogReason', formBlogReason);
		formData.append('tone', formTone);
		formData.append('format', formFormat);
		formData.append('tags', tagsArray.join(','));
		formData.append('category', formCategory);
		formData.append('additionalInstructions', formAdditionalInstructions);

		// If appending, include existing content so the API can potentially resume
		if (appendContent && generatedContent) {
			formData.append('existingContent', generatedContent);
		}

		try {
			const response = await fetch(`/api/urls/${data.savedUrl.id}/generate-stream`, {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Generation failed');
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error('Response body is not readable');
			}

			const decoder = new TextDecoder();
			let accumulatedContent = appendContent ? generatedContent : '';
			let chunksReceived = 0;
			const expectedChunks = 50;

			streamMessage = 'Generating content...';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				accumulatedContent += chunk;
				chunksReceived++;

				streamProgress = Math.min((chunksReceived / expectedChunks) * 100, 95);
				generatedContent = accumulatedContent;

				const titleMatch = accumulatedContent.match(/title:\s*(.+)/);
				if (titleMatch) {
					generatedTitle = titleMatch[1].trim();
				}
			}

			streamProgress = 100;
			streamMessage = 'Generation complete!';

			await new Promise(resolve => setTimeout(resolve, 500));

			isGenerating = false;

			toast.success('Blog post generated successfully!', {
				description: 'Review and edit your content before saving.',
			});
		} catch (error) {
			console.error('Generation error:', error);
			isGenerating = false;
			hasError = true;
			streamMessage = 'Generation interrupted';
			errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

			toast.error('Generation interrupted', {
				description: 'Your content has been preserved. You can retry or proceed with what was generated.',
			});
		}
	}

	async function handleContinue() {
		await startGeneration(true);
	}

	async function handleSave({ content, title }: { content: string; title: string }) {
		try {
			const response = await fetch('/api/blog-posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					savedUrlId: data.savedUrl.id,
					title,
					content,
					tone: formTone,
					format: formFormat,
					tags: tagsArray,
					category: formCategory,
					blogReason: formBlogReason,
					additionalInstructions: formAdditionalInstructions,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to save blog post');
			}

			toast.success('Blog post saved successfully!', {
				description: 'Your content has been published.',
			});

			window.location.href = `/urls/${data.savedUrl.id}`;
		} catch (error) {
			console.error('Save error:', error);
			toast.error('Failed to save blog post', {
				description: error instanceof Error ? error.message : 'Please try again',
			});
		}
	}

	function handleCancel() {
		window.location.href = `/urls/${data.savedUrl.id}/generate`;
	}

	onMount(() => {
		startGeneration(false);
	});
</script>

<svelte:head>
	<title>Generating Blog Post - URL2.blog</title>
</svelte:head>

<Header />

<main class="pt-16 min-h-screen flex flex-col items-center p-4">
	<div class="flex flex-col items-center w-full max-w-2xl" style="margin-top: 1vh;">
		<div class="card w-full">
			<div class="modal-header">
				<div>
					<h2 class="modal-title">
						{#if isGenerating}
							Generating Blog Post
						{:else if hasError}
							Generation Interrupted
						{:else}
							Review & Edit
						{/if}
					</h2>
					<p class="text-sm text-[var(--fg-muted)]">{data.savedUrl.url}</p>
				</div>
				{#if isGenerating}
					<a href="/urls/{data.savedUrl.id}/generate" class="btn btn-outline btn-sm">
						Cancel
					</a>
				{:else}
					<a href="/urls/{data.savedUrl.id}" class="btn btn-outline btn-sm">
						Cancel
					</a>
				{/if}
			</div>

			{#if isGenerating}
				<div class="generation-status" style="padding: 0.75rem 1rem; background: var(--bg-elevated); border-bottom: 1px solid var(--border);">
					<div class="status-row" style="display: flex; align-items: center; gap: 0.75rem;">
						<div class="spinner" style="display: flex; align-items: center;">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin" style="color: var(--accent);">
								<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
							</svg>
						</div>
						<span class="status-text" style="font-size: 0.875rem; color: var(--fg-muted);">{streamMessage}</span>
						<div class="progress-bar-container" style="flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden;">
							<div
								class="progress-bar"
								style="width: {streamProgress}%; height: 100%; background: var(--accent); transition: width 0.3s ease;"
							></div>
						</div>
						<span style="font-size: 0.75rem; color: var(--fg-muted); min-width: 3rem; text-align: right;">{Math.round(streamProgress)}%</span>
					</div>
				</div>
			{:else if hasError}
				<div class="error-section" style="padding: 1rem; background: var(--error-bg, #fee2e2); border-bottom: 1px solid var(--error, #ef4444);">
					<div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
						<div>
							<p style="font-weight: 600; color: var(--error, #ef4444); font-size: 0.875rem;">
								Generation was interrupted
							</p>
							<p style="font-size: 0.75rem; color: var(--fg-muted); margin-top: 0.25rem;">
								{errorMessage}
							</p>
						</div>
						<button
							type="button"
							class="btn btn-primary"
							onclick={handleContinue}
							style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--accent); color: white; border: none; border-radius: 0.5rem; cursor: pointer;"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polygon points="5 3 19 12 5 21 5 3"/>
							</svg>
							Continue
						</button>
					</div>
				</div>
			{/if}

			<div class="modal-body" style="min-height: 400px;">
				<BlogEditor
					content={generatedContent}
					title={generatedTitle || formTitle}
					savedUrlId={data.savedUrl.id}
					isGenerating={isGenerating}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>
		</div>
	</div>
</main>

<style>
	:global(.card) {
		background: transparent;
		border: none;
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	:global(.modal-header),
	:global(.modal-body) {
		background: transparent;
	}

	:global(.modal-header) {
		padding: 1.5rem 5px;
	}

	:global(.modal-body) {
		padding: 0 5px;
	}

	.generation-status {
		animation: fadeIn 0.3s ease;
	}

	.error-section {
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background: var(--accent);
		color: white;
		border: none;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.btn-outline {
		background: transparent;
		color: var(--fg);
		border: 1px solid var(--border);
	}

	.btn-outline:hover {
		background: var(--bg-elevated);
	}
</style>
