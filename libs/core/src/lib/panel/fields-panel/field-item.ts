import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { TieredMenu } from 'primeng/tieredmenu';
import { CoreFieldService } from '../../config/core-field.service';
import { CoreFormService } from '../../editor/core-form.service';
import { FieldPresetDialogService } from '../../field-preset/field-preset-dialog.service';
import { Tooltip, TreeItem } from '../../shared';

@Component({
  selector: 'core-panel-field-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, Tooltip, Chip, TieredMenu, TreeItem],
  template: `
    <core-tree-item
      #folderTreeItem
      [isParent]="isParent()"
      [level]="level()"
      [isActive]="isActiveField()"
      [isExpanded]="!isCollapsed()"
      [alwaysShowActions]="alwaysShowActions()"
      (click)="setActive($event)"
      (keydown.enter)="setActive($event)"
      (toggleClicked)="toggleCollapsed($event)"
    >
      <span class="inline-flex items-center gap-2 overflow-hidden">
        <span
          class="inline-flex items-center gap-2 truncate"
          [class.font-medium]="isParent()"
        >
          @if (fieldIcon(); as icon) {
            <i
              class="material-symbols-outlined text-muted-color"
              tooltipPosition="top"
              [style.fontSize]="'1.25rem'"
              [coreTooltip]="fieldInfo().name"
              >{{ icon }}</i
            >
          }
          <span>{{ fieldKey() || fieldInfo().name }} </span>
          @if (isParent()) {
            <span class="text-xs text-muted-color">[{{ childIds().length }}]</span>
          }
        </span>
        @if (isHidden()) {
          <i class="material-symbols-outlined"> visibility_off </i>
        }
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
      </span>

      <ng-container actions>
        @if (menuOptions().length) {
          <span class="inline-flex">
            <p-tiered-menu
              #optionsMenu
              appendTo="body"
              [model]="menuOptions()"
              [popup]="true"
              (onShow)="optionsMenuVisible.set(true)"
              (onHide)="optionsMenuVisible.set(false)"
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
            </p-tiered-menu>
            <button
              pButton
              text
              rounded
              class="size-8"
              aria-label="Field options"
              coreTooltip="Field options"
              tooltipPosition="top"
              (click)="openOptionsMenu($event)"
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
      </ng-container>
    </core-tree-item>

    @if (hasChildren()) {
      <ul>
        @for (childId of childIds(); track childId) {
          <li
            [class.hidden]="
              isCollapsed() || (isFiltering() && !filteredVisibleFieldIds().includes(childId))
            "
            [class.block]="!isCollapsed()"
          >
            <core-panel-field-item
              [fieldId]="childId"
              [level]="level() + 1"
              [isFiltering]="isFiltering()"
              [filteredVisibleFieldIds]="filteredVisibleFieldIds()"
              (expandParent)="onExpandParent()"
            />
          </li>
        }
      </ul>
    }
  `,
})
export class FieldItem {
  readonly fieldId = input.required<string>();
  readonly isFiltering = input(false, { transform: booleanAttribute });
  readonly filteredVisibleFieldIds = input.required<string[]>();
  readonly level = input(0, { transform: numberAttribute });
  readonly isTabRoot = input(false, { transform: booleanAttribute });
  expandParent = output<void>();
  readonly optionsMenu = viewChild('optionsMenu', { read: TieredMenu });

  protected document = inject(DOCUMENT);
  protected formService = inject(CoreFormService);
  protected fieldService = inject(CoreFieldService);
  protected presetDialogService = inject(FieldPresetDialogService);

  linePaddingLeft = `calc(var(--spacing) * 3.75)`;

  readonly isCollapsed = signal(false);
  readonly optionsMenuVisible = signal(false);

  readonly field = computed(() => {
    return this.formService.activeFieldMap()[this.fieldId()];
  });
  readonly fieldInfo = computed(() => this.field()._info);
  readonly fieldKey = computed(() => this.fieldService.getKey(this.field()));
  readonly childIds = computed(() => {
    return this.fieldService.getChildIds(this.fieldInfo());
  });
  readonly hasChildren = computed(() => this.childIds().length > 0);
  readonly isParent = computed(() => this.fieldInfo().isParent);
  readonly isActiveField = computed(() => {
    return this.fieldId() === this.formService.activeFieldId();
  });
  readonly isHidden = computed(() => {
    return this.field().hide;
  });
  readonly fieldIcon = computed(() => {
    return this.fieldService.getFieldIcon(this.field());
  });
  readonly alwaysShowActions = computed(() => this.optionsMenuVisible());
  readonly addOptions = computed(() => this.formService.getAddOptions(this.fieldInfo()));
  readonly replaceOptions = computed(() => this.formService.getReplaceOptions(this.fieldInfo()));
  readonly otherOptions = computed(() => {
    const options: MenuItem[] = [];
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
  readonly menuOptions = computed(() => {
    const options: MenuItem[] = [];
    const addOptions = this.addOptions();
    const replaceOptions = this.replaceOptions();
    if (addOptions.length) {
      options.push({ label: 'Add Field', matIcon: 'add', items: addOptions });
    }
    if (replaceOptions.length) {
      options.push({ label: 'Replace Field', matIcon: 'swap_horiz', items: replaceOptions });
    }
    options.push(...this.otherOptions());
    return options;
  });

  constructor() {
    effect(() => {
      if (this.isActiveField()) {
        this.expandParent.emit();
      }
    });
  }

  setActive(event: Event): void {
    if (event.defaultPrevented) {
      return;
    }

    if (this.isActiveField()) {
      this.toggleCollapsed(event);
    } else {
      this.formService.setActiveField(this.fieldId());
      this.isCollapsed.set(false);
      this.scrollToField();
    }
    event.preventDefault();
  }

  toggleCollapsed(event: Event): void {
    if (event.defaultPrevented) {
      return;
    }

    this.isCollapsed.set(!this.isCollapsed());
    event.preventDefault();
  }

  onExpandParent() {
    this.isCollapsed.set(false);
    this.expandParent.emit();
  }

  removeField() {
    this.formService.removeField(this.fieldInfo().id);
  }

  openOptionsMenu(event: MouseEvent) {
    this.optionsMenu()?.show(event);
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

  protected scrollToField() {
    const element = this.document.getElementById(this.fieldId());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}
