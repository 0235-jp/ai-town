# convex/aiTown/ - AIタウンゲームロジック

ゲームのコアロジック。プレイヤー、エージェント、会話、移動を管理。

## アーキテクチャ

```
AbstractGame (engine/)
     ↑ 継承
   Game (game.ts)
     │
     ├── World (world.ts) - 全エンティティのコンテナ
     │     ├── Players[]
     │     ├── Agents[]
     │     └── Conversations[]
     │
     ├── WorldMap (worldMap.ts) - マップデータ、衝突判定
     ├── PlayerDescriptions - プレイヤー詳細情報
     └── AgentDescriptions - エージェント詳細情報
```

## 主要ファイル

| ファイル | 役割 |
|---------|------|
| `main.ts` | エントリーポイント。`runStep`がゲームループを駆動 |
| `game.ts` | Gameクラス。AbstractGameを継承、状態の読み書き |
| `inputs.ts` | 入力タイプ定義（join, leave, moveTo, startConversation等） |
| `inputHandler.ts` | 入力ハンドラー登録 |
| `player.ts` | Playerクラス。移動、会話参加 |
| `agent.ts` | Agentクラス。AI行動決定（会話開始、移動先選択） |
| `conversation.ts` | Conversationクラス。会話の状態管理 |
| `movement.ts` | 経路探索（A*アルゴリズム） |
| `location.ts` | 位置データ、履歴追跡 |
| `ids.ts` | GameId型定義（`p:0`, `a:1`, `c:2`形式） |

## ゲームループ

```typescript
// main.ts - runStep
while (now < deadline) {
  await game.runStep(ctx, now);  // AbstractGame.runStep
  await sleep(stepDuration);
}
// 自身を再スケジュール
await ctx.scheduler.runAfter(0, internal.aiTown.main.runStep, ...);
```

## 入力システム

```typescript
// inputs.ts で入力タイプを定義
export const inputs: Inputs = {
  join: { handler: (game, now, args) => { ... } },
  moveTo: { handler: (game, now, args) => { ... } },
  startConversation: { handler: ... },
  // ...
};

// クライアントから呼び出し
await sendInput(worldId, 'moveTo', { playerId, destination });
```

## エンティティID

GameIdは文字列形式: `<type>:<number>`
- `p:0` - Player ID
- `a:1` - Agent ID
- `c:2` - Conversation ID
