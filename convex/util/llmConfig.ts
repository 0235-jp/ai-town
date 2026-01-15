// LLM設定ファイル
// プロバイダーを変更する場合は、使用したい設定のコメントを外してください

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModelV1, EmbeddingModelV1 } from 'ai';

// =============================================================================
// エンベディング次元数（スキーマ評価時に必要なため、ここで定義）
// =============================================================================
export const EMBEDDING_DIMENSION = 768;

// =============================================================================
// モデル初期化（遅延評価 - 実行時のみ）
// =============================================================================
let _chatModel: LanguageModelV1 | null = null;
let _embeddingModel: EmbeddingModelV1<string> | null = null;

function initModels() {
  if (_chatModel && _embeddingModel) return;

  // LM Studio（デフォルト）
  const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: process.env.LLM_API_URL || 'http://localhost:1234/v1',
  });

  _chatModel = lmstudio(process.env.LLM_MODEL || 'llama-3.2-3b-instruct');
  _embeddingModel = lmstudio.embeddingModel(
    process.env.LLM_EMBEDDING_MODEL || 'nomic-embed-text-v1.5',
  );
}

export function getChatModel(): LanguageModelV1 {
  initModels();
  return _chatModel!;
}

export function getEmbeddingModel(): EmbeddingModelV1<string> {
  initModels();
  return _embeddingModel!;
}

// =============================================================================
// 他のプロバイダー例
// =============================================================================
//
// --- OpenAI ---
// import { createOpenAI } from '@ai-sdk/openai';
// const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
// _chatModel = openai('gpt-4o-mini');
// _embeddingModel = openai.embeddingModel('text-embedding-3-small');
// EMBEDDING_DIMENSION = 1536;
//
// --- Anthropic Claude ---
// エンベディングは非対応のため、OpenAI等と併用が必要
// import { createAnthropic } from '@ai-sdk/anthropic';
// import { createOpenAI } from '@ai-sdk/openai';
// const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
// _chatModel = anthropic('claude-sonnet-4-20250514');
// _embeddingModel = openai.embeddingModel('text-embedding-3-small');
// EMBEDDING_DIMENSION = 1536;
//
// --- Google Gemini ---
// import { createGoogleGenerativeAI } from '@ai-sdk/google';
// const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
// _chatModel = google('gemini-2.0-flash');
// _embeddingModel = google.textEmbeddingModel('text-embedding-004');
// EMBEDDING_DIMENSION = 768;
//
// --- Ollama ---
// import { createOllama } from 'ollama-ai-provider';
// const ollama = createOllama({
//   baseURL: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434/api',
// });
// _chatModel = ollama('llama3');
// _embeddingModel = ollama.embeddingModel('mxbai-embed-large');
// EMBEDDING_DIMENSION = 1024;
//
// --- カスタム（OpenAI互換API）---
// import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
// const custom = createOpenAICompatible({
//   name: 'custom',
//   baseURL: process.env.LLM_API_URL!,
//   headers: { Authorization: `Bearer ${process.env.LLM_API_KEY}` },
// });
// _chatModel = custom('your-model');
// _embeddingModel = custom.embeddingModel('your-embedding-model');
// EMBEDDING_DIMENSION = 768;
