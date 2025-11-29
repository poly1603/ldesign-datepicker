/**
 * 亮色主题配置
 */

import type { ThemeData } from '../types/theme'

export const lightTheme: ThemeData = {
  name: 'light',
  
  colors: {
    // 主色系
    primary: '#1890ff',
    primaryHover: '#40a9ff',
    primaryActive: '#096dd9',
    secondary: '#f0f0f0',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
    info: '#1890ff',
    
    // 背景色
    bgPrimary: '#ffffff',
    bgSecondary: '#fafafa',
    bgHover: '#f5f5f5',
    bgSelected: '#e6f7ff',
    bgDisabled: '#f5f5f5',
    
    // 文字色
    textPrimary: 'rgba(0, 0, 0, 0.85)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textTertiary: 'rgba(0, 0, 0, 0.45)',
    textDisabled: 'rgba(0, 0, 0, 0.25)',
    textInverse: '#ffffff',
    
    // 边框色
    borderColor: '#d9d9d9',
    borderHover: '#40a9ff',
    borderActive: '#096dd9',
    
    // 其他
    divider: '#f0f0f0',
    overlay: 'rgba(0, 0, 0, 0.45)'
  },
  
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.16)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.20)'
  },
  
  borderRadius: {
    sm: '2px',
    md: '6px',
    lg: '8px',
    full: '9999px'
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  animation: {
    durationFast: '0.15s',
    durationBase: '0.3s',
    durationSlow: '0.5s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    sizeSm: '12px',
    sizeBase: '14px',
    sizeLg: '16px',
    sizeXl: '20px',
    weightNormal: 400,
    weightMedium: 500,
    weightBold: 600
  }
}

export default lightTheme