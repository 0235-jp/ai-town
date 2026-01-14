# src/ - Reactフロントエンド

React + PixiJSによるゲームUI。Convexからリアルタイムでゲーム状態を受信して描画。

## フォルダ構造

```
src/
├── components/     # Reactコンポーネント
│   └── buttons/    # ボタンコンポーネント
├── hooks/          # カスタムフック
├── App.tsx         # ルートコンポーネント
├── main.tsx        # エントリーポイント
└── toasts.ts       # トースト通知
```

## 主要ファイル

| ファイル | 役割 |
|---------|------|
| `App.tsx` | メインレイアウト、ゲーム/UI切り替え |
| `main.tsx` | Reactマウント、Convexプロバイダー設定 |
| `toasts.ts` | react-toastify設定 |

## データフロー

```
Convex DB
    ↓ useQuery (リアルタイム購読)
serverGame.ts (useServerGame)
    ↓ ゲーム状態
useHistoricalValue (位置補間)
    ↓ スムーズな位置データ
PixiGame.tsx
    ↓ レンダリング
Canvas
```

## Convex連携

```typescript
// ConvexClientProvider.tsx でクライアント設定
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

// コンポーネント内でクエリ
const worldState = useQuery(api.world.worldState, { worldId });

// ミューテーション呼び出し
const sendInput = useMutation(api.aiTown.main.sendInput);
await sendInput({ worldId, name: 'moveTo', args: { ... } });
```

## 環境変数

```bash
# .env.local
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk認証（オプション）
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```
