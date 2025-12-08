# Glacier Photo Vault - デジタル貸金庫

AWS Glacier Deep Archiveを使用した、取り出し時のみ課金される写真保管サービスです。

## 特徴

### 💰 コスト効率
- **超低コストの長期保管**: S3標準ストレージの約1/4のコスト
- **アップロード時は無料**: 写真の保管に課金なし
- **取り出し時のみ課金**: 必要な時だけコストが発生

### 🔒 安全性
- **AWSの堅牢なインフラ**: 99.999999999%(イレブンナイン)の耐久性
- **自動暗号化**: 保管データは自動的に暗号化
- **長期保存に最適**: デジタル貸金庫として理想的

### ⏰ 復元オプション
- **Standard (標準)**: 12時間で復元
- **Bulk (バルク)**: 48時間で復元（低コスト）

## セットアップ

### 1. AWS設定

#### S3バケットの作成
```bash
aws s3 mb s3://glacier-photo-vault --region us-east-1
```

#### ライフサイクルポリシーの設定
S3バケットに以下のライフサイクルポリシーを設定します：

```json
{
  "Rules": [
    {
      "Id": "MoveToGlacierDeepArchive",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 0,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ]
    }
  ]
}
```

または、AWS CLIで設定：
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket glacier-photo-vault \
  --lifecycle-configuration file://lifecycle-policy.json
```

#### IAM権限の設定
以下の権限を持つIAMユーザーまたはロールを作成：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:RestoreObject",
        "s3:HeadObject"
      ],
      "Resource": [
        "arn:aws:s3:::glacier-photo-vault",
        "arn:aws:s3:::glacier-photo-vault/*"
      ]
    }
  ]
}
```

### 2. 環境変数の設定

`.env`ファイルを作成（`.env.example`を参考に）：

```bash
cp .env.example .env
```

必要な環境変数を設定：
- `AWS_REGION`: AWSリージョン
- `AWS_ACCESS_KEY_ID`: AWSアクセスキー
- `AWS_SECRET_ACCESS_KEY`: AWSシークレットキー
- `S3_BUCKET_NAME`: S3バケット名

### 3. 依存関係のインストール

```bash
npm install
```

### 4. アプリケーションの起動

```bash
npm run dev
```

## 使い方

### 写真のアップロード

1. 「Photo Vault」タブを開く
2. 「写真をアップロード」セクションでファイルを選択
3. タイトル、説明、タグを入力（オプション）
4. 「Glacier Deep Archiveにアップロード」をクリック

写真はすぐにGlacier Deep Archiveに保管され、`ARCHIVED`ステータスになります。

### 写真の復元

1. 保管中の写真リストから復元したい写真を選択
2. 復元オプションを選択：
   - **復元 (12時間)**: Standard tier - 12時間で利用可能
   - **復元 (48時間・低コスト)**: Bulk tier - 48時間で利用可能（低コスト）
3. 復元リクエストが送信されます

### 復元状態の確認

復元中の写真は「状態確認」ボタンで進捗を確認できます。

### 写真のダウンロード

復元が完了すると、「ダウンロード」ボタンが表示されます。
復元されたコピーは7日間利用可能です。

## API エンドポイント

### POST `/api/photos/upload`
写真をアップロード

**Request:**
- `photo`: 画像ファイル (multipart/form-data)
- `userId`: ユーザーID
- `title`: タイトル (オプション)
- `description`: 説明 (オプション)
- `tags`: タグ (JSON配列)

**Response:**
```json
{
  "success": true,
  "photo": { ... },
  "message": "Photo uploaded to Glacier Deep Archive successfully"
}
```

### GET `/api/photos/user/:userId`
ユーザーの全写真を取得

### POST `/api/photos/:photoId/restore`
写真の復元をリクエスト

**Request:**
```json
{
  "tier": "Standard" | "Bulk"
}
```

### GET `/api/photos/:photoId/restore/status`
復元状態を確認

### GET `/api/photos/:photoId/download`
復元済み写真のダウンロードURL取得

### GET `/api/photos/user/:userId/stats`
ユーザーの統計情報取得

## コスト見積もり

### ストレージコスト (Glacier Deep Archive)
- 約 $0.00099 per GB / 月
- 100GBの写真: 約 $0.10 / 月

### 復元コスト
- Standard (12時間): 約 $0.02 per GB
- Bulk (48時間): 約 $0.0025 per GB

### データ転送コスト
- ダウンロード: 最初の1GB無料、その後 $0.09 per GB

## 技術スタック

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite
- **Storage**: AWS S3 Glacier Deep Archive
- **SDK**: AWS SDK for JavaScript v3

## セキュリティ考慮事項

1. AWS認証情報は`.env`ファイルで管理し、Gitにコミットしない
2. 本番環境ではIAMロールの使用を推奨
3. S3バケットのパブリックアクセスはブロック
4. HTTPS経由でのアップロード/ダウンロードを強制

## 制限事項

- Glacier Deep Archiveからの復元には最低12時間必要
- 復元されたコピーは指定期間（デフォルト7日）後に自動削除
- 最小保管期間: 180日（早期削除には追加料金）
- 最小オブジェクトサイズ: 40KB（小さいファイルは40KBとして課金）

## トラブルシューティング

### アップロードエラー
- AWS認証情報が正しいか確認
- S3バケットが存在するか確認
- IAM権限が適切に設定されているか確認

### 復元が完了しない
- 復元には12-48時間かかります
- 「状態確認」ボタンで進捗を確認
- AWS Consoleでジョブステータスを確認

## ライセンス

MIT
