<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import FeedCard from '$lib/components/FeedCard.svelte';
	import UrlCard from '$lib/components/UrlCard.svelte';
	import ClipboardModal from '$lib/components/ClipboardModal.svelte';
	import GeneratingModal from '$lib/components/GeneratingModal.svelte';

	let activeSection = $state('button');
	let activeTab = $state<'preview' | 'code' | 'props'>('preview');
	let theme = $state<'light' | 'dark'>('light');
	let clipboardModalOpen = $state(false);
	let generatingModalOpen = $state(false);
	let modalOpen = $state(false);

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
	}

	function copyCode(code: string) {
		navigator.clipboard.writeText(code);
		clipboardModalOpen = true;
	}

	const components = [
		{ id: 'button', name: 'Button', icon: 'mdi:button-cursor' },
		{ id: 'alert', name: 'Alert', icon: 'mdi:alert' },
		{ id: 'modal', name: 'Modal', icon: 'mdi:window-maximize' },
		{ id: 'empty-state', name: 'EmptyState', icon: 'mdi:file-outline' },
		{ id: 'feed-card', name: 'FeedCard', icon: 'mdi:card' },
		{ id: 'url-card', name: 'UrlCard', icon: 'mdi:link' },
		{ id: 'clipboard-modal', name: 'ClipboardModal', icon: 'mdi:clipboard' },
		{ id: 'generating-modal', name: 'GeneratingModal', icon: 'mdi:loading' }
	];

	type ComponentData = {
		title: string;
		description: string;
		props: Array<{ name: string; type: string; default: string; description: string }>;
		code: string;
	};

	const componentData: Record<string, ComponentData> = {
		button: {
			title: 'Button',
			description: 'Reusable button component with multiple variants and sizes.',
			props: [
				{ name: 'variant', type: 'primary | secondary | outline | ghost', default: 'primary', description: 'Button visual style' },
				{ name: 'size', type: 'sm | md | lg', default: 'md', description: 'Button size' },
				{ name: 'type', type: 'button | submit | reset', default: 'button', description: 'HTML button type' },
				{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable button interaction' },
				{ name: 'href', type: 'string', default: 'undefined', description: 'If provided, renders as anchor link' },
				{ name: 'onclick', type: '(e: MouseEvent) => void', default: 'undefined', description: 'Click handler' }
			],
			code: `<Button variant="primary" size="md">Click me</Button>`
		},
		alert: {
			title: 'Alert',
			description: 'Display contextual feedback messages to users with success or error states.',
			props: [
				{ name: 'type', type: 'error | success', default: 'error', description: 'The alert variant' },
				{ name: 'message', type: 'string', default: '', description: 'The alert message content' },
				{ name: 'title', type: 'string', default: 'undefined', description: 'Optional title for the alert' },
				{ name: 'dismissible', type: 'boolean', default: 'true', description: 'Whether the alert can be dismissed' },
				{ name: 'onDismiss', type: '() => void', default: 'undefined', description: 'Callback when alert is dismissed' },
				{ name: 'children', type: 'Snippet', default: 'undefined', description: 'Optional custom content' }
			],
			code: `<Alert type="error" message="Something went wrong" dismissible />`
		},
		modal: {
			title: 'Modal',
			description: 'A dialog overlay for capturing user input with form fields and actions.',
			props: [
				{ name: 'open', type: 'boolean', default: 'false', description: 'Controls modal visibility' },
				{ name: 'savedUrlId', type: 'string | null', default: 'null', description: 'Optional URL ID for context' },
				{ name: 'onsubmit', type: '(formData: FormData) => void', default: 'undefined', description: 'Form submission handler' },
				{ name: 'onclose', type: '() => void', default: 'undefined', description: 'Close callback' }
			],
			code: `<Modal open={true} onclose={() => {}} />`
		},
		'empty-state': {
			title: 'EmptyState',
			description: 'Display when no content is available, with optional action button.',
			props: [
				{ name: 'icon', type: 'string', default: 'mdi:link-variant', description: 'Icon identifier' },
				{ name: 'message', type: 'string', default: 'required', description: 'Empty state message' },
				{ name: 'actionText', type: 'string', default: 'undefined', description: 'Action button text' },
				{ name: 'actionHref', type: 'string', default: '/', description: 'Action link URL' },
				{ name: 'class', type: 'string', default: '', description: 'Additional CSS classes' }
			],
			code: `<EmptyState message="No URLs saved yet" actionText="Add URL" />`
		},
		'feed-card': {
			title: 'FeedCard',
			description: 'Card component for displaying saved URLs in a feed layout.',
			props: [
				{ name: 'savedUrl', type: 'SavedUrl', default: 'required', description: 'URL data object' }
			],
			code: `<FeedCard savedUrl={savedUrl} />`
		},
		'url-card': {
			title: 'UrlCard',
			description: 'Interactive card for saved URLs with edit, regenerate, and delete actions.',
			props: [
				{ name: 'savedUrl', type: 'SavedUrl', default: 'required', description: 'URL data object' },
				{ name: 'onEdit', type: '(id, title, content, url) => void', default: 'undefined', description: 'Edit handler' },
				{ name: 'onRegenerate', type: '(urlId, url) => void', default: 'undefined', description: 'Regenerate handler' },
				{ name: 'onDelete', type: '(urlId) => void', default: 'undefined', description: 'Delete handler' },
				{ name: 'isDeleting', type: 'boolean', default: 'false', description: 'Deleting state' }
			],
			code: `<UrlCard savedUrl={savedUrl} onDelete={(id) => {}} />`
		},
		'clipboard-modal': {
			title: 'ClipboardModal',
			description: 'Small modal for displaying clipboard or notification messages.',
			props: [
				{ name: 'open', type: 'boolean', default: 'false', description: 'Modal visibility' },
				{ name: 'message', type: 'string', default: '', description: 'Message to display' },
				{ name: 'onclose', type: '() => void', default: 'undefined', description: 'Close callback' }
			],
			code: `<ClipboardModal open={true} message="Copied to clipboard!" onclose={() => {}} />`
		},
		'generating-modal': {
			title: 'GeneratingModal',
			description: 'Loading modal displayed while blog post is being generated.',
			props: [
				{ name: 'open', type: 'boolean', default: 'false', description: 'Modal visibility' }
			],
			code: `<GeneratingModal open={true} />`
		}
	};

	function setActiveSection(id: string) {
		activeSection = id;
		activeTab = 'preview';
	}
</script>

<div class="layout" data-theme={theme}>
	<aside class="sidebar">
		<div class="sidebar-header">
			<a href="/" class="logo-mark flex items-center gap-2">
				<span class="font-display font-bold text-lg">URL2.blog</span>
			</a>
			<div class="sidebar-search">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input type="text" placeholder="Search components..." />
			</div>
		</div>
		<nav class="sidebar-nav">
			{#each components as component}
				<a
					href="#{component.id}"
					class="nav-link {activeSection === component.id ? 'active' : ''}"
					onclick={(e) => {
						e.preventDefault();
						setActiveSection(component.id);
					}}
				>
					<span class="iconify" data-icon={component.icon}></span>
					<span>{component.name}</span>
				</a>
			{/each}
		</nav>
	</aside>

	<main class="main">
		<header class="main-header">
			<div class="breadcrumb">
				<a href="/">Home</a>
				<span>/</span>
				<span class="breadcrumb-current">UI Library</span>
			</div>
			<div class="header-actions">
				<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
					<svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="5" />
						<line x1="12" y1="1" x2="12" y2="3" />
						<line x1="12" y1="21" x2="12" y2="23" />
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
						<line x1="1" y1="12" x2="3" y2="12" />
						<line x1="21" y1="12" x2="23" y2="12" />
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
					</svg>
					<svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				</button>
			</div>
		</header>

		<div class="content">
			{#each components as component}
				<section id={component.id} class="component-section">
					<div class="component-header">
						<h1 class="component-title">
							<span class="iconify mr-2" data-icon={component.icon}></span>
							{componentData[component.id].title}
						</h1>
						<p class="component-description">{componentData[component.id].description}</p>
						<div class="component-meta">
							<span class="meta-badge">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<polyline points="16 18 22 12 16 6" />
									<polyline points="8 6 2 12 8 18" />
								</svg>
								Svelte 5
							</span>
							<span class="meta-badge">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
								</svg>
								TypeScript
							</span>
						</div>
					</div>

					<div class="component-tabs">
						<div class="tabs-list">
							<button
								class="tab-trigger {activeTab === 'preview' ? 'active' : ''}"
								onclick={() => activeTab = 'preview'}
							>
								Preview
							</button>
							<button
								class="tab-trigger {activeTab === 'code' ? 'active' : ''}"
								onclick={() => activeTab = 'code'}
							>
								Code
							</button>
							<button
								class="tab-trigger {activeTab === 'props' ? 'active' : ''}"
								onclick={() => activeTab = 'props'}
							>
								Props
							</button>
						</div>
					</div>

					{#if component.id === 'button'}
						<div class="tab-content {activeTab === 'preview' ? 'active' : ''}">
							<div class="preview-panel">
								<div class="preview-body">
									<div class="flex flex-wrap gap-2">
										<Button variant="primary">Primary</Button>
										<Button variant="secondary">Secondary</Button>
										<Button variant="outline">Outline</Button>
										<Button variant="ghost">Ghost</Button>
									</div>
									<div class="flex flex-wrap gap-2 mt-4">
										<Button variant="primary" size="sm">Small</Button>
										<Button variant="primary" size="md">Medium</Button>
										<Button variant="primary" size="lg">Large</Button>
									</div>
									<div class="flex flex-wrap gap-2 mt-4">
										<Button variant="primary" disabled>Disabled</Button>
										<Button variant="outline" disabled>Disabled</Button>
									</div>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'code' ? 'active' : ''}">
							<div class="code-block">
								<div class="code-header">
									<span class="code-language">Svelte</span>
									<button class="code-copy-btn" onclick={() => copyCode(componentData.button.code)} aria-label="Copy code">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
										</svg>
									</button>
								</div>
								<div class="code-content">
									<pre><code>{componentData.button.code}</code></pre>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'props' ? 'active' : ''}">
							<table class="props-table">
								<thead>
									<tr>
										<th>Prop</th>
										<th>Type</th>
										<th>Default</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{#each componentData.button.props as prop}
										<tr>
											<td><code class="prop-name">{prop.name}</code></td>
											<td><span class="prop-type">{prop.type}</span></td>
											<td><code class="prop-default">{prop.default}</code></td>
											<td>{prop.description}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else if component.id === 'alert'}
						<div class="tab-content {activeTab === 'preview' ? 'active' : ''}">
							<div class="preview-panel">
								<div class="preview-body">
									<Alert type="error" message="This is an error alert" title="Error" />
									<Alert type="success" message="This is a success alert" title="Success" />
									<Alert type="error" message="Dismissible alert" dismissible={true} />
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'code' ? 'active' : ''}">
							<div class="code-block">
								<div class="code-header">
									<span class="code-language">Svelte</span>
									<button class="code-copy-btn" onclick={() => copyCode(componentData.alert.code)} aria-label="Copy code">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
										</svg>
									</button>
								</div>
								<div class="code-content">
									<pre><code>{componentData.alert.code}</code></pre>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'props' ? 'active' : ''}">
							<table class="props-table">
								<thead>
									<tr>
										<th>Prop</th>
										<th>Type</th>
										<th>Default</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{#each componentData.alert.props as prop}
										<tr>
											<td><code class="prop-name">{prop.name}</code></td>
											<td><span class="prop-type">{prop.type}</span></td>
											<td><code class="prop-default">{prop.default}</code></td>
											<td>{prop.description}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else if component.id === 'modal'}
						<div class="tab-content {activeTab === 'preview' ? 'active' : ''}">
							<div class="preview-panel">
								<div class="preview-body">
									<Button variant="primary" onclick={() => modalOpen = true}>Open Modal</Button>
									<Modal open={modalOpen} onclose={() => modalOpen = false} />
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'code' ? 'active' : ''}">
							<div class="code-block">
								<div class="code-header">
									<span class="code-language">Svelte</span>
									<button class="code-copy-btn" onclick={() => copyCode(componentData.modal.code)} aria-label="Copy code">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
										</svg>
									</button>
								</div>
								<div class="code-content">
									<pre><code>{componentData.modal.code}</code></pre>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'props' ? 'active' : ''}">
							<table class="props-table">
								<thead>
									<tr>
										<th>Prop</th>
										<th>Type</th>
										<th>Default</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{#each componentData.modal.props as prop}
										<tr>
											<td><code class="prop-name">{prop.name}</code></td>
											<td><span class="prop-type">{prop.type}</span></td>
											<td><code class="prop-default">{prop.default}</code></td>
											<td>{prop.description}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else if component.id === 'empty-state'}
						<div class="tab-content {activeTab === 'preview' ? 'active' : ''}">
							<div class="preview-panel">
								<div class="preview-body">
									<div class="card" style="min-height: 200px;">
										<EmptyState message="No content available" actionText="Get Started" actionHref="/urls" />
									</div>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'code' ? 'active' : ''}">
							<div class="code-block">
								<div class="code-header">
									<span class="code-language">Svelte</span>
									<button class="code-copy-btn" onclick={() => copyCode(componentData['empty-state'].code)} aria-label="Copy code">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
										</svg>
									</button>
								</div>
								<div class="code-content">
									<pre><code>{componentData['empty-state'].code}</code></pre>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'props' ? 'active' : ''}">
							<table class="props-table">
								<thead>
									<tr>
										<th>Prop</th>
										<th>Type</th>
										<th>Default</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{#each componentData['empty-state'].props as prop}
										<tr>
											<td><code class="prop-name">{prop.name}</code></td>
											<td><span class="prop-type">{prop.type}</span></td>
											<td><code class="prop-default">{prop.default}</code></td>
											<td>{prop.description}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else if component.id === 'feed-card'}
						<div class="tab-content {activeTab === 'preview' ? 'active' : ''}">
							<div class="preview-panel">
								<div class="preview-body">
									<div class="card" style="max-width: 400px;">
										<FeedCard savedUrl={{
											id: '1',
											url: 'https://example.com/article',
											createdAt: new Date(),
											hasBlogPost: true,
											latestBlogPost: {
												id: '1',
												title: 'Example Blog Post',
												content: 'This is sample content...'
											}
										}} />
									</div>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'code' ? 'active' : ''}">
							<div class="code-block">
								<div class="code-header">
									<span class="code-language">Svelte</span>
									<button class="code-copy-btn" onclick={() => copyCode(componentData['feed-card'].code)} aria-label="Copy code">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
										</svg>
									</button>
								</div>
								<div class="code-content">
									<pre><code>{componentData['feed-card'].code}</code></pre>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'props' ? 'active' : ''}">
							<table class="props-table">
								<thead>
									<tr>
										<th>Prop</th>
										<th>Type</th>
										<th>Default</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{#each componentData['feed-card'].props as prop}
										<tr>
											<td><code class="prop-name">{prop.name}</code></td>
											<td><span class="prop-type">{prop.type}</span></td>
											<td><code class="prop-default">{prop.default}</code></td>
											<td>{prop.description}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else if component.id === 'url-card'}
						<div class="tab-content {activeTab === 'preview' ? 'active' : ''}">
							<div class="preview-panel">
								<div class="preview-body">
									<div class="card" style="max-width: 400px;">
										<UrlCard savedUrl={{
											id: '1',
											url: 'https://example.com/article',
											createdAt: new Date(),
											hasBlogPost: true,
											latestBlogPost: {
												id: '1',
												title: 'Example Blog Post',
												content: 'This is sample content...'
											}
										}} />
									</div>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'code' ? 'active' : ''}">
							<div class="code-block">
								<div class="code-header">
									<span class="code-language">Svelte</span>
									<button class="code-copy-btn" onclick={() => copyCode(componentData['url-card'].code)} aria-label="Copy code">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
										</svg>
									</button>
								</div>
								<div class="code-content">
									<pre><code>{componentData['url-card'].code}</code></pre>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'props' ? 'active' : ''}">
							<table class="props-table">
								<thead>
									<tr>
										<th>Prop</th>
										<th>Type</th>
										<th>Default</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{#each componentData['url-card'].props as prop}
										<tr>
											<td><code class="prop-name">{prop.name}</code></td>
											<td><span class="prop-type">{prop.type}</span></td>
											<td><code class="prop-default">{prop.default}</code></td>
											<td>{prop.description}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="tab-content {activeTab === 'preview' ? 'active' : ''}">
							<div class="preview-panel">
								<div class="preview-body">
									<div class="card card-body">
										<p class="text-sm text-muted">Interactive preview available in the application</p>
										<Button
											variant="outline"
											size="sm"
											onclick={() => {
												if (component.id === 'clipboard-modal') clipboardModalOpen = true;
												if (component.id === 'generating-modal') generatingModalOpen = true;
											}}
										>
											Open {component.name}
										</Button>
									</div>
									<ClipboardModal open={clipboardModalOpen} message="Copied to clipboard!" onclose={() => clipboardModalOpen = false} />
									<GeneratingModal open={generatingModalOpen} />
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'code' ? 'active' : ''}">
							<div class="code-block">
								<div class="code-header">
									<span class="code-language">Svelte</span>
									<button class="code-copy-btn" onclick={() => copyCode(componentData[component.id].code)} aria-label="Copy code">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
										</svg>
									</button>
								</div>
								<div class="code-content">
									<pre><code>{componentData[component.id].code}</code></pre>
								</div>
							</div>
						</div>
						<div class="tab-content {activeTab === 'props' ? 'active' : ''}">
							<table class="props-table">
								<thead>
									<tr>
										<th>Prop</th>
										<th>Type</th>
										<th>Default</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{#each componentData[component.id].props as prop}
										<tr>
											<td><code class="prop-name">{prop.name}</code></td>
											<td><span class="prop-type">{prop.type}</span></td>
											<td><code class="prop-default">{prop.default}</code></td>
											<td>{prop.description}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</section>
			{/each}
		</div>
	</main>
</div>

<style>
	:global(.layout) {
		display: flex;
		min-height: 100vh;
	}

	:global(.sidebar) {
		width: 280px;
		background: var(--bg-elevated);
		border-right: 1px solid var(--border);
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		overflow-y: auto;
		z-index: 100;
	}

	:global(.sidebar-header) {
		padding: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	:global(.sidebar-search) {
		position: relative;
		margin-top: 1rem;
	}

	:global(.sidebar-search input) {
		width: 100%;
		padding: 0.625rem 0.625rem 0.625rem 2.25rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 0.8125rem;
		color: var(--fg);
	}

	:global(.sidebar-search svg) {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--fg-muted);
	}

	:global(.sidebar-nav) {
		padding: 1rem 0;
	}

	:global(.nav-link) {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1.5rem;
		color: var(--fg-muted);
		text-decoration: none;
		font-size: 0.875rem;
		transition: all 0.2s ease;
	}

	:global(.nav-link:hover) {
		background: var(--accent-light);
		color: var(--fg);
	}

	:global(.nav-link.active) {
		background: var(--accent-light);
		color: var(--accent);
		border-left: 2px solid var(--accent);
	}

	:global(.main) {
		flex: 1;
		margin-left: 280px;
		min-height: 100vh;
	}

	:global(.main-header) {
		position: sticky;
		top: 0;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		z-index: 50;
		backdrop-filter: blur(8px);
	}

	:global(.breadcrumb) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: var(--fg-muted);
	}

	:global(.breadcrumb a) {
		color: var(--accent);
		text-decoration: none;
	}

	:global(.breadcrumb a:hover) {
		text-decoration: underline;
	}

	:global(.breadcrumb-current) {
		color: var(--fg);
		font-weight: 500;
	}

	:global(.header-actions) {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	:global(.theme-toggle) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 10px;
		color: var(--fg);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	:global(.theme-toggle:hover) {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	:global(.theme-toggle .moon-icon) {
		display: none;
	}

	:global([data-theme="dark"] .theme-toggle .sun-icon) {
		display: none;
	}

	:global([data-theme="dark"] .theme-toggle .moon-icon) {
		display: block;
	}

	:global(.content) {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	:global(.component-section) {
		margin-bottom: 4rem;
		padding-bottom: 3rem;
		border-bottom: 1px solid var(--border);
	}

	:global(.component-header) {
		margin-bottom: 2rem;
	}

	:global(.component-title) {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
	}

	:global(.component-description) {
		font-size: 1rem;
		color: var(--fg-muted);
		margin-bottom: 1rem;
		max-width: 600px;
	}

	:global(.component-meta) {
		display: flex;
		gap: 0.5rem;
	}

	:global(.meta-badge) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 100px;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--fg-muted);
	}

	:global(.component-tabs) {
		margin-bottom: 1.5rem;
	}

	:global(.tabs-list) {
		display: flex;
		gap: 0.5rem;
		background: var(--bg-card);
		padding: 0.375rem;
		border-radius: 10px;
		border: 1px solid var(--border);
	}

	:global(.tab-trigger) {
		padding: 0.5rem 1.25rem;
		background: transparent;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--fg-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	:global(.tab-trigger:hover) {
		background: var(--bg);
		color: var(--fg);
	}

	:global(.tab-trigger.active) {
		background: var(--accent);
		color: #fff;
	}

	:global(.tab-content) {
		display: none;
	}

	:global(.tab-content.active) {
		display: block;
	}

	:global(.preview-panel) {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 14px;
		overflow: hidden;
	}

	:global(.preview-body) {
		padding: 2rem;
		min-height: 200px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}

	:global(.code-block) {
		background: var(--code-bg);
		border: 1px solid var(--border);
		border-radius: 14px;
		overflow: hidden;
	}

	:global(.code-header) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		background: var(--bg-elevated);
	}

	:global(.code-language) {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--fg-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	:global(.code-copy-btn) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--fg-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	:global(.code-copy-btn:hover) {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}

	:global(.code-content) {
		overflow-x: auto;
	}

	:global(.code-content pre) {
		margin: 0;
		padding: 1.25rem;
		font-size: 0.8125rem;
		line-height: 1.6;
	}

	:global(.code-content code) {
		font-family: 'JetBrains Mono', monospace;
		color: var(--fg);
	}

	:global(.props-table) {
		width: 100%;
		border-collapse: collapse;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 14px;
		overflow: hidden;
	}

	:global(.props-table th) {
		padding: 1rem 1.25rem;
		background: var(--bg-elevated);
		text-align: left;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--fg-muted);
		border-bottom: 1px solid var(--border);
	}

	:global(.props-table td) {
		padding: 1rem 1.25rem;
		font-size: 0.875rem;
		border-bottom: 1px solid var(--border);
		vertical-align: top;
	}

	:global(.props-table tr:last-child td) {
		border-bottom: none;
	}

	:global(.prop-name) {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8125rem;
		color: var(--accent);
		background: var(--accent-light);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	:global(.prop-type) {
		font-size: 0.8125rem;
		color: var(--fg-muted);
	}

	:global(.prop-default) {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		background: var(--bg);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		color: var(--fg-muted);
	}

	@media (max-width: 1024px) {
		:global(.sidebar) {
			transform: translateX(-100%);
			transition: transform 0.3s ease;
		}

		:global(.sidebar.open) {
			transform: translateX(0);
		}

		:global(.main) {
			margin-left: 0;
		}
	}
</style>
