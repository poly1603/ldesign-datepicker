import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDatePickerCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },

    rollupOptions: {
      external: ['@ldesign/datepicker-shared'],

      output: {
        exports: 'named',

        // 代码分割优化
        manualChunks: (id) => {
          // 架构模块单独打包
          if (id.includes('/architecture/')) {
            return 'architecture';
          }

          // 计算器模块单独打包
          if (id.includes('/calculators/')) {
            return 'calculators';
          }

          // 渲染器模块单独打包
          if (id.includes('/renderers/')) {
            return 'renderers';
          }

          // 移动端模块单独打包
          if (id.includes('/mobile/')) {
            return 'mobile';
          }

          // 工具模块
          if (id.includes('/utils/')) {
            return 'utils';
          }
        },
      },
    },

    // 优化选项
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: true,

    // Tree-shaking 优化
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },

    // CSS 处理
    cssCodeSplit: true,
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: ['@ldesign/datepicker-shared'],
  },
});
