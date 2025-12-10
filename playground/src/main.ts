import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './styles/index.scss';

// 导入 datepicker 样式
import '@ldesign/datepicker-core/styles/index.scss';

// 导入 prism 样式
import 'prismjs/themes/prism-tomorrow.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home.vue'),
    },
    {
      path: '/date',
      name: 'date',
      component: () => import('./views/DateDemo.vue'),
    },
    {
      path: '/week',
      name: 'week',
      component: () => import('./views/WeekDemo.vue'),
    },
    {
      path: '/month',
      name: 'month',
      component: () => import('./views/MonthDemo.vue'),
    },
    {
      path: '/quarter',
      name: 'quarter',
      component: () => import('./views/QuarterDemo.vue'),
    },
    {
      path: '/year',
      name: 'year',
      component: () => import('./views/YearDemo.vue'),
    },
    {
      path: '/range',
      name: 'range',
      component: () => import('./views/RangeDemo.vue'),
    },
    {
      path: '/datetime',
      name: 'datetime',
      component: () => import('./views/DateTimeDemo.vue'),
    },
    {
      path: '/time',
      name: 'time',
      component: () => import('./views/TimeDemo.vue'),
    },
    {
      path: '/multiple',
      name: 'multiple',
      component: () => import('./views/MultipleDemo.vue'),
    },
  ],
});

const app = createApp(App);
app.use(router);
app.mount('#app');
