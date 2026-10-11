import { CoreFormService } from '../../editor/core-form.service';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { CoreLibraryService } from '../../config/core-library.service';
import { CreateFormDialogService } from './create-form-dialog.service';
import { MouseInsideService } from '../../editor/mouse-inside.service';
import { Tooltip } from '../../shared';
import { NameEditPopover } from '../../shared/name-edit-popover';
import { TreeItem } from '../../shared/tree-item';

@Component({
  selector: 'core-workspace-tree-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, Tooltip, TreeItem, Menu, NameEditPopover],
  template: `
    @if (node(); as item) {
      @if (item.type === 'folder') {
        <div class="flex flex-col">
          <core-tree-item
            #folderTreeItem
            isParent
            [level]="level()"
            [isExpanded]="isExpanded()"
            [alwaysShowActions]="alwaysShowFolderActions()"
            (click)="toggleFolder($event)"
            (toggleClicked)="toggleFolder($event)"
          >
            <i class="material-symbols-outlined text-primary">
              {{ isExpanded() ? 'folder_open' : 'folder' }}
            </i>
            <span class="truncate font-medium">{{ item.name }}</span>

            <ng-container actions>
              <button
                pButton
                text
                class="size-8"
                rounded
                aria-label="Options"
                coreTooltip="Options"
                tooltipPosition="top"
                (click)="$event.preventDefault(); folderMenu.toggle($event)"
              >
                <i
                  pButtonIcon
                  class="material-symbols-outlined"
                >
                  more_vert
                </i>
              </button>
            </ng-container>
          </core-tree-item>

          <p-menu
            #folderMenu
            [model]="folderMenuItems"
            [popup]="true"
            (onShow)="folderMenuVisible.set(true)"
            (onHide)="folderMenuVisible.set(false)"
          />

          <core-name-edit-popover
            #folderNamePopover
            title="Edit Folder Name"
            placeholder="Folder name"
            [(value)]="folderNameEditValue"
            (save)="setFolderName()"
            (visibleChange)="folderPopoverVisible.set($event)"
          />

          <ul>
            @if (hasChildren()) {
              @for (childId of childIds(); track childId) {
                <li
                  [class.hidden]="
                    !isExpanded() || (isFiltering() && !filteredVisibleNodeIds().includes(childId))
                  "
                  [class.block]="isExpanded()"
                >
                  <core-workspace-tree-item
                    [nodeId]="childId"
                    [level]="level() + 1"
                    [isFiltering]="isFiltering()"
                    [filteredVisibleNodeIds]="filteredVisibleNodeIds()"
                  />
                </li>
              }
            } @else if (isExpanded()) {
              <li>
                <core-tree-item
                  canInteract="false"
                  [level]="level() + 1"
                >
                  <i class="material-symbols-outlined text-muted-color">box</i>
                  <span class="text-sm text-muted-color italic">No forms yet</span>
                </core-tree-item>
              </li>
            }
          </ul>
        </div>
      } @else if (item.type === 'form') {
        <core-tree-item
          #formTreeItem
          [level]="level()"
          [isActive]="isActiveForm()"
          [alwaysShowActions]="alwaysShowFormActions()"
          (click)="selectForm($event)"
        >
          <div class="flex min-w-0 flex-col gap-0.5">
            <div class="flex items-center gap-1.5">
              <i class="material-symbols-outlined text-content-secondary"> description </i>
              <span class="truncate">{{ item.name }}</span>
            </div>
            <div class="ml-8 flex items-center gap-1.5 text-sm text-muted-color">
              @if (uiConfigLabel()) {
                <span>{{ uiConfigLabel() }}</span>
              }
              @if (formFieldCount() !== undefined) {
                <span>&bull;</span>
                <span>{{ formFieldCount() + ' Field' + (formFieldCount() === 1 ? '' : 's') }}</span>
              }
            </div>
          </div>

          <ng-container actions>
            <button
              pButton
              text
              class="size-8"
              rounded
              aria-label="Options"
              coreTooltip="Options"
              tooltipPosition="top"
              (click)="$event.preventDefault(); formMenu.toggle($event)"
            >
              <i
                pButtonIcon
                class="material-symbols-outlined"
              >
                more_vert
              </i>
            </button>
          </ng-container>
        </core-tree-item>

        <p-menu
          #formMenu
          [model]="formMenuItems"
          [popup]="true"
          (onShow)="formNameMenuVisible.set(true)"
          (onHide)="formNameMenuVisible.set(false)"
        />

        <core-name-edit-popover
          #formNamePopover
          title="Edit Form Name"
          placeholder="Form name"
          [(value)]="formNameEditValue"
          (save)="setFormName()"
          (visibleChange)="formNamePopoverVisible.set($event)"
        />
      }
    }
  `,
})
export class WorkspaceTreeItem {
  readonly nodeId = input.required<string>();
  readonly level = input(0, { transform: numberAttribute });
  readonly isFiltering = input(false, { transform: booleanAttribute });
  readonly filteredVisibleNodeIds = input<string[]>([]);

