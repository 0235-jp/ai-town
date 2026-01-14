# AI Town 拡張設計ドキュメント

## 目次

1. [現在のアーキテクチャ](#1-現在のアーキテクチャ)
2. [拡張設計の概要](#2-拡張設計の概要)
3. [変更箇所の詳細](#3-変更箇所の詳細)
4. [実装の優先順位](#4-実装の優先順位)

---

## 1. 現在のアーキテクチャ

### 1.1 全体構成

```
┌─────────────────────────────────────────────────────────┐
│                    フロントエンド                         │
│  src/                                                   │
│  ├── components/Game.tsx      # メインゲームラッパー       │
│  ├── components/PixiGame.tsx  # 2D描画（PixiJS）         │
│  └── hooks/serverGame.ts      # リアルタイム状態購読       │
└─────────────────────────────────────────────────────────┘
                              ↕ Convex リアルタイム同期
┌─────────────────────────────────────────────────────────┐
│                    バックエンド (Convex)                  │
│  convex/                                                │
│  ├── aiTown/                  # ゲームロジック            │
│  │   ├── main.ts              # エントリーポイント        │
│  │   ├── game.ts              # Gameクラス              │
│  │   ├── player.ts            # プレイヤー管理           │
│  │   ├── agent.ts             # エージェント行動          │
│  │   ├── conversation.ts      # 会話状態管理             │
│  │   └── movement.ts          # 経路探索（A*）           │
│  ├── agent/                   # AI知能                  │
│  │   ├── conversation.ts      # LLMプロンプト生成        │
│  │   └── memory.ts            # ベクトル検索メモリ        │
│  └── engine/                  # 汎用ゲームエンジン        │
│      └── abstractGame.ts      # tickベースシミュレーション │
└─────────────────────────────────────────────────────────┘
```

### 1.2 現在のデータフロー

```
ユーザー入力
    ↓
sendInput (mutation)
    ↓
inputs テーブル（キュー）
    ↓
runStep (action) - 16ms tick / 1秒 step
    ↓
Game.tick() → 状態更新 → worlds テーブル
    ↓
クライアントへリアルタイム同期
```

### 1.3 現在のエージェント行動

```typescript
// convex/aiTown/agentOperations.ts

// 現在の行動決定（LLM不使用、ランダム）
agentDoSomething:
  1. 会話クールダウン中？ → ランダムに歩く (wanderDestination)
  2. そうでなければ → ランダムにアクティビティ実行
  3. 近くにプレイヤーがいれば → 会話を開始

// wanderDestination - マップ内のランダムな位置
function wanderDestination(worldMap: WorldMap) {
  return {
    x: 1 + Math.floor(Math.random() * (worldMap.width - 2)),
    y: 1 + Math.floor(Math.random() * (worldMap.height - 2)),
  };
}
```

### 1.4 現在のメモリシステム

```typescript
// convex/agent/memory.ts

// メモリ構造
memories: {
  playerId,           // メモリの所有者
  description,        // 要約テキスト（LLM生成）
  embeddingId,        // ベクトル参照
  importance,         // 重要度 0-9
  lastAccess,         // 最終アクセス時刻
  data: {
    type: 'conversation' | 'reflection' | 'relationship',
    ...
  }
}

// 検索：ベクトル類似度 + 重要度 + 最近性でランキング
searchMemories(ctx, playerId, embedding, limit)
```

### 1.5 現在の制約

| 項目 | 現状 |
|------|------|
| ワールド | 単一ワールドのみ |
| エージェント行動 | ランダム（LLM不使用） |
| 全エージェント | 常時LLMで会話生成 |
| 時間 | ゲーム内時間（現実と同期可能） |
| 外部連携 | なし |

---

## 2. 拡張設計の概要

### 2.1 目標

```
┌─────────────────────────────────────────────────────────┐
│ 1. マルチワールド                                        │
│    - 町の広場、スーパー、飲食店などを別ワールドとして構成    │
│    - キャラクターがワールド間を移動可能                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. キャラクターの2層構造                                  │
│    - メインキャラクター: 常時LLM、自発的行動               │
│    - NPC: 話しかけられた時のみLLM、低コスト                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3. LLMによる自己判断                                     │
│    - ワールド移動先をキャラクターが自分で決める             │
│    - 性格・目標に基づいた判断                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 4. 現実時間同期                                          │
│    - Date.now() をそのまま使用                           │
│    - 朝昼夜、曜日を会話に反映                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 5. 外部チャット連携                                       │
│    - 記憶APIを公開                                       │
│    - Slack/Discord等からキャラクターと会話可能             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 新アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│  AI Town（記憶の育成環境）                                │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │メインワールド│  │ スーパー  │  │ 飲食店   │  ...        │
│  │（町の広場） │  │          │  │          │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│        ↑              ↑              ↑                  │
│        └──────────────┼──────────────┘                  │
│                       ↓                                 │
│              ワールド間移動（移動可能キャラのみ）            │
│                                                         │
│  キャラクター:                                            │
│  ├── メインキャラ: 自発行動、常時LLM、ワールド移動可能       │
│  └── NPC: 固定配置、話しかけられた時のみLLM               │
└─────────────────────────────────────────────────────────┘
                         ↓ 記憶API
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Slack     │  │  Discord    │  │  LINE Bot   │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 3. 変更箇所の詳細

### 3.1 キャラクター定義の拡張

**ファイル: `data/characters.ts`**

```typescript
// === 現在 ===
export const Descriptions = [
  {
    name: 'Lucky',
    character: 'f1',
    identity: `Lucky is always happy and curious...`,
    plan: 'You want to hear all the gossip.',
  },
  // ...
];

// === 変更後 ===
export const Descriptions = [
  // メインキャラクター（常時LLM、ワールド移動可能）
  {
    name: 'Lucky',
    character: 'f1',
    identity: `Lucky is always happy and curious...`,
    plan: 'You want to hear all the gossip.',
    isNPC: false,                    // 追加: メインキャラクター
    canTravelBetweenWorlds: true,    // 追加: ワールド移動可能
  },

  // NPC（話しかけられた時のみLLM、固定配置）
  {
    name: 'スーパー店員',
    character: 'f4',
    identity: `真面目で几帳面な店員。小学生の子どもが一人いる。`,
    plan: 'お客様に良いサービスを提供したい',
    isNPC: true,                     // 追加: NPC
    canTravelBetweenWorlds: false,   // 追加: 移動不可
    homeWorld: 'supermarket',        // 追加: 所属ワールド
  },
  // ...
];
```

### 3.2 ワールド定義の追加

**新規ファイル: `data/worlds.ts`**

```typescript
export const WorldDescriptions = [
  {
    id: 'main',
    name: '町の広場',
    description: '住民が集まる中心地。噂話や最新情報が集まる。',
    mapData: 'gentle',  // 既存のマップデータ
  },
  {
    id: 'supermarket',
    name: 'スーパーマーケット',
    description: '食料品や日用品が揃う。店員が親切に案内してくれる。',
    mapData: 'supermarket',  // 新規作成が必要
  },
  {
    id: 'restaurant',
    name: 'レストラン',
    description: '美味しい料理が楽しめる。シェフとの会話も人気。',
    mapData: 'restaurant',  // 新規作成が必要
  },
];
```

### 3.3 NPCの会話記録スキーマ

**ファイル: `convex/schema.ts`（追加）**

```typescript
// === 追加 ===
npcConversations: defineTable({
  npcPlayerId: v.string(),      // NPC の playerId
  withPlayerId: v.string(),     // 会話相手の playerId
  timestamp: v.number(),        // 会話時刻（現実時間）
  messages: v.array(v.object({
    role: v.string(),           // 'npc' | 'human'
    content: v.string(),
  })),
})
.index('byPlayers', ['npcPlayerId', 'withPlayerId', 'timestamp']),
```

### 3.4 NPC会話処理の追加

**新規ファイル: `convex/npc/conversation.ts`**

```typescript
import { internalAction, internalQuery, internalMutation } from '../_generated/server';
import { v } from 'convex/values';
import { chatCompletion } from '../util/llm';
import { internal } from '../_generated/api';

// 過去の会話を取得
export const getPastConversations = internalQuery({
  args: {
    npcPlayerId: v.string(),
    withPlayerId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('npcConversations')
      .withIndex('byPlayers', (q) =>
        q.eq('npcPlayerId', args.npcPlayerId)
         .eq('withPlayerId', args.withPlayerId)
      )
      .order('desc')
      .take(args.limit);
  },
});

// 会話を記録
export const saveConversation = internalMutation({
  args: {
    npcPlayerId: v.string(),
    withPlayerId: v.string(),
    timestamp: v.number(),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('npcConversations', args);
  },
});

// NPC応答生成（話しかけられた時のみ実行）
export const npcRespond = internalAction({
  args: {
    worldId: v.id('worlds'),
    npcPlayerId: v.string(),
    humanPlayerId: v.string(),
    humanMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // NPC情報を取得
    const npcDesc = await ctx.runQuery(internal.world.getPlayerDescription, {
      worldId: args.worldId,
      playerId: args.npcPlayerId,
    });

    // 会話相手の情報を取得
    const humanDesc = await ctx.runQuery(internal.world.getPlayerDescription, {
      worldId: args.worldId,
      playerId: args.humanPlayerId,
    });

    // 過去の会話を取得（最新3件）
    const pastConversations = await ctx.runQuery(
      internal.npc.conversation.getPastConversations,
      {
        npcPlayerId: args.npcPlayerId,
        withPlayerId: args.humanPlayerId,
        limit: 3
      }
    );

    const now = Date.now();

    // プロンプト構築
    const prompt = buildNPCPrompt(npcDesc, humanDesc, pastConversations, now);

    // LLM呼び出し
    const { content } = await chatCompletion({
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `${humanDesc.name}: ${args.humanMessage}` },
      ],
      max_tokens: 300,
    });

    // 会話を記録
    await ctx.runMutation(internal.npc.conversation.saveConversation, {
      npcPlayerId: args.npcPlayerId,
      withPlayerId: args.humanPlayerId,
      timestamp: now,
      messages: [
        { role: 'human', content: args.humanMessage },
        { role: 'npc', content },
      ],
    });

    return content;
  },
});

// NPCプロンプト構築
function buildNPCPrompt(
  npc: { name: string; identity: string },
  human: { name: string },
  pastConversations: Array<{ timestamp: number; messages: Array<{ role: string; content: string }> }>,
  now: number
): string {
  const date = new Date(now);
  const hour = date.getHours();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

  let timeOfDay = '';
  if (hour >= 6 && hour < 12) timeOfDay = '朝';
  else if (hour >= 12 && hour < 18) timeOfDay = '昼';
  else if (hour >= 18 && hour < 22) timeOfDay = '夕方';
  else timeOfDay = '夜';

  let prompt = `あなたは${npc.name}です。
${npc.identity}

【現在】${dayOfWeek}曜日の${timeOfDay}（${hour}時頃）
`;

  // 過去の会話を追加
  if (pastConversations.length > 0) {
    prompt += `\n【${human.name}との過去の会話】`;

    for (const convo of pastConversations.reverse()) {
      const daysAgo = Math.floor((now - convo.timestamp) / (24 * 60 * 60 * 1000));
      const timeLabel = daysAgo === 0 ? '今日' : `${daysAgo}日前`;

      prompt += `\n\n--- ${timeLabel} ---`;
      for (const msg of convo.messages) {
        const name = msg.role === 'npc' ? npc.name : human.name;
        prompt += `\n${name}: ${msg.content}`;
      }
    }
  } else {
    prompt += `\n${human.name}とは初めて話します。`;
  }

  prompt += `\n\n過去の会話を踏まえて自然に応答してください。
以前話した予定や出来事があれば、時間経過を考慮してその後どうなったか話してください。`;

  return prompt;
}
```

### 3.5 エージェント行動の分岐

**ファイル: `convex/aiTown/agent.ts`（修正）**

```typescript
// === 現在 ===
// 全エージェントが同じ処理

// === 変更後 ===
tick(game: Game, now: number) {
  // NPCかどうかで処理を分岐
  const description = game.agentDescriptions.get(this.id);

  if (description.isNPC) {
    // NPC: 話しかけられるまで待機（自発的行動なし）
    this.npcTick(game, now);
  } else {
    // メインキャラクター: 従来の処理
    this.mainCharacterTick(game, now);
  }
}

// NPC用のtick（シンプル）
npcTick(game: Game, now: number) {
  // アクティビティがあれば継続
  const player = game.world.players.get(this.playerId);
  if (player?.activity && player.activity.until > now) {
    return; // アクティビティ中は何もしない
  }

  // 会話中でなければ、定位置で待機 or 軽い移動
  // （自発的な会話開始はしない）
}

// メインキャラクター用のtick（従来の処理 + ワールド移動判断）
mainCharacterTick(game: Game, now: number) {
  // 従来の処理...

  // 追加: 定期的にワールド移動を検討
  if (this.shouldConsiderWorldTravel(now)) {
    this.startOperation(game, now, 'agentDecideWorldTravel', {
      worldId: game.worldId,
      playerId: this.playerId,
      agentId: this.id,
    });
  }
}
```

### 3.6 LLMによるワールド移動判断

**新規ファイル: `convex/agent/worldTravel.ts`**

```typescript
import { internalAction } from '../_generated/server';
import { v } from 'convex/values';
import { chatCompletion } from '../util/llm';
import { WorldDescriptions } from '../../data/worlds';

export const decideWorldTravel = internalAction({
  args: {
    worldId: v.id('worlds'),
    playerId: v.string(),
    agentId: v.string(),
    currentWorldId: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await getAgentDescription(ctx, args.agentId);
    const player = await getPlayerDescription(ctx, args.playerId);

    // 行けるワールドのリスト（現在地以外）
    const availableWorlds = WorldDescriptions.filter(w => w.id !== args.currentWorldId);
    const currentWorld = WorldDescriptions.find(w => w.id === args.currentWorldId);

    const prompt = `
あなたは${player.name}です。
${agent.identity}

【あなたの目標】
${agent.plan}

【現在地】
${currentWorld.name}: ${currentWorld.description}

【行ける場所】
${availableWorlds.map(w => `- ${w.name}: ${w.description}`).join('\n')}

次にどこに行きますか？JSON形式で回答してください:
{
  "action": "stay" | "travel",
  "destination": "ワールド名（travelの場合）",
  "reason": "理由"
}
`;

    const { content } = await chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    try {
      return JSON.parse(content);
    } catch {
      return { action: 'stay', reason: 'パース失敗' };
    }
  },
});
```

### 3.7 外部API（Slack等連携用）

**新規ファイル: `convex/api/character.ts`**

```typescript
import { action, query } from '../_generated/server';
import { v } from 'convex/values';
import { chatCompletion, fetchEmbedding } from '../util/llm';
import * as memory from '../agent/memory';

// キャラクター情報を取得
export const getCharacterInfo = query({
  args: { characterName: v.string() },
  handler: async (ctx, args) => {
    const player = await findPlayerByName(ctx, args.characterName);
    if (!player) return null;

    const description = await ctx.db
      .query('playerDescriptions')
      .filter(q => q.eq(q.field('playerId'), player.id))
      .first();

    return {
      name: player.name,
      identity: description?.identity,
      plan: description?.plan,
    };
  },
});

// キャラクターの記憶を検索
export const searchCharacterMemory = action({
  args: {
    characterName: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const player = await findPlayerByName(ctx, args.characterName);
    if (!player) return [];

    const embedding = await fetchEmbedding(args.query);
    const memories = await memory.searchMemories(
      ctx,
      player.id,
      embedding,
      args.limit ?? 5
    );

    return memories.map(m => ({
      description: m.description,
      importance: m.importance,
      type: m.data.type,
    }));
  },
});

// キャラクターとして応答を生成（外部チャット用）
export const generateCharacterResponse = action({
  args: {
    characterName: v.string(),
    userMessage: v.string(),
    conversationHistory: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const player = await findPlayerByName(ctx, args.characterName);
    const description = await getPlayerDescription(ctx, player.id);

    // メモリ検索
    const embedding = await fetchEmbedding(args.userMessage);
    const memories = await memory.searchMemories(ctx, player.id, embedding, 3);

    const prompt = `
あなたは${player.name}です。
${description.identity}

【あなたの記憶】
${memories.map(m => `- ${m.description}`).join('\n')}

ユーザーとの会話に自然に答えてください。
`;

    const { content } = await chatCompletion({
      messages: [
        { role: 'system', content: prompt },
        ...(args.conversationHistory ?? []),
        { role: 'user', content: args.userMessage },
      ],
      max_tokens: 300,
    });

    return content;
  },
});
```

### 3.8 HTTPエンドポイント追加

**ファイル: `convex/http.ts`（修正）**

```typescript
// === 現在 ===
import { httpRouter } from 'convex/server';
import { handleReplicateWebhook } from './music';

const http = httpRouter();
http.route({
  path: '/replicate_webhook',
  method: 'POST',
  handler: handleReplicateWebhook,
});
export default http;

// === 変更後 ===
import { httpRouter } from 'convex/server';
import { handleReplicateWebhook } from './music';
import { httpAction } from './_generated/server';
import { api } from './_generated/api';

const http = httpRouter();

http.route({
  path: '/replicate_webhook',
  method: 'POST',
  handler: handleReplicateWebhook,
});

// 外部チャット用エンドポイント
http.route({
  path: '/api/character/respond',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { characterName, message, history } = body;

    const response = await ctx.runAction(api.api.character.generateCharacterResponse, {
      characterName,
      userMessage: message,
      conversationHistory: history,
    });

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }),
});

