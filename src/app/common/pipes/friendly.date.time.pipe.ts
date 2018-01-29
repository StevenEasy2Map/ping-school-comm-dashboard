import {PipeTransform, Pipe} from '@angular/core';
import * as moment from 'moment';


@Pipe({name: 'friendlydatetime'})

export class FriendlyDateTimePipe implements PipeTransform {
  transform(value, args: string[]): any {

    if (!value) {
      return '';
    }

    const date = new Date(value);
    return moment(date).calendar();

  }
}
