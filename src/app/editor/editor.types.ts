import { InjectionToken } from '@angular/core';

export interface EditorFieldConfig {
    name: string;
    type: string;
    customType?: string;
    canHaveChildren?: boolean;
}

export interface EditorFieldCategoryConfig {
    name: string;
    fields: EditorFieldConfig[];
}

export interface EditorConfig {
    defaultType: string;
    defaultCustomType?: string;
    fieldCategories: EditorFieldCategoryConfig[];
}

export const EDITOR_CONFIG = new InjectionToken<EditorConfig[]>('EDITOR_CONFIG');
