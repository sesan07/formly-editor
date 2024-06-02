import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fieldName',
    standalone: true,
})
export class FieldNamePipe implements PipeTransform {
    transform(name: string, key?: string | number | (string | number)[]): string {
        return `${name}${key ? ` (${key})` : ''}`;
    }
}
