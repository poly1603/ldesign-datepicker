<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import DemoCard from '@/components/DemoCard.vue';

const datetime = ref<Date | null>(null);

const vueCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const datetime = ref(null);
<\/script>

<template>
  <DatePicker v-model="datetime" mode="datetime" show-time show-confirm />
</template>`;

const jsCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'datetime',
  showTime: true,
  showConfirm: true,
  onChange: (value, formatted) => {
    console.log('选中日期时间:', formatted);
  },
});

picker.mount('#container');`;
</script>

<template>
  <div class="datetime-demo">
    <p class="page-desc">日期时间选择器用于同时选择日期和时间。</p>
    
    <DemoCard
      title="日期时间选择"
      description="选择一个日期和具体时间。"
      :vue-code="vueCode"
      :js-code="jsCode"
    >
      <DatePicker
        v-model="datetime"
        mode="datetime"
        show-time
        show-confirm
        placeholder="请选择日期时间"
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
