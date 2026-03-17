<script lang="ts">
	import { Toaster, toast } from 'svelte-sonner';

	// Re-export toast functions for convenience
	export { toast };
</script>

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

<style>
	:global(.glass-toast) {
		font-family: 'Lekton', monospace !important;
		font-size: 0.9375rem !important;
		line-height: 1.5 !important;
	}

	:global(.sonner-loading-bar) {
		background: var(--accent) !important;
	}
</style>
