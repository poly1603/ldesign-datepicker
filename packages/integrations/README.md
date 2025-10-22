# DatePicker 集成工具

提供与主流框架和库的集成支持。

## 📦 包含的集成

### 表单验证

- **form-validator** - 通用表单验证适配器
- **react-hook-form** - React Hook Form 集成
- **vee-validate** - VeeValidate 集成（Vue）

### 状态管理

- **pinia** - Pinia 状态管理集成
- **vuex** - Vuex 状态管理集成
- **redux** - Redux 状态管理集成
- **zustand** - Zustand 状态管理集成

## 🚀 使用示例

### React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { useDatePickerField, DatePickerRules } from '@ldesign/datepicker-integrations/react-hook-form';
import { DatePicker } from '@ldesign/datepicker-react';

function MyForm() {
  const { control, handleSubmit } = useForm();
  
  const dateField = useDatePickerField({
    name: 'birthDate',
    control,
    rules: {
      ...DatePickerRules.required(),
      ...DatePickerRules.maxDate(new Date()),
    },
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DatePicker {...dateField} />
      {dateField.error && <span>{dateField.error}</span>}
    </form>
  );
}
```

### Pinia

```ts
import { createDatePickerStore } from '@ldesign/datepicker-integrations/pinia';

const useDatePickerStore = createDatePickerStore({
  id: 'main-datepicker',
  initialValue: new Date(),
});

// 在组件中使用
const store = useDatePickerStore();
store.setValue(new Date('2024-01-01'));
store.undo();
store.redo();
```

## 📚 文档

查看各集成的详细文档：

- [表单验证集成](./form-validator/README.md)
- [React Hook Form](./react-hook-form/README.md)
- [Pinia](./pinia/README.md)

