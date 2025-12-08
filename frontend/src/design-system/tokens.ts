/**
 * デジタル庁デザインシステム（DADS）準拠のデザイントークン
 * 参考: https://design.digital.go.jp/dads/
 */

// カラーパレット
export const DADSColors = {
  // Primary Colors
  primary: '#0066CC',
  primaryDark: '#0052A3',
  primaryLight: '#3385D6',

  // Text Colors
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textDisabled: '#999999',

  // Background Colors
  background: '#FFFFFF',
  backgroundGray: '#F5F5F5',
  backgroundCard: '#FFFFFF',

  // Status Colors
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#D32F2F',
  info: '#0288D1',

  // Border & Divider
  border: '#E0E0E0',
  divider: '#EEEEEE',

  // Photo Status Colors
  statusArchived: '#757575',
  statusRestoring: '#F57C00',
  statusRestored: '#2E7D32',
  statusFailed: '#D32F2F',
} as const;

// タイポグラフィ
export const DADSTypography = {
  // Large Title
  largeTitle: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: '1.4',
  },

  // Titles
  title1: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '1.4',
  },
  title2: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: '1.4',
  },
  title3: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '1.4',
  },

  // Body
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '1.6',
  },
  bodyBold: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '1.6',
  },

  // Caption
  caption: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.5',
  },
  captionBold: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '1.5',
  },

  // Small
  small: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '1.5',
  },
  smallBold: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '1.5',
  },
} as const;

// スペーシング（8pxグリッドシステム）
export const DADSSpacing = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

// ボーダー半径
export const DADSRadius = {
  small: '4px',
  medium: '8px',
  large: '12px',
  xlarge: '16px',
} as const;

// シャドウ
export const DADSShadow = {
  small: '0 2px 4px rgba(0, 0, 0, 0.08)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
  large: '0 8px 16px rgba(0, 0, 0, 0.16)',
} as const;

// ブレークポイント
export const DADSBreakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

// ヘルパー関数：CSSスタイルオブジェクトの生成
export const createTypographyStyle = (variant: keyof typeof DADSTypography) => {
  return DADSTypography[variant];
};

// ヘルパー関数：ステータスカラーの取得
export const getStatusColor = (status: string): string => {
  const statusColorMap: Record<string, string> = {
    uploading: DADSColors.info,
    archived: DADSColors.statusArchived,
    restore_requested: DADSColors.statusRestoring,
    restoring: DADSColors.statusRestoring,
    restored: DADSColors.statusRestored,
    failed: DADSColors.statusFailed,
  };
  return statusColorMap[status] || DADSColors.textSecondary;
};
