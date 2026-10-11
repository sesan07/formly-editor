import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { FormlyFieldConfig } from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { MarkdownType } from './markdown';
import { withMarkdownType } from './config';

describe('MarkdownType', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownType, ReactiveFormsModule],
    }).compileComponents();
  });

  function createMarkdown(text: string): ComponentFixture<MarkdownType> {
    const fixture = TestBed.createComponent(MarkdownType);

    fixture.componentRef.setInput('field', {
      id: 'markdown',
      type: 'markdown',
      props: { text },
      formControl: new FormControl(),
    } as FormlyFieldConfig);
    fixture.detectChanges();

    return fixture;
  }

  it('registers the markdown Formly type', () => {
    expect(withMarkdownType()).toEqual({
      types: [{ name: 'markdown', component: MarkdownType }],
    });
  });

  it('renders markdown and removes unsafe HTML', async () => {
    const fixture = createMarkdown('# Hello\n\n<script>alert(1)</script>\n\n**world**');

    await fixture.whenStable();
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.markdown-type-content');
    const renderedHtml = content.innerHTML;
    expect(content).toBeTruthy();
    expect(renderedHtml).toContain('<h1>Hello</h1>');
    expect(renderedHtml).toContain('<p><strong>world</strong></p>');
    expect(renderedHtml).not.toContain('<script>');
  });
});
