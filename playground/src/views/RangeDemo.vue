<script setup lang="ts">
import { ref } from 'vue';
import { DateRangePicker, DatePicker } from '@ldesign/datepicker-vue';
import type { DateRange } from '@ldesign/datepicker-core';
import DemoCard from '@/components/DemoCard.vue';

const dateRange = ref<DateRange | null>(null);
const weekRange = ref<DateRange | null>(null);
const monthRange = ref<DateRange | null>(null);
const quarterRange = ref<DateRange | null>(null);
const yearRange = ref<DateRange | null>(null);
const datetimeRange = ref<DateRange | null>(null);

const vueDateRangeCode = `<script setup>
import { ref } from 'vue';
import { DateRangePicker } from '@ldesign/datepicker-vue';

const range = ref(null);
<\/script>

<template>
  <DateRangePicker v-model="range" />
</template>`;

const jsDateRangeCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'date',
  selectionType: 'range',
  panelCount: 2,
  onChange: (value, formatted) => {
    console.log('选中范围:', formatted);
  },
});

picker.mount('#container');`;

const vueMonthRangeCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const range = ref(null);
<\/script>

<template>
  <DatePicker v-model="range" mode="month" selection-type="range" />
</template>`;

const jsMonthRangeCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'month',
  selectionType: 'range',
  panelCount: 2,
});

picker.mount('#container');`;

const vueYearRangeCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const range = ref(null);
<\/script>

<template>
  <DatePicker v-model="range" mode="year" selection-type="range" />
</template>`;

const jsYearRangeCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'year',
  selectionType: 'range',
  panelCount: 2,
});

picker.mount('#container');`;
</script>

<template>
  <div class="range-demo">
    <p class="page-desc">范围选择器用于选择一个时间范围。</p>
    
    <DemoCard
      title="日期范围"
      description="选择一个开始日期和结束日期。鼠标悬停可预览范围。"
      :vue-code="vueDateRangeCode"
      :js-code="jsDateRangeCode"
    >
      <DateRangePicker v-model="dateRange" :placeholder="['开始日期', '结束日期']" />
    </DemoCard>
    
    <DemoCard
      title="周范围"
      description="选择一个开始周和结束周。"
      vue-code="<DatePicker v-model='range' mode='week' selection-type='range' :panel-count='2' />"
      js-code="createDatePicker({ mode: 'week', selectionType: 'range', panelCount: 2 })"
    >
      <DatePicker
        v-model="weekRange"
        mode="week"
        selection-type="range"
        :panel-count="2"
        :placeholder="['开始周', '结束周']"
      />
    </DemoCard>
    
    <DemoCard
      title="月份范围"
      description="选择一个开始月份和结束月份。鼠标悬停可预览范围。"
      :vue-code="vueMonthRangeCode"
      :js-code="jsMonthRangeCode"
    >
      <DatePicker
        v-model="monthRange"
        mode="month"
        selection-type="range"
        :panel-count="2"
        :placeholder="['开始月份', '结束月份']"
      />
    </DemoCard>
    
    <DemoCard
      title="季度范围"
      description="选择一个开始季度和结束季度。"
      vue-code="<DatePicker v-model='range' mode='quarter' selection-type='range' :panel-count='2' />"
      js-code="createDatePicker({ mode: 'quarter', selectionType: 'range', panelCount: 2 })"
    >
      <DatePicker
        v-model="quarterRange"
        mode="quarter"
        selection-type="range"
        :panel-count="2"
        :placeholder="['开始季度', '结束季度']"
      />
    </DemoCard>
    
    <DemoCard
      title="年份范围"
      description="选择一个开始年份和结束年份。鼠标悬停可预览范围。"
      :vue-code="vueYearRangeCode"
      :js-code="jsYearRangeCode"
    >
      <DatePicker
        v-model="yearRange"
        mode="year"
        selection-type="range"
        :panel-count="2"
        :placeholder="['开始年份', '结束年份']"
      />
    </DemoCard>
    
    <DemoCard
      title="日期时间范围"
      description="选择一个带时间的日期范围。点击确定后选择结束日期时间。"
      vue-code="<DatePicker v-model='range' mode='datetime' selection-type='range' show-confirm />"
      js-code="createDatePicker({ mode: 'datetime', selectionType: 'range', showConfirm: true })"
    >
      <DatePicker
        v-model="datetimeRange"
        mode="datetime"
        selection-type="range"
        show-confirm
        :placeholder="['开始时间', '结束时间']"
      />
    </DemoCard>
  </div>
</template>

<style lang="scss" scoped>
.page-desc {
  color: var(--text-secondary);
  margin-bottom: 32px;
  font-size: 15px;
}
</style>
