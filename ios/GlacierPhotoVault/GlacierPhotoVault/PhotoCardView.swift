//
//  PhotoCardView.swift
//  GlacierPhotoVault
//
//  デジタル庁デザインシステム（DADS）準拠
//

import SwiftUI

struct PhotoCardView: View {
    let photo: Photo
    @ObservedObject var viewModel: PhotoViewModel
    @State private var showingRestoreOptions = false
    @State private var isDownloading = false

    var body: some View {
        VStack(alignment: .leading, spacing: DADSSpacing.md) {
            // Header
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: DADSSpacing.xxs) {
                    Text(photo.title ?? photo.originalName)
                        .font(DADSTypography.title3)
                        .foregroundColor(DADSColor.textPrimary)
                        .lineLimit(2)

                    HStack(spacing: DADSSpacing.xs) {
                        Image(systemName: "doc.fill")
                            .font(DADSTypography.small)
                            .foregroundColor(DADSColor.textSecondary)
                        Text(photo.formattedSize)
                            .font(DADSTypography.small)
                            .foregroundColor(DADSColor.textSecondary)
                    }
                }

                Spacer()

                StatusBadge(status: photo.status)
            }

            // Description
            if let description = photo.description {
                Text(description)
                    .font(DADSTypography.caption)
                    .foregroundColor(DADSColor.textSecondary)
                    .lineLimit(2)
                    .lineSpacing(2)
            }

            // Tags
            if !photo.tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: DADSSpacing.xs) {
                        ForEach(photo.tags, id: \.self) { tag in
                            HStack(spacing: 4) {
                                Image(systemName: "tag.fill")
                                    .font(DADSTypography.small)
                                Text(tag)
                                    .font(DADSTypography.small)
                            }
                            .padding(.horizontal, DADSSpacing.sm)
                            .padding(.vertical, DADSSpacing.xxs)
                            .background(DADSColor.primary.opacity(0.1))
                            .foregroundColor(DADSColor.primary)
                            .cornerRadius(DADSRadius.large)
                        }
                    }
                }
            }

            // Divider
            Rectangle()
                .fill(DADSColor.divider)
                .frame(height: 1)

            // Info
            HStack(spacing: DADSSpacing.md) {
                HStack(spacing: DADSSpacing.xxs) {
                    Image(systemName: "calendar")
                        .font(DADSTypography.small)
                        .foregroundColor(DADSColor.textSecondary)
                    Text(photo.uploadDate, style: .date)
                        .font(DADSTypography.small)
                        .foregroundColor(DADSColor.textSecondary)
                }

                if let restoredUntil = photo.restoredUntilDate {
                    Spacer()
                    HStack(spacing: DADSSpacing.xxs) {
                        Image(systemName: "clock.fill")
                            .font(DADSTypography.small)
                            .foregroundColor(DADSColor.warning)
                        Text(restoredUntil, style: .date)
                            .font(DADSTypography.small)
                            .foregroundColor(DADSColor.warning)
                    }
                }
            }

            // Actions
            actionButtons
        }
        .padding(DADSSpacing.md)
        .background(DADSColor.backgroundCard)
        .cornerRadius(DADSRadius.large)
        .shadow(
            color: DADSShadow.small.color,
            radius: DADSShadow.small.radius,
            x: DADSShadow.small.x,
            y: DADSShadow.small.y
        )
        .confirmationDialog("復元方法を選択してください", isPresented: $showingRestoreOptions, titleVisibility: .visible) {
            Button("Standard（12時間）") {
                requestRestore(tier: "Standard")
            }
            Button("Bulk（48時間・低コスト）") {
                requestRestore(tier: "Bulk")
            }
            Button("キャンセル", role: .cancel) {}
        } message: {
            Text("写真の復元方法を選んでください。復元には時間がかかります。")
        }
    }

    @ViewBuilder
    private var actionButtons: some View {
        HStack(spacing: DADSSpacing.sm) {
            switch photo.status {
            case .archived:
                Button(action: { showingRestoreOptions = true }) {
                    HStack {
                        Image(systemName: "arrow.down.circle.fill")
                        Text("復元する")
                            .font(DADSTypography.bodyBold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, DADSSpacing.md)
                }
                .dadsPrimaryButton()
                .accessibilityLabel("写真を復元する")

            case .restoreRequested, .restoring:
                Button(action: { checkStatus() }) {
                    HStack {
                        Image(systemName: "arrow.clockwise")
                        Text("状態を確認")
                            .font(DADSTypography.bodyBold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, DADSSpacing.md)
                }
                .dadsSecondaryButton()
                .accessibilityLabel("復元状態を確認する")

                Text(photo.status == .restoreRequested ? "復元リクエスト済み" : "復元中...")
                    .font(DADSTypography.caption)
                    .foregroundColor(DADSColor.warning)
                    .frame(maxWidth: .infinity)

            case .restored:
                Button(action: { downloadPhoto() }) {
                    if isDownloading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, DADSSpacing.md)
                    } else {
                        HStack {
                            Image(systemName: "arrow.down.to.line.circle.fill")
                            Text("ダウンロード")
                                .font(DADSTypography.bodyBold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, DADSSpacing.md)
                    }
                }
                .dadsPrimaryButton(disabled: isDownloading)
                .accessibilityLabel("復元済み写真をダウンロードする")

            case .failed:
                Text("処理が失敗しました")
                    .font(DADSTypography.caption)
                    .foregroundColor(DADSColor.error)
                    .frame(maxWidth: .infinity)

            default:
                EmptyView()
            }
        }
    }

    private func requestRestore(tier: String) {
        Task {
            await viewModel.requestRestore(photoId: photo.id, tier: tier)
        }
    }

    private func checkStatus() {
        Task {
            await viewModel.checkRestoreStatus(photoId: photo.id)
        }
    }

    private func downloadPhoto() {
        isDownloading = true
        Task {
            if let urlString = await viewModel.getDownloadURL(photoId: photo.id),
               let url = URL(string: urlString) {
                await UIApplication.shared.open(url)
            }
            isDownloading = false
        }
    }
}

