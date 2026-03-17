<script lang="ts">
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import Modal from '$lib/components/Modal.svelte';
	import MarkdownModal from '$lib/components/MarkdownModal.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import GeneratingModal from '$lib/components/GeneratingModal.svelte';
	import Button from '$lib/components/Button.svelte';
	import CategorySelect from '$lib/components/CategorySelect.svelte';
	import { ArrowBigLeftDash, ExternalLink, Calendar, Link, NotebookPen, FileText, ReceiptText, X } from '@lucide/svelte';

	interface BlogPost {
		id: string;
		title: string;
		content: string;
		createdAt: Date;
	}

	interface Category {
		id: string;
		name: string;
		description?: string;
	}

	interface SavedUrl {
		id: string;
		url: string;
		title?: string;
		description?: string;
		thumbnail?: string;
		markdownContent?: string;
		createdAt: Date;
		categories: Category[];
		blogPosts: BlogPost[];
	}

	interface PageData {
		savedUrl: SavedUrl;
		allCategories: Category[];
	}

	let { data }: { data: PageData } = $props();

	let showEditor = $state(false);
	let editorContent = $state('');
	let editorTitle = $state('');
	let editorBlogPostId = $state<string | null>(null);
	let editorSavedUrl = $state('');

	let modalOpen = $state(false);
	let currentUrlId = $state<string | null>(null);
	let currentUrl = $state<string>('');
	let isGenerating = $state(false);

	let markdownModalOpen = $state(false);

	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let isSavingBlogPost = $state(false);

	let assignedCategories = $state<Category[]>(data.savedUrl.categories ?? []);

	// Category dropdown state
	let autocompleteValue = $state('');
	let isDropdownOpen = $state(false);
	let dropdownRef = $state<HTMLDivElement | null>(null);

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

	function openGenerateModal(urlId: string, url: string) {
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

	function closeEditor() {
		showEditor = false;
		editorBlogPostId = null;
		editorTitle = '';
		editorContent = '';
	}

	function openMarkdownModal() {
		markdownModalOpen = true;
	}

	function closeMarkdownModal() {
		markdownModalOpen = false;
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

			const data = result.data;

			isGenerating = false;

			if (result.type === 'success' && data) {
				openEditor(
					data.id || '',
					data.title || '',
					data.content || '',
					currentUrl
				);
			} else if (result.status >= 400 && data?.error) {
				errorMessage = data.error;
			}
		} catch (err) {
			isGenerating = false;
			errorMessage = 'Failed to generate blog post. Please try again.';
		}
	}

	async function handleCreateCategory(name: string) {
		if (!name.trim()) return;

		try {
			const formData = new FormData();
			formData.append('name', name.trim());
			formData.append('description', '');
			formData.append('savedUrlId', data.savedUrl.id);
			const response = await fetch('?/createCategory', {
				method: 'POST',
				body: formData,
			});
			const result = await response.json();
			console.log('handleCreateCategory result:', result);
			if (result.type === 'success') {
				successMessage = 'Category created successfully';
				// Parse the nested JSON data
				const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
				console.log('parsedData:', parsedData);
				// The category mapping is in index 2, with values pointing to indices of actual data
				const categoryMapping = Array.isArray(parsedData) ? parsedData[2] : parsedData;
				console.log('categoryMapping:', categoryMapping);
				const newCategory: Category = {
					id: parsedData[categoryMapping.id],
					name: parsedData[categoryMapping.name],
					description: parsedData[categoryMapping.description] || '',
				};
				console.log('newCategory created:', newCategory);
				assignedCategories = [...assignedCategories, newCategory];
			} else if (result.error) {
				errorMessage = result.error;
			}
		} catch (err) {
			errorMessage = 'Failed to create category. Please try again.';
		}
	}

	async function handleAutocompleteChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = input.value.trim();

		if (!value) return;

		// Check if it's an existing category
		const foundCategory = data.allCategories.find(c => c.name.toLowerCase() === value.toLowerCase());
		if (foundCategory && !assignedCategories.some(c => c.id === foundCategory.id)) {
			const category: Category = {
				id: foundCategory.id,
				name: foundCategory.name,
				description: foundCategory.description
			};
			assignedCategories = [...assignedCategories, category];
			await handleAssignCategory(category, 'connect');
		} else if (!assignedCategories.some(c => c.name.toLowerCase() === value.toLowerCase())) {
			// Create new category
			await handleCreateCategory(value);
		}

		// Clear the input
		autocompleteValue = '';
	}

	// Minimum length for a category name
	const MIN_CATEGORY_NAME_LENGTH = 2;

	// Check if the current input should show a save button
	function shouldShowSaveButton(value: string): boolean {
		const trimmedValue = value.trim();
		if (trimmedValue.length < MIN_CATEGORY_NAME_LENGTH) return false;

		// Check if it matches any existing category
		const matchesExisting = data.allCategories.some(
			cat => cat.name.toLowerCase() === trimmedValue.toLowerCase()
		);
		if (matchesExisting) return false;

		// Check if it's already assigned
		const alreadyAssigned = assignedCategories.some(
			cat => cat.name.toLowerCase() === trimmedValue.toLowerCase()
		);
		if (alreadyAssigned) return false;

		return true;
	}

	async function saveNewCategory(name: string) {
		const trimmedName = name.trim();
		if (!trimmedName || trimmedName.length < MIN_CATEGORY_NAME_LENGTH) return;
		await handleCreateCategory(trimmedName);
		autocompleteValue = '';
		isDropdownOpen = false;
	}

	// Filter categories based on input
	function filteredCategories() {
		if (!autocompleteValue) {
			return data.allCategories.filter(cat => !assignedCategories.some(c => c.id === cat.id));
		}
		return data.allCategories.filter(
			cat => !assignedCategories.some(c => c.id === cat.id) && cat.name.toLowerCase().includes(autocompleteValue.toLowerCase())
		);
	}

	// Handle click outside to close dropdown
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isDropdownOpen = false;
		}
	}

	$effect(() => {
		if (isDropdownOpen) {
			document.addEventListener('click', handleClickOutside);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	async function handleAssignCategory(category: Category, action: 'connect' | 'disconnect') {
		try {
			const formData = new FormData();
			formData.append('categoryId', category.id);
			formData.append('savedUrlId', data.savedUrl.id);
			formData.append('action', action);
			const response = await fetch('?/assignCategory', {
				method: 'POST',
				body: formData,
			});
			const result = await response.json();
			if (result.type === 'success') {
				successMessage = result.message;
				if (action === 'connect') {
					if (!assignedCategories.some(c => c.id === category.id)) {
						assignedCategories = [...assignedCategories, category];
					}
				} else {
					assignedCategories = assignedCategories.filter(c => c.id !== category.id);
				}
			} else if (result.error) {
				errorMessage = result.error;
			}
		} catch (err) {
			errorMessage = 'Failed to assign category. Please try again.';
		}
	}
</script>

<svelte:head>
	<title>{data.savedUrl.title?.replace(/^https?:\/\//, '').split('/')[0] || 'URL Details'} - URL2.blog</title>
	<script src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1" type="module"></script>
</svelte:head>

<Header />

{#if errorMessage}
	<Alert type="error" message={errorMessage} dismissible onDismiss={() => errorMessage = null} />
{/if}

{#if successMessage}
	<Alert type="success" message={successMessage} dismissible onDismiss={() => successMessage = null} />
{/if}

<GeneratingModal open={isSavingBlogPost} />

{#if showEditor && editorBlogPostId}
	<div class="pt-16 min-h-screen bg-zinc-50">
		<div class="max-w-4xl mx-auto p-6">
			<div class="bg-white rounded-xl shadow-sm border border-zinc-200 mb-4">
				<div class="flex items-center justify-between p-4 border-b border-zinc-200">
					<div>
						<h2 class="text-xl font-semibold text-zinc-900">Edit Blog Post</h2>
						<p class="text-sm text-zinc-500">{data.savedUrl.url}</p>
					</div>
					<Button variant="outline" size="sm" onclick={closeEditor}>
						Close Editor
					</Button>
				</div>
			</div>
			<BlogEditor
				content={editorContent}
				title={editorTitle}
				savedUrlId={data.savedUrl.id}
				onSave={async (data) => {
					const formData = new FormData();
					formData.append('blogPostId', editorBlogPostId || '');
					formData.append('title', data.title);
					formData.append('content', data.content);

					isSavingBlogPost = true;
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
					} finally {
						isSavingBlogPost = false;
					}
				}}
				onCancel={closeEditor}
			/>
		</div>
	</div>
{:else}
	<main class="pt-8">
		<!-- Hero Section -->
		<div class="bg-[var(--bg)] py-12 sm:py-16">
			<div class="mx-auto max-w-[2560px] px-6 lg:px-8">
				<div class="mx-auto max-w-2xl lg:text-center">
					<!-- Buttons -->
					<div class="mb-6 flex items-center justify-center gap-2">
						<a href="/urls" class="btn btn-outline" aria-label="Back to all URLs">
							<ArrowBigLeftDash size={16} />
						</a>
						<a
							href={data.savedUrl.url}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-outline"
							aria-label="Visit original URL"
						>
							<ExternalLink size={16} />
						</a>
						{#if data.savedUrl.markdownContent}
							<button onclick={openMarkdownModal} class="btn btn-outline" aria-label="View stored markdown">
								<FileText size={16} />
							</button>
						{/if}
					</div>
					<!-- Divider -->
					<div class="border-t border-[var(--border)]"></div>
					<p class="mt-10 text-4xl font-semibold tracking-tight text-pretty text-[var(--fg)] sm:text-5xl lg:text-balance font-display">
						{data.savedUrl.title || data.savedUrl.url.replace(/^https?:\/\//, '').split('/')[0]}
					</p>
					<span class="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
						{new Date(data.savedUrl.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
					</span>
					<!-- Category Select -->
					<div class="mt-6 flex flex-col items-center gap-3">
						<CategorySelect
							categories={data.allCategories}
							assignedCategories={assignedCategories}
							onAssign={handleAssignCategory}
							onCreate={handleCreateCategory}
						/>
					</div>
					{#if data.savedUrl.description}
						<p class="mt-6 text-lg/8 text-[var(--fg-muted)]">
							{data.savedUrl.description}
						</p>
					{/if}
					<!-- Divider -->
					<div class="border-t border-[var(--border)] mt-6"></div>
					{#if data.savedUrl.blogPosts.length === 0}
						<div class="mt-10 flex justify-center">
							<a href="/urls/{data.savedUrl.id}/generate" class="btn btn-primary" aria-label="Generate blog post">
								<NotebookPen size={20} />
							</a>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Blog Posts Grid -->
		{#if data.savedUrl.blogPosts.length > 0}
			<div class="bg-[var(--bg)] py-16">
				<div class="mx-auto max-w-[2560px] px-6 lg:px-8">
					<div class="mx-auto max-w-2xl lg:text-center mb-16">
						<h2 class="text-3xl font-semibold tracking-tight text-[var(--fg)]">
							Blog Posts ({data.savedUrl.blogPosts.length})
						</h2>
						<p class="mt-4 text-lg/8 text-[var(--fg-muted)]">
							Generated content from your saved URL
						</p>
					</div>
					<div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
						<dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
							{#each data.savedUrl.blogPosts as blogPost}
								<div class="flex flex-col">
									<dt class="flex items-center gap-x-3 text-base/7 font-semibold text-[var(--fg)]">
										<svg viewBox="0 0 20 20" fill="currentColor" class="size-5 flex-none text-[var(--accent)]">
											<path d="M5.5 17a4.5 4.5 0 0 1-1.44-8.765 4.5 4.5 0 0 1 8.302-3.046 3.5 3.5 0 0 1 4.504 4.272A4 4 0 0 1 15 17H5.5Zm3.75-2.75a.75.75 0 0 0 1.5 0V9.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0l-3.25 3.5a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z" clip-rule="evenodd" fill-rule="evenodd" />
										</svg>
										{blogPost.title}
									</dt>
									<dd class="mt-4 flex flex-auto flex-col text-base/7 text-[var(--fg-muted)]">
										<p class="flex-auto">
											{blogPost.content.replace(/---[\s\S]*?---/, '').trim().substring(0, 150)}...
										</p>
										<p class="mt-6">
											<button onclick={() => openEditor(blogPost.id, blogPost.title, blogPost.content, data.savedUrl.url)} class="text-sm/6 font-semibold text-[var(--accent)] hover:text-[var(--fg)]">
												Edit post <span aria-hidden="true">→</span>
											</button>
										</p>
									</dd>
								</div>
							{/each}
						</dl>
					</div>
				</div>
			</div>
		{/if}
	</main>
{/if}

<GeneratingModal open={isGenerating} />

<Modal
	open={modalOpen}
	savedUrlId={currentUrlId}
	onclose={closeModal}
	onsubmit={handleGenerateBlog}
/>

<MarkdownModal
	open={markdownModalOpen}
	title={data.savedUrl.title || 'Stored Markdown'}
	content={data.savedUrl.markdownContent || ''}
	onclose={closeMarkdownModal}
/>
