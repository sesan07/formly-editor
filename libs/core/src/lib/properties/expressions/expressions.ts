import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Panel, PanelPassThrough } from 'primeng/panel';
import { Empty } from '../../empty/empty';
import { Expression } from './expressions.types';
import { ExpressionsPropertyConfig } from './expressions.config';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { Tooltip } from '../../shared/tooltip';
import { ExpressionItem } from './expression-item';

@Component({
  selector: 'core-field-expressions-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, Panel, ExpressionItem, Empty, Tooltip],
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
          {{ '{' + childProperties().length + '}' }}
        </span>
      </ng-template>
      <ng-template #icons>
        <button
          class="mr-2"
          pButton
          text
          rounded
          aria-label="Add expression"
          coreTooltip="Add expression"
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
      </ng-template>
      <ng-template #headericons>
        <i class="material-symbols-outlined">{{ isCollapsed() ? 'expand_more' : 'expand_less' }}</i>
      </ng-template>
      @for (expression of childProperties(); track expression.key) {
        <core-expression-item
          [index]="$index"
          [key]="expression.key"
          [value]="expression.value"
          (keyChange)="onChildKeyChanged(expression.key, $event)"
          (valueChange)="onChildValueChanged(expression.key, $event)"
          (expressionChange)="onChildExpressionChanged(expression.key, $event)"
          (remove)="onRemoveChild(expression.key)"
        />
      } @empty {
        <core-empty
          label="No expressions yet"
          description="Click the + button to add an expression."
        />
      }
    </p-panel>
  `,
})
export class FieldExpressionsProperty extends BaseProperty<
  ExpressionsPropertyConfig,
  Record<string, string>
> {
  panelPT: PanelPassThrough = {
    header: {
      class: 'cursor-pointer',
    },
  };

  protected defaultValue = {};
  protected propertyType = PropertyType.EXPRESSIONS;

  readonly isCollapsed = signal(true);
  readonly childProperties = computed<Expression[]>(() =>
    Object.entries(this.currentValue()).map(([key, value]) => ({
      key,
      value,
    })),
  );

  onAddChild(event: MouseEvent): void {
    event.stopPropagation();
    this.onChildValueChanged('', '');
  }

  onRemoveChild(key: string): void {
    this._clear([...this.path(), key]);
  }

  onChildKeyChanged(currKey: string, newKey: string): void {
    this._modifyKey([...this.path(), currKey], [...this.path(), newKey]);
  }

  onChildValueChanged(key: string, value: string): void {
    this._modifyValue(value, [...this.path(), key]);
  }

  onChildExpressionChanged(key: string, expression: Expression): void {
    this.onChildKeyChanged(key, expression.key);
    this.onChildValueChanged(expression.key, expression.value);
  }

  protected override _isValidProperty(x: unknown): x is ExpressionsPropertyConfig {
    return this._isBaseProperty(x);
  }
}
