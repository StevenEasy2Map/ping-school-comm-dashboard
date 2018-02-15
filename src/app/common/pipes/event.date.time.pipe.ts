import {PipeTransform, Pipe} from '@angular/core';
import * as moment from 'moment';


@Pipe({name: 'eventdatetime'})

export class EventDateTimePipe implements PipeTransform {
  transform(value, args: string[]): any {

    if (!value) {
      return '';
    }

    const date = new Date(value);
    return moment(date).format('MMMM Do YYYY, h:mm:ss a');

  }
}
