export interface LLMGatewayConfig {
  baseUrl: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface BlogGenerationOptions {
  url: string;
  title?: string;
  blogReason?: string;
  tone?: string;
  format?: string;
  tags?: string[];
  category?: string;
  additionalInstructions?: string;
  existingContent?: string;
}

export class LLMGatewayClient {
  private config: LLMGatewayConfig;

  constructor(config: LLMGatewayConfig) {
    this.config = config;
  }

  async generateBlogPost(options: BlogGenerationOptions): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(options);
    const userPrompt = this.buildUserPrompt(options);

    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.config.maxTokens || 2048,
        temperature: this.config.temperature || 0.7,
      }),
      signal: AbortSignal.timeout(this.config.timeout || 30000),
    });

    if (!response.ok) {
      throw new Error(`LLM Gateway error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async *generateBlogPostStream(options: BlogGenerationOptions): AsyncGenerator<string, void, unknown> {
    const systemPrompt = this.buildSystemPrompt(options);
    const userPrompt = this.buildUserPrompt(options);

    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.config.maxTokens || 2048,
        temperature: this.config.temperature || 0.7,
        stream: true,
      }),
      signal: AbortSignal.timeout(this.config.timeout || 60000),
    });

    if (!response.ok) {
      throw new Error(`LLM Gateway error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  }

  private buildSystemPrompt(options: BlogGenerationOptions): string {
    return `You are a professional blog writer. Generate well-structured blog posts with YAML frontmatter.

Required frontmatter fields:
- title: Blog post title
- tags: Array of relevant tags
- category: Blog category
- tone: Writing tone (${options.tone || 'Professional'})
- format: Content format (${options.format || 'Tutorial'})

Write engaging, informative content that provides value to readers.`;
  }

  private buildUserPrompt(options: BlogGenerationOptions): string {
    // If existing content is provided, we're continuing from where we left off
    if (options.existingContent) {
      let prompt = `Continue writing the blog post from where it was interrupted. Here is the content generated so far:\n\n---\n${options.existingContent}\n---\n\nContinue exactly from where the text ended above. Do not repeat any content, just continue writing naturally. Complete the blog post with proper ending.`;

      if (options.additionalInstructions) {
        prompt += `\n\nKeep in mind: ${options.additionalInstructions}`;
      }

      return prompt;
    }

    // Normal generation without existing content
    let prompt = `Write a blog post about this URL: ${options.url}`;

    if (options.title) {
      prompt += `\n\nSuggested title: ${options.title}`;
    }

    if (options.blogReason) {
      prompt += `\n\nReason for writing: ${options.blogReason}`;
    }

    if (options.tags && options.tags.length > 0) {
      prompt += `\n\nTags: ${options.tags.join(', ')}`;
    }

    if (options.category) {
      prompt += `\n\nCategory: ${options.category}`;
    }

    if (options.additionalInstructions) {
      prompt += `\n\nAdditional instructions: ${options.additionalInstructions}`;
    }

    return prompt;
  }
}
