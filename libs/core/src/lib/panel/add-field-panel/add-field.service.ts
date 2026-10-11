import { CoreFormService } from '../../editor/core-form.service';
import { CoreFieldService } from '../../config/core-field.service';
import { computed, inject, Injectable } from '@angular/core';
import { AddFieldAction } from './types';

@Injectable()
export class AddFieldService {
  protected formService = inject(CoreFormService);
  protected fieldService = inject(CoreFieldService);

  readonly addActions = computed<AddFieldAction[]>(() => {
    const activeField = this.formService.activeField();
    if (!activeField) {
      return [{ label: 'Add to form', icon: 'add_circle' }];
    }

    const fieldInfo = activeField._info;
    const key = this.fieldService.getKey(activeField) || activeField._info.name;
    const actions: AddFieldAction[] = [];
    if (fieldInfo.isParent) {
      actions.push({
        label: `Add inside ${key}`,
        parentId: fieldInfo.id,
        icon: 'add_box',
      });
    }

    const index = this.formService.getFieldIndex(fieldInfo.id);
    const parentId = fieldInfo.idPath[fieldInfo.idPath.length - 2];
    actions.push({
      label: `Add before ${key}`,
      parentId,
      index: index >= 0 ? index : undefined,
      icon: 'chevron_left',
    });
    actions.push({
      label: `Add after ${key}`,
      parentId,
      index: index >= 0 ? index + 1 : undefined,
      icon: 'chevron_right',
    });
    return actions;
  });
}
