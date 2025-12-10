<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import DemoCard from '@/components/DemoCard.vue';

const month = ref<Date | null>(null);

const vueCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const month = ref(null);
<\/script>

<template>
  <DatePicker v-model="month" mode="month" />
</template>`;

const jsCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'month',
  onChange: (value, formatted) => {
    console.log('选中月份:', formatted);
  },
});

picker.mount('#container');`;
</script>

<template>
  <div class="month-demo">
    <p class="page-desc">月份选择器用于选择年月。</p>
    
    <DemoCard
      title="月份选择"
      description="选择一个月份，格式为'年份-月份'。"
      :vue-code="vueCode"
      :js-code="jsCode"
    >
      <DatePicker v-model="month" mode="month" placeholder="请选择月份" />
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
