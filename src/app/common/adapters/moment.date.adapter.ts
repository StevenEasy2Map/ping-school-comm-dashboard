import {DateAdapter} from '@angular/material';
import {Moment} from 'moment';
import * as moment from 'moment';

export class MomentDateAdapter extends DateAdapter<Moment> {
  getYear(date: moment.Moment): number {
    return undefined;
  }

  getMonth(date: moment.Moment): number {
    return undefined;
  }


  getDate(date: moment.Moment): number {
    return undefined;
  }

  getDayOfWeek(date: moment.Moment): number {
    return undefined;
  }

  getMonthNames(style): string[] {
    return undefined;
  }

  getDateNames(): string[] {
    return undefined;
  }

  getDayOfWeekNames(style): string[] {
    return undefined;
  }

  getYearName(date: moment.Moment): string {
    return undefined;
  }

  getFirstDayOfWeek(): number {
    return undefined;
  }

  getNumDaysInMonth(date: moment.Moment): number {
    return undefined;
  }

  clone(date: moment.Moment): moment.Moment {
    return undefined;
  }

  createDate(year: number, month: number, date: number): moment.Moment {
    return undefined;
  }

  today(): moment.Moment {
    return undefined;
  }

  format(date: moment.Moment, displayFormat: any): string {
    return undefined;
  }

  addCalendarYears(date: moment.Moment, years: number): moment.Moment {
    return undefined;
  }

  addCalendarMonths(date: moment.Moment, months: number): moment.Moment {
    return undefined;
  }

  addCalendarDays(date: moment.Moment, days: number): moment.Moment {
    return undefined;
  }

  toIso8601(date: moment.Moment): string {
    return undefined;
  }

  isDateInstance(obj: any): boolean {
    return undefined;
  }

  isValid(date: moment.Moment): boolean {
    return undefined;
  }

  invalid(): moment.Moment {
    return undefined;
  }

  parse(value: any, parseFormat: any): Moment {
    return moment(value, parseFormat);
  }

  // Implementation for remaining abstract methods of DateAdapter.
}
