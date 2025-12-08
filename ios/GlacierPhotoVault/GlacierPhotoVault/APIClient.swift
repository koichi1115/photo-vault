//
//  APIClient.swift
//  GlacierPhotoVault
//
//  Created by Claude
//

import Foundation
import UIKit

class APIClient {
    static let shared = APIClient()

    // Change this to your backend URL
    private let baseURL = "http://localhost:3001/api/photos"

    private init() {}

    // MARK: - Photo Operations

    func uploadPhoto(
        userId: String,
        image: UIImage,
        title: String?,
        description: String?,
        tags: [String]
    ) async throws -> Photo {
        guard let url = URL(string: "\(baseURL)/upload") else {
            throw APIError.invalidURL
        }

        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            throw APIError.invalidImage
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add photo
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"photo\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)

        // Add userId
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"userId\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(userId)\r\n".data(using: .utf8)!)

        // Add title if present
        if let title = title {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"title\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(title)\r\n".data(using: .utf8)!)
        }

        // Add description if present
        if let description = description {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"description\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(description)\r\n".data(using: .utf8)!)
        }

        // Add tags
        if let tagsJSON = try? JSONEncoder().encode(tags),
           let tagsString = String(data: tagsJSON, encoding: .utf8) {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"tags\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(tagsString)\r\n".data(using: .utf8)!)
        }

        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }

        let photoResponse = try JSONDecoder().decode(PhotoResponse.self, from: data)

        if photoResponse.success, let photo = photoResponse.photo {
            return photo
        } else {
            throw APIError.serverError
        }
    }

    func getUserPhotos(userId: String) async throws -> [Photo] {
        guard let url = URL(string: "\(baseURL)/user/\(userId)") else {
            throw APIError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }

        let photosResponse = try JSONDecoder().decode(PhotosResponse.self, from: data)
        return photosResponse.photos
    }

    func requestRestore(photoId: String, tier: String = "Standard") async throws -> RestoreResponse {
        guard let url = URL(string: "\(baseURL)/\(photoId)/restore") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["tier": tier]
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }

        return try JSONDecoder().decode(RestoreResponse.self, from: data)
    }

    func checkRestoreStatus(photoId: String) async throws -> PhotoStatus {
        guard let url = URL(string: "\(baseURL)/\(photoId)/restore/status") else {
            throw APIError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }

        let statusResponse = try JSONDecoder().decode(StatusResponse.self, from: data)
        return statusResponse.status
    }

    func getDownloadURL(photoId: String) async throws -> String {
        guard let url = URL(string: "\(baseURL)/\(photoId)/download") else {
            throw APIError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }

        let downloadResponse = try JSONDecoder().decode(DownloadResponse.self, from: data)
        return downloadResponse.downloadUrl
    }

    func getUserStats(userId: String) async throws -> PhotoStats {
        guard let url = URL(string: "\(baseURL)/user/\(userId)/stats") else {
            throw APIError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }

        let statsResponse = try JSONDecoder().decode(StatsResponse.self, from: data)
        return statsResponse.stats
    }
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidImage
    case serverError
    case decodingError

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "無効なURLです"
        case .invalidImage:
            return "画像の変換に失敗しました"
        case .serverError:
            return "サーバーエラーが発生しました"
        case .decodingError:
            return "データの解析に失敗しました"
        }
    }
}
