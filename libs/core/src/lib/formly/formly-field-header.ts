import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { Menu } from 'primeng/menu';
import { TieredMenu } from 'primeng/tieredmenu';
import { CoreFieldService } from '../config/core-field.service';
import { CoreFormService } from '../editor/core-form.service';
import { FieldPresetDialogService } from '../field-preset/field-preset-dialog.service';
import { EditorField, FieldInfo } from '../model/types';
import { Tooltip } from '../shared';

@Component({
  selector: 'core-formly-field-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, Tooltip, Chip, Menu, TieredMenu],
  host: {
    class: 'flex justify-between rounded-t-sm bg-primary/20 px-2',
    '[class.cursor-grab]': 'isDraggable()',
    '[class.cursor-pointer]': '!isDraggable()',
  },
  template: `
    <div class="flex min-w-24 items-center gap-1.5 overflow-hidden">
      @if (isDraggable()) {
        <i class="material-symbols-outlined opacity-50">drag_indicator</i>
      }
      @if (fieldIcon(); as icon) {
        <i
          class="material-symbols-outlined text-muted-color"
          tooltipPosition="top"
          [style.fontSize]="'1rem'"
          [coreTooltip]="fieldInfo().name"
        >
          {{ icon }}
        </i>
      }
      <span class="truncate">{{ fieldKey() || fieldInfo().name }} </span>
      @if (fieldInfo().badges; as badges) {
        @for (badge of badges; track badge.label) {
          <p-chip
            class="py-0 text-sm"
            tooltipPosition="top"
            [coreTooltip]="badge.description"
            [label]="badge.label"
          />
        }
      }
    </div>
    <div
      class="touch-actions-visible flex items-center gap-2 opacity-0 transition-opacity"
      [class.opacity-100]="areOptionsVisible()"
    >
      @if (addOptions().length) {
        <span class="inline-flex">
          <p-tiered-menu
            #addTieredMenu
            appendTo="body"
            [model]="addOptions()"
            [popup]="true"
          />
          <button
            pButton
            text
            class="size-6"
            aria-label="Add Field"
            coreTooltip="Add Field"
            tooltipPosition="top"
            (click)="openAddMenu($event)"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              add
            </i>
          </button>
        </span>
      }
      @if (replaceOptions().length) {
        <span class="inline-flex">
          <p-tiered-menu
            #replaceOptionsMenu
            appendTo="body"
            [model]="replaceOptions()"
            [popup]="true"
          />
          <button
            pButton
            text
            class="size-6"
            aria-label="Replace Field"
            coreTooltip="Replace Field"
            tooltipPosition="top"
            (click)="openReplaceOptionsMenu($event)"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              swap_horiz
            </i>
          </button>
        </span>
      }
      @if (otherOptions().length) {
        <span class="inline-flex">
          <p-menu
            #otherOptionsMenu
            appendTo="body"
            [model]="otherOptions()"
            [popup]="true"
          >
            <ng-template
              #item
              let-item
            >
              <div
                class="flex cursor-pointer items-center gap-2 px-3 py-1"
                [class.text-button-text-danger]="item.warn"
              >
                @if (item.matIcon) {
                  <i class="material-symbols-outlined">
                    {{ item.matIcon }}
                  </i>
                }
                {{ item.label }}
              </div>
            </ng-template>
          </p-menu>
          <button
            pButton
            text
            class="size-6"
            aria-label="Options"
            coreTooltip="Options"
            tooltipPosition="top"
            (click)="openOtherOptionsMenu($event)"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              more_horiz
            </i>
          </button>
        </span>
      }
    </div>
  `,
})
export class FormlyFieldHeader {
  readonly field = input.required<EditorField>();
  readonly fieldInfo = input.required<FieldInfo>();
  readonly fieldKey = input<string | number | (string | number)[]>();
  readonly isMouseInside = input.required<boolean>();
  readonly addTieredMenuChild = viewChild('addTieredMenu', { read: TieredMenu });
  readonly otherOptionsMenuChild = viewChild('otherOptionsMenu', { read: Menu });
  readonly replaceOptionsMenuChild = viewChild('replaceOptionsMenu', { read: TieredMenu });

