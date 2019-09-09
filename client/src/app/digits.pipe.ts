import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'digits'
})
export class DigitsPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (typeof value === 'string') {
      value = parseFloat(value);
    }
    return value.toFixed(2);
  }

}
