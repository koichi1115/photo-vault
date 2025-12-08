//
//  DesignSystem.swift
//  GlacierPhotoVault
//
//  デジタル庁デザインシステム（DADS）準拠のデザイントークン
//  参考: https://design.digital.go.jp/dads/
//

import SwiftUI

/// デジタル庁デザインシステムに準拠したカラーパレット
enum DADSColor {
    // Primary Colors
    static let primary = Color(hex: "0066CC")           // メインカラー
    static let primaryDark = Color(hex: "0052A3")       // 濃いメインカラー
    static let primaryLight = Color(hex: "3385D6")      // 薄いメインカラー

    // Text Colors
    static let textPrimary = Color(hex: "1A1A1A")       // 本文
    static let textSecondary = Color(hex: "666666")     // 補助テキスト
    static let textDisabled = Color(hex: "999999")      // 無効状態

    // Background Colors
    static let background = Color(hex: "FFFFFF")        // 背景
    static let backgroundGray = Color(hex: "F5F5F5")    // グレー背景
    static let backgroundCard = Color(hex: "FFFFFF")    // カード背景

    // Status Colors
    static let success = Color(hex: "2E7D32")           // 成功
    static let warning = Color(hex: "F57C00")           // 警告
    static let error = Color(hex: "D32F2F")             // エラー
    static let info = Color(hex: "0288D1")              // 情報

    // Border & Divider
    static let border = Color(hex: "E0E0E0")            // ボーダー
    static let divider = Color(hex: "EEEEEE")           // 区切り線

    // Photo Status Colors (DADS準拠)
    static let statusArchived = Color(hex: "757575")    // アーカイブ済み
    static let statusRestoring = Color(hex: "F57C00")   // 復元中
    static let statusRestored = Color(hex: "2E7D32")    // 復元完了
    static let statusFailed = Color(hex: "D32F2F")      // 失敗
}

/// タイポグラフィ（フォントスタイル）
enum DADSTypography {
    // Large Title
    static let largeTitle = Font.system(size: 28, weight: .bold)

    // Titles
    static let title1 = Font.system(size: 24, weight: .bold)
    static let title2 = Font.system(size: 20, weight: .bold)
    static let title3 = Font.system(size: 18, weight: .semibold)

    // Body
    static let body = Font.system(size: 16, weight: .regular)
    static let bodyBold = Font.system(size: 16, weight: .semibold)

    // Caption
    static let caption = Font.system(size: 14, weight: .regular)
    static let captionBold = Font.system(size: 14, weight: .semibold)

    // Small
    static let small = Font.system(size: 12, weight: .regular)
    static let smallBold = Font.system(size: 12, weight: .semibold)
}

/// スペーシング（8pxグリッドシステム）
enum DADSSpacing {
    static let xxs: CGFloat = 4      // 4pt
    static let xs: CGFloat = 8       // 8pt
    static let sm: CGFloat = 12      // 12pt
    static let md: CGFloat = 16      // 16pt
    static let lg: CGFloat = 24      // 24pt
    static let xl: CGFloat = 32      // 32pt
    static let xxl: CGFloat = 48     // 48pt
}

/// ボーダー半径
enum DADSRadius {
    static let small: CGFloat = 4
    static let medium: CGFloat = 8
    static let large: CGFloat = 12
    static let xlarge: CGFloat = 16
}

/// シャドウ
struct DADSShadow {
    static let small = (color: Color.black.opacity(0.08), radius: CGFloat(4), x: CGFloat(0), y: CGFloat(2))
    static let medium = (color: Color.black.opacity(0.12), radius: CGFloat(8), x: CGFloat(0), y: CGFloat(4))
    static let large = (color: Color.black.opacity(0.16), radius: CGFloat(16), x: CGFloat(0), y: CGFloat(8))
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Modifiers

struct DADSCardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(DADSColor.backgroundCard)
            .cornerRadius(DADSRadius.medium)
            .shadow(
                color: DADSShadow.small.color,
                radius: DADSShadow.small.radius,
                x: DADSShadow.small.x,
                y: DADSShadow.small.y
            )
    }
}

struct DADSPrimaryButton: ViewModifier {
    let isDisabled: Bool

    func body(content: Content) -> some View {
        content
            .font(DADSTypography.bodyBold)
            .foregroundColor(.white)
            .padding(.vertical, DADSSpacing.md)
            .padding(.horizontal, DADSSpacing.lg)
            .frame(maxWidth: .infinity)
            .background(isDisabled ? DADSColor.textDisabled : DADSColor.primary)
            .cornerRadius(DADSRadius.medium)
    }
}

struct DADSSecondaryButton: ViewModifier {
    let isDisabled: Bool

    func body(content: Content) -> some View {
        content
            .font(DADSTypography.bodyBold)
            .foregroundColor(isDisabled ? DADSColor.textDisabled : DADSColor.primary)
            .padding(.vertical, DADSSpacing.md)
            .padding(.horizontal, DADSSpacing.lg)
            .frame(maxWidth: .infinity)
            .background(DADSColor.background)
            .overlay(
                RoundedRectangle(cornerRadius: DADSRadius.medium)
                    .stroke(isDisabled ? DADSColor.textDisabled : DADSColor.primary, lineWidth: 2)
            )
    }
}

// MARK: - View Extensions

extension View {
    func dadsCard() -> some View {
        modifier(DADSCardStyle())
    }

    func dadsPrimaryButton(disabled: Bool = false) -> some View {
        modifier(DADSPrimaryButton(isDisabled: disabled))
    }

    func dadsSecondaryButton(disabled: Bool = false) -> some View {
        modifier(DADSSecondaryButton(isDisabled: disabled))
    }
}
