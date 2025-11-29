/**
 * 简体中文语言包
 */

import type { LocaleData } from '../../types/locale'

export const zhCN: LocaleData = {
  name: 'zh-CN',

  months: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ],

  monthsShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ],

  weekdays: [
    '星期日', '星期一', '星期二', '星期三',
    '星期四', '星期五', '星期六'
  ],

  weekdaysShort: [
    '周日', '周一', '周二', '周三',
    '周四', '周五', '周六'
  ],

  weekdaysMin: [
    '日', '一', '二', '三', '四', '五', '六'
  ],

  meridiem: (hour: number, minute: number, isLowercase?: boolean) => {
    const hm = hour * 100 + minute
    if (hm < 600) {
      return isLowercase ? '凌晨' : '凌晨'
    } else if (hm < 900) {
      return isLowercase ? '早上' : '早上'
    } else if (hm < 1130) {
      return isLowercase ? '上午' : '上午'
    } else if (hm < 1230) {
      return isLowercase ? '中午' : '中午'
    } else if (hm < 1800) {
      return isLowercase ? '下午' : '下午'
    }
    return isLowercase ? '晚上' : '晚上'
  },

  formats: {
    date: 'YYYY-MM-DD',
    time: 'HH:mm:ss',
    datetime: 'YYYY-MM-DD HH:mm:ss',
    month: 'YYYY-MM',
    year: 'YYYY',
    week: 'YYYY-WW'
  },

  buttons: {
    confirm: '确定',
    cancel: '取消',
    clear: '清除',
    today: '今天',
    now: '此刻',
    prevYear: '上一年',
    nextYear: '下一年',
    prevMonth: '上一月',
    nextMonth: '下一月'
  },

  shortcuts: {
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    lastWeek: '上周',
    lastMonth: '上月',
    lastYear: '去年',
    thisWeek: '本周',
    thisMonth: '本月',
    thisYear: '今年',
    last7Days: '最近 7 天',
    last30Days: '最近 30 天',
    last90Days: '最近 90 天'
  },

  placeholders: {
    date: '请选择日期',
    dateRange: ['开始日期', '结束日期'],
    month: '请选择月份',
    monthRange: ['开始月份', '结束月份'],
    year: '请选择年份',
    yearRange: ['开始年份', '结束年份'],
    week: '请选择周',
    weekRange: ['开始周', '结束周'],
    time: '请选择时间',
    timeRange: ['开始时间', '结束时间'],
    datetime: '请选择日期时间',
    datetimeRange: ['开始日期时间', '结束日期时间']
  },

  texts: {
    selectDate: '选择日期',
    selectTime: '选择时间',
    selectYear: '选择年份',
    selectMonth: '选择月份',
    selectWeek: '选择周',
    startDate: '开始日期',
    endDate: '结束日期',
    startTime: '开始时间',
    endTime: '结束时间',
    to: '至',
    weekNumber: '周'
  }
}

export default zhCN