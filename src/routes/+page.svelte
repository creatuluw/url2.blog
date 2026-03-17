<script lang="ts">
	import '../app.css';
	import Modal from '$lib/components/Modal.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import { Files } from '@lucide/svelte';

	// Modal state
	let modalOpen = $state(false);
	let currentUrlId = $state<string | null>(null);
	let currentUrl = $state<string>('');
	let isGenerating = $state(false);
	let urlInputValue = $state<string>('');

	// Clipboard modal state
	let clipboardModalOpen = $state(false);
	let clipboardModalMessage = $state<string>('');



	// Editor state
	let showEditor = $state(false);
	let editorContent = $state('');
	let editorTitle = $state('');
	let editorBlogPostId = $state<string | null>(null);
	let editorSavedUrl = $state<string>('');

	// UI state
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	$effect(() => {
		if (errorMessage) {
			const timer = setTimeout(() => {
				errorMessage = null;
			}, 5000);
			return () => clearTimeout(timer);
		}
	});




	// Auto-paste from clipboard on page load if URL starts with http
	$effect(() => {
		async function checkClipboard() {
			try {
				const clipboardText = await navigator.clipboard.readText();
				if (clipboardText && clipboardText.startsWith('http')) {
					urlInputValue = clipboardText.trim();
				}
			} catch (err) {
				// Clipboard access denied or not available - silently fail
				console.log('Clipboard access not available:', err);
			}
		}
		checkClipboard();
	});

	$effect(() => {
		if (successMessage) {
			const timer = setTimeout(() => {
				successMessage = null;
			}, 3000);
			return () => clearTimeout(timer);
		}
	});

	function openGenerateModal(urlId: string | null, url: string) {
		currentUrlId = urlId;
		currentUrl = url;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		currentUrlId = null;
		currentUrl = '';
	}

	function openEditor(blogPostId: string, title: string, content: string, url: string) {
		editorBlogPostId = blogPostId;
		editorTitle = title;
		editorContent = content;
		editorSavedUrl = url;
		showEditor = true;
	}



	async function handlePasteFromClipboard() {
		try {
			const clipboardText = await navigator.clipboard.readText();
			if (clipboardText && clipboardText.startsWith('http')) {
				urlInputValue = clipboardText.trim();
			} else if (clipboardText && !clipboardText.startsWith('http')) {
				clipboardModalMessage = 'Clipboard does not contain a valid URL (must start with http)';
				clipboardModalOpen = true;
			} else {
				clipboardModalMessage = 'Clipboard is empty. Please copy a URL first.';
				clipboardModalOpen = true;
			}
		} catch (err) {
			clipboardModalMessage = 'Failed to access clipboard. Please paste manually.';
			clipboardModalOpen = true;
		}
	}

	function closeClipboardModal() {
		clipboardModalOpen = false;
		clipboardModalMessage = '';
	}

	function closeEditor() {
		showEditor = false;
		editorBlogPostId = null;
		editorTitle = '';
		editorContent = '';
		editorSavedUrl = '';
	}

	async function handleSaveUrl(formData: FormData) {
		try {
			const response = await fetch('?/saveUrl', {
				method: 'POST',
				body: formData,
			});
			const result = await response.json();

			if (result.type === 'success' && result.data) {
				if (result.data.exists) {
					errorMessage = 'This URL already exists in your collection';
				} else if (result.data.id && result.data.url) {
					openGenerateModal(result.data.id, result.data.url);
				}
			} else if (result.status >= 400 && result.data?.error) {
				errorMessage = result.data.error;
			}
		} catch (err) {
			errorMessage = 'Failed to save URL. Please try again.';
		}
	}

	async function handleGenerateBlog(formData: FormData) {
		isGenerating = true;
		closeModal();

		try {
			const response = await fetch('?/generateBlog', {
				method: 'POST',
				body: formData,
			});
			const result = await response.json();

			isGenerating = false;

			if (result.type === 'success' && result.data) {
				openEditor(
					result.data.id,
					result.data.title,
					result.data.content,
					currentUrl
				);
			} else if (result.status >= 400 && result.data?.error) {
				errorMessage = result.data.error;
			}
		} catch (err) {
			isGenerating = false;
			errorMessage = 'Failed to generate blog post. Please try again.';
		}
	}
</script>

<svelte:head>
	<title>URL2.blog - Transform URLs into Blog Posts</title>
</svelte:head>