  readonly formTreeItemRef = viewChild('formTreeItem', { read: ElementRef });
  readonly folderTreeItemRef = viewChild('folderTreeItem', { read: ElementRef });
  readonly formNamePopover = viewChild('formNamePopover', { read: NameEditPopover });
  readonly folderNamePopover = viewChild('folderNamePopover', { read: NameEditPopover });

  protected formService = inject(CoreFormService);
  protected libraryService = inject(CoreLibraryService);
  protected mouseInsideService = inject(MouseInsideService);
  protected createFormDialogService = inject(CreateFormDialogService);

  isMouseInsideRoot = this.mouseInsideService.isMouseInside;
  linePaddingLeft = `calc(var(--spacing) * 3.75)`;

  folderMenuItems: MenuItem[] = [
    { label: 'Add Folder', command: () => this.addFolderInFolder() },
    { label: 'Add Form', command: () => this.addFormInFolder() },
    {
      label: 'Edit Name',
      command: () => {
        this.folderNameEditValue.set(this.node()?.name ?? '');
        this.folderNamePopover()?.show(this.folderTreeItemRef()?.nativeElement);
      },
    },
    { label: 'Delete', command: () => this.deleteNode() },
  ];

  formMenuItems: MenuItem[] = [
    {
      label: 'Edit Name',
      command: () => {
        this.formNameEditValue.set(this.node()?.name ?? '');
        this.formNamePopover()?.show(this.formTreeItemRef()?.nativeElement);
      },
    },
    { label: 'Delete', command: () => this.deleteNode() },
  ];

  readonly isMouseInside = signal(false);
  readonly formNameEditValue = signal('');
  readonly formNameMenuVisible = signal(false);
  readonly formNamePopoverVisible = signal(false);

  readonly folderNameEditValue = signal('');
  readonly folderMenuVisible = signal(false);
  readonly folderPopoverVisible = signal(false);

  readonly alwaysShowFormActions = computed(
    () => this.formNameMenuVisible() || this.formNamePopoverVisible(),
  );

  readonly alwaysShowFolderActions = computed(
    () => this.folderMenuVisible() || this.folderPopoverVisible(),
  );

  readonly node = computed(() => {
    return this.formService.hierarchyNodeMap()[this.nodeId()];
  });

  readonly isExpanded = computed(() => {
    const n = this.node();
    return n && n.type === 'folder' ? !!n.isExpanded : false;
  });

  readonly childIds = computed(() => {
    const n = this.node();
    return n && n.type === 'folder' ? n.childIds : [];
  });

  readonly hasChildren = computed(() => this.childIds().length > 0);

  readonly formFieldCount = computed(() => {
    const n = this.node();
    return n && n.type === 'form' ? n.fieldCount : undefined;
  });

  readonly uiConfigLabel = computed(() => {
    const n = this.node();
    if (n && n.type === 'form' && n.libraryId) {
      return this.libraryService.getLibraryLabel(n.libraryId) ?? null;
    }
    return null;
  });

  readonly isActiveForm = computed(() => {
    const n = this.node();
    return n && n.type === 'form' ? this.formService.activeFormId() === n.id : false;
  });

  readonly lines = computed(() => Array.from({ length: this.level() }, (_, i) => i));
  readonly paddingLeft = computed(
    () => `calc(((var(--spacing) * 4) * ${this.level()}) + var(--spacing))`,
  );

  toggleFolder(event: MouseEvent) {
    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    this.formService.toggleFolderExpansion(this.nodeId());
  }

  selectForm(event: MouseEvent) {
    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    const n = this.node();
    if (n && n.type === 'form' && !this.isActiveForm()) {
      this.formService.setActiveForm(n.id);
    }
  }

  addFolderInFolder() {
    this.formService.createFolder?.('New Folder', this.nodeId());
  }

  addFormInFolder() {
    this.createFormDialogService.open(this.nodeId());
  }

  deleteNode() {
    this.formService.deleteWorkspaceNode(this.nodeId());
  }

  setFormName() {
    const newName = this.formNameEditValue();
    this.formNameEditValue.set('');
    this.formNamePopover()?.hide();

    if (!newName.trim()) {
      return;
    }

    this.formService.setWorkspaceNodeName(this.nodeId(), newName);
  }

  setFolderName() {
    const newName = this.folderNameEditValue();
    this.folderNameEditValue.set('');
    this.folderNamePopover()?.hide();

    if (!newName.trim()) {
      return;
    }

    this.formService.setWorkspaceNodeName(this.nodeId(), newName);
  }
}
