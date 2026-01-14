# src/hooks/ - Reactカスタムフック

ゲーム状態管理とサーバー連携のためのフック。

## ファイル

| ファイル | 役割 |
|---------|------|
| `serverGame.ts` | サーバーからゲーム状態を購読 |
| `useHistoricalTime.ts` | ゲーム時間の管理 |
| `useHistoricalValue.ts` | 位置の履歴補間 |
| `useWorldHeartbeat.ts` | ワールドのアクティブ維持 |
| `sendInput.ts` | サーバーへの入力送信 |

## serverGame.ts

Convexからゲーム状態をリアルタイム購読:

```typescript
export function useServerGame(worldId: Id<'worlds'>) {
  const worldState = useQuery(api.world.worldState, { worldId });
  // players, agents, conversations, map などを返す
  return worldState;
}
```

## useHistoricalValue.ts

サーバーからの離散的な位置データをスムーズに補間:

```typescript
// サーバーは1秒ごとに位置を送信
// クライアントは60fpsでレンダリング
// → 位置を線形補間してスムーズなアニメーション

const position = useHistoricalValue(
  historicalData,  // サーバーからの履歴データ
  currentTime,     // 現在のゲーム時間
);
// position は補間された現在位置
```

## useWorldHeartbeat.ts

ブラウザがアクティブな間、ワールドを維持:

```typescript
// 定期的にサーバーにハートビートを送信
// → IDLE_WORLD_TIMEOUT (5分) 後に自動停止を防ぐ
useWorldHeartbeat(worldId);
```

## sendInput.ts

ゲームへの入力送信とレスポンス待機:

```typescript
const sendInput = useSendInput(worldId);

// 移動
await sendInput('moveTo', {
  playerId: 'p:0',
  destination: { x: 10, y: 20 }
});

// 会話開始
await sendInput('startConversation', {
  playerId: 'p:0',
  invitee: 'p:1'
});
```
