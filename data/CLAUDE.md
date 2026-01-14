# data/ - ゲームデータ

キャラクター定義、スプライトシート、マップデータ。

## フォルダ構造

```
data/
├── characters.ts       # キャラクター定義（**主要編集ファイル**）
├── spritesheets/       # キャラクターアニメーションデータ
│   ├── f1.ts ~ f8.ts   # 各キャラクターのスプライト定義
├── gentle.js           # マップデータ
└── convertMap.js       # Tiledマップ変換スクリプト
```

## characters.ts

### キャラクター性格 (Descriptions)

```typescript
export const Descriptions = [
  {
    name: 'Lucky',           // 表示名
    character: 'f1',         // スプライト参照
    identity: `Lucky is...`, // AIの性格・背景設定
    plan: 'You want to...',  // 会話での目標
  },
  // ...
];
```

### スプライト定義 (characters)

```typescript
export const characters = [
  {
    name: 'f1',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f1SpritesheetData,  // アニメーションフレーム
    speed: 0.1,
  },
  // ...
];
```

## カスタマイズ

### キャラクターの性格を変更

`Descriptions`配列を編集:

```typescript
{
  name: 'MyCharacter',
  character: 'f1',
  identity: `MyCharacter is a friendly robot who loves to help people...`,
  plan: 'You want to make everyone smile.',
}
```

### 新しいスプライトを追加

1. `spritesheets/`に新しいファイルを作成
2. `characters.ts`でインポートして`characters`配列に追加

## マップ編集

### 手順

1. [Tiled](https://www.mapeditor.org/)でマップを編集
2. JSONとしてエクスポート（レイヤー名: `bgtiles`, `objmap`）
3. 変換スクリプトを実行:

```bash
node data/convertMap.js <mapDataPath> <assetPath> <tilesetpxw> <tilesetpxh>
```

4. 生成された`converted-map.js`を`gentle.js`の代わりに使用

## 注意

キャラクターやマップを変更したら、データをリセット:

```bash
npx convex run testing:wipeAllTables
npm run dev
```
