# @ldesign/datepicker-vue

Vue 3 日期选择器组件，基于 `@ldesign/datepicker-core` 构建。

## 特性

- 🎯 **多种模式** - 支持日期、周、月、季度、年份选择
- 📅 **范围选择** - 支持日期范围、周范围、月份范围等
- 🔢 **多选模式** - 支持多个日期同时选择
- ⏰ **时间选择** - 内置时间面板，支持时分秒选择
- 🎨 **TDesign风格** - 内置精美的样式
- 🪝 **Composition API** - 提供 `useDatePicker` Hook
- 📝 **指令支持** - 提供 `v-datepicker` 指令

## 安装

```bash
pnpm add @ldesign/datepicker-vue
```

## 基本使用

### 全局注册

```javascript
import { createApp } from 'vue';
import LDatePicker from '@ldesign/datepicker-vue';
import '@ldesign/datepicker-core/styles';

const app = createApp(App);
app.use(LDatePicker);
```

### 按需引入

```vue
<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import '@ldesign/datepicker-core/styles';

const date = ref(null);
</script>

<template>
  <DatePicker v-model="date" />
</template>
```

## 组件

### DatePicker 日期选择器

```vue
<template>
  <!-- 基础用法 -->
  <DatePicker v-model="date" />
  
  <!-- 周选择 -->
  <DatePicker v-model="week" mode="week" />
  
  <!-- 月份选择 -->
  <DatePicker v-model="month" mode="month" />
  
  <!-- 季度选择 -->
  <DatePicker v-model="quarter" mode="quarter" />
  
  <!-- 年份选择 -->
  <DatePicker v-model="year" mode="year" />
  
  <!-- 日期时间选择 -->
  <DatePicker v-model="datetime" mode="datetime" show-time />
</template>
```

### DateRangePicker 日期范围选择器

```vue
<script setup>
import { ref } from 'vue';
import { DateRangePicker } from '@ldesign/datepicker-vue';

const range = ref({ start: null, end: null });
</script>

<template>
  <DateRangePicker v-model="range" />
</template>
```

### TimePicker 时间选择器

```vue
<script setup>
import { ref } from 'vue';
import { TimePicker } from '@ldesign/datepicker-vue';

const time = ref({ hour: 0, minute: 0, second: 0 });
</script>

<template>
  <TimePicker v-model="time" />
</template>
```

## Hook: useDatePicker

```vue
<script setup>
import { useDatePicker } from '@ldesign/datepicker-vue';

const {
  state,
  visible,
  displayText,
  calendarData,
  open,
  close,
  selectDate,
  prev,
  next,
} = useDatePicker({
  mode: 'date',
  onChange: (value) => console.log(value),
});
</script>
```

## 指令: v-datepicker

```vue
<template>
  <input
    v-datepicker="{
      mode: 'date',
      onUpdate: (value) => handleUpdate(value)
    }"
  />
</template>
```

## Props

### DatePicker Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `Date \| Date[] \| DateRange \| null` | - |
| mode | 选择器模式 | `'date' \| 'week' \| 'month' \| 'quarter' \| 'year' \| 'datetime'` | `'date'` |
| selectionType | 选择类型 | `'single' \| 'range' \| 'multiple'` | `'single'` |
| format | 日期格式 | `string` | 根据mode自动推断 |
| weekStart | 星期首日 | `0-6` | `1` |
| disabledDate | 禁用日期函数 | `(date: Date) => boolean` | - |
| minDate | 最小日期 | `Date` | - |
| maxDate | 最大日期 | `Date` | - |
| showWeekNumber | 是否显示周数 | `boolean` | `false` |
| showToday | 是否显示今天按钮 | `boolean` | `true` |
| showConfirm | 是否显示确认按钮 | `boolean` | `false` |
| showTime | 是否显示时间选择 | `boolean` | `false` |
| allowClear | 是否允许清空 | `boolean` | `true` |
| placeholder | 占位文本 | `string \| [string, string]` | `'请选择日期'` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| panelCount | 面板数量（范围选择） | `number` | `1` |
| locale | 国际化配置 | `DatePickerLocale` | 中文 |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value) => void` |
| change | 值变化时触发 | `(value, formatted) => void` |
| panelChange | 面板变化时触发 | `(panel, date) => void` |
| open | 面板打开时触发 | `() => void` |
| close | 面板关闭时触发 | `() => void` |
| confirm | 确认时触发 | `(value) => void` |
| clear | 清除时触发 | `() => void` |

## 自定义样式

样式变量可通过 SCSS 覆盖：

```scss
// 覆盖主色
$ldp-primary-color: #1890ff;

@import '@ldesign/datepicker-core/styles';
```

## License

MIT
