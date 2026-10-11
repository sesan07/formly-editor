import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Panel, PanelPassThrough } from 'primeng/panel';
import { Empty } from '../../empty/empty';
import { CustomValidation, CustomValidationPropertyConfig } from './custom-validation.config';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { getChildPath } from '../utils';
import { Tooltip } from '../../shared/tooltip';
import { CustomValidationItem } from './custom-validation-item';

@Component({
  selector: 'core-field-custom-validation-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, Panel, CustomValidationItem, Empty, Tooltip],
  template: `
    <p-panel
      toggler="header"
      [pt]="panelPT"
      [toggleable]="true"
      [(collapsed)]="isCollapsed"
    >
      <ng-template #header>
        <span
          class="p-panel-title"
          tooltipPosition="left"
          [coreTooltip]="property().description"
        >
          {{ property().label }}
          {{ '[' + childProperties().length + ']' }}
        </span>
      </ng-template>
      <ng-template #icons>
        @if (defaultAddOption()) {
          <button
            class="mr-2"
            pButton
            text
            rounded
            aria-label="Add custom validation"
            coreTooltip="Add custom validation"
            tooltipPosition="top"
            [style.opacity]="isCollapsed() ? '0' : '1'"
            [style.pointerEvents]="isCollapsed() ? 'none' : 'auto'"
            (click)="onAddChild($event)"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
              >add</i
            >
          </button>
        }
      </ng-template>
      <ng-template #headericons>
        <i class="material-symbols-outlined">{{ isCollapsed() ? 'expand_more' : 'expand_less' }}</i>
      </ng-template>
      @for (customValidation of childProperties(); track $index) {
        <core-custom-validation-item
          [index]="$index"
          [validationOptions]="property().validationOptions"
          [path]="getChildPath(path(), $index)"
          [name]="customValidation.name"
          [target]="target()"
          (remove)="onRemoveChild($index)"
          (targetChanged)="targetChanged.emit($event)"
        />
      } @empty {
        <core-empty
          label="No custom validations"
          description="Click the + button to add a custom validation."
        />
      }
    </p-panel>
  `,
})
export class FieldCustomValidationProperty extends BaseProperty<
  CustomValidationPropertyConfig,
  (string | CustomValidation)[]
> {
  panelPT: PanelPassThrough = {
    header: {
      class: 'cursor-pointer',
    },
  };

  protected defaultValue = [];
  protected propertyType = PropertyType.CUSTOM_VALIDATION;

  readonly isCollapsed = signal(true);
  readonly childProperties = computed(() =>
    this.currentValue().map((item) => (typeof item === 'string' ? { name: item } : item)),
  );

  readonly defaultAddOption = computed(() => {
    const selectedOptions =
      this.currentValue()?.map((v) => (typeof v === 'string' ? v : v.name)) ?? [];
    const availableOptions = this.property()
      .validationOptions.map((opt) => opt.value)
      .filter((opt) => !selectedOptions.includes(opt));
    return availableOptions.length ? availableOptions[0] : null;
  });

  getChildPath = getChildPath;

  onAddChild(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.defaultAddOption()) {
      console.warn('No validation options available to add a new custom validation.');
      return;
    }

    const newValue = [...this.currentValue(), { name: this.defaultAddOption() }];
    this._modifyValue(newValue);
  }

  onRemoveChild(index: number): void {
    const newValue = this.currentValue().filter((_, i) => i !== index);
    this._modifyValue(newValue);
  }

  protected override _isValidProperty(x: unknown): x is CustomValidationPropertyConfig {
    return (
      this._isBaseProperty(x) && 'validationOptions' in x && Array.isArray(x.validationOptions)
    );
  }
}
