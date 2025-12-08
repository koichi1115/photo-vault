//
//  PhotoViewModel.swift
//  GlacierPhotoVault
//
//  Created by Claude
//

import Foundation
import SwiftUI
import Combine

@MainActor
class PhotoViewModel: ObservableObject {
    @Published var photos: [Photo] = []
    @Published var stats: PhotoStats?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let userId: String
    private let apiClient = APIClient.shared

    init(userId: String = "demo-user") {
        self.userId = userId
    }

    func loadPhotos() async {
        isLoading = true
        errorMessage = nil

        do {
            photos = try await apiClient.getUserPhotos(userId: userId)
        } catch {
            errorMessage = "写真の読み込みに失敗しました: \(error.localizedDescription)"
        }

        isLoading = false
    }

    func loadStats() async {
        do {
            stats = try await apiClient.getUserStats(userId: userId)
        } catch {
            print("Stats load error: \(error)")
        }
    }

    func uploadPhoto(image: UIImage, title: String?, description: String?, tags: [String]) async {
        isLoading = true
        errorMessage = nil

        do {
            let photo = try await apiClient.uploadPhoto(
                userId: userId,
                image: image,
                title: title,
                description: description,
                tags: tags
            )
            photos.insert(photo, at: 0)
            await loadStats()
        } catch {
            errorMessage = "アップロードに失敗しました: \(error.localizedDescription)"
        }

        isLoading = false
    }

    func requestRestore(photoId: String, tier: String) async {
        errorMessage = nil

        do {
            let response = try await apiClient.requestRestore(photoId: photoId, tier: tier)
            await loadPhotos()
            errorMessage = response.message
        } catch {
            errorMessage = "復元リクエストに失敗しました: \(error.localizedDescription)"
        }
    }

    func checkRestoreStatus(photoId: String) async {
        do {
            let status = try await apiClient.checkRestoreStatus(photoId: photoId)
            if let index = photos.firstIndex(where: { $0.id == photoId }) {
                var updatedPhoto = photos[index]
                // Note: This is a simplified update, in a real app you'd fetch the full photo object
                photos[index] = updatedPhoto
            }
            await loadPhotos()
        } catch {
            errorMessage = "状態確認に失敗しました: \(error.localizedDescription)"
        }
    }

    func getDownloadURL(photoId: String) async -> String? {
        do {
            return try await apiClient.getDownloadURL(photoId: photoId)
        } catch {
            errorMessage = "ダウンロードURLの取得に失敗しました: \(error.localizedDescription)"
            return nil
        }
    }

    func refresh() async {
        await loadPhotos()
        await loadStats()
    }
}
