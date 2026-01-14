# convex/engine/ - 汎用ゲームエンジン

AIタウンから独立した汎用的なゲームエンジン基盤。

## 設計思想

- **Tick-based Simulation**: 固定間隔（16ms）でゲーム状態を更新
- **Input Queue**: 入力をキューに積み、tick時に処理
- **Optimistic Concurrency**: generationNumberで競合を検出
- **State Diff**: 差分のみを保存して効率化

## ファイル

| ファイル | 役割 |
|---------|------|
| `abstractGame.ts` | 抽象ゲームクラス、メインループ |
| `historicalObject.ts` | 位置履歴の追跡（クライアント補間用） |
| `schema.ts` | engines, inputs テーブル定義 |

## AbstractGameクラス

```typescript
abstract class AbstractGame {
  // 継承先で定義が必要
  abstract tickDuration: number;      // tick間隔（ms）
  abstract stepDuration: number;      // step間隔（ms）
  abstract maxTicksPerStep: number;   // 1stepあたり最大tick数
  abstract maxInputsPerStep: number;  // 1stepあたり最大入力数

  abstract handleInput(now, name, args): Value;  // 入力処理
  abstract tick(now): void;                       // 1tick分の更新
  abstract saveStep(ctx, update): Promise<void>; // 状態保存

  // 実装済み
  async runStep(ctx, now) { ... }  // メインループ
}
```

## ゲームループ詳細

```
runStep(now):
  1. inputs テーブルから未処理入力を取得
  2. beginStep() 呼び出し
  3. while (numTicks < maxTicksPerStep):
     a. 現在時刻以前の入力を収集
     b. handleInput() で各入力を処理
     c. tick() でゲーム状態を更新
     d. 時間を tickDuration 進める
  4. saveStep() で状態をDBに保存
  5. generationNumber をインクリメント
```

## Engineテーブル

```typescript
// schema.ts
engine: {
  currentTime: number,        // 現在のゲーム時間
  lastStepTs: number,         // 前回stepの時間
  generationNumber: number,   // 楽観的ロック用
  running: boolean,           // 実行中フラグ
  processedInputNumber: number // 処理済み入力番号
}
```

## HistoricalObject

クライアントでスムーズなアニメーションを実現するため、位置の履歴を保持:

```typescript
// historicalObject.ts
class HistoricalObject<T> {
  update(time, value)  // 新しい値を記録
  pack(): ArrayBuffer  // バイナリにシリアライズ
}
```
