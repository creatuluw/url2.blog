<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import TagsInput from 'svelte-unstyled-tags';
	import Select from '$lib/components/Select.svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		data: {
			savedUrl: {
				id: string;
				url: string;
				title: string | null;
				description: string | null;
			};
		};
	}

	let { data }: Props = $props();

	let formTitle = $state(data.savedUrl.title || '');
	let formBlogReason = $state('');
	let formTone = $state('Professional');
	let formFormat = $state('Tutorial');
	let tagsArray = $state<string[]>([]);
	let formCategory = $state('Technology');
	let formAdditionalInstructions = $state('');

	let canGenerate = $derived(formTitle.length > 0 && formBlogReason.length > 0);

	function handleGenerate() {
		if (!canGenerate) {
			toast.error('Please fill in both Title and Blog Reason fields');
			return;
		}

		// Build URL with form data as search params
		const params = new URLSearchParams();
		params.set('title', formTitle);
		params.set('blogReason', formBlogReason);
		params.set('tone', formTone);
		params.set('format', formFormat);
		params.set('tags', tagsArray.join(','));
		params.set('category', formCategory);
		params.set('additionalInstructions', formAdditionalInstructions);

		// Navigate to the blog generation page
		window.location.href = `/urls/${data.savedUrl.id}/generate/blog?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>Generate Blog Post - URL2.blog</title>
</svelte:head>

<Header />

<main class="pt-16 min-h-screen flex flex-col items-center p-4">
	<div class="flex flex-col items-center w-full max-w-2xl" style="margin-top: 1vh;">
		<div class="card w-full">
			<div class="modal-header">
				<div>
					<h2 class="modal-title">Generate Blog Post</h2>
					<p class="text-sm text-[var(--fg-muted)]">{data.savedUrl.url}</p>
				</div>
				<a href="/urls/{data.savedUrl.id}" class="btn btn-outline btn-sm">
					Cancel
				</a>
			</div>

			<div class="modal-body">
				<div class="input-group">
					<label class="input-label" for="title">
						Title <span style="color: var(--error);">*</span>
					</label>
					<input
						id="title"
						type="text"
						class="input-field"
						bind:value={formTitle}
						placeholder="Blog post title"
						required
					/>
				</div>

				<div class="input-group">
					<label class="input-label" for="blogReason">
						Blog Reason <span style="color: var(--error);">*</span>
					</label>
					<textarea
						id="blogReason"
						class="input-field textarea-field"
						style="min-height: 80px;"
						bind:value={formBlogReason}
						placeholder="Why are you writing about this?"
						required
					></textarea>
				</div>

				<div style="display: flex; gap: 1rem;">
					<div class="input-group" style="flex: 1;">
						<label class="input-label" for="tone">
							Tone
						</label>
						<Select
							id="tone"
							bind:value={formTone}
							options={[
								{ value: 'Professional', label: 'Professional' },
								{ value: 'Casual', label: 'Casual' },
								{ value: 'Technical', label: 'Technical' },
								{ value: 'Friendly', label: 'Friendly' },
								{ value: 'Academic', label: 'Academic' }
							]}
						/>
					</div>

					<div class="input-group" style="flex: 1;">
						<label class="input-label" for="format">
							Format
						</label>
						<Select
							id="format"
							bind:value={formFormat}
							options={[
								{ value: 'Tutorial', label: 'Tutorial' },
								{ value: 'Guide', label: 'Guide' },
								{ value: 'Review', label: 'Review' },
								{ value: 'News', label: 'News' },
								{ value: 'Opinion', label: 'Opinion' }
							]}
						/>
					</div>
				</div>

				<div style="display: flex; gap: 1rem;">
					<div class="input-group" style="flex: 1;">
						<label class="input-label" for="category">
							Category
						</label>
						<Select
							id="category"
							bind:value={formCategory}
							options={[
								{ value: 'Technology', label: 'Technology' },
								{ value: 'Product', label: 'Product' },
								{ value: 'Tutorial', label: 'Tutorial' },
								{ value: 'News', label: 'News' }
							]}
						/>
					</div>

					<div class="input-group" style="flex: 1;">
						<label class="input-label">
							Tags
						</label>
						<div class="input-field" style="min-height: 52px; padding: 10px 18px;">
							<TagsInput
								bind:tags={tagsArray}
								inputPlaceholderText="Add a tag"
								addTagKey="Enter"
								onlyUnique={true}
								componentWrapperClasses="flex flex-wrap"
								allTagsWrapperClasses="flex flex-row items-center gap-x-2 gap-y-2 flex-wrap"
								tagWrapperClasses="flex items-center justify-between bg-[var(--accent)] text-white px-3 py-1.5 rounded-md min-w-[5rem]"
								tagClasses="pr-4 text-sm"
								removeTagButtonClasses="cursor-pointer rounded px-2 hover:outline font-bold text-white"
								inputClasses="ml-2 px-2 py-1 border-none outline-none focus:outline-none focus:ring-0 bg-transparent text-[var(--fg)]"
							/>
						</div>
					</div>
				</div>

				<div class="input-group">
					<label class="input-label" for="additionalInstructions">
						Additional Instructions
					</label>
					<textarea
						id="additionalInstructions"
						class="input-field textarea-field"
						style="min-height: 80px;"
						bind:value={formAdditionalInstructions}
						placeholder="Any specific requirements or focus areas"
					></textarea>
				</div>
			</div>

			<div class="modal-footer" style="border-radius: 16px;">
				<a href="/urls/{data.savedUrl.id}" class="btn btn-outline">
					Cancel
				</a>
				<button
					type="button"
					class="btn btn-primary"
					disabled={!canGenerate}
					onclick={handleGenerate}
				>
					Generate
				</button>
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
	:global(.modal-body),
	:global(.modal-footer) {
		background: transparent;
	}

	:global(.modal-header) {
		padding: 1.5rem 5px;
	}

	:global(.modal-body) {
		padding: 0 5px;
	}

	:global(.modal-footer) {
		padding: 1.25rem 5px;
	}

	:global(.input-label) {
		margin-top: 12px;
	}

	:global(.input-field) {
		background: white;
		border: 1px solid var(--border-hover);
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
	}
</style>
