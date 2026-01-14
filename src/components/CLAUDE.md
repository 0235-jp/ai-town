# src/components/ - Reactコンポーネント

ゲームUIのReactコンポーネント群。

## コンポーネント階層

```
App.tsx
└── Game.tsx                    # ゲーム全体のコンテナ
    ├── PixiGame.tsx            # PixiJSゲームレンダラー
    │   ├── PixiViewport.tsx    # パン・ズーム対応ビューポート
    │   ├── PixiStaticMap.tsx   # 背景タイルマップ
    │   ├── Character.tsx       # キャラクタースプライト
    │   └── Player.tsx          # プレイヤー表示（名前、吹き出し）
    │
    ├── PlayerDetails.tsx       # 選択プレイヤーの詳細パネル
    ├── Messages.tsx            # チャットメッセージ一覧
    └── MessageInput.tsx        # チャット入力欄
```

## 主要コンポーネント

| ファイル | 役割 |
|---------|------|
| `Game.tsx` | ゲーム状態管理、ワールドハートビート |
| `PixiGame.tsx` | PixiJSアプリケーション、キャラクター/マップ描画 |
| `PixiViewport.tsx` | pixi-viewportラッパー |
| `PixiStaticMap.tsx` | タイルマップ描画 |
| `Character.tsx` | アニメーションスプライト |
| `Player.tsx` | プレイヤー名、会話吹き出し |
| `PlayerDetails.tsx` | 選択プレイヤー情報 |
| `Messages.tsx` | 会話履歴表示 |
| `MessageInput.tsx` | 人間プレイヤーのメッセージ入力 |

## PixiJS統合

```typescript
// @pixi/react を使用
import { Stage, Container, Sprite } from '@pixi/react';

// PixiGame.tsx
<Stage options={{ ... }}>
  <PixiViewport>
    <PixiStaticMap />
    {players.map(p => <Player key={p.id} ... />)}
  </PixiViewport>
</Stage>
```

## buttons/

| ファイル | 役割 |
|---------|------|
| `Button.tsx` | 基本ボタンスタイル |
| `InteractButton.tsx` | プレイヤー操作ボタン |
| `LoginButton.tsx` | Clerk認証ボタン |
| `MusicButton.tsx` | 背景音楽ON/OFF |
| `FreezeButton.tsx` | シミュレーション一時停止 |
