import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { get } from 'lodash-es';
import { Select, SelectPassThrough } from 'primeng/select';
import { CoreFieldService } from '../../config/core-field.service';
import { CoreFormService } from '../../editor/core-form.service';
import { FieldPropertyWrapper } from '../../properties/property-wrapper';
import { PropertyChange, PropertyChangeType } from '../../properties/types';
import { Breakpoint, ClassType, CORE_STYLES_CONFIG, StyleOptionConfig } from './types';
import {
  classTokens,
  findVariant,
  formatVariant,
  removeInvalidDependencies,
  removeOptionClasses,
} from './utils';

@Component({
  selector: 'core-styling-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Select, FormsModule, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="option().name"
      [labelForId]="selectId"
      [isClearable]="true"
      (clear)="clear()"
    >
      <p-select
        class="w-full"
        checkmark
        [virtualScroll]="true"
        [virtualScrollItemSize]="38"
        [inputId]="selectId"
        [pt]="selectPT"
        [options]="option().variants"
        [ngModel]="selectedVariant()"
        (onChange)="selectVariant($event.value)"
      />
    </core-field-property-wrapper>
  `,
})
export class StylingOption {
  readonly option = input.required<StyleOptionConfig>();
  readonly breakpoint = input.required<Breakpoint>();
  readonly classType = input.required<ClassType>();
  fieldChange = output<PropertyChange>();

  formService = inject(CoreFormService);
  fieldService = inject(CoreFieldService);
  stylesConfig = inject(CORE_STYLES_CONFIG);

  activeField = this.formService.activeField;
  classNamePath = this.fieldService.classNamePath;
  fieldGroupClassNamePath = this.fieldService.fieldGroupClassNamePath;
  breakpointAffix = this.stylesConfig.breakpointAffix;
  selectId = `styling-option-select-${Math.random().toString(36).substring(2, 15)}`;

  readonly classPath = computed(() =>
    this.classType() === ClassType.CLASS_NAME ? this.classNamePath : this.fieldGroupClassNamePath,
  );
  readonly classValue = computed(() =>
    this.activeField()
      ? ((get(this.activeField(), this.classPath()) as string | null | undefined) ?? '')
      : '',
  );
  readonly selectedVariant = computed(() =>
    findVariant(this.classValue(), this.option(), this.breakpoint(), this.breakpointAffix),
  );

  selectPT: SelectPassThrough = {
    option: {
      style: { height: '36px' }, // Using px to match virtual scroll item height
    },
  };
  itemSize = 38; // 36px height + 2px gap

  selectVariant(variant: string): void {
    if (variant && !this.option().variants.includes(variant)) {
      return;
    }
    const formattedVariant = variant
      ? formatVariant(variant, this.option(), this.breakpoint(), this.breakpointAffix)
      : '';
    const remaining = removeOptionClasses(
      this.classValue(),
      this.option(),
      this.breakpoint(),
      this.breakpointAffix,
    );

    if (
      variant &&
      variant === this.selectedVariant() &&
      classTokens(this.classValue()).length - classTokens(remaining).length === 1
    ) {
      return;
    }

    const field = this.activeField();
    if (!field) {
      return;
    }

    const previous = {
      [ClassType.CLASS_NAME]: (get(field, this.classNamePath) as string | null | undefined) ?? '',
      [ClassType.FIELD_GROUP_CLASS_NAME]:
        (get(field, this.fieldGroupClassNamePath) as string | null | undefined) ?? '',
    };

    const result = removeInvalidDependencies(
      previous,
      {
        ...previous,
        [this.classType()]: [remaining, formattedVariant].filter((token) => !!token).join(' '),
      },
      this.stylesConfig,
    );

    const changes: PropertyChange[] = [];
    for (const classType of [
      this.classType(),
      this.classType() === ClassType.CLASS_NAME
        ? ClassType.FIELD_GROUP_CLASS_NAME
        : ClassType.CLASS_NAME,
    ]) {
      if (result[classType] === previous[classType]) {
        continue;
      }

      const path =
        classType === ClassType.CLASS_NAME ? this.classNamePath : this.fieldGroupClassNamePath;
      changes.push(
        result[classType]
          ? { type: PropertyChangeType.VALUE, path, value: result[classType] }
          : { type: PropertyChangeType.CLEAR, path },
      );
    }

    for (const change of changes) {
      this.fieldChange.emit(change);
    }
  }

  protected clear(): void {
    this.selectVariant('');
  }
}
