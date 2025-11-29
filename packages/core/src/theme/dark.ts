/**
 * 暗色主题配置
 */

import type { ThemeData } from '../types/theme'

export const darkTheme: ThemeData = {
  name: 'dark',
  
  colors: {
    // 主色系
    primary: '#177ddc',
    primaryHover: '#3c9ae8',
    primaryActive: '#095cb5',
    secondary: '#262626',
    success: '#49aa19',
    warning: '#d89614',
    danger: '#d32029',
    info: '#177ddc',
    
    // 背景色
    bgPrimary: '#141414',
    bgSecondary: '#1f1f1f',
    bgHover: '#262626',
    bgSelected: '#111b26',
    bgDisabled: '#262626',
    
    // 文字色
    textPrimary: 'rgba(255, 255, 255, 0.85)',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    textTertiary: 'rgba(255, 255, 255, 0.45)',
    textDisabled: 'rgba(255, 255, 255, 0.25)',
    textInverse: 'rgba(0, 0, 0, 0.85)',
    
    // 边框色
    borderColor: '#434343',
    borderHover: '#3c9ae8',
    borderActive: '#095cb5',
    
    // 其他
    divider: '#303030',
    overlay: 'rgba(0, 0, 0, 0.65)'
  },
  
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.45)',
    md: '0 4px 16px rgba(0, 0, 0, 0.55)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.65)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.75)'
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

export default darkTheme