export default http;
```

---

## 4. 実装の優先順位

### Phase 1: NPC基盤（低コスト化）

| 順番 | タスク | ファイル |
|-----|--------|---------|
| 1-1 | キャラクター定義に `isNPC` フラグ追加 | `data/characters.ts` |
| 1-2 | NPC会話記録スキーマ追加 | `convex/schema.ts` |
| 1-3 | NPC会話処理実装 | `convex/npc/conversation.ts` |
| 1-4 | エージェントtickの分岐 | `convex/aiTown/agent.ts` |

### Phase 2: マルチワールド

| 順番 | タスク | ファイル |
|-----|--------|---------|
| 2-1 | ワールド定義追加 | `data/worlds.ts` |
| 2-2 | 店舗マップ作成 | `data/supermarket.js` 等 |
| 2-3 | 複数ワールド初期化 | `convex/init.ts` |
| 2-4 | ワールド移動入力追加 | `convex/aiTown/inputs.ts` |
| 2-5 | フロントエンドでワールド切替 | `src/components/` |

### Phase 3: LLM自己判断

| 順番 | タスク | ファイル |
|-----|--------|---------|
| 3-1 | ワールド移動判断ロジック | `convex/agent/worldTravel.ts` |
| 3-2 | エージェントからの呼び出し | `convex/aiTown/agent.ts` |

### Phase 4: 外部連携

| 順番 | タスク | ファイル |
|-----|--------|---------|
| 4-1 | 記憶API実装 | `convex/api/character.ts` |
| 4-2 | HTTPエンドポイント追加 | `convex/http.ts` |
| 4-3 | Slack Bot実装 | 別プロジェクト |

---

## 付録: コスト比較

| キャラクタータイプ | LLM使用タイミング | 1日あたりAPI呼び出し目安 |
|------------------|------------------|----------------------|
| メインキャラクター | 常時（会話、行動判断、移動判断） | 数百回 |
| NPC | 話しかけられた時のみ | 数回〜数十回 |

**例: メインキャラ2体 + NPC10体の構成**
- 従来: 12体 × 数百回 = 数千回/日
- 新設計: 2体 × 数百回 + 10体 × 数十回 = 数百〜千回/日

**コスト削減率: 約50-80%**
