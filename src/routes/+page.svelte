<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import UrlInputForm from '$lib/components/UrlInputForm.svelte';
	import ClipboardModal from '$lib/components/ClipboardModal.svelte';
	import GeneratingModal from '$lib/components/GeneratingModal.svelte';
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
	let showToast = $state(false);
	let toastMessage = $state<string>('');
	let toastTitle = $state<string>('');
	let isSavingUrl = $state(false);

	$effect(() => {
		if (errorMessage) {
			const timer = setTimeout(() => {
				errorMessage = null;
			}, 5000);
			return () => clearTimeout(timer);
		}
	});

	$effect(() => {
		if (successMessage) {
			const timer = setTimeout(() => {
				successMessage = null;
			}, 3000);
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

	function deserializeSvelteKitResponse(envelope: any) {
		// SvelteKit wraps form action data in a JSON string
		// Format: { type, status, data: "JSON_STRING" }
		if (envelope?.data && typeof envelope.data === 'string') {
			try {
				const parsedData = JSON.parse(envelope.data);
				// Check if parsedData is the string table format (array)
				if (Array.isArray(parsedData)) {
					return parseStringTableFormat(parsedData);
				}
				return parsedData;
			} catch (e) {
				console.error('Failed to parse nested JSON:', e);
				return envelope;
			}
		}
		return envelope;
	}

	function parseStringTableFormat(envelope: any[]) {
		// SvelteKit uses string table serialization for form actions
		// Format: [{keys}, stringValue1, value2, object1, stringValue2, ...]
		if (!Array.isArray(envelope)) {
			return envelope;
		}

		const stringTable = envelope[0];
		const values = envelope.slice(1);

		function resolveValue(value: any): any {
			if (typeof value === 'number' && value > 0 && value <= values.length) {
				return resolveValue(values[value - 1]);
			}
			return value;
		}

		function deserializeObject(obj: any): any {
			if (!obj || typeof obj !== 'object') {
				return resolveValue(obj);
			}
			if (Array.isArray(obj)) {
				return obj.map(deserializeObject);
			}
			const result: any = {};
			for (const key of Object.keys(obj)) {
				result[key] = deserializeObject(obj[key]);
			}
			return result;
		}

		// Reconstruct the full envelope from the string table
		const result: any = {};
		for (const key of Object.keys(stringTable)) {
			const index = stringTable[key];
			if (index && index > 0 && index <= values.length) {
				result[key] = deserializeObject(values[index - 1]);
			}
		}

		return result;
	}

	async function handleSaveUrl(formData: FormData) {
		console.log('handleSaveUrl called, setting isSavingUrl = true');
		isSavingUrl = true;
		console.log('isSavingUrl state:', isSavingUrl);

		try {
			console.log('Starting fetch request...');
			const response = await fetch('?/saveUrl', {
				method: 'POST',
				body: formData,
			});
			console.log('Fetch completed, status:', response.status);

			const envelope = await response.json();
			console.log('Raw envelope:', envelope);

			const result = deserializeSvelteKitResponse(envelope);
			console.log('Parsed result:', result);
			console.log('Result type:', result?.type, 'Result data:', result?.data);

			if (result?.type === 'success' && result?.data) {
				console.log('Success branch taken');
				if (result.data.exists) {
					console.log('URL exists branch - setting toast');
					errorMessage = 'This URL already exists in your collection';
					toastTitle = 'Info';
					toastMessage = 'This URL already exists in your collection';
					showToast = true;
					console.log('Toast state:', showToast, toastTitle, toastMessage);
					// Navigate to existing URL detail page
					goto(`/urls/${result.data.id}`);
				} else if (result.data.id && result.data.url) {
					console.log('New URL branch - setting toast');
					toastTitle = 'Success';
					toastMessage = 'URL saved successfully!';
					showToast = true;
					console.log('Toast state:', showToast, toastTitle, toastMessage);
					// Navigate to new URL detail page
					goto(`/urls/${result.data.id}`);
				}
			} else if (result?.error) {
				console.log('Error branch (result.error)');
				errorMessage = result.error;
			} else if (result?.data?.error) {
				console.log('Error branch (result.data.error)');
				errorMessage = result.data.error;
			} else {
				console.log('Fallback error branch');
				errorMessage = 'Failed to save URL. Please try again.';
			}
		} catch (err) {
			console.error('Save URL error:', err);
			errorMessage = 'Failed to save URL. Please try again.';
		} finally {
			console.log('Finally block - setting isSavingUrl = false');
			isSavingUrl = false;
			console.log('isSavingUrl state:', isSavingUrl);
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
			<Alert type="error" message={errorMessage} title="Error" onDismiss={() => errorMessage = null} />
		{/if}

		{#if successMessage}
			<Alert type="success" message={successMessage} />
		{/if}

		{#if showToast}
			<Toast
				type="success"
				title={toastTitle}
				message={toastMessage}
				onDismiss={() => showToast = false}
			/>
		{/if}

		<GeneratingModal open={isGenerating} />

		{#if showEditor && editorBlogPostId}
			<div class="editor-wrapper w-full max-w-4xl mx-auto mt-8">
				<div class="editor-header-bar flex items-center justify-between mb-4">
					<div>
						<h2 class="text-xl font-bold">Edit Blog Post</h2>
						<p class="text-sm text-[var(--fg-muted)]">{editorSavedUrl}</p>
					</div>
					<Button variant="outline" size="sm" onclick={closeEditor}>
						Close Editor
					</Button>
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
				<UrlInputForm
					urlValue={urlInputValue}
					onUrlChange={(url) => urlInputValue = url}
					onPaste={handlePasteFromClipboard}
					onSubmit={handleSaveUrl}
					disabled={isSavingUrl}
				/>

				<ClipboardModal
					open={clipboardModalOpen}
					message={clipboardModalMessage}
					onclose={closeClipboardModal}
				/>

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
	.editor-wrapper {
		background: var(--bg);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
	}

	.editor-header-bar {
		border-bottom: 1px solid var(--border);
		padding-bottom: 1rem;
	}
</style>
