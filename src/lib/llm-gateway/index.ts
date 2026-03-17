import { LLMGatewayClient } from './client';

export const llmClient = new LLMGatewayClient({
  baseUrl: 'https://hoi-llm-gateway.up.railway.app',
  model: 'unsloth/Qwen3.5-2B-GGUF',
  maxTokens: 25000,
  temperature: 0.7,
  timeout: 120000, // 2 minutes
});
