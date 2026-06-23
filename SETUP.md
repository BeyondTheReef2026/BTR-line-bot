# BTR LINEシナリオBOT セットアップ手順

## 概要

このフォルダ（`btr-line-bot`）をGitHubにアップロードし、Vercelでデプロイするだけで動きます。
所要時間：約1〜2時間（初めての場合）

---

## 手順1：LINE Developersでチャネルを作る

1. https://developers.line.biz/ja/ を開いてLINEアカウントでログイン
2. 左のメニューから「プロバイダー」→「作成」（または既存のものを選択）
3. 「新しいチャネルを作成」→「Messaging API」を選択
4. チャネル名など入力して作成

**取得するもの（メモしておく）：**
- 「Messaging API設定」タブ → **チャネルアクセストークン**（「発行」ボタンで作成）
- 「チャネル基本設定」タブ → **チャネルシークレット**

**重要な設定：**
- 「Messaging API設定」→「Webhookの利用」→ **オン**
- 「応答メッセージ」→ **オフ**（LINE公式アカウントマネージャー側でも無効化する）

---

## 手順2：GitHubにアップロード

1. https://github.com を開いてアカウント作成またはログイン
2. 右上「+」→「New repository」→ リポジトリ名（例：`btr-line-bot`）→「Create」
3. 「uploading an existing file」リンクをクリック
4. この `btr-line-bot` フォルダの中身をすべてドラッグ＆ドロップ
5. 「Commit changes」をクリック

---

## 手順3：Vercelにデプロイ

1. https://vercel.com を開いてGitHubアカウントでログイン
2. 「Add New Project」→ さっき作ったGitHubリポジトリを選択→「Import」
3. **「Environment Variables」セクションで以下を入力：**

   | 名前 | 値 |
   |------|-----|
   | `LINE_CHANNEL_ACCESS_TOKEN` | チャネルアクセストークン |
   | `LINE_CHANNEL_SECRET` | チャネルシークレット |
   | `LINE_NOTIFY_GROUP_ID` | （後で追加・手順5参照） |

4. 「Deploy」をクリック → デプロイ完了を待つ（2〜3分）
5. デプロイ後に表示される **URLをメモ**（例：`https://btr-line-bot.vercel.app`）

**Vercel KV（データベース）の追加：**
1. Vercelのプロジェクトページ → 「Storage」タブ
2. 「Create Database」→「KV」→「Create」
3. 自動的に環境変数（`KV_REST_API_URL` 等）が設定される

---

## 手順4：Webhook URLをLINE Developersに設定

1. LINE Developers → 「Messaging API設定」タブ
2. 「Webhook URL」に入力：`https://{あなたのVercelURL}/api/webhook`
   - 例：`https://btr-line-bot.vercel.app/api/webhook`
3. 「更新」→「検証」ボタンをクリック → 「成功」と出ればOK

---

## 手順5：担当者LINEグループIDを取得する

1. LINEアプリでグループを作成（例：「BTR問い合わせ通知」）
2. 担当者（かえさんなど）をグループに招待
3. LINEチャネルのQRコードからBotをグループに招待
4. 試しにグループでメッセージを送る
5. Vercelのダッシュボード → 「Logs」タブ → ログを確認してグループIDを探す
   - `groupId` として表示される（`C` から始まる文字列）
6. Vercel → 「Settings」→「Environment Variables」→ `LINE_NOTIFY_GROUP_ID` に追加
7. Vercelを再デプロイ（「Deployments」→ 最新のデプロイ → 「...」→「Redeploy」）

---

## 手順6：動作テスト

1. 自分のLINEで公式アカウントに友だち追加（または既存の友だち登録で）
2. 何かメッセージを送る → カテゴリ選択ボタンが出ればOK
3. 各カテゴリをタップして動作確認
4. 「その他のご相談」で名前→電話番号→内容を入力 → グループに通知が届くか確認

---

## トラブル時

- Webhook検証で「失敗」→ URLが間違っているか、Vercelデプロイが完了していない
- ボットが返答しない→ Vercelの「Logs」でエラーを確認
- 担当者グループに通知が来ない→ `LINE_NOTIFY_GROUP_ID` の値を確認

サポートが必要な場合はClaudeに相談してください。
