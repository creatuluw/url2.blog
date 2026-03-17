<script lang="ts">
	import { ArrowBigDownDash } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';
	import { tick } from 'svelte';

	interface Props {
		id?: string;
		name?: string;
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		options?: Array<{ value: string; label: string }>;
		[key: string]: any;
	}

	let {
		id,
		name,
		value = $bindable(''),
		placeholder = 'Select an option',
		disabled = false,
		required = false,
		class: className = '',
		options = [],
		...restProps
	}: Props = $props();

	const dispatch = createEventDispatcher();

	let isOpen = $state(false);
	let selectedIndex = $state(-1);
	let selectRef: HTMLSelectElement | undefined = $state();
	let buttonRef: HTMLButtonElement | undefined = $state();
	let dropdownRef: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (options.length > 0 && value) {
			selectedIndex = options.findIndex(opt => opt.value === value);
		}
	});

	function toggleDropdown() {
		if (disabled) return;
		isOpen = !isOpen;
	}

	function selectOption(optionValue: string, index: number) {
		value = optionValue;
		selectedIndex = index;
		isOpen = false;
		dispatch('change', { value: optionValue });
		dispatch('input', { value: optionValue });
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		switch (e.key) {
			case 'Enter':
			case ' ':
				e.preventDefault();
				toggleDropdown();
				break;
			case 'Escape':
				isOpen = false;
				break;
			case 'ArrowDown':
				e.preventDefault();
				if (!isOpen) {
					isOpen = true;
				} else if (selectedIndex < options.length - 1) {
					selectedIndex++;
					value = options[selectedIndex].value;
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (isOpen && selectedIndex > 0) {
					selectedIndex--;
					value = options[selectedIndex].value;
				}
				break;
		}
	}

	function handleClickOutside(e: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(e.target as Node) &&
			buttonRef && !buttonRef.contains(e.target as Node)) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	const selectedOption = $derived(
		selectedIndex >= 0 && options.length > 0 ? options[selectedIndex] : null
	);
</script>

<div class="select-wrapper {className}" {...restProps}>
	<div class="input-field-wrapper">
		<button
			type="button"
			{id}
			{disabled}
			class="input-field select-button {isOpen ? 'select-button-open' : ''}"
			onclick={toggleDropdown}
			onkeydown={handleKeyDown}
			aria-haspopup="listbox"
			aria-expanded={isOpen}
			bind:this={buttonRef}
		>
			<span class="select-value">
				{selectedOption ? selectedOption.label : placeholder}
			</span>
		</button>

		<button
			type="button"
			class="dropdown-toggle"
			onclick={toggleDropdown}
			{disabled}
			aria-label="Toggle dropdown"
		>
			<ArrowBigDownDash
				class="dropdown-icon {isOpen ? 'dropdown-icon-open' : ''}"
				size={20}
			/>
		</button>

		{#if isOpen}
			<div class="dropdown-menu" role="listbox" bind:this={dropdownRef}>
				{#each options as option, index}
					<button
						type="button"
						class="dropdown-item {selectedIndex === index ? 'dropdown-item-selected' : ''}"
						onclick={() => selectOption(option.value, index)}
						role="option"
						aria-selected={selectedIndex === index}
						{disabled}
					>
						{option.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<select
		bind:this={selectRef}
		{name}
		bind:value
		{required}
		{disabled}
		class="hidden-select"
	>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>

<style>
	.select-wrapper {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}

	.input-field-wrapper {
		position: relative;
		width: 100%;
	}

	.select-button {
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		cursor: pointer;
		text-align: left;
		padding-right: 40px;
	}

	.select-button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.select-button-open {
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}

	.select-value {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
		transition: transform 0.2s ease;
	}

	.dropdown-icon-open {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		left: 0;
		top: 100%;
		margin-top: 0;
		z-index: 50;
		width: 100%;
		max-height: 240px;
		overflow-y: auto;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-top: none;
		border-radius: 0 0 12px 12px;
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

	.dropdown-item-selected {
		background: var(--accent-light);
		color: var(--accent);
		font-weight: 600;
	}

	.hidden-select {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
</style>
