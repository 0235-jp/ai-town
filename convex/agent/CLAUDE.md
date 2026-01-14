# convex/agent/ - AIエージェント知能

LLMを使ったエージェントの会話生成とメモリ管理。

## ファイル

| ファイル | 役割 |
|---------|------|
| `conversation.ts` | 会話メッセージ生成（開始、継続、退出） |
| `memory.ts` | ベクトル検索によるメモリ取得 |
| `embeddingsCache.ts` | エンベディングのキャッシュ |
| `schema.ts` | メモリ・キャッシュのスキーマ |

## 会話フロー

```typescript
// conversation.ts

// 1. 会話開始時
startConversationMessage(ctx, worldId, conversationId, playerId, otherPlayerId)
  → プロンプト構築（自己紹介、相手情報、過去の会話、関連メモリ）
  → chatCompletion() でLLM呼び出し
  → 挨拶メッセージを返す

// 2. 会話継続時
continueConversationMessage(...)
  → 会話履歴 + メモリをプロンプトに含める
  → 返答を生成

// 3. 退出時
leaveConversationMessage(...)
  → 別れの挨拶を生成
```

## メモリシステム

```typescript
// memory.ts

// メモリの種類
type MemoryType =
  | 'conversation'  // 会話の要約
  | 'reflection'    // 振り返り
  | 'identity';     // 自己認識

// 検索
searchMemories(ctx, playerId, embedding, limit)
  → ベクトル類似度でメモリを検索
  → 関連度の高い順に返す
```

## プロンプト構造

```
System:
  - あなたは{player.name}です
  - あなたについて: {agent.identity}
  - 会話の目標: {agent.plan}
  - {otherPlayer.name}について: {otherAgent.identity}
  - 前回の会話: {lastConversation}
  - 関連メモリ: {memories}

User: 会話履歴...
User: {player.name} to {otherPlayer.name}:
```

## エンベディングキャッシュ

同じテキストのエンベディングを再計算しないようにキャッシュ:

```typescript
// embeddingsCache.ts
fetch(ctx, text)
  → キャッシュにあれば返す
  → なければLLM APIで生成してキャッシュに保存
```
