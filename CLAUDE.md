# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## ビルド・開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（フロントエンド + バックエンド同時）
npm run dev

# フロントエンドとバックエンドを別々に起動（デバッグに便利）
npm run dev:frontend   # Vite開発サーバー http://localhost:5173
npm run dev:backend    # Convexバックエンド（ライブリロード + ログ出力）

# 本番ビルド
npm run build

# リント
npm run lint

# テスト実行
npm test

# Convexダッシュボードを開く
npm run dashboard
```

## Convex CLIコマンド

```bash
# ワールドの初期化/リセット
npx convex run init

# シミュレーションエンジンを停止
npx convex run testing:stop

# シミュレーションエンジンを再開
npx convex run testing:resume

# エージェントが止まった場合にエンジンをキック
npx convex run testing:kick

# 全データを消去して最初からやり直す
npx convex run testing:wipeAllTables
npx convex run init

# 本番環境にデプロイ
npx convex deploy
npx convex run init --prod

# 環境変数の設定
npx convex env set OLLAMA_HOST http://localhost:11434
npx convex env set OPENAI_API_KEY 'your-key'
```

## アーキテクチャ概要

AIキャラクターが仮想の町で生活し、チャットし、交流するリアルタイムマルチプレイヤーAIシミュレーション。アーキテクチャは3つの主要レイヤーで構成されています。

### バックエンド (Convex) - `convex/`

**ゲームエンジン (`convex/engine/`):**
- `abstractGame.ts` - tickベースシミュレーションの基底ゲームループクラス（16msのtick、1秒のstep）
- 入力をキューから処理し、ゲームtickを実行し、状態の差分をデータベースに保存
- generationNumberによる楽観的並行制御を使用

**AIタウン実装 (`convex/aiTown/`):**
- `game.ts` - AbstractGameを継承し、AIタウン固有のロジック（ワールド、プレイヤー、エージェント、会話）を実装
- `main.ts` - エントリーポイント: `runStep`アクションがシミュレーションループを駆動、`sendInput`ミューテーションがプレイヤー入力を受け付け
- `inputs.ts` - 全ての有効な入力タイプを定義（join, leave, moveTo, startConversation等）
- `player.ts`, `agent.ts`, `conversation.ts` - tickメソッドを持つコアエンティティクラス
- `movement.ts`, `location.ts` - 経路探索と位置追跡

**エージェント知能 (`convex/agent/`):**
- `conversation.ts` - 会話の開始/継続/退出のためのLLMプロンプティング
- `memory.ts` - 関連コンテキストのためのベクトルベースメモリ検索
- `embeddingsCache.ts` - API呼び出しを減らすためのエンベディングキャッシュ

**LLM設定 (`convex/util/llm.ts`):**
- Ollama（デフォルト）、OpenAI、Together.ai、またはカスタムOpenAI互換APIをサポート
- **重要:** `EMBEDDING_DIMENSION`定数は選択したプロバイダーと一致させる必要あり（Ollama=1024, OpenAI=1536, Together=768）
- プロバイダーを変更する場合はデータのワイプが必要: エンベディングはプロバイダー固有

### フロントエンド (React + PixiJS) - `src/`

- `components/Game.tsx` - メインゲームラッパー
- `components/PixiGame.tsx` - PixiJSを使用して2Dゲームワールドをレンダリング
- `hooks/serverGame.ts` - Convexからリアルタイムでゲーム状態を購読
- `hooks/useHistoricalValue.ts` - スムーズなアニメーションのためにサーバー更新間の位置を補間

### データ (`data/`)

- `characters.ts` - キャラクター定義（アイデンティティ、プラン、スプライト参照）
- `spritesheets/` - 各キャラクターのアニメーションフレームデータ
- `gentle.js` - マップデータ（タイル、衝突、スポーンポイント）

## 主要な定数 (`convex/constants.ts`)

ゲームのタイミングと動作は定数で制御されます。主要なもの:
- `TICK = 16` (tickあたりms)
- `STEP_INTERVAL = 1000` (サーバーstepあたりms)
- `CONVERSATION_COOLDOWN = 15000` (会話間のms)
- `MAX_CONVERSATION_MESSAGES = 8` (退出前のメッセージ数)
- `NUM_MEMORIES_TO_SEARCH = 3` (コンテキスト用メモリ数)

## カスタマイズ

**キャラクター:** `data/characters.ts`を編集 - AI性格のための`Descriptions`配列を変更。

**マップ:** Tiledエディタを使用し、JSONをエクスポートし、`node data/convertMap.js <mapDataPath> <assetPath> <tilesetpxw> <tilesetpxh>`を実行。

**LLMプロバイダー:** `convex/util/llm.ts`の`EMBEDDING_DIMENSION`を変更し、適切な環境変数を設定。プロバイダー変更後は必ずデータをワイプすること。
