/**
 * 主题系统类型定义
 */

/**
 * 主题名称
 */
export type ThemeName = 'light' | 'dark' | string

/**
 * 颜色配置
 */
export interface ThemeColors {
  /** 主色 */
  primary: string
  /** 主色悬停 */
  primaryHover: string
  /** 主色激活 */
  primaryActive: string
  /** 次要色 */
  secondary: string
  /** 成功色 */
  success: string
  /** 警告色 */
  warning: string
  /** 危险色 */
  danger: string
  /** 信息色 */
  info: string
  
  /** 主背景色 */
  bgPrimary: string
  /** 次背景色 */
  bgSecondary: string
  /** 悬停背景色 */
  bgHover: string
  /** 选中背景色 */
  bgSelected: string
  /** 禁用背景色 */
  bgDisabled: string
  
  /** 主文字色 */
  textPrimary: string
  /** 次文字色 */
  textSecondary: string
  /** 三级文字色 */
  textTertiary: string
  /** 禁用文字色 */
  textDisabled: string
  /** 反色文字 */
  textInverse: string
  
  /** 边框色 */
  borderColor: string
  /** 边框悬停色 */
  borderHover: string
  /** 边框激活色 */
  borderActive: string
  
  /** 分隔线色 */
  divider: string
  /** 遮罩层色 */
  overlay: string
}

/**
 * 阴影配置
 */
export interface ThemeShadows {
  /** 小阴影 */
  sm: string
  /** 中等阴影 */
  md: string
  /** 大阴影 */
  lg: string
  /** 超大阴影 */
  xl: string
}

/**
 * 圆角配置
 */
export interface ThemeBorderRadius {
  /** 小圆角 */
  sm: string
  /** 默认圆角 */
  md: string
  /** 大圆角 */
  lg: string
  /** 圆形 */
  full: string
}

/**
 * 间距配置
 */
export interface ThemeSpacing {
  /** 超小间距 */
  xs: string
  /** 小间距 */
  sm: string
  /** 中等间距 */
  md: string
  /** 大间距 */
  lg: string
  /** 超大间距 */
  xl: string
  /** 超超大间距 */
  xxl: string
}

/**
 * 动画配置
 */
export interface ThemeAnimation {
  /** 快速动画时长 */
  durationFast: string
  /** 默认动画时长 */
  durationBase: string
  /** 慢速动画时长 */
  durationSlow: string
  /** 缓动函数 */
  easing: string
}

/**
 * 字体配置
 */
export interface ThemeFonts {
  /** 字体家族 */
  family: string
  /** 小号字体 */
  sizeSm: string
  /** 默认字体 */
  sizeBase: string
  /** 大号字体 */
  sizeLg: string
  /** 超大号字体 */
  sizeXl: string
  /** 字重 - 正常 */
  weightNormal: number
  /** 字重 - 中等 */
  weightMedium: number
  /** 字重 - 加粗 */
  weightBold: number
}

/**
 * 主题数据完整结构
 */
export interface ThemeData {
  /** 主题名称 */
  name: ThemeName
  /** 颜色配置 */
  colors: ThemeColors
  /** 阴影配置 */
  shadows: ThemeShadows
  /** 圆角配置 */
  borderRadius: ThemeBorderRadius
  /** 间距配置 */
  spacing: ThemeSpacing
  /** 动画配置 */
  animation: ThemeAnimation
  /** 字体配置 */
  fonts: ThemeFonts
}

/**
 * 主题配置选项（可选的部分覆盖）
 */
export type ThemeConfig = Partial<ThemeData>