<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<svelte:head>
	<title>URL2.blog</title>
	<meta name="description" content="Transform your URLs into blog posts" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Lekton:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Toaster
	position="bottom-right"
	toastOptions={{
		style: 'background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 16px; gap: 12px;',
		className: 'glass-toast',
		duration: 4000,
	}}
	styles={{
		error: 'background: rgba(255, 245, 245, 0.9); border-color: rgba(181, 74, 74, 0.2); color: var(--error);',
		success: 'background: rgba(245, 255, 250, 0.9); border-color: rgba(85, 166, 48, 0.2); color: var(--success);',
		info: 'background: rgba(240, 248, 244, 0.9); border-color: rgba(0, 127, 95, 0.2); color: var(--info);',
		warning: 'background: rgba(255, 255, 240, 0.9); border-color: rgba(212, 215, 0, 0.2); color: var(--warning);',
	}}
/>

{@render children()}
