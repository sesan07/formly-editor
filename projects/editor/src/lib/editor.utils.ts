import { AbstractControl } from '@angular/forms';
import { FieldCategoryOption, FieldOption, FieldTypeOption } from './editor.types';

export const isCategoryOption = (x: FieldOption): x is FieldCategoryOption => !!(x as FieldCategoryOption).children;
export const isTypeOption = (x: FieldOption): x is FieldTypeOption => !!(x as FieldTypeOption).name;

export const getKeyPath = (control: AbstractControl): string => {
    const path: string[] = [];
    while (control?.parent) {
        const siblings: { [key: string]: AbstractControl } | AbstractControl[] = control.parent.controls;
        const key: string | number = Object.keys(siblings).find(k => siblings[k] === control);
        if (key) {
            path.unshift(key);
        }
        control = control.parent;
    }

    return path.join('.');
};
