/**
 * English (US) Locale
 */

import type { LocaleData } from '../../types/locale'

export const enUS: LocaleData = {
  name: 'en-US',

  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],

  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],

  weekdays: [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ],

  weekdaysShort: [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ],

  weekdaysMin: [
    'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
  ],

  meridiem: (hour: number, _minute: number, isLowercase?: boolean) => {
    if (hour < 12) {
      return isLowercase ? 'am' : 'AM'
    }
    return isLowercase ? 'pm' : 'PM'
  },

  formats: {
    date: 'MM/DD/YYYY',
    time: 'hh:mm:ss A',
    datetime: 'MM/DD/YYYY hh:mm:ss A',
    month: 'MM/YYYY',
    year: 'YYYY',
    week: 'YYYY-WW'
  },

  buttons: {
    confirm: 'OK',
    cancel: 'Cancel',
    clear: 'Clear',
    today: 'Today',
    now: 'Now',
    prevYear: 'Previous Year',
    nextYear: 'Next Year',
    prevMonth: 'Previous Month',
    nextMonth: 'Next Month'
  },

  shortcuts: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    lastYear: 'Last Year',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    last90Days: 'Last 90 Days'
  },

  placeholders: {
    date: 'Select date',
    dateRange: ['Start date', 'End date'],
    month: 'Select month',
    monthRange: ['Start month', 'End month'],
    year: 'Select year',
    yearRange: ['Start year', 'End year'],
    week: 'Select week',
    weekRange: ['Start week', 'End week'],
    time: 'Select time',
    timeRange: ['Start time', 'End time'],
    datetime: 'Select datetime',
    datetimeRange: ['Start datetime', 'End datetime']
  },

  texts: {
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    selectYear: 'Select Year',
    selectMonth: 'Select Month',
    selectWeek: 'Select Week',
    startDate: 'Start Date',
    endDate: 'End Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    to: 'to',
    weekNumber: 'Week'
  }
}

export default enUS