  formService = inject(CoreFormService);
  fieldService = inject(CoreFieldService);
  presetDialogService = inject(FieldPresetDialogService);

  readonly savePresetName = signal('');
  readonly savePresetJSON = signal('');
  readonly isSavePresetDialogOpen = signal(false);
  readonly isSavable = computed(() => !this.fieldInfo().isRoot);
  readonly isRemovable = computed(() => !this.fieldInfo().isRoot);
  readonly isDraggable = computed(() => !this.fieldInfo().isRoot);
  readonly fieldIcon = computed(() => {
    return this.fieldService.getFieldIcon(this.field());
  });
  readonly addOptions = computed(() => this.formService.getAddOptions(this.fieldInfo()));
  readonly replaceOptions = computed(() => this.formService.getReplaceOptions(this.fieldInfo()));
  readonly otherOptions = computed(() => {
    const options: MenuItem[] = [];
    const fieldInfo = this.fieldInfo();
    const fieldIndex = this.formService.getFieldIndex(fieldInfo.id);
    const siblingIds = this.siblingIds();

    if (fieldIndex > 0) {
      options.push({
        label: 'Move up',
        matIcon: 'arrow_upward',
        command: () => this.moveField(-1),
      });
    }
    if (fieldIndex >= 0 && fieldIndex < siblingIds.length - 1) {
      options.push({
        label: 'Move down',
        matIcon: 'arrow_downward',
        command: () => this.moveField(1),
      });
    }

    if (!this.fieldInfo().isRoot) {
      options.push(
        {
          label: 'Save as Preset',
          matIcon: 'save',
          command: () => this.openPresetDialog(),
        },
        {
          label: 'Remove',
          matIcon: 'delete',
          warn: true,
          command: () => this.removeField(),
        },
      );
    }

    return options;
  });
  readonly siblingIds = computed(() => {
    const parentId = this.fieldInfo().idPath[this.fieldInfo().idPath.length - 2];
    if (!parentId) {
      return this.formService.activeRootFieldIds();
    }

    const parent = this.formService.getField(parentId);
    return parent ? this.fieldService.getChildIds(parent._info) : [];
  });
  readonly areOptionsVisible = computed(
    () =>
      this.isMouseInside() ||
      this.addTieredMenuChild()?.visible ||
      this.otherOptionsMenuChild()?.visible ||
      this.replaceOptionsMenuChild()?.visible,
  );

  openAddMenu(event: MouseEvent) {
    this.addTieredMenuChild()?.show(event);
    event.preventDefault();
  }

  openOtherOptionsMenu(event: MouseEvent) {
    this.otherOptionsMenuChild()?.show(event);
    event.preventDefault();
  }

  openReplaceOptionsMenu(event: MouseEvent) {
    this.replaceOptionsMenuChild()?.show(event);
    event.preventDefault();
  }

  openPresetDialog() {
    const fieldMap = this.formService.activeFieldMap();
    const field = this.formService.buildField(this.fieldInfo().id, fieldMap);
    this.formService.cleanField(field);
    const fieldJSON = JSON.stringify(field, null, 2);

    this.presetDialogService.open({
      name: `My ${this.fieldInfo().name}`,
      json: fieldJSON,
    });
  }

  removeField() {
    this.formService.removeField(this.fieldInfo().id);
  }

  moveField(direction: -1 | 1): void {
    const fieldInfo = this.fieldInfo();
    const fieldIndex = this.formService.getFieldIndex(fieldInfo.id);
    if (fieldIndex < 0) {
      return;
    }

    const parentId = fieldInfo.idPath[fieldInfo.idPath.length - 2];
    const targetIndex = direction === -1 ? fieldIndex - 1 : fieldIndex + 2;
    this.formService.moveField(fieldInfo.id, fieldIndex, targetIndex, parentId);
  }
}
