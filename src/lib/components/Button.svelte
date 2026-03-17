<script lang="ts">
	import type { Snippet } from 'svelte';

	type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
	type ButtonSize = 'sm' | 'md' | 'lg';
	type ButtonType = 'button' | 'submit' | 'reset';

	interface Props {
		variant?: ButtonVariant;
		size?: ButtonSize;
		type?: ButtonType;
		disabled?: boolean;
		href?: string;
		class?: string;
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		href,
		class: className = '',
		children,
		onclick,
		...restProps
	}: Props = $props();

	let classes = $derived([
		'btn',
		variant === 'primary' ? 'btn-primary' :
		variant === 'secondary' ? 'btn-secondary' :
		variant === 'outline' ? 'btn-outline' :
		'btn-ghost',
		size === 'sm' ? 'btn-sm' :
		size === 'lg' ? 'btn-lg' : '',
		className
	].filter(Boolean).join(' '));
</script>

{#if href}
	<a
		{href}
		class={classes}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		type={type}
		class={classes}
		disabled={disabled}
		onclick={onclick}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
