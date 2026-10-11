import { inject, Injectable, linkedSignal } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FieldInfo } from '../model/types';
import { CoreFormService } from './core-form.service';

type StatefulField = FormlyFieldConfig & { _info?: Pick<FieldInfo, 'id'> };

@Injectable()
export class BuilderFieldStateService {
  private readonly formService = inject(CoreFormService);
  private readonly state = linkedSignal({
    source: this.formService.activeFieldMap,
    computation: (fields, previous): Record<string, unknown> =>
      Object.fromEntries(
        Object.entries(previous?.value ?? {}).filter(([id]) => Object.hasOwn(fields, id)),
      ),
  });

  getState<T>(field: StatefulField): T | undefined {
    const id = field._info?.id;
    return id && Object.hasOwn(this.formService.activeFieldMap(), id)
      ? (this.state()[id] as T | undefined)
      : undefined;
  }

  setState<T>(field: StatefulField, state: T): void {
    const id = field._info?.id;
    if (!id || !Object.hasOwn(this.formService.activeFieldMap(), id)) {
      return;
    }

    this.state.update((current) => ({ ...current, [id]: state }));
  }
}
