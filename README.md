# TabVault

Chrome拡張機能で、開いているタブをNotionデータベースに保存できます。

## 機能

- 現在開いている全てのタブをNotionに一括保存
- タブのタイトル、URL、保存日時を記録
- シンプルで使いやすいUI

## セットアップ

### 1. Notion Integration の作成

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「+ New integration」をクリック
3. 名前を入力（例: TabVault）
4. ワークスペースを選択
5. 「Submit」をクリック
6. **Internal Integration Secret** をコピー（`secret_` で始まる文字列）

### 2. Notionデータベースの作成

1. Notionで新しいページを作成
2. データベース（テーブル）を追加
3. 以下のプロパティを作成:
   - `Title` (タイトル型) - デフォルトで存在
   - `URL` (URL型) - 手動で追加
   - `Saved Date` (日付型) - 手動で追加
4. データベースのIDをコピー
   - URLから取得: `https://notion.so/workspace/DATABASE_ID?v=...`
   - `DATABASE_ID` の部分（32文字のハイフン区切り文字列）

### 3. Integrationをデータベースに接続

1. データベースページを開く
2. 右上の「...」メニューをクリック
3. 「接続」→「追加」
4. 作成したIntegration（TabVault）を選択

### 4. 拡張機能の設定

1. 拡張機能のアイコンをクリック
2. 「⚙️ 設定」ボタンをクリック
3. Integration Token と Database ID を入力
4. 「保存」をクリック

## 使い方

1. ブラウザでタブを開く
2. 拡張機能のアイコンをクリック
3. 「💾 全て保存する」ボタンをクリック
4. Notionデータベースにタブが保存されます

## 開発

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm run dev

# ビルド
pnpm run build

# テスト実行
pnpm run test

# リント & フォーマット
pnpm run lint
pnpm run format
```

## 技術スタック

- React 19 + TypeScript
- Vite
- Chrome Extension Manifest V3
- Notion API
- Vitest + Testing Library

## ライセンス

MIT
