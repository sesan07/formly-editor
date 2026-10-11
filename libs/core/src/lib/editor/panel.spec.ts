import { describe, expect, it } from 'vitest';
import { PanelService } from './panel.service';

describe('PanelService', () => {
  let service: PanelService;

  beforeEach(() => {
    service = new PanelService();
  });

  it('defaults active LHS panel to forms and RHS panel to field-edit', () => {
    expect(service.activeLHSPanel()).toBe('forms');
    expect(service.activeRHSPanel()).toBe('field-edit');
    expect(service.activePanel()).toBe('forms');
  });

  it('updates LHS panel and emits highlight event', () => {
    let highlighted: string | undefined;
    service.highlightPanel$.subscribe((panel) => (highlighted = panel));

    service.setActiveLHSPanel('fields');

    expect(service.activeLHSPanel()).toBe('fields');
    expect(service.activePanel()).toBe('fields');
    expect(highlighted).toBe('fields');
  });

  it('updates RHS panel and emits highlight event', () => {
    let highlighted: string | undefined;
    service.highlightPanel$.subscribe((panel) => (highlighted = panel));

    service.setActiveRHSPanel('model');

    expect(service.activeRHSPanel()).toBe('model');
    expect(service.activePanel()).toBe('model');
    expect(highlighted).toBe('model');
  });
});
