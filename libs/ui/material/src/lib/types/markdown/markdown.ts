import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { FormlyFieldConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/material/form-field';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { MarkdownProps } from './types';

@Component({
  selector: 'lib-markdown-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ReactiveFormsModule],
  template: `
    <div
      class="markdown-type-content"
      [innerHTML]="sanitizedHtml()"
    ></div>
  `,
  styles: [
    `
      .markdown-type-content {
        --markdown-type-content-border-color: color-mix(in srgb, currentColor 20%, transparent);
        --markdown-type-content-code-background: color-mix(in srgb, currentColor 10%, transparent);
        --markdown-type-content-muted-color: color-mix(in srgb, currentColor 70%, transparent);
        color: inherit;
        overflow-wrap: anywhere;
      }

      .markdown-type-content :where(h1, h2, h3, h4, h5, h6) {
        color: inherit;
        font-weight: 700;
        line-height: 1.25;
        margin: 1.5em 0 0.5em;
      }

      .markdown-type-content :where(h1) {
        border-bottom: 1px solid var(--markdown-type-content-border-color);
        font-size: 1.5rem;
        padding-bottom: 0.3em;
      }

      .markdown-type-content :where(h2) {
        border-bottom: 1px solid var(--markdown-type-content-border-color);
        font-size: 1.25rem;
        padding-bottom: 0.3em;
      }

      .markdown-type-content :where(h3) {
        font-size: 1.125rem;
      }

      .markdown-type-content :where(h1, h2, h3, h4, h5, h6):first-child {
        margin-top: 0;
      }

      .markdown-type-content :where(p, ul, ol, blockquote, pre, table) {
        margin: 0 0 1rem;
      }

      .markdown-type-content :where(ul, ol) {
        padding-left: 1.5rem;
      }

      .markdown-type-content :where(ul) {
        list-style: disc;
      }

      .markdown-type-content :where(ol) {
        list-style: decimal;
      }

      .markdown-type-content :where(li + li) {
        margin-top: 0.25rem;
      }

      .markdown-type-content :where(blockquote) {
        border-left: 0.25rem solid var(--markdown-type-content-border-color);
        color: var(--markdown-type-content-muted-color);
        padding: 0.25rem 1rem;
      }

      .markdown-type-content :where(code) {
        background: var(--markdown-type-content-code-background);
        border-radius: 0.25rem;
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
          monospace;
        font-size: 0.875em;
        padding: 0.15em 0.35em;
      }

      .markdown-type-content :where(pre) {
        background: var(--markdown-type-content-code-background);
        border: 1px solid var(--markdown-type-content-border-color);
        border-radius: 0.375rem;
        overflow-x: auto;
        padding: 1rem;
      }

      .markdown-type-content :where(pre code) {
        background: transparent;
        border-radius: 0;
        padding: 0;
      }

      .markdown-type-content :where(a) {
        color: inherit;
        text-decoration: underline;
        text-underline-offset: 0.15em;
      }

      .markdown-type-content :where(a:hover) {
        text-decoration-thickness: 0.125rem;
      }

      .markdown-type-content :where(hr) {
        border: 0;
        border-top: 1px solid var(--markdown-type-content-border-color);
        margin: 1.5rem 0;
      }

      .markdown-type-content :where(img) {
        border-radius: 0.375rem;
        height: auto;
        max-width: 100%;
      }

      .markdown-type-content :where(table) {
        border-collapse: collapse;
        display: block;
        max-width: 100%;
        overflow-x: auto;
      }

      .markdown-type-content :where(th, td) {
        border: 1px solid var(--markdown-type-content-border-color);
        padding: 0.5rem 0.75rem;
        text-align: left;
      }

      .markdown-type-content :where(th) {
        background: var(--markdown-type-content-code-background);
        font-weight: 700;
      }
    `,
  ],
})
export class MarkdownType extends FieldType<FormlyFieldConfig<MarkdownProps>> implements OnInit {
  readonly sanitizedHtml = signal('');

  async ngOnInit(): Promise<void> {
    const rawHtml = await marked.parse(this.props.text ?? '');
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    this.sanitizedHtml.set(cleanHtml);
  }
}
