import { TrackByFunction } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FieldCategoryOption, FieldOption, FieldTypeOption, IEditorFormlyField } from './editor.types';

export const trackByKey: TrackByFunction<{ [others: string]: any; key: string }> = (_, val) => val.key;
export const trackByFieldId: TrackByFunction<IEditorFormlyField> = (_, field) => field._info.fieldId;
export const trackByDisplayName: TrackByFunction<FieldOption> = (_, opt) => opt.displayName;

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
