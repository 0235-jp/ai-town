# convex/util/ - ユーティリティ

共通ユーティリティ関数とLLM API統合。

## ファイル

| ファイル | 役割 |
|---------|------|
| `llm.ts` | LLM API統合（**最重要**） |
| `geometry.ts` | 2Dジオメトリ計算（距離、方向、線分交差） |
| `compression.ts` | 履歴データの圧縮 |
| `FastIntegerCompression.ts` | 整数配列の高速圧縮 |
| `minheap.ts` | 最小ヒープ（A*経路探索用） |
| `object.ts` | Map↔配列のシリアライズ |
| `asyncMap.ts` | 非同期map関数 |
| `sleep.ts` | Promise.sleep |
| `assertNever.ts` | exhaustive check用 |
| `xxhash.ts` | ハッシュ関数 |
| `types.ts` | 型ユーティリティ |
| `isSimpleObject.ts` | プレーンオブジェクト判定 |

## LLM設定 (llm.ts)

### プロバイダー設定

```typescript
// EMBEDDING_DIMENSION を変更してプロバイダーを選択
const OPENAI_EMBEDDING_DIMENSION = 1536;
const TOGETHER_EMBEDDING_DIMENSION = 768;
const OLLAMA_EMBEDDING_DIMENSION = 1024;

export const EMBEDDING_DIMENSION = OLLAMA_EMBEDDING_DIMENSION; // ← 変更
```

### 環境変数

```bash
# Ollama（デフォルト）
npx convex env set OLLAMA_HOST http://127.0.0.1:11434
npx convex env set OLLAMA_MODEL llama3
npx convex env set OLLAMA_EMBEDDING_MODEL mxbai-embed-large

# OpenAI
npx convex env set OPENAI_API_KEY 'sk-...'
npx convex env set OPENAI_CHAT_MODEL gpt-4o-mini

# Together.ai
npx convex env set TOGETHER_API_KEY '...'

# カスタム（OpenAI互換API）
npx convex env set LLM_API_URL 'https://...'
npx convex env set LLM_API_KEY '...'
npx convex env set LLM_MODEL '...'
npx convex env set LLM_EMBEDDING_MODEL '...'
```

### 主要関数

```typescript
// チャット補完
chatCompletion({ messages, max_tokens, stop, stream? })
  → { content: string, retries: number, ms: number }

// エンベディング
fetchEmbedding(text) → { embedding: number[] }
fetchEmbeddingBatch(texts) → { embeddings: number[][] }

// ストリーミング対応
const { content } = await chatCompletion({ ..., stream: true });
for await (const chunk of content.read()) {
  console.log(chunk);
}
```

## 注意事項

**プロバイダー変更時は必ずデータをワイプする**:
```bash
npx convex run testing:wipeAllTables
npx convex run init
```
エンベディングの次元が異なるため、古いデータと互換性がない。
