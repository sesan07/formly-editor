import { CoreFormService } from '../../editor/core-form.service';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { Empty } from '../../empty/empty';
import { CreateFormDialogService } from './create-form-dialog.service';
import { ImportDialogService } from './import-dialog.service';
import { MouseInsideService } from '../../editor/mouse-inside.service';
import { Filter } from '../../shared/filter';
import { PanelHeader } from '../../shared/panel-header';
import { Tooltip } from '../../shared/tooltip';
import { WorkspaceTreeItem } from './workspace-tree-item';

@Component({
  selector: 'core-forms-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MouseInsideService],
  imports: [
    Empty,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ButtonGroup,
    Tooltip,
    Filter,
    PanelHeader,
    WorkspaceTreeItem,
  ],
  host: {
    class: 'overflow-hidden h-full block',
  },
  template: `
    <core-panel-header
      header="Workspace"
      subHeader="Create and manage forms"
    >
      <span
        actions
        class="inline-flex items-center gap-2"
      >
        <p-buttongroup aria-label="Workspace actions">
          <button
            pButton
            severity="secondary"
            aria-label="New folder"
            coreTooltip="New folder"
            tooltipPosition="top"
            (click)="addNewFolder()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              create_new_folder
            </i>
          </button>
          <button
            pButton
            severity="secondary"
            aria-label="Import Form"
            coreTooltip="Import Form"
            tooltipPosition="top"
            (click)="openImportDialog()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              upload
            </i>
          </button>
          <button
            pButton
            aria-label="Create Form"
            coreTooltip="Create Form"
            tooltipPosition="top"
            (click)="addNewForm()"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
            >
              add
            </i>
            <span pButtonLabel>Create Form</span>
          </button>
        </p-buttongroup>
      </span>
    </core-panel-header>

    @if (showFilter()) {
      <div class="flex min-h-0 flex-1 flex-col">
        <div class="min-h-(--sub-panel-header-height) shrink-0 px-4">
          <core-filter
            [(value)]="filterValue"
            (clear)="clearFilter()"
          />
        </div>

        @if (isFiltering() && !filteredVisibleNodeIds().length) {
          <core-empty
            label="No forms or folders found"
            description="Try adjusting your filter criteria."
          />
        } @else if (hierarchyRootNodeIds().length) {
          <ul
            class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4"
            (mouseenter)="setMouseInside(true)"
            (mouseleave)="setMouseInside(false)"
          >
            @for (nodeId of hierarchyRootNodeIds(); track nodeId) {
              <li [class.hidden]="isFiltering() && !filteredVisibleNodeIds().includes(nodeId)">
                <core-workspace-tree-item
                  [nodeId]="nodeId"
                  [isFiltering]="isFiltering()"
                  [filteredVisibleNodeIds]="filteredVisibleNodeIds()"
                />
              </li>
            }
          </ul>
        }
      </div>
    } @else {
      <core-empty
        label="No Forms Yet"
        description="Click the + button to add a new form. You can also add the default form"
      >
        <button
          pButton
          text
          (click)="addNewForm()"
        >
          <i class="material-symbols-outlined">assignment</i>
          Create Form
        </button>
      </core-empty>
    }
  `,
})
export class FormsPanel {
  protected formService = inject(CoreFormService);
  protected mouseInsideService = inject(MouseInsideService);
  protected createFormDialogService = inject(CreateFormDialogService);
  private readonly importDialogService = inject(ImportDialogService);

  formList = this.formService.formList;
  hierarchyRootNodeIds = this.formService.hierarchyRootNodeIds;
  hierarchyNodeMap = this.formService.hierarchyNodeMap;

  readonly filterValue = signal('');
  readonly isFiltering = computed(() => !!this.filterValue().trim());
  readonly showFilter = computed(
    () => this.isFiltering() || this.hierarchyRootNodeIds().length > 0,
  );
  readonly filteredVisibleNodeIds = computed(
    () => {
      const query = this.filterValue().trim().toLowerCase();
      if (!query) {
        return [];
      }

      const nodes = Object.values(this.hierarchyNodeMap());
      const visibleNodeIds = new Set<string>();

      nodes
        .filter((node) => node.name.toLowerCase().includes(query))
        .forEach((node) => {
          node.idPath.forEach((id) => visibleNodeIds.add(id));

          nodes
            .filter(
              (candidate) =>
                candidate.idPath.length >= node.idPath.length &&
                node.idPath.every((id, index) => candidate.idPath[index] === id),
            )
            .forEach((candidate) => visibleNodeIds.add(candidate.id));
        });

      return Array.from(visibleNodeIds);
    },
    {
      equal: (a, b) => a.length === b.length && a.every((val, index) => val === b[index]),
    },
  );

  addNewForm(): void {
    this.createFormDialogService.open();
  }

  addNewFolder(): void {
    this.formService.createFolder?.('New Folder');
  }

  openImportDialog(): void {
    this.importDialogService.open();
  }

  setMouseInside(isInside: boolean) {
    this.mouseInsideService.setMouseInside(isInside);
  }

  clearFilter() {
    this.filterValue.set('');
  }
}
