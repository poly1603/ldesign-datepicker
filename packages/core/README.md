# @ldesign/datepicker-core

框架无关的日期时间选择器核心库。

## 特性

- ✨ 功能全面：支持日期、年份、月份、星期、时间及范围选择
- 🎨 现代化设计：精美的 UI 和流畅的动画
- 🌍 国际化：支持多语言
- 🎭 主题系统：支持亮色/暗色主题
- 🔧 框架无关：纯 JavaScript/TypeScript 实现
- 📦 轻量级：核心库体积小
- 🎯 TypeScript：完整的类型定义

## 安装

```bash
npm install @ldesign/datepicker-core
```

## 基础用法

```typescript
import { DatePicker } from '@ldesign/datepicker-core'
import '@ldesign/datepicker-core/styles'

const picker = new DatePicker({
  locale: 'zh-CN',
  theme: 'light',
  onChange: (value) => {
    console.log('选中日期:', value)
  }
})

picker.mount(document.getElementById('picker-container'))
```

## 文档

查看完整文档请访问 [文档站点](#)

## License

MIT