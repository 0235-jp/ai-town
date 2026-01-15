'use node';

import { generateText, embed, embedMany } from 'ai';
import { getChatModel, getEmbeddingModel, EMBEDDING_DIMENSION } from './llmConfig';

export { EMBEDDING_DIMENSION };

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: LLMMessage[];
  max_tokens?: number;
  temperature?: number;
  stop?: string | string[];
}

export async function chatCompletion(
  options: ChatCompletionOptions,
): Promise<{ content: string; retries: number; ms: number }> {
  const start = Date.now();

  const { text } = await generateText({
    model: getChatModel(),
    messages: options.messages,
    maxOutputTokens: options.max_tokens,
    temperature: options.temperature,
    stopSequences: options.stop
      ? Array.isArray(options.stop)
        ? options.stop
        : [options.stop]
      : undefined,
  });

  return { content: text, retries: 0, ms: Date.now() - start };
}

export async function fetchEmbedding(
  text: string,
): Promise<{ embedding: number[]; retries: number; ms: number }> {
  const start = Date.now();
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: text.replace(/\n/g, ' '),
  });
  return { embedding, retries: 0, ms: Date.now() - start };
}

export async function fetchEmbeddingBatch(
  texts: string[],
): Promise<{ ollama: false; embeddings: number[][]; retries: number; ms: number }> {
  const start = Date.now();
  const { embeddings } = await embedMany({
    model: getEmbeddingModel(),
    values: texts.map((text) => text.replace(/\n/g, ' ')),
  });
  return {
    ollama: false,
    embeddings,
    retries: 0,
    ms: Date.now() - start,
  };
}
