# convex/ - Convexバックエンド

Convexサーバーレスバックエンド。リアルタイムデータベース、サーバー関数、ゲームエンジンを含む。

## フォルダ構造

- `aiTown/` - AIタウンのゲームロジック（プレイヤー、エージェント、会話）
- `agent/` - AIエージェントの知能（LLMプロンプト、メモリ）
- `engine/` - 汎用ゲームエンジン（tick処理、入力キュー）
- `util/` - ユーティリティ（LLM API、ジオメトリ、圧縮）
- `_generated/` - Convex自動生成ファイル（編集禁止）

## 主要ファイル

| ファイル | 役割 |
|---------|------|
| `schema.ts` | データベーススキーマ定義 |
| `init.ts` | ワールド初期化（`npx convex run init`で実行） |
| `testing.ts` | デバッグ用関数（stop, resume, kick, wipeAllTables） |
| `constants.ts` | ゲーム動作パラメータ |
| `crons.ts` | 定期実行ジョブ（非アクティブワールド停止、音楽生成） |
| `http.ts` | HTTPエンドポイント（Replicateウェブフック） |
| `messages.ts` | チャットメッセージのCRUD |
| `music.ts` | 背景音楽生成（Replicate API） |
| `world.ts` | ワールド状態のクエリ |

## Convex関数の種類

```typescript
// query - 読み取り専用、リアルタイム購読可能
export const listMessages = query({ ... });

// mutation - データ変更、トランザクション保証
export const sendInput = mutation({ ... });

// action - 外部API呼び出し可能（LLM等）
export const runStep = internalAction({ ... });

// internal* - 内部専用（クライアントから呼び出し不可）
export const loadWorld = internalQuery({ ... });
```

## データフロー

```
クライアント → mutation(sendInput) → inputs テーブル
                                           ↓
action(runStep) ← scheduler ← mutation(saveWorld)
      ↓
   Game.tick() → 状態更新 → worlds テーブル
      ↓
   クライアントへリアルタイム同期
```
