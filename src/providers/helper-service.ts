import {Injectable} from '@angular/core';

@Injectable()
export class HelperService {

  static isValidMailFormat(email: string) {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    if (email !== '' && (email.length <= 5 || !EMAIL_REGEXP.test(email))) {
      return false;
    }

    return true;
  }

  static timeZoneAdjustedDate(date: string, timezoneOffset: number) {

    const targetTime = new Date(date);
    // return new Date(targetTime.getTime() + timezoneOffset * 60 * 1000);
    return new Date(targetTime.getTime());

  }

  static friendlyDateTime(date: any) {

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
      'Sep', 'Oct', 'Nov', 'Dec'];

    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours().toString();
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes().toString();

    return `${date.getDate()} ${months[date.getMonth()]} , ${date.getFullYear()} ${hours}:${minutes}`;

  }
}
