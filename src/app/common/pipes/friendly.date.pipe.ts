import {PipeTransform, Pipe} from '@angular/core';


@Pipe({name: 'friendlydate'})

export class FriendlyDatePipe implements PipeTransform {
    transform(value, args: string[]): any {

        if (!value) {
          return '';
        }

        const date = new Date(value);

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'];

        return date.getDate() + ' ' + months[date.getMonth()] + ', ' + date.getFullYear();

    }
}
