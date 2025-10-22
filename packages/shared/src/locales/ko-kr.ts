/**
 * 韩语语言包
 */

import type { Locale } from '../types';

export const koKR: Locale = {
  name: 'ko-kr',
  weekdays: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  weekdaysShort: ['일', '월', '화', '수', '목', '금', '토'],
  weekdaysMin: ['일', '월', '화', '수', '목', '금', '토'],
  months: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  monthsShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  firstDayOfWeek: 0,
  formats: {
    date: 'YYYY-MM-DD',
    datetime: 'YYYY-MM-DD HH:mm:ss',
    time: 'HH:mm:ss',
    month: 'YYYY-MM',
    year: 'YYYY',
    quarter: 'YYYY-[Q]Q',
  },
  meridiem: {
    am: '오전',
    pm: '오후',
  },
};

