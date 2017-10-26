import {PipeTransform, Pipe} from '@angular/core';


@Pipe({name: 'numberpad'})

export class NumberPadPipe implements PipeTransform {
    transform(value, args: string[]): any {
        const item = parseInt(value);
        if (item < 10) return '0' + item;
        return item;
    }
}
