# Glacier Photo Vault - iOS App

AWS Glacier Deep Archiveを使った写真保管サービスのiOSネイティブアプリです。

## 機能

### ✨ 主要機能
- 📸 **写真アップロード**: カメラロールから写真を選択してGlacier Deep Archiveに保管
- 📊 **統計表示**: 総写真数、総容量、ステータス別の集計
- 🔄 **復元リクエスト**: Standard（12時間）とBulk（48時間）の2つの復元オプション
- ⬇️ **ダウンロード**: 復元完了後の写真ダウンロード
- 🏷️ **メタデータ管理**: タイトル、説明、タグの追加
- 🔍 **ステータス確認**: 復元進捗のリアルタイム確認

### 📱 ネイティブ機能
- SwiftUI による最新のUI設計
- Async/Await による非同期処理
- Pull to Refresh でデータ更新
- ネイティブ画像ピッカー統合
- ダークモード対応（自動）

## 必要要件

- iOS 16.0 以上
- Xcode 15.0 以上
- Swift 5.9 以上
- バックエンドサーバーが起動していること

## セットアップ

### 1. Xcodeでプロジェクトを開く

```bash
cd ios/GlacierPhotoVault
open GlacierPhotoVault.xcodeproj
```

### 2. APIのベースURLを設定

`APIClient.swift` の `baseURL` を環境に合わせて変更：

```swift
// Development (localhost)
private let baseURL = "http://localhost:3001/api/photos"

// Production
private let baseURL = "https://your-api-domain.com/api/photos"
```

**注意**: ローカル開発の場合、シミュレーターでは `localhost` が使えます。実機の場合は、コンピューターのIPアドレスを使用してください（例: `http://192.168.1.100:3001/api/photos`）。

### 3. Info.plistの確認

`NSPhotoLibraryUsageDescription` が設定されていることを確認してください（既に設定済み）。

### 4. ビルド＆実行

1. Xcodeでターゲットデバイスを選択（シミュレーターまたは実機）
2. ⌘ + R でビルド＆実行

## プロジェクト構造

```
GlacierPhotoVault/
├── GlacierPhotoVault.xcodeproj/     # Xcodeプロジェクトファイル
└── GlacierPhotoVault/
    ├── GlacierPhotoVaultApp.swift   # アプリエントリーポイント
    ├── Models.swift                  # データモデル定義
    ├── APIClient.swift               # API通信クライアント
    ├── PhotoViewModel.swift          # ビューモデル（状態管理）
    ├── ContentView.swift             # メインビュー
    ├── PhotoCardView.swift           # 写真カードビュー
    ├── UploadPhotoView.swift         # アップロードビュー
    └── Info.plist                    # アプリ設定
```

## 主要コンポーネント

### Models.swift
- `Photo`: 写真のデータモデル
- `PhotoStatus`: 写真のステータス（アーカイブ済み、復元中など）
- `PhotoStats`: 統計情報
- APIレスポンス型

### APIClient.swift
- バックエンドAPIとの通信を管理
- マルチパートフォームデータによる写真アップロード
- 復元リクエスト、ステータス確認、ダウンロードURL取得

### PhotoViewModel.swift
- `@ObservableObject` を使った状態管理
- 写真一覧の読み込み、アップロード、復元操作
- エラーハンドリング

### ContentView.swift
- メイン画面
- 統計情報の表示
- 写真一覧表示
- Pull to Refreshによる更新

### PhotoCardView.swift
- 各写真の詳細カード
- ステータスバッジ表示
- 復元・ダウンロードボタン

### UploadPhotoView.swift
- 写真選択とアップロード
- メタデータ入力（タイトル、説明、タグ）
- ネイティブ画像ピッカー

## 使い方

### 写真のアップロード

1. 右上の **+** ボタンをタップ
2. **写真を選択** をタップしてカメラロールから選択
3. タイトル、説明、タグを入力（オプション）
4. **Glacier Deep Archiveにアップロード** をタップ

### 写真の復元

1. アーカイブ済みの写真カードで **復元** ボタンをタップ
2. 復元オプションを選択：
   - **Standard (12時間)**: 通常の復元速度
   - **Bulk (48時間・低コスト)**: より安価な復元オプション

### 復元状態の確認

復元リクエスト後、**状態確認** ボタンで進捗を確認できます。

### 写真のダウンロード

復元が完了すると **ダウンロード** ボタンが表示されます。タップするとSafariでダウンロードURLが開きます。

## トラブルシューティング

### シミュレーターでネットワークエラーが発生する

- バックエンドサーバーが起動していることを確認
- `Info.plist` の `NSAppTransportSecurity` 設定を確認（HTTP接続を許可）

### 実機でlocalhostに接続できない

- `APIClient.swift` のベースURLをコンピューターのIPアドレスに変更
- 実機とコンピューターが同じWi-Fiネットワークに接続されていることを確認

### 写真選択時に権限エラーが出る

- 設定アプリで Photo Vault のフォトライブラリアクセス権限を確認
- `Info.plist` の `NSPhotoLibraryUsageDescription` が設定されていることを確認

## 今後の改善案

- [ ] オフライン対応（CoreDataでローカルキャッシュ）
- [ ] サムネイル表示
- [ ] 写真の検索・フィルタリング機能
- [ ] 一括アップロード
- [ ] プッシュ通知（復元完了時）
- [ ] Face ID / Touch ID による保護
- [ ] iCloud同期

## ライセンス

MIT

## 関連リンク

- [バックエンドAPI仕様](../README_GLACIER.md)
- [Webフロントエンド](../frontend/)
