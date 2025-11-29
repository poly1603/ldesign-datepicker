/**
 * @ldesign/datepicker-core
 * 框架无关的日期时间选择器核心库
 */

// 导入样式
import './styles/index.css'

// 导出类型定义
export * from './types'

// 导出工具类
export * from './utils'

// 导出国际化
export * from './i18n'
export * from './i18n/locales'

// 导出主题系统
export * from './theme'
export { lightTheme } from './theme/light'
export { darkTheme } from './theme/dark'

// 导出选择器
export * from './pickers'

// 版本信息
export const VERSION = '0.1.0'