<Header />
<main class="pt-16 min-h-screen flex flex-col items-center p-4">
	<div class="flex flex-col items-center w-full max-w-2xl" style="margin-top: 20vh;">

		{#if errorMessage}
			<div class="alert alert-error" role="alert">
				<svg
					class="alert-icon"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
				<div class="alert-content">
					<p class="alert-title">Error</p>
					<p class="alert-message">{errorMessage}</p>
				</div>
				<button class="btn btn-outline btn-sm" onclick={() => errorMessage = null}>
					Dismiss
				</button>
			</div>
		{/if}

		{#if successMessage}
			<div class="alert alert-success" role="alert">
				<svg
					class="alert-icon"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
				<div class="alert-content">
					<p class="alert-message">{successMessage}</p>
				</div>
			</div>
		{/if}

		{#if isGenerating}
			<div class="modal-overlay open">
				<div class="modal">
					<div class="modal-body">
						<div class="space-y-4">
							<h3 class="modal-title">Generating your blog post...</h3>
							<div class="progress-bar-container">
								<div class="progress-track">
									<div
										class="progress-fill"
										style="width: 100%; animation: progress-indeterminate 1.5s infinite;"
									></div>
								</div>
							</div>
							<p class="text-center text-[var(--fg-muted)]">
								This may take up to 30 seconds
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if showEditor && editorBlogPostId}
			<div class="editor-wrapper w-full max-w-4xl mx-auto mt-8">
				<div class="editor-header-bar flex items-center justify-between mb-4">
					<div>
						<h2 class="text-xl font-bold">Edit Blog Post</h2>
						<p class="text-sm text-[var(--fg-muted)]">{editorSavedUrl}</p>
					</div>
					<button class="btn btn-outline btn-sm" onclick={closeEditor}>
						Close Editor
					</button>
				</div>
				<BlogEditor
					content={editorContent}
					title={editorTitle}
					savedUrlId={currentUrlId}
					onSave={async (data) => {
						const formData = new FormData();
						formData.append('blogPostId', editorBlogPostId || '');
						formData.append('title', data.title);
						formData.append('content', data.content);

						try {
							const response = await fetch('?/saveBlogPost', {
								method: 'POST',
								body: formData,
							});

							if (response.ok) {
								successMessage = 'Blog post saved successfully!';
								editorContent = data.content;
								editorTitle = data.title;
							} else {
								errorMessage = 'Failed to save changes';
							}
						} catch (err) {
							errorMessage = 'Failed to save changes';
						}
					}}
					onCancel={closeEditor}
				/>
			</div>
		{:else}
			<section class="container text-center">
				<form method="POST" action="?/saveUrl" class="space-y-4" onsubmit={(e) => {
					e.preventDefault();
					const formData = new FormData(e.currentTarget);
					if (urlInputValue) {
						formData.set('url', urlInputValue);
					}
					handleSaveUrl(formData);
				}}>
					<div class="input-group">
						<label class="input-label" for="url-input">
							Paste your URL
						</label>
						<div class="relative">
							<input
								id="url-input"
								type="url"
								name="url"
								class="input-field pr-12"
								placeholder="https://example.com"
								autocomplete="off"
								required
								bind:value={urlInputValue}
							/>
							<button
								type="button"
								class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-[var(--accent-light)] transition-colors cursor-pointer"
								onclick={handlePasteFromClipboard}
								title="Paste from clipboard"
								aria-label="Paste from clipboard"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
									<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
								</svg>
							</button>
						</div>
					</div>

					<button type="submit" class="btn btn-primary mt-2">
						Save
					</button>
				</form>

				{#if clipboardModalOpen}
					<div class="modal-overlay open modal-overlay-top" onclick={closeClipboardModal}>
						<div class="small-modal" onclick={(e) => e.stopPropagation()}>
							<div class="small-modal-body">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="small-modal-icon"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="12" y1="8" x2="12" y2="12" />
									<line x1="12" y1="16" x2="12.01" y2="16" />
								</svg>
								<p class="small-modal-message">{clipboardModalMessage}</p>
							</div>
							<button class="btn btn-sm btn-outline" onclick={closeClipboardModal}>
								OK
							</button>
						</div>
					</div>
				{/if}

				<div class="flex justify-center mt-4">
					<a href="/urls" class="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
						<Files size={24} />
					</a>
				</div>
			</section>
		{/if}
	</div>

	<Modal
		open={modalOpen}
		savedUrlId={currentUrlId}
		onclose={closeModal}
		onsubmit={handleGenerateBlog}
	/>
</main>

<style>
	@keyframes progress-indeterminate {
		0% {
			margin-left: -100%;
			width: 100%;
		}
		100% {
			margin-left: 100%;
			width: 100%;
		}
	}

	.editor-wrapper {
		background: var(--bg);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
	}

	.editor-header-bar {
		border-bottom: 1px solid var(--border);
		padding-bottom: 1rem;
	}

	.small-modal {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 16px;
		max-width: 320px;
		width: 100%;
		padding: 1.5rem;
		transform: scale(0.95) translateY(20px);
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		text-align: center;
	}

	.modal-overlay.open .small-modal {
		transform: scale(1) translateY(0);
	}

	.modal-overlay-top {
		align-items: flex-start;
		padding-top: 15vh;
	}

	.small-modal-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.small-modal-icon {
		color: var(--error);
	}

	.small-modal-message {
		font-size: 0.9375rem;
		color: var(--fg);
		line-height: 1.5;
		margin: 0;
	}


</style>
