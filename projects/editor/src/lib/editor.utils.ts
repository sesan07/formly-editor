import { TrackByFunction } from '@angular/core';
import { IEditorFormlyField } from './editor.types';

export const trackByKey: TrackByFunction<{ [others: string]: any; key: string }> = (_, val) => val.key;
export const trackByFieldId: TrackByFunction<IEditorFormlyField> = (_, field) => field._info.fieldId;
