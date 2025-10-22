/**
 * 葡萄牙语（巴西）语言包
 */

import type { Locale } from '../types';

export const ptBR: Locale = {
  name: 'pt-br',
  weekdays: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  weekdaysMin: ['Do', 'Se', 'Te', 'Qa', 'Qi', 'Sx', 'Sá'],
  months: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  monthsShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ],
  firstDayOfWeek: 0,
  formats: {
    date: 'DD/MM/YYYY',
    datetime: 'DD/MM/YYYY HH:mm:ss',
    time: 'HH:mm:ss',
    month: 'MM/YYYY',
    year: 'YYYY',
    quarter: '[Q]Q YYYY',
  },
  meridiem: {
    am: 'AM',
    pm: 'PM',
  },
};

