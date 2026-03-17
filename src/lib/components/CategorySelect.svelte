<script lang="ts">
	import { CircleCheckBig, Circle, X } from '@lucide/svelte';

	interface Category {
		id: string;
		name: string;
		description?: string;
	}

	interface Props {
		/**
		 * All available categories
		 */
		categories: Category[];

		/**
		 * Currently assigned categories
		 */
		assignedCategories: Category[];

		/**
		 * Callback when a category is assigned
		 */
		onAssign: (category: Category, action: 'connect' | 'disconnect') => Promise<void>;

		/**
		 * Callback when a new category is created
		 */
		onCreate?: (name: string) => Promise<void>;

		/**
		 * Placeholder text for the input
		 * @default 'Search or create category...'
		 */
		placeholder?: string;

		/**
		 * Label for the input
		 * @default 'Categories'
		 */
		label?: string;

		/**
		 * Whether the component is disabled
		 * @default false
		 */
		disabled?: boolean;

		/**
		 * Additional CSS classes
		 */
		class?: string;
	}

	let {
		categories,
		assignedCategories,
		onAssign,
		onCreate,
		placeholder = 'Search or create category...',
		label = 'Categories',
		disabled = false,
		class: className = '',
	}: Props = $props();

	let autocompleteValue = $state('');
	let isDropdownOpen = $state(false);
	let dropdownRef = $state<HTMLDivElement | null>(null);
	let isCreating = $state(false);

	// Minimum characters required to show save button
	const MIN_CATEGORY_NAME_LENGTH = 2;

	// Check if save button should be shown
	function shouldShowSaveButton(value: string): boolean {
		const trimmedValue = value.trim();
		if (trimmedValue.length < MIN_CATEGORY_NAME_LENGTH) return false;

		// Check if matches existing category
		const matchesExisting = categories.some(
			cat => cat.name.toLowerCase() === trimmedValue.toLowerCase()
		);
		if (matchesExisting) return false;

		// Check if already assigned
		const alreadyAssigned = assignedCategories.some(
			cat => cat.name.toLowerCase() === trimmedValue.toLowerCase()
		);
		return !alreadyAssigned;
	}

	// Filter categories based on input
	function filteredCategories(): Category[] {
		if (!autocompleteValue) {
			return categories.filter(cat => !assignedCategories.some(c => c.id === cat.id));
		}
		return categories.filter(
			cat => !assignedCategories.some(c => c.id === cat.id) &&
				  cat.name.toLowerCase().includes(autocompleteValue.toLowerCase())
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

	async function handleSelectCategory(category: Category) {
		await onAssign(category, 'connect');
		autocompleteValue = '';
		isDropdownOpen = false;
	}

	async function handleRemoveCategory(category: Category) {
		await onAssign(category, 'disconnect');
	}

	async function handleCreateCategory() {
		if (!onCreate || !shouldShowSaveButton(autocompleteValue)) return;

		isCreating = true;
		try {
			await onCreate(autocompleteValue.trim());
			autocompleteValue = '';
			isDropdownOpen = false;
		} finally {
			isCreating = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && shouldShowSaveButton(autocompleteValue)) {
			e.preventDefault();
			handleCreateCategory();
		}
		if (e.key === 'Escape') {
			isDropdownOpen = false;
		}
	}
</script>

<div class="category-select {className}">
	{#if label}
		<label class="input-label">{label}</label>
	{/if}

	<div class="category-input-wrapper">
		<div class="input-button-group">
			<div class="relative" bind:this={dropdownRef}>
				<div class="input-field-wrapper">
					<input
						type="text"
						class="input-field"
						bind:value={autocompleteValue}
						onfocus={() => { isDropdownOpen = true; }}
						onkeydown={handleKeydown}
						{placeholder}
						{disabled}
					/>
					<button
						type="button"
						class="dropdown-toggle"
						onclick={() => { isDropdownOpen = !isDropdownOpen; }}
						{disabled}
						aria-label="Toggle categories dropdown"
					>
						<svg viewBox="0 0 20 20" fill="currentColor" class="dropdown-icon">
							<path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
						</svg>
					</button>
				</div>

				{#if isDropdownOpen && filteredCategories().length > 0}
					<div class="dropdown-menu">
						{#each filteredCategories() as cat}
							<button
								type="button"
								class="dropdown-item"
								onclick={() => handleSelectCategory(cat)}
								{disabled}
							>
								{cat.name}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			{#if shouldShowSaveButton(autocompleteValue)}
				<button
					type="button"
					class="create-button"
					onclick={handleCreateCategory}
					disabled={disabled || isCreating}
					aria-label="Save as new category"
				>
					<CircleCheckBig class="icon-success" />
				</button>
			{:else}
				<button
					type="button"
					class="create-button"
					disabled
					aria-label="Save as new category (disabled)"
				>
					<Circle class="icon-disabled" />
				</button>
			{/if}
		</div>
	</div>

	{#if assignedCategories.length > 0}
		<div class="assigned-categories">
			{#each assignedCategories as category}
				<span class="category-tag">
					{category.name}
					<button
						type="button"
						class="tag-remove"
						onclick={() => handleRemoveCategory(category)}
						{disabled}
						aria-label="Remove category"
					>
						<X size={15} />
					</button>
				</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.category-select {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}

	.category-input-wrapper {
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}

	.input-button-group {
		display: flex;
		position: relative;
		align-items: flex-start;
	}

	.input-field-wrapper {
		position: relative;
		width: 400px;
	}

	.dropdown-toggle {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		color: var(--fg-muted);
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.dropdown-toggle:hover {
		opacity: 1;
	}

	.dropdown-toggle:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	.dropdown-icon {
		width: 20px;
		height: 20px;
	}

	.dropdown-menu {
		position: absolute;
		left: 0;
		top: 100%;
		margin-top: 4px;
		z-index: 50;
		width: 100%;
		max-height: 240px;
		overflow-y: auto;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.dropdown-item {
		width: 100%;
		padding: 12px 18px;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--fg);
		font-family: 'Lekton', monospace;
		font-size: 0.9375rem;
		transition: background-color 0.2s ease;
	}

	.dropdown-item:hover {
		background: var(--accent-light);
	}

	.dropdown-item:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.create-button {
		position: absolute;
		left: calc(400px + 8px);
		top: 0;
		padding: 14px;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.create-button:hover:not(:disabled) {
		border-color: var(--accent);
	}

	.create-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.icon-success {
		width: 20px;
		height: 20px;
		color: var(--success);
	}

	.icon-disabled {
		width: 20px;
		height: 20px;
		color: var(--fg-muted);
		opacity: 0.5;
	}

	.assigned-categories {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin-top: 8px;
	}

	.category-tag {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 6px 12px;
		background: var(--accent-light);
		color: var(--accent);
		border-radius: 100px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.tag-remove {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.tag-remove:hover {
		opacity: 1;
	}

	.tag-remove:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	.tag-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translateY(-1px);
	}
</style>
