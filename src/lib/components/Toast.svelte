<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type ToastType = 'error' | 'success' | 'info';

	interface Props {
		type?: ToastType;
		message?: string;
		title?: string;
		duration?: number;
		dismissible?: boolean;
		onDismiss?: () => void;
	}

	let {
		type = 'info',
		message = '',
		title,
		duration = 3000,
		dismissible = true,
		onDismiss
	}: Props = $props();

	const dispatch = createEventDispatcher<{ dismiss: void }>();

	let isVisible = $state(true);

	$effect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				dismiss();
			}, duration);
			return () => clearTimeout(timer);
		}
	});

	function dismiss() {
		isVisible = false;
		dispatch('dismiss');
		onDismiss?.();
	}

	let iconPath = $derived(
		type === 'error'
			? '<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />'
			: type === 'success'
				? '<polyline points="20 6 9 17 4 12" />'
				: '<circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />'
	);

	let colorClasses = $derived(
		type === 'error'
			? 'bg-red-50 border-red-200 text-red-700'
			: type === 'success'
				? 'bg-green-50 border-green-200 text-green-700'
				: 'bg-blue-50 border-blue-200 text-blue-700'
	);

	let iconColor = $derived(
		type === 'error'
			? 'text-red-500'
			: type === 'success'
				? 'text-green-500'
				: 'text-blue-500'
	);
</script>

{#if isVisible}
	<div
		role="status"
		class="glass-panel border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 fixed top-20 left-1/2 -translate-x-1/2 z-50 min-w-[300px] max-w-[400px] {colorClasses}"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class={iconColor}
		>
			{@html iconPath}
		</svg>
		<div class="flex items-center gap-3 flex-1">
			{#if title}
				<div class="flex flex-col">
					<p class="font-medium">{title}</p>
					<p class="text-sm">{message}</p>
				</div>
			{:else}
				<p class="font-medium">{message}</p>
			{/if}
		</div>
		{#if dismissible}
			<button
				class="{iconColor} hover:opacity-70 ml-2 cursor-pointer"
				onclick={dismiss}
				aria-label="Dismiss toast"
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
		{/if}
	</div>
{/if}