struct StatusBadge: View {
    let status: PhotoStatus

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)

            Text(status.displayName)
                .font(DADSTypography.smallBold)
        }
        .padding(.horizontal, DADSSpacing.sm)
        .padding(.vertical, DADSSpacing.xxs)
        .background(statusColor.opacity(0.15))
        .foregroundColor(statusColor)
        .cornerRadius(DADSRadius.large)
    }

    private var statusColor: Color {
        switch status {
        case .uploading:
            return DADSColor.info
        case .archived:
            return DADSColor.statusArchived
        case .restoreRequested, .restoring:
            return DADSColor.statusRestoring
        case .restored:
            return DADSColor.statusRestored
        case .failed:
            return DADSColor.statusFailed
        }
    }
}

#Preview {
    VStack {
        PhotoCardView(
            photo: Photo(
                id: "1",
                userId: "user1",
                filename: "photo.jpg",
                originalName: "夏の思い出.jpg",
                mimeType: "image/jpeg",
                size: 1024000,
                title: "夏の思い出",
                description: "美しい海辺の夕日。家族との素晴らしい時間を過ごしました。",
                tags: ["旅行", "海", "夕日"],
                s3Key: "key",
                glacierArchiveId: nil,
                status: .archived,
                uploadedAt: Date().timeIntervalSince1970 * 1000,
                restoredUntil: nil,
                thumbnailUrl: nil
            ),
            viewModel: PhotoViewModel()
        )

        PhotoCardView(
            photo: Photo(
                id: "2",
                userId: "user1",
                filename: "photo2.jpg",
                originalName: "restored.jpg",
                mimeType: "image/jpeg",
                size: 2048000,
                title: "復元済み写真",
                description: nil,
                tags: [],
                s3Key: "key",
                glacierArchiveId: nil,
                status: .restored,
                uploadedAt: Date().timeIntervalSince1970 * 1000,
                restoredUntil: (Date().timeIntervalSince1970 + 86400 * 7) * 1000,
                thumbnailUrl: nil
            ),
            viewModel: PhotoViewModel()
        )
    }
    .padding()
    .background(DADSColor.backgroundGray)
}
