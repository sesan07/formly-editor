import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PanelService } from '../editor/panel.service';
import { TabletSidebar } from './tablet-sidebar';

describe('TabletSidebar', () => {
  let fixture: ComponentFixture<TabletSidebar>;
  let panelService: PanelService;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    TestBed.overrideComponent(TabletSidebar, {
      set: {
        imports: [],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    await TestBed.configureTestingModule({
      imports: [TabletSidebar],
      providers: [PanelService],
    }).compileComponents();

    fixture = TestBed.createComponent(TabletSidebar);
    panelService = TestBed.inject(PanelService);
    fixture.detectChanges();
  });

  it('defines all seven tablet panel workflows', () => {
    const options = fixture.componentInstance['panelOptions'];

    expect(options.map((option) => option.value)).toEqual([
      'forms',
      'fields',
      'add-field',
      'field-edit',
      'validation',
      'styling',
      'model',
    ]);
  });

  it('routes left and right workflows through PanelService', () => {
    fixture.componentInstance.setActivePanel('fields');
    expect(panelService.activePanel()).toBe('fields');
    expect(panelService.activeLHSPanel()).toBe('fields');

    fixture.componentInstance.setActivePanel('model');
    expect(panelService.activePanel()).toBe('model');
    expect(panelService.activeRHSPanel()).toBe('model');

    fixture.componentInstance.setActivePanel('validation');
    expect(panelService.activePanel()).toBe('validation');
    expect(panelService.activeRHSPanel()).toBe('validation');
  });
});
