import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies
vi.mock('$lib/server/database', () => ({
	prisma: {
		savedUrl: {
			findUnique: vi.fn(),
		},
	},
}));

vi.mock('$lib/llm-gateway', () => ({
	llmClient: {
		generateBlogPostStream: vi.fn(),
	},
}));

describe('Generate Stream API Endpoint', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Helper to create a valid FormData with all required fields
	function createValidFormData(overrides: Record<string, string> = {}): FormData {
		const formData = new FormData();
		formData.append('savedUrlId', overrides.savedUrlId ?? 'test-url-id');
		formData.append('title', overrides.title ?? 'Test Title');
		formData.append('blogReason', overrides.blogReason ?? 'Test reason');
		formData.append('tone', overrides.tone ?? 'Professional');
		formData.append('format', overrides.format ?? 'Tutorial');
		formData.append('category', overrides.category ?? 'Technology');
		if (overrides.additionalInstructions) {
			formData.append('additionalInstructions', overrides.additionalInstructions);
		}
		if (overrides.existingContent) {
			formData.append('existingContent', overrides.existingContent);
		}
		if (overrides.tags) {
			formData.append('tags', overrides.tags);
		}
		return formData;
	}

	describe('Validation', () => {
		it('requires savedUrlId', async () => {
			const { POST } = await import('../+server');

			const formData = new FormData();
			formData.append('title', 'Test Title');
			formData.append('blogReason', 'Test reason');
			formData.append('tone', 'Professional');
			formData.append('format', 'Tutorial');
			formData.append('category', 'Technology');

			const request = new Request('http://localhost/api/urls/test-id/generate-stream', {
				method: 'POST',
				body: formData,
			});

			const response = await POST({ params: { id: 'test-id' }, request } as any);
			const result = await response.json();

			expect(response.status).toBe(400);
			expect(result.error).toContain('Expected string');
		});

		it('requires title', async () => {
			const { POST } = await import('../+server');

			const formData = new FormData();
			formData.append('savedUrlId', 'test-url-id');
			formData.append('blogReason', 'Test reason');
			formData.append('tone', 'Professional');
			formData.append('format', 'Tutorial');
			formData.append('category', 'Technology');

			const request = new Request('http://localhost/api/urls/test-id/generate-stream', {
				method: 'POST',
				body: formData,
			});

			const response = await POST({ params: { id: 'test-id' }, request } as any);
			const result = await response.json();

			expect(response.status).toBe(400);
			expect(result.error).toContain('Expected string');
		});

		it('requires blogReason', async () => {
			const { POST } = await import('../+server');

			const formData = new FormData();
			formData.append('savedUrlId', 'test-url-id');
			formData.append('title', 'Test Title');
			formData.append('tone', 'Professional');
			formData.append('format', 'Tutorial');
			formData.append('category', 'Technology');

			const request = new Request('http://localhost/api/urls/test-id/generate-stream', {
				method: 'POST',
				body: formData,
			});

			const response = await POST({ params: { id: 'test-id' }, request } as any);
			const result = await response.json();

			expect(response.status).toBe(400);
			expect(result.error).toContain('Expected string');
		});

		it('accepts optional existingContent', async () => {
			const { prisma } = await import('$lib/server/database');
			const { llmClient } = await import('$lib/llm-gateway');
			const { POST } = await import('../+server');

			vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue({
				id: 'test-url-id',
				url: 'https://example.com',
				title: 'Test URL',
				description: 'Test description',
				thumbnail: null,
				markdownContent: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			} as any);

			// Mock the generator
			async function* mockGenerator() {
				yield '---\n';
				yield 'title: Test\n';
				yield '---\n';
				yield '\nContent here';
			}

			vi.mocked(llmClient.generateBlogPostStream).mockReturnValue(mockGenerator());

			const formData = createValidFormData({
				existingContent: '---\ntitle: Previous\n---\n\nPrevious content',
			});

			const request = new Request('http://localhost/api/urls/test-id/generate-stream', {
				method: 'POST',
				body: formData,
			});

			const response = await POST({ params: { id: 'test-id' }, request } as any);

			expect(response.status).toBe(200);

			// Check that the LLM gateway was called with existingContent
			const callArgs = vi.mocked(llmClient.generateBlogPostStream).mock.calls[0][0];
			expect(callArgs.url).toBe('https://example.com');
			expect(callArgs.title).toBe('Test Title');
			expect(callArgs.blogReason).toBe('Test reason');
			// Normalize line endings for cross-platform compatibility
			expect(callArgs.existingContent?.replace(/\r\n/g, '\n')).toBe('---\ntitle: Previous\n---\n\nPrevious content');
		});

		it('accepts null existingContent (not provided)', async () => {
			const { prisma } = await import('$lib/server/database');
			const { llmClient } = await import('$lib/llm-gateway');
			const { POST } = await import('../+server');

			vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue({
				id: 'test-url-id',
				url: 'https://example.com',
				title: 'Test URL',
				description: 'Test description',
				thumbnail: null,
				markdownContent: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			} as any);

			async function* mockGenerator() {
				yield '---\n';
				yield 'title: Test\n';
				yield '---\n';
			}

			vi.mocked(llmClient.generateBlogPostStream).mockReturnValue(mockGenerator());

			const formData = createValidFormData();
			// Note: existingContent is not appended - it will be null

			const request = new Request('http://localhost/api/urls/test-id/generate-stream', {
				method: 'POST',
				body: formData,
			});

			const response = await POST({ params: { id: 'test-id' }, request } as any);

			expect(response.status).toBe(200);
			expect(llmClient.generateBlogPostStream).toHaveBeenCalledWith(
				expect.objectContaining({
					existingContent: undefined,
				})
			);
		});
	});

	describe('Stream Response', () => {
		it('returns streaming response on success', async () => {
			const { prisma } = await import('$lib/server/database');
			const { llmClient } = await import('$lib/llm-gateway');
			const { POST } = await import('../+server');

			vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue({
				id: 'test-url-id',
				url: 'https://example.com',
				title: 'Test URL',
				description: 'Test description',
				thumbnail: null,
				markdownContent: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			} as any);

			async function* mockGenerator() {
				yield 'Hello ';
				yield 'World';
			}

			vi.mocked(llmClient.generateBlogPostStream).mockReturnValue(mockGenerator());

			const formData = createValidFormData();

			const request = new Request('http://localhost/api/urls/test-id/generate-stream', {
				method: 'POST',
				body: formData,
			});

			const response = await POST({ params: { id: 'test-id' }, request } as any);

			expect(response.status).toBe(200);
			expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');

			// Read the stream
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let content = '';

			if (reader) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					content += decoder.decode(value);
				}
			}

			expect(content).toBe('Hello World');
		});

		it('returns 404 when URL not found', async () => {
			const { prisma } = await import('$lib/server/database');
			const { POST } = await import('../+server');

			vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue(null);

			const formData = createValidFormData({ savedUrlId: 'non-existent-id' });

			const request = new Request('http://localhost/api/urls/test-id/generate-stream', {
				method: 'POST',
				body: formData,
			});

			const response = await POST({ params: { id: 'test-id' }, request } as any);
			const result = await response.json();

			expect(response.status).toBe(404);
			expect(result.error).toBe('URL not found');
		});
	});

	describe('Existing Content Handling', () => {
		it('passes existingContent to LLM gateway when provided', async () => {
			const { prisma } = await import('$lib/server/database');
			const { llmClient } = await import('$lib/llm-gateway');
			const { POST } = await import('../+server');

			vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue({
				id: 'test-url-id',
				url: 'https://example.com',
				title: 'Test URL',
				description: 'Test description',
				thumbnail: null,
				markdownContent: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			} as any);

			async function* mockGenerator() {
				yield 'Continued content';
			}

			const mockGen = vi.mocked(llmClient.generateBlogPostStream);
			mockGen.mockReturnValue(mockGenerator());

			const existingContent = '---\ntitle: Partial\n---\n\nThis is partial...';

			const formData = createValidFormData({ existingContent });

			const request = new Request('http://localhost/api/urls/test-id/generate-stream', {
				method: 'POST',
				body: formData,
			});

			await POST({ params: { id: 'test-id' }, request } as any);

			// Check that the LLM gateway was called with existingContent
			const callArgs = mockGen.mock.calls[0][0];
			expect(callArgs.url).toBe('https://example.com');
			expect(callArgs.title).toBe('Test Title');
			expect(callArgs.blogReason).toBe('Test reason');
			// Normalize line endings for cross-platform compatibility
			expect(callArgs.existingContent?.replace(/\r\n/g, '\n')).toBe(existingContent.replace(/\r\n/g, '\n'));
		});

		it('passes all form fields to LLM gateway', async () => {
			const { prisma } = await import('$lib/server/database');
			const { llmClient } = await import('$lib/llm-gateway');
			const { POST } = await import('../+server');

			vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue({
				id: 'test-url-id',
				url: 'https://example.com',
				title: 'Test URL',
				description: 'Test description',
				thumbnail: null,
				markdownContent: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			} as any);

			async function* mockGenerator() {
				yield 'Content';
			}

			const mockGen = vi.mocked(llmClient.generateBlogPostStream);
			mockGen.mockReturnValue(mockGenerator());

			const formData = createValidFormData({
				title: 'My Blog Post',
				blogReason: 'Testing all fields',
				tone: 'Casual',
				format: 'Guide',
				tags: 'test,vitest,typescript',
				category: 'Technology',
				additionalInstructions: 'Keep it short',
			});

			const request = new Request('http://localhost/api/urls/test-id/generate-stream', {
				method: 'POST',
				body: formData,
			});

			await POST({ params: { id: 'test-id' }, request } as any);

			expect(mockGen).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://example.com',
					title: 'My Blog Post',
					blogReason: 'Testing all fields',
					tone: 'Casual',
					format: 'Guide',
					tags: ['test', 'vitest', 'typescript'],
					category: 'Technology',
				})
			);
		});
	});
});
