<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import { createDatePicker } from '@ldesign/datepicker-core';
import DemoCard from '@/components/DemoCard.vue';

const date1 = ref<Date | null>(null);
const date2 = ref<Date | null>(null);
const date3 = ref<Date | null>(null);

// 原生JS实例
let jsPicker1: ReturnType<typeof createDatePicker> | null = null;
let jsPicker2: ReturnType<typeof createDatePicker> | null = null;
let jsPicker3: ReturnType<typeof createDatePicker> | null = null;

onMounted(() => {
  // 基础日期选择器
  jsPicker1 = createDatePicker({
    mode: 'date',
    placeholder: '请选择日期',
    onChange: (value) => {
      console.log('JS选中日期:', value);
    },
  });
  jsPicker1.mount('#js-date-basic');

  // 带今天按钮
  jsPicker2 = createDatePicker({
    mode: 'date',
    showToday: true,
    placeholder: '请选择日期',
  });
  jsPicker2.mount('#js-date-today');

  // 禁用日期
  jsPicker3 = createDatePicker({
    mode: 'date',
    placeholder: '请选择日期',
    disabledDate: (date) => {
      return date.getDay() === 0 || date.getDay() === 6;
    },
  });
  jsPicker3.mount('#js-date-disabled');
});

onUnmounted(() => {
  jsPicker1?.destroy();
  jsPicker2?.destroy();
  jsPicker3?.destroy();
});

const vueBasicCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const date = ref(null);
<\/script>

<template>
  <DatePicker v-model="date" placeholder="请选择日期" />
</template>`;

const jsBasicCode = `import { createDatePicker } from '@ldesign/datepicker-core';
import '@ldesign/datepicker-core/styles';

const picker = createDatePicker({
  mode: 'date',
  placeholder: '请选择日期',
  onChange: (value, formatted) => {
    console.log('选中日期:', value, formatted);
  },
});

picker.mount('#container');`;

const vueTodayCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const date = ref(null);
<\/script>

<template>
  <DatePicker v-model="date" show-today />
</template>`;

const jsTodayCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'date',
  showToday: true,
});

picker.mount('#container');`;

const vueDisabledCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const date = ref(null);

// 禁用周末
const disabledDate = (date) => {
  return date.getDay() === 0 || date.getDay() === 6;
};
<\/script>

<template>
  <DatePicker v-model="date" :disabled-date="disabledDate" />
</template>`;

const jsDisabledCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'date',
  disabledDate: (date) => {
    // 禁用周末
    return date.getDay() === 0 || date.getDay() === 6;
  },
});

picker.mount('#container');`;
</script>

<template>
  <div class="date-demo">
    <p class="page-desc">日期选择器用于选择一个具体的日期。</p>
    
    <DemoCard
      title="基础用法"
      description="最简单的日期选择器，用于选择单个日期。"
      :vue-code="vueBasicCode"
      :js-code="jsBasicCode"
    >
      <div class="demo-row">
        <div class="demo-item">
          <span class="demo-label">Vue 组件:</span>
          <DatePicker v-model="date1" placeholder="请选择日期" />
        </div>
        <div class="demo-item">
          <span class="demo-label">原生 JS:</span>
          <div id="js-date-basic"></div>
        </div>
      </div>
    </DemoCard>
    
    <DemoCard
      title="今天按钮"
      description="显示'今天'快捷按钮，点击可快速选择今天日期。"
      :vue-code="vueTodayCode"
      :js-code="jsTodayCode"
    >
      <div class="demo-row">
        <div class="demo-item">
          <span class="demo-label">Vue 组件:</span>
          <DatePicker v-model="date2" show-today placeholder="请选择日期" />
        </div>
        <div class="demo-item">
          <span class="demo-label">原生 JS:</span>
          <div id="js-date-today"></div>
        </div>
      </div>
    </DemoCard>
    
    <DemoCard
      title="禁用日期"
      description="通过 disabledDate 函数禁用特定日期（如禁用周末）。"
      :vue-code="vueDisabledCode"
      :js-code="jsDisabledCode"
    >
      <div class="demo-row">
        <div class="demo-item">
          <span class="demo-label">Vue 组件:</span>
          <DatePicker
            v-model="date3"
            :disabled-date="(date: Date) => date.getDay() === 0 || date.getDay() === 6"
            placeholder="请选择日期"
          />
        </div>
        <div class="demo-item">
          <span class="demo-label">原生 JS:</span>
          <div id="js-date-disabled"></div>
        </div>
      </div>
    </DemoCard>
  </div>
</template>

<style lang="scss" scoped>
.page-desc {
  color: var(--text-secondary);
  margin-bottom: 32px;
  font-size: 15px;
}

.demo-row {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.demo-label {
  flex-shrink: 0;
  width: 80px;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
