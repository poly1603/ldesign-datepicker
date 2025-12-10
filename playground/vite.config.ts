import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 开发时直接指向源代码，无需先构建
      '@ldesign/datepicker-core/styles': resolve(__dirname, '../packages/core/src/styles'),
      '@ldesign/datepicker-core': resolve(__dirname, '../packages/core/src'),
      '@ldesign/datepicker-vue': resolve(__dirname, '../packages/vue/src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *;`,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
