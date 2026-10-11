import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { LHSPanelType, RHSPanelType } from './types';

@Injectable()
export class PanelService {
  protected readonly activePanelSrc = signal<LHSPanelType | RHSPanelType>('forms');
  readonly activePanel = this.activePanelSrc.asReadonly();

  protected readonly activeLHSPanelSrc = signal<LHSPanelType>('forms');
  readonly activeLHSPanel = this.activeLHSPanelSrc.asReadonly();

  protected readonly activeRHSPanelSrc = signal<RHSPanelType>('field-edit');
  readonly activeRHSPanel = this.activeRHSPanelSrc.asReadonly();

  protected highlightPanelSrc$ = new Subject<RHSPanelType | LHSPanelType>();
  readonly highlightPanel$ = this.highlightPanelSrc$.asObservable();

  setActivePanel(panel: LHSPanelType | RHSPanelType) {
    if (panel === 'forms' || panel === 'fields' || panel === 'add-field') {
      this.setActiveLHSPanel(panel);
    } else {
      this.setActiveRHSPanel(panel);
    }
  }

  setActiveLHSPanel(panel: LHSPanelType) {
    this.activeLHSPanelSrc.set(panel);
    this.activePanelSrc.set(panel);
    this.highlightPanelSrc$.next(panel);
  }

  setActiveRHSPanel(panel: RHSPanelType) {
    this.activeRHSPanelSrc.set(panel);
    this.activePanelSrc.set(panel);
    this.highlightPanelSrc$.next(panel);
  }
}
