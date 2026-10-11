import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownDialogService } from './markdown-dialog.service';
import { PropertyChangeType } from '../types';
import { FieldMarkdownProperty } from './markdown';
import { createMarkdownProperty } from './markdown.config';

describe('FieldMarkdownProperty', () => {
  let fixture: ComponentFixture<FieldMarkdownProperty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldMarkdownProperty],
      providers: [MarkdownDialogService, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldMarkdownProperty);
    fixture.componentRef.setInput(
      'property',
      createMarkdownProperty({
        label: 'Text',
        key: 'props.text',
        clearOnEmpty: true,
      }),
    );
    fixture.componentRef.setInput('path', ['text']);
    fixture.componentRef.setInput('target', { text: '# Initial' });
    fixture.detectChanges();
  });

  it('emits Markdown text changes at the property path', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.onValueChange('## Updated');

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['text'],
      value: '## Updated',
    });
  });

  it('clears empty Markdown text by default', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.onValueChange('');

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.CLEAR,
      path: ['text'],
    });
  });

  it('opens the dialog with the current text and saves through the property path', () => {
    const changed = vi.fn();
    const dialogService = TestBed.inject(MarkdownDialogService);
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.openEditor();
    dialogService.data()?.saveCallback('## Saved');

    expect(dialogService.data()?.value).toBe('# Initial');
    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['text'],
      value: '## Saved',
    });
  });
});
