/**
 * 阿拉伯语语言包（支持 RTL）
 */

import type { Locale } from '../types';

export const arSA: Locale = {
  name: 'ar-sa',
  weekdays: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  weekdaysShort: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  weekdaysMin: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  months: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ],
  monthsShort: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ],
  firstDayOfWeek: 6,
  formats: {
    date: 'DD/MM/YYYY',
    datetime: 'DD/MM/YYYY HH:mm:ss',
    time: 'HH:mm:ss',
    month: 'MM/YYYY',
    year: 'YYYY',
    quarter: '[Q]Q YYYY',
  },
  meridiem: {
    am: 'ص',
    pm: 'م',
  },
};

