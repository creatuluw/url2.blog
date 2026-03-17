import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LLMGatewayClient, type BlogGenerationOptions } from './client';

// Mock fetch globally
global.fetch = vi.fn();

describe('LLMGatewayClient', () => {
	let client: LLMGatewayClient;
	const defaultConfig = {
		baseUrl: 'http://localhost:8080',
		model: 'test-model',
		maxTokens: 2048,
		temperature: 0.7,
		timeout: 30000,
	};

	beforeEach(() => {
		client = new LLMGatewayClient(defaultConfig);
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('constructor', () => {
		it('creates client with provided config', () => {
			const customClient = new LLMGatewayClient({
				baseUrl: 'http://custom-url',
				model: 'custom-model',
				maxTokens: 4096,
				temperature: 0.5,
			});
			expect(customClient).toBeInstanceOf(LLMGatewayClient);
		});
	});

	describe('buildSystemPrompt', () => {
		it('includes tone in system prompt', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com',
				tone: 'Casual',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildSystemPrompt'](options);
			expect(prompt).toContain('Casual');
		});

		it('includes format in system prompt', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com',
				format: 'Tutorial',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildSystemPrompt'](options);
			expect(prompt).toContain('Tutorial');
		});

		it('uses default values when tone and format are not provided', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildSystemPrompt'](options);
			expect(prompt).toContain('Professional');
			expect(prompt).toContain('Tutorial');
		});

		it('includes required frontmatter fields in prompt', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildSystemPrompt'](options);
			expect(prompt).toContain('title: Blog post title');
			expect(prompt).toContain('tags: Array of relevant tags');
			expect(prompt).toContain('category: Blog category');
		});
	});

	describe('buildUserPrompt', () => {
		it('includes URL in prompt', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com/article',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildUserPrompt'](options);
			expect(prompt).toContain('https://example.com/article');
		});

		it('includes title when provided', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com',
				title: 'My Test Blog Post',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildUserPrompt'](options);
			expect(prompt).toContain('My Test Blog Post');
			expect(prompt).toContain('Suggested title:');
		});

		it('includes blogReason when provided', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com',
				blogReason: 'Testing the feature',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildUserPrompt'](options);
			expect(prompt).toContain('Testing the feature');
			expect(prompt).toContain('Reason for writing:');
		});

		it('includes tags when provided', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com',
				tags: ['test', 'blog', 'vitest'],
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildUserPrompt'](options);
			expect(prompt).toContain('test, blog, vitest');
			expect(prompt).toContain('Tags:');
		});

		it('includes category when provided', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com',
				category: 'Technology',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildUserPrompt'](options);
			expect(prompt).toContain('Technology');
			expect(prompt).toContain('Category:');
		});

		it('includes additionalInstructions when provided', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com',
				additionalInstructions: 'Make it concise and engaging',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildUserPrompt'](options);
			expect(prompt).toContain('Make it concise and engaging');
			expect(prompt).toContain('Additional instructions:');
		});

		it('includes all options when all are provided', () => {
			const options: BlogGenerationOptions = {
				url: 'https://example.com/article',
				title: 'Complete Test',
				blogReason: 'Testing all fields',
				tags: ['complete', 'test'],
				category: 'Testing',
				additionalInstructions: 'Be thorough',
			};
			// @ts-expect-error - accessing private method for testing
			const prompt = client['buildUserPrompt'](options);
			expect(prompt).toContain('https://example.com/article');
			expect(prompt).toContain('Complete Test');
			expect(prompt).toContain('Testing all fields');
			expect(prompt).toContain('complete, test');
			expect(prompt).toContain('Testing');
			expect(prompt).toContain('Be thorough');
		});

		describe('existingContent handling', () => {


			it('includes existingContent in the prompt', () => {
				const existingContent = '---\ntitle: My Blog\n---\n\n# Introduction\n\nThis is the beginning...';
				const options: BlogGenerationOptions = {
					url: 'https://example.com',
					existingContent,
				};
				// @ts-expect-error - accessing private method for testing
				const prompt = client['buildUserPrompt'](options);
				expect(prompt).toContain(existingContent);
			});

			it('instructs not to repeat content', () => {
				const options: BlogGenerationOptions = {
					url: 'https://example.com',
					existingContent: 'Some content...',
				};
				// @ts-expect-error - accessing private method for testing
				const prompt = client['buildUserPrompt'](options);
				expect(prompt).toContain('Do not repeat any content');
			});

			it('includes additionalInstructions with existingContent', () => {
				const options: BlogGenerationOptions = {
					url: 'https://example.com',
					existingContent: 'Some content...',
					additionalInstructions: 'Keep the tone consistent',
				};
				// @ts-expect-error - accessing private method for testing
				const prompt = client['buildUserPrompt'](options);
				expect(prompt).toContain('Keep in mind: Keep the tone consistent');
			});

			it('does not include URL when existingContent is provided', () => {
				const options: BlogGenerationOptions = {
					url: 'https://example.com',
					existingContent: 'Some content...',
				};
				// @ts-expect-error - accessing private method for testing
				const prompt = client['buildUserPrompt'](options);
				expect(prompt).not.toContain('Write a blog post about this URL:');
			});

			it('does not include title when existingContent is provided', () => {
				const options: BlogGenerationOptions = {
					url: 'https://example.com',
					title: 'Test Title',
					existingContent: 'Some content...',
				};
				// @ts-expect-error - accessing private method for testing
				const prompt = client['buildUserPrompt'](options);
				expect(prompt).not.toContain('Suggested title:');
			});
		});
	});

	describe('generateBlogPost', () => {
		it('makes POST request to correct endpoint', async () => {
			const mockResponse = {
				choices: [
					{
						message: {
							content: 'Generated blog content',
						},
					},
				],
			};

			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
				title: 'Test Post',
			};

			const result = await client.generateBlogPost(options);

			expect(fetch).toHaveBeenCalledWith(
				'http://localhost:8080/v1/chat/completions',
				expect.objectContaining({
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
				})
			);

			expect(result).toBe('Generated blog content');
		});

		it('throws error on non-ok response', async () => {
			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};

			await expect(client.generateBlogPost(options)).rejects.toThrow(
				'LLM Gateway error: 500 Internal Server Error'
			);
		});

		it('returns empty string when no content in response', async () => {
			const mockResponse = {
				choices: [],
			};

			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};

			const result = await client.generateBlogPost(options);
			expect(result).toBe('');
		});
	});

	describe('generateBlogPostStream', () => {
		it('yields content chunks from stream', async () => {
			const mockReader = {
				read: vi.fn()
					.mockResolvedValueOnce({
						done: false,
						value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello "}}]}\n\n'),
					})
					.mockResolvedValueOnce({
						done: false,
						value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"World"}}]}\n\n'),
					})
					.mockResolvedValueOnce({
						done: true,
						value: undefined,
					}),
			};

			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				body: {
					getReader: () => mockReader,
				},
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};

			const chunks: string[] = [];
			for await (const chunk of client.generateBlogPostStream(options)) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual(['Hello ', 'World']);
		});

		it('handles [DONE] marker in stream', async () => {
			const mockReader = {
				read: vi.fn()
					.mockResolvedValueOnce({
						done: false,
						value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Content"}}]}\n\ndata: [DONE]\n\n'),
					})
					.mockResolvedValueOnce({
						done: true,
						value: undefined,
					}),
			};

			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				body: {
					getReader: () => mockReader,
				},
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};

			const chunks: string[] = [];
			for await (const chunk of client.generateBlogPostStream(options)) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual(['Content']);
		});

		it('skips invalid JSON lines', async () => {
			const mockReader = {
				read: vi.fn()
					.mockResolvedValueOnce({
						done: false,
						value: new TextEncoder().encode('data: invalid json\ndata: {"choices":[{"delta":{"content":"Valid"}}]}\n\n'),
					})
					.mockResolvedValueOnce({
						done: true,
						value: undefined,
					}),
			};

			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				body: {
					getReader: () => mockReader,
				},
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};

			const chunks: string[] = [];
			for await (const chunk of client.generateBlogPostStream(options)) {
				chunks.push(chunk);
			}

			expect(chunks).toEqual(['Valid']);
		});

		it('throws error when response is not ok', async () => {
			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: 'Not Found',
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};

			await expect(async () => {
				for await (const _ of client.generateBlogPostStream(options)) {
					// Just iterate
				}
			}).rejects.toThrow('LLM Gateway error: 404 Not Found');
		});

		it('throws error when body is not readable', async () => {
			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				body: null,
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};

			await expect(async () => {
				for await (const _ of client.generateBlogPostStream(options)) {
					// Just iterate
				}
			}).rejects.toThrow('Response body is not readable');
		});

		it('sends stream: true in request body', async () => {
			const mockReader = {
				read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined }),
			};

			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				body: {
					getReader: () => mockReader,
				},
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
			};

			for await (const _ of client.generateBlogPostStream(options)) {
				// Just iterate
			}

			expect(fetch).toHaveBeenCalledWith(
				'http://localhost:8080/v1/chat/completions',
				expect.objectContaining({
					body: expect.stringContaining('"stream":true'),
				})
			);
		});

		it('includes existingContent in request when provided', async () => {
			const mockReader = {
				read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined }),
			};

			(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				body: {
					getReader: () => mockReader,
				},
			});

			const options: BlogGenerationOptions = {
				url: 'https://example.com',
				existingContent: '---\ntitle: Test\n---\n\nExisting content...',
			};

			for await (const _ of client.generateBlogPostStream(options)) {
				// Just iterate
			}

			const callArgs = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
			const requestBody = JSON.parse(callArgs[1].body);

			// Check that the user message contains continuation prompt
			const userMessage = requestBody.messages.find((m: { role: string }) => m.role === 'user');
			expect(userMessage.content).toContain('Continue writing the blog post');
			expect(userMessage.content).toContain('Existing content...');
		});
	});
});
