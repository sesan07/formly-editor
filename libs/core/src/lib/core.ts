import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { Drawer } from 'primeng/drawer';
import { Splitter } from 'primeng/splitter';
import { Toast } from 'primeng/toast';
import { CoreResponsiveService } from './core-responsive.service';
import { PanelService } from './editor/panel.service';
import { LHSPanelType, RHSPanelType } from './editor/types';
import { FormPanel } from './panel/form-panel';
import { LHSSidebar } from './sidebar/lhs-sidebar';
import { PanelOptionList } from './sidebar/panel-option-list';
import { RHSSidebar } from './sidebar/rhs-sidebar';
import { TABLET_PANEL_OPTIONS, TabletSidebar } from './sidebar/tablet-sidebar';

@Component({
  selector: 'core-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
  imports: [
    FormPanel,
    Drawer,
    PanelOptionList,
    Splitter,
    LHSSidebar,
    RHSSidebar,
    TabletSidebar,
    Toast,
  ],
  host: { class: 'core-root block h-full min-h-0' },
  template: `
    @if (isDesktop()) {
      <p-splitter
        class="h-full min-h-0"
        stateStorage="local"
        stateKey="formly-studio-main-splitter-desktop"
        [panelStyle]="{ minWidth: '4.9rem' }"
        [panelSizes]="panelSizes()"
        [minSizes]="minSizes()"
      >
        <ng-template #panel>
          <core-lhs-sidebar />
        </ng-template>
        <ng-template #panel>
          <core-form-panel />
        </ng-template>
        <ng-template #panel>
          <core-rhs-sidebar />
        </ng-template>
      </p-splitter>
    } @else if (isTablet()) {
      <p-splitter
        class="h-full min-h-0"
        stateStorage="local"
        stateKey="formly-studio-main-splitter-tablet"
        [panelStyle]="{ minWidth: '4.9rem' }"
        [panelSizes]="tabletPanelSizes()"
        [minSizes]="tabletMinSizes()"
      >
        <ng-template #panel>
          <core-tablet-sidebar />
        </ng-template>
        <ng-template #panel>
          <core-form-panel />
        </ng-template>
      </p-splitter>
    } @else if (isMobile()) {
      <div class="flex h-full min-w-0">
        <core-panel-option-list
          position="left"
          [options]="panelOptions"
          [value]="activePanel()"
          (selected)="openMobilePanel($event)"
        />
        <core-form-panel class="min-w-0 grow" />
      </div>

      <p-drawer
        styleClass="core-root w-full! md:w-[44rem]!"
        header="Editor panels"
        position="left"
        [visible]="mobileDrawerVisible()"
        [modal]="true"
        [dismissible]="true"
        [closeOnEscape]="true"
        [blockScroll]="true"
        [style]="{ width: 'min(92vw, 30rem)' }"
        (visibleChange)="mobileDrawerVisible.set($event)"
      >
        <core-tablet-sidebar class="h-full min-h-0 min-w-0 overflow-hidden" />
      </p-drawer>
    }
    <p-toast position="bottom-center" />
  `,
})
export class Core {
  private readonly destroyRef = inject(DestroyRef);
  private readonly responsiveService = inject(CoreResponsiveService);
  private readonly panelService = inject(PanelService);
  private readonly viewContainerRef = inject(ViewContainerRef);

  protected readonly isDesktop = this.responsiveService.isDesktop;
  protected readonly isTablet = this.responsiveService.isTablet;
  protected readonly isMobile = this.responsiveService.isMobile;
  protected readonly panelSizes = signal([20, 60, 20]);
  protected readonly minSizes = signal([20, 20]);
  protected readonly tabletPanelSizes = signal([40, 60]);
  protected readonly tabletMinSizes = signal([28, 40]);
  protected readonly mobileDrawerVisible = signal(false);
  protected readonly activePanel = this.panelService.activePanel;
  protected readonly panelOptions = TABLET_PANEL_OPTIONS;

  constructor() {
    let destroyed = false;
    this.destroyRef.onDestroy(() => (destroyed = true));

    void import('./app-dialogs').then(({ AppDialogs }) => {
      if (!destroyed) {
        this.viewContainerRef.createComponent(AppDialogs);
      }
    });

    this.panelService.highlightPanel$.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.isMobile()) {
        this.mobileDrawerVisible.set(true);
      }
    });
  }

  openMobilePanel(panel: string): void {
    this.panelService.setActivePanel(panel as LHSPanelType | RHSPanelType);
    this.mobileDrawerVisible.set(true);
  }
}
