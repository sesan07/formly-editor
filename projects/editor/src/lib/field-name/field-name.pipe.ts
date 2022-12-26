import { Pipe, PipeTransform } from '@angular/core';
import { IEditorFormlyField } from '../editor.types';

@Pipe({
    name: 'fieldName',
})
export class FieldNamePipe implements PipeTransform {
    transform(name: string, key?: string | number | (string | number)[]): string {
        return `${name}${key ? ` (${key})` : ''}`;
    }
}
