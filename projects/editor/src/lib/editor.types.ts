import { InjectionToken } from '@angular/core';
import { ConfigOption, TypeOption } from '@ngx-formly/core/lib/services/formly.config';

export interface EditorTypeOption extends TypeOption {
    displayName: string;
    name: string;
    customName?: string;
    canHaveChildren?: boolean;
}

export interface EditorTypeCategoryOption {
    name: string;
    typeOptions: EditorTypeOption[];
}

export interface EditorConfigOption extends ConfigOption {
    defaultName: string;
    defaultCustomName?: string;
    typeCategories: EditorTypeCategoryOption[];
}

export const EDITOR_CONFIG = new InjectionToken<EditorConfigOption[]>('EDITOR_CONFIG');
