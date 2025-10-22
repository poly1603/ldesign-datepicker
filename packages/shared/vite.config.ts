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
      name: 'LDatePickerShared',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },

    rollupOptions: {
      output: {
        exports: 'named',

        // 按需加载优化
        manualChunks: (id) => {
          // 语言包按需加载
          if (id.includes('/locales/')) {
            const match = id.match(/\/locales\/([^/]+)\.ts$/);
            if (match) {
              return `locale-${match[1]}`;
            }
          }

          // 验证器单独打包
          if (id.includes('/validators/')) {
            return 'validators';
          }

          // 国际化工具
          if (id.includes('/i18n/')) {
            return 'i18n';
          }

          // 工具函数
          if (id.includes('/utils/')) {
            return 'utils';
          }
        },
      },
    },

    minify: 'esbuild',
    target: 'es2020',
    sourcemap: true,

    // Tree-shaking 优化
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
  },
});
