import {PipeTransform, Pipe} from '@angular/core';


@Pipe({name: 'friendlydatetime'})

export class FriendlyDateTimePipe implements PipeTransform {
    transform(value, args: string[]): any {

        if (!value) {
          return '';
        }

        const date = new Date(value);

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'];

        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours().toString();
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes().toString();

        return `${date.getDate()} ${months[date.getMonth()]} , ${date.getFullYear()} ${hours}:${minutes}`;

    }
}
