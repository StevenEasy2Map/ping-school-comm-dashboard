import {PipeTransform, Pipe} from '@angular/core';
import * as moment from 'moment';


@Pipe({name: 'eventdatetimefromto'})

export class EventDateTimeFromToPipe implements PipeTransform {
  transform(value, args: string[]): any {

    if (args.length < 2) {
      return '';
    }

    const startDate = new Date(args[0]);
    const endDate = new Date(args[1]);

    let dateDescription = moment(startDate).format('ddd MMMM Do, h:mm a');
    if (startDate.getFullYear() === endDate.getFullYear() && startDate.getDay() === endDate.getDay()
      && startDate.getMonth() === endDate.getMonth()) {
      dateDescription += ' - ' + moment(endDate).format('h:mm a');
    } else {
      dateDescription += ' - ' + moment(endDate).format('ddd MMMM Do, h:mm a');
    }

    return dateDescription;

  }
}
