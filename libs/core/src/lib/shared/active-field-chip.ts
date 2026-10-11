import { CoreFormService } from '../editor/core-form.service';
import { CoreFieldService } from '../config/core-field.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chip } from 'primeng/chip';
import { Tooltip } from './tooltip';

interface ActiveFieldData {
  key?: string;
  icon?: string;
  name?: string;
}
const EMPTY_DATA: ActiveFieldData = {};

@Component({
  selector: 'core-active-field-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Chip, Tooltip],
  template: `
    @if (activeField()) {
      <p-chip
        class="px-2 py-1"
        coreTooltip="Active Field"
        tooltipPosition="top"
      >
        <i class="material-symbols-outlined">{{ activeFieldData().icon }}</i>
        <span class="ml-1 font-medium">{{ activeFieldData().key }}</span>
      </p-chip>
    }
  `,
})
export class ActiveFieldChip {
  protected formService = inject(CoreFormService);
  protected fieldService = inject(CoreFieldService);

  activeField = this.formService.activeField;

  readonly activeFieldData = computed<ActiveFieldData>(() => {
    const activeField = this.activeField();
    if (!activeField) {
      return EMPTY_DATA;
    }

    return {
      key: this.fieldService.getKey(activeField) || activeField._info.name,
      icon: this.fieldService.getFieldIcon(activeField),
      name: activeField._info.name,
    };
  });
}
