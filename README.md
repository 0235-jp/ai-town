# AI Town 🏠💻💌

[ライブデモ](https://www.convex.dev/ai-town)

[コミュニティDiscordに参加: AI Stack Devs](https://discord.gg/PQUmTBTGmT)

<img width="1454" alt="Screen Shot 2023-08-14 at 10 01 00 AM" src="https://github.com/a16z-infra/ai-town/assets/3489963/a4c91f17-23ed-47ec-8c4e-9f9a8505057d">

AI Townは、AIキャラクターが生活し、チャットし、交流する仮想の町です。

このプロジェクトは、独自のAI Townバージョンを簡単に構築・カスタマイズするためのデプロイ可能なスターターキットです。研究論文[_Generative Agents: Interactive Simulacra of Human Behavior_](https://arxiv.org/pdf/2304.03442.pdf)にインスパイアされています。

このプロジェクトの主な目標は、楽しく作業できることに加えて、拡張を前提とした強固な基盤を持つプラットフォームを提供することです。バックエンドはグローバル共有状態、トランザクション、シミュレーションエンジンをネイティブサポートしており、ちょっとした遊びのプロジェクトからスケーラブルなマルチプレイヤーゲームまで対応できます。副次的な目標として、この分野のシミュレーター（上記の論文を含む）のほとんどがPythonで書かれているため、JS/TSフレームワークを利用可能にすることがあります。

## 概要

- 💻 [技術スタック](#技術スタック)
- 🧠 [インストール](#インストール)（クラウド、ローカル、Docker、セルフホスト、Fly.io等）
- 💻️ [Windows前提条件](#windowsインストール)
- 🤖 [LLMの設定](#llmに接続する)（Ollama、OpenAI、Together.ai等）
- 👤 [カスタマイズ - 独自のシミュレーションワールド](#独自のシミュレーションをカスタマイズ)
- 👩‍💻 [本番環境へのデプロイ](#アプリを本番環境にデプロイ)
- 🐛 [トラブルシューティング](#トラブルシューティング)

## 技術スタック

- ゲームエンジン、データベース、ベクトル検索: [Convex](https://convex.dev/)
- LLM統合: [Vercel AI SDK](https://ai-sdk.dev/)
- 認証（オプション）: [Clerk](https://clerk.com/)
- 対応LLMプロバイダー:
  - [OpenAI](https://platform.openai.com/)（デフォルト: チャット用）
  - [Google Gemini](https://ai.google.dev/)（デフォルト: エンベディング用）
  - [Anthropic Claude](https://www.anthropic.com/)
  - [Ollama](https://ollama.com/)
  - [LM Studio](https://lmstudio.ai/)
  - その他OpenAI互換API
- 背景音楽生成: [Replicate](https://replicate.com/)で[MusicGen](https://huggingface.co/spaces/facebook/MusicGen)を使用

その他のクレジット:

- ピクセルアート生成: [Replicate](https://replicate.com/)、[Fal.ai](https://serverless.fal.ai/lora)
- プロジェクト内の<Game/>コンポーネントでのすべてのインタラクション、背景音楽、レンダリングは[PixiJS](https://pixijs.com/)で動作
- タイルシート:
  - https://opengameart.org/content/16x16-game-assets by George Bailey
  - https://opengameart.org/content/16x16-rpg-tileset by hilau
- このプロジェクトの元のPOCには https://github.com/pierpo/phaser3-simple-rpg を使用。その後アプリ全体を書き直しましたが、簡単なスタートポイントとして感謝
- オリジナルアセット by [ansimuz](https://opengameart.org/content/tiny-rpg-forest)
- UIは[Mounir Tohami](https://mounirtohami.itch.io/pixel-art-gui-elements)のオリジナルアセットに基づく

# インストール

全体的な手順:

1. [ビルドとデプロイ](#ビルドとデプロイ)
2. [LLMに接続する](#llmに接続する)

## ビルドとデプロイ

Convex（バックエンド）上でアプリを実行するいくつかの方法があります。

1. 標準的なConvexセットアップ。ローカルまたはクラウドで開発。Convexアカウント（無料）が必要。クラウドへのデプロイと本格的な開発に最も簡単な方法
2. Dockerで試したい場合でアカウント不要なら、Docker Composeセットアップが便利で自己完結型
3. [Pinokio](https://pinokio.computer/item?uri=https://github.com/cocktailpeanutlabs/aitown)でワンクリックインストールを提供するコミュニティフォークもあり、実行するだけで変更しない人向け 😎
4. [Fly.io](https://fly.io/)にデプロイすることも可能。[./fly](./fly)を参照

### 標準セットアップ

注: Windowsの場合は[下記](#windowsインストール)を参照。

```sh
git clone https://github.com/a16z-infra/ai-town.git
cd ai-town
npm install
```

これにはConvexアカウントへのログインが必要です（まだの場合）。

実行するには:

```sh
npm run dev
```

これで http://localhost:5173 にアクセスできます。

フロントエンドとバックエンドを別々に実行したい場合（保存時にバックエンド関数を同期）、2つのターミナルでこれらを実行:

```bash
npm run dev:frontend
npm run dev:backend
```

詳細は[package.json](./package.json)を参照。

### Docker ComposeでセルフホストされたConvexを使用

ConvexバックエンドをセルフホストされたDockerコンテナで実行することもできます。

#### 初回セットアップ

```sh
# 管理キーを生成（初回のみ）
docker compose up -d
docker compose exec backend ./generate_admin_key.sh
```

`.env.local`ファイルに追加:

```sh
# .env.localに
CONVEX_SELF_HOSTED_ADMIN_KEY="<admin-key>" # 引用符で囲むこと
CONVEX_SELF_HOSTED_URL="http://127.0.0.1:3210"
```

注: `docker compose down`して`up`すると、キーを再生成して`.env.local`ファイルを更新する必要があります。

#### 開発サーバーの起動と停止

```sh
# 起動（Docker + Convexバックエンド + フロントエンド全て）
npm run dev

# 停止
# 1. Ctrl+C で dev プロセスを停止
# 2. npm stop で Docker コンテナを停止
```

#### 開発環境のURL

- フロントエンド: http://localhost:5173
- Convexバックエンド: http://localhost:3210（HTTP APIは3211）
- Convexダッシュボード: http://localhost:6791

ダッシュボードを見るには、`http://localhost:6791`にアクセスして先ほど生成した管理キーを入力します。

### OllamaのためのDocker設定

ローカル推論にOllamaを使用する場合、Dockerが接続できるように設定する必要があります。

```sh
npx convex env set OLLAMA_HOST http://host.docker.internal:11434
```

接続をテストするには（[実行後](#ollamaデフォルト)）:

```sh
docker compose exec backend /bin/bash curl http://host.docker.internal:11434
```

「Ollama is running」と表示されれば成功です！そうでなければ[トラブルシューティング](#トラブルシューティング)セクションを確認してください。

## LLMに接続する

このプロジェクトは[Vercel AI SDK](https://ai-sdk.dev/)を使用しており、複数のLLMプロバイダーに対応しています。

プロバイダーの設定は `convex/util/llmConfig.ts` を編集して行います。

### デフォルト設定（OpenAI + Google）

デフォルトでは以下の構成を使用します：
- **チャット**: OpenAI `gpt-5-mini-2025-08-07`
- **エンベディング**: Google `gemini-embedding-001`（次元数: 3072）

環境変数を設定:

```sh
npx convex env set OPENAI_API_KEY 'your-openai-key'
npx convex env set GOOGLE_API_KEY 'your-google-key'
```

### OpenAI（チャット + エンベディング両方）

`convex/util/llmConfig.ts`を編集:

```ts
import { createOpenAI } from '@ai-sdk/openai';
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
_chatModel = openai('gpt-4o-mini');
_embeddingModel = openai.embeddingModel('text-embedding-3-small');
// EMBEDDING_DIMENSION = 1536; に変更
```

環境変数を設定:

```sh
npx convex env set OPENAI_API_KEY 'your-key'
```

### Anthropic Claude

Claude はエンベディングに対応していないため、OpenAI等と併用が必要です。

```ts
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const chatModel = anthropic('claude-sonnet-4-20250514');
export const embeddingModel = openai.embeddingModel('text-embedding-3-small');
export const EMBEDDING_DIMENSION = 1536;
```

### Google Gemini

```ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
export const chatModel = google('gemini-2.0-flash');
export const embeddingModel = google.textEmbeddingModel('text-embedding-004');
export const EMBEDDING_DIMENSION = 768;
```

### Ollama

```ts
import { createOllama } from 'ollama-ai-provider';
const ollama = createOllama({ baseURL: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434/api' });
export const chatModel = ollama('llama3');
export const embeddingModel = ollama.embeddingModel('mxbai-embed-large');
export const EMBEDDING_DIMENSION = 1024;
```

### エンベディングモデルの変更に関する注意

エンベディングモデルを変更する場合は、データを削除して最初からやり直す必要があります:

```sh
npx convex run testing:wipeAllTables
npx convex run init
```

チャットモデルのみの変更ではワイプは不要です。

## 独自のシミュレーションをカスタマイズ

注: キャラクターデータを変更するたびに、`npx convex run testing:wipeAllTables`を実行してから`npm run dev`を実行してすべてをConvexに再アップロードする必要があります。これはキャラクターデータが初回ロード時にConvexに送信されるためです。ただし、`npx convex run testing:wipeAllTables`はすべてのデータを消去することに注意。

1. 独自のキャラクターとストーリーを作成: すべてのキャラクターとストーリー、およびそのスプライトシート参照は[characters.ts](./data/characters.ts)に保存されています。キャラクターの説明を変更することから始められます。

2. スプライトシートの更新: `data/characters.ts`に以下のコードがあります:

   ```ts
   export const characters = [
     {
       name: 'f1',
       textureUrl: '/ai-town/assets/32x32folk.png',
       spritesheetData: f1SpritesheetData,
       speed: 0.1,
     },
     ...
   ];
   ```

   キャラクター用のスプライトシートを見つけて、対応するファイルでスプライトのモーション/アセットを定義する必要があります（上記の例では、`f1SpritesheetData`はf1.tsで定義されています）

3. 背景（環境）の更新: マップは`convex/init.ts`で`data/gentle.js`からロードされます。マップを更新するには、以下の手順に従います:

   - [Tiled](https://www.mapeditor.org/)を使用してタイルマップをJSONファイルとしてエクスポート（bgtiles と objmap という名前の2つのレイヤー）
   - `convertMap.js`スクリプトを使用してJSONをエンジンが使用できる形式に変換

   ```console
   node data/convertMap.js <mapDataPath> <assetPath> <tilesetpxw> <tilesetpxh>
   ```

   - `<mapDataPath>`: TiledのJSONファイルへのパス
   - `<assetPath>`: タイルセット画像へのパス
   - `<tilesetpxw>`: タイルセットの幅（ピクセル）
   - `<tilesetpxh>`: タイルセットの高さ（ピクセル）。`gentle.js`のように使用できる`converted-map.js`を生成

4. Replicateで背景音楽を追加（オプション）

   日次の背景音楽生成のために、[Replicate](https://replicate.com/)アカウントを作成し、プロフィールの[API Tokenページ](https://replicate.com/account/api-tokens)でトークンを作成。
   `npx convex env set REPLICATE_API_TOKEN # トークン`

   これはReplicateからwebhookを受信できる場合にのみ機能します。通常のConvexクラウドで実行している場合、デフォルトで機能します。セルフホストしている場合は、アプリのURLの`/http`にヒットするように設定する必要があります。Docker Composeを使用している場合は`http://localhost:3211`になりますが、ローカルマシンへトラフィックをプロキシする必要があります。

   **注**: ウィンドウがアイドル状態になると、シミュレーションは5分後に一時停止します。ページをロードすると一時停止が解除されます。UIのボタンでワールドを手動でフリーズ/解除することもできます。ブラウザなしでワールドを実行したい場合は、`convex/crons.ts`の「stop inactive worlds」cronをコメントアウトできます。

   - `convex/music.ts`のプロンプトを変更して背景音楽を変更
   - `convex/crons.ts`の`generate new background music`ジョブを変更して新しい音楽を生成する頻度を変更

## 実行/テスト/デバッグ用コマンド

**アクティビティが多すぎる場合にバックエンドを停止**

これによりエンジンとエージェントの実行が停止します。クエリの実行や関数の実行でデバッグは引き続き可能です。

```bash
npx convex run testing:stop
```

**停止後にバックエンドを再起動**

```bash
npx convex run testing:resume
```

**ゲームエンジンやエージェントが実行されていない場合にエンジンをキック**

```bash
npx convex run testing:kick
```

**ワールドをアーカイブ**

ワールドをリセットして最初からやり直したい場合、現在のワールドをアーカイブできます:

```bash
npx convex run testing:archive
```

その後、ダッシュボードでワールドのデータを見ることはできますが、エンジンとエージェントは実行されなくなります。

その後、`init`で新しいワールドを作成できます。

```bash
npx convex run init
```

**バックエンドデプロイメントを一時停止**

[ダッシュボード](https://dashboard.convex.dev)のデプロイメント設定に移動して、デプロイメントを一時停止/解除できます。これにより、クライアントから呼び出されたか、スケジュールされたか、cronジョブとしての関数がすべて停止します。上記のより穏やかな停止方法があるため、これは最後の手段として使用してください。

## Windowsインストール

### 前提条件

1. **WSL2がインストールされたWindows 10/11**
2. **インターネット接続**

手順:

1. WSL2のインストール

   まず、WSL2をインストールする必要があります。[このガイド](https://docs.microsoft.com/en-us/windows/wsl/install)に従ってWindowsマシンにWSL2をセットアップしてください。LinuxディストリビューションとしてUbuntuを推奨します。

2. パッケージの更新

   WSLターミナル（Ubuntu）を開いてパッケージを更新:

   ```sh
   sudo apt update
   ```

3. NVMとNode.jsのインストール

   NVM（Node Version Manager）は複数のNode.jsバージョンを管理するのに役立ちます。NVMとNode.js 18（安定版）をインストール:

   ```sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
   export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   source ~/.bashrc
   nvm install 18
   nvm use 18
   ```

4. PythonとPipのインストール

   一部の依存関係にはPythonが必要です。PythonとPipをインストール:

   ```sh
   sudo apt-get install python3 python3-pip sudo ln -s /usr/bin/python3 /usr/bin/python
   ```

この時点で、[上記](#インストール)の手順に従えます。

## アプリを本番環境にデプロイ

### Convex関数を本番環境にデプロイ

アプリを実行する前に、Convex関数を本番環境にデプロイする必要があります。注: これはデフォルトのConvexクラウド製品を使用していることを前提としています。

1. `npx convex deploy`を実行してconvex関数を本番にデプロイ
2. `npx convex run init --prod`を実行

ローカルデータをクラウドに転送するには、`npx convex export`を実行してから`npx convex import --prod`でインポートできます。

クリアしたい既存データがある場合は、`npx convex run testing:wipeAllTables --prod`を実行できます。

### 認証の追加（オプション）

`git revert b44a436`でclerk認証を戻すことができます。または、そのdiffを見て何が変更されたかを確認するだけでもできます。

**Clerkアカウントを作成**

- https://dashboard.clerk.com/ に移動して「Add Application」をクリック
- アプリケーションに名前を付けて、ユーザーに提供するサインインプロバイダーを選択
- Create Application
- `.env.local`に`VITE_CLERK_PUBLISHABLE_KEY`と`CLERK_SECRET_KEY`を追加

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_***
CLERK_SECRET_KEY=sk_***
```

- JWT Templatesに移動して新しいConvex Templateを作成
- 以下で使用するJWKSエンドポイントURLをコピー

```sh
npx convex env set CLERK_ISSUER_URL # 例: https://your-issuer-url.clerk.accounts.dev/
```

### フロントエンドをVercelにデプロイ

- Vercelでアカウントを登録してから[Vercel CLIをインストール](https://vercel.com/docs/cli)
- **Github Codespacesを使用している場合**: codespaces cliから`vercel login`を実行して[Vercel CLIをインストール](https://vercel.com/docs/cli)して認証する必要があります
- `vercel --prod`でアプリをVercelにデプロイ

## クラウドデプロイからローカル推論を使用する

会話生成に[Ollama](https://github.com/jmorganca/ollama)を使用することをサポートしています。Webからアクセス可能にするには、TunnelmoleやNgrokなどを使用して、クラウドバックエンドがローカルマシンで実行されているOllamaにリクエストを送信できるようにします。

手順:

1. TunnelmoleまたはNgrokをセットアップ
2. OllamaエンドポイントをConvexに追加
   ```sh
   npx convex env set OLLAMA_HOST # 前のステップからのtunnelmole/ngrokユニークURL
   ```
3. Ollamaドメインを更新。Ollamaには許可されたドメインのリストがあります。ngrokドメインを追加してトラフィックが拒否されないようにします。詳細は[ollama.ai](https://ollama.ai)を参照。

### Tunnelmoleを使用

[Tunnelmole](https://github.com/robbie-cahill/tunnelmole-client)はオープンソースのトンネリングツールです。

以下のオプションのいずれかを使用してTunnelmoleをインストールできます:

- NPM: `npm install -g tunnelmole`
- Linux: `curl -s https://tunnelmole.com/sh/install-linux.sh | sudo bash`
- Mac:
  `curl -s https://tunnelmole.com/sh/install-mac.sh --output install-mac.sh && sudo bash install-mac.sh`
- Windows: NPMでインストールするか、NodeJSがインストールされていない場合は、[こちら](https://tunnelmole.com/downloads/tmole.exe)からWindows用の`exe`ファイルをダウンロードしてPATHのどこかに置く

Tunnelmoleをインストールしたら、以下のコマンドを実行:

```
tmole 11434
```

このコマンドを実行するとTunnelmoleはユニークなURLを出力します。

### Ngrokを使用

Ngrokは人気のあるクローズドソーストンネリングツールです。

- [Ngrokをインストール](https://ngrok.com/docs/getting-started/)

ngrokをインストールして認証したら、以下のコマンドを実行:

```
ngrok http http://localhost:11434
```

このコマンドを実行するとNgrokはユニークなURLを出力します。

## トラブルシューティング

### データベースをワイプして最初からやり直す

以下を実行してデータベースをワイプできます:

```sh
npx convex run testing:wipeAllTables
```

その後、以下でリセット:

```sh
npx convex run init
```

### 互換性のないNode.jsバージョン

アプリケーション起動時にconvexサーバーでnodeバージョンエラーが発生した場合、最も安定しているnode version 18を使用してください。方法の1つは[nvmをインストール](https://nodejs.org/en/download/package-manager)して`nvm install 18`と`nvm use 18`を実行することです。

### Ollamaへの接続

バックエンドがOllamaと通信できない問題がある場合、セットアップによってデバッグ方法が異なります:

1. Windows上で直接実行している場合は、[Windows Ollama接続の問題](#windows-ollama接続の問題)を参照
2. **Docker**を使用している場合は、[DockerからOllamaへの接続の問題](#dockerからollamaへの接続の問題)を参照
3. ローカルで実行している場合、以下を試せます:

```sh
npx convex env set OLLAMA_HOST http://localhost:11434
```

デフォルトではホストは`http://127.0.0.1:11434`に設定されています。一部のシステムは`localhost`を好みます ¯\_(ツ)\_/¯

### Windows Ollama接続の問題

[Windows](#windowsインストール)と通常の[インストール](#インストール)手順に従った後、上記がうまくいかない場合、Dockerを使用して**いない**ことを前提に、以下を試せます。

Dockerを使用している場合は、[次のセクション](#dockerからollamaへの接続の問題)を参照してください。

Windows上で直接実行する場合、以下を試せます:

1. `unzip`と`socat`をインストール:

   ```sh
   sudo apt install unzip socat
   ```

2. Ollama用にポートをブリッジするために`socat`を設定

   以下のコマンドを実行してポートをブリッジ:

   ```sh
   socat TCP-LISTEN:11434,fork TCP:$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):11434 &
   ```

3. 動作しているかテスト:

   ```sh
   curl http://127.0.0.1:11434
   ```

   OKと応答すれば、Ollama APIにアクセス可能です。

### DockerからOllamaへの接続の問題

バックエンドがOllamaと通信できない問題がある場合、いくつか確認することがあります:

1. Dockerは少なくともバージョン18.03ですか？これにより、`host.docker.internal`ホスト名を使用してコンテナ内からホストに接続できます。

2. Ollamaは実行していますか？コンテナの外から`curl http://localhost:11434`を実行して確認できます。

3. Ollamaはコンテナ内からアクセス可能ですか？`docker compose exec backend curl http://host.docker.internal:11434`を実行して確認できます。

1と2が動作するが3が動作しない場合、`socat`を使用してコンテナ内からホストで実行されているOllamaへトラフィックをブリッジできます。

1. ホストのIPアドレス（Docker IPではなく）で`socat`を設定

   ```sh
   docker compose exec backend /bin/bash
   HOST_IP=YOUR-HOST-IP
   socat TCP-LISTEN:11434,fork TCP:$HOST_IP:11434
   ```

   これを実行し続けます。

2. その後、コンテナの外から:

   ```sh
   npx convex env set OLLAMA_HOST http://localhost:11434
   ```

3. 動作しているかテスト:

   ```sh
   docker compose exec backend curl http://localhost:11434
   ```

   OKと応答すれば、Ollama APIにアクセス可能です。そうでなければ、前の2つを`http://127.0.0.1:11434`に変更してみてください。

### インタラクティブDockerターミナルの起動

コンテナ内を調査したい場合、`frontend`、`backend`、`dashboard`サービス用にインタラクティブDockerターミナルを起動できます:

```bash
docker compose exec frontend /bin/bash
```

コンテナを終了するには、`exit`を実行します。

### ブラウザリストの更新

```bash
docker compose exec frontend npx update-browserslist-db@latest
```

# 🧑‍🏫 Convexとは？

[Convex](https://convex.dev)は、[TypeScript](https://docs.convex.dev/typescript)で[データベーススキーマ](https://docs.convex.dev/database/schemas)と[サーバー関数](https://docs.convex.dev/functions)を書けるビルトインデータベースを持つホスト型バックエンドプラットフォームです。サーバーサイドのデータベース[クエリ](https://docs.convex.dev/functions/query-functions)は自動的にデータを[キャッシュ](https://docs.convex.dev/functions/query-functions#caching--reactivity)して[サブスクライブ](https://docs.convex.dev/client/react#reactivity)し、[Reactクライアント](https://docs.convex.dev/client/react)の[リアルタイム`useQuery`フック](https://docs.convex.dev/client/react#fetching-data)を動かします。[Python](https://docs.convex.dev/client/python)、[Rust](https://docs.convex.dev/client/rust)、[ReactNative](https://docs.convex.dev/client/react-native)、[Node](https://docs.convex.dev/client/javascript)用のクライアントもあり、簡単な[HTTP API](https://docs.convex.dev/http-api/)もあります。

データベースは[NoSQLスタイルのドキュメント](https://docs.convex.dev/database/document-storage)をサポートし、[オプトインスキーマ検証](https://docs.convex.dev/database/schemas)、[リレーションシップ](https://docs.convex.dev/database/document-ids)、[カスタムインデックス](https://docs.convex.dev/database/indexes/)（ネストされたオブジェクトのフィールドを含む）があります。

[`query`](https://docs.convex.dev/functions/query-functions)と[`mutation`](https://docs.convex.dev/functions/mutation-functions)サーバー関数は、データベースへのトランザクショナルで低遅延のアクセスを持ち、[決定性ガードレール](https://docs.convex.dev/functions/runtimes#using-randomness-and-time-in-queries-and-mutations)を持つ[`v8`ランタイム](https://docs.convex.dev/functions/runtimes)を活用して、市場で最強のACID保証を提供します：即時一貫性、直列化可能分離、[楽観的マルチバージョン同時実行制御](https://docs.convex.dev/database/advanced/occ)（OCC / MVCC）による自動競合解決。

[`action`サーバー関数](https://docs.convex.dev/functions/actions)は外部APIにアクセスでき、[最適化された`v8`ランタイム](https://docs.convex.dev/functions/runtimes)または[より柔軟な`node`ランタイム](https://docs.convex.dev/functions/runtimes#nodejs-runtime)で他の副作用と非決定性を可能にします。

関数は[スケジューリング](https://docs.convex.dev/scheduling/scheduled-functions)と[cronジョブ](https://docs.convex.dev/scheduling/cron-jobs)を介してバックグラウンドで実行できます。

開発はクラウドファーストで、[CLI](https://docs.convex.dev/cli)による[サーバー関数編集のホットリロード](https://docs.convex.dev/cli#run-the-convex-dev-server)、[プレビューデプロイメント](https://docs.convex.dev/production/hosting/preview-deployments)、[ロギングと例外報告の統合](https://docs.convex.dev/production/integrations/)があります。[データを閲覧・編集](https://docs.convex.dev/dashboard/deployments/data)、[環境変数を編集](https://docs.convex.dev/production/environment-variables)、[ログを見る](https://docs.convex.dev/dashboard/deployments/logs)、[サーバー関数を実行](https://docs.convex.dev/dashboard/deployments/functions)などができる[ダッシュボードUI](https://docs.convex.dev/dashboard)があります。

[リアクティブページネーション](https://docs.convex.dev/database/pagination)、[ファイルストレージ](https://docs.convex.dev/file-storage)、[リアクティブテキスト検索](https://docs.convex.dev/text-search)、[ベクトル検索](https://docs.convex.dev/vector-search)、[httpsエンドポイント](https://docs.convex.dev/functions/http-actions)（webhooks用）、[スナップショットインポート/エクスポート](https://docs.convex.dev/database/import-export/)、[ストリーミングインポート/エクスポート](https://docs.convex.dev/production/integrations/streaming-import-export)、[関数引数](https://docs.convex.dev/functions/args-validation)と[データベースデータ](https://docs.convex.dev/database/schemas#schema-validation)の[ランタイム検証](https://docs.convex.dev/database/schemas#validators)用のビルトイン機能があります。

すべてが自動的にスケールし、[無料で始められます](https://www.convex.dev/plans)。
