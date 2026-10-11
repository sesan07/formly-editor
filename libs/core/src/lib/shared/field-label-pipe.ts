import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'coreFieldLabel',
})
export class FieldLabelPipe implements PipeTransform {
  transform(label: string, key?: string | number | (string | number)[]): string {
    return `${label}${key ? ` (${key})` : ''}`;
  }
}
