import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { Compartment, EditorState, Extension } from '@codemirror/state';
import { EditorView, placeholder } from '@codemirror/view';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { basicSetup } from 'codemirror';
import { CORE_THEME } from '../theme';

@Component({
  selector: 'core-code-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class CodeEditor implements AfterViewInit, OnDestroy {
  readonly text = model.required<string>();
  readonly placeholderText = input<string>('');
  readonly mode = input<'javascript' | 'json' | 'markdown'>('javascript');
  readonly editable = input(true, { transform: booleanAttribute });
  readonly editorRef = viewChild.required<ElementRef<HTMLDivElement>>('editorRef');

  theme = inject(CORE_THEME, { optional: true });
  elementRef = inject(ElementRef);

  protected view: EditorView | undefined;
  protected themeConfig = new Compartment();

  constructor() {
    // Keep the editor document in sync with the `text` input signal.
    effect(() => {
      const newText = this.text();
      const view = this.view;
      if (!view) return;
      const current = view.state.doc.toString();
      if (current !== newText) {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: newText } });
      }
    });

    // Update the editor theme when the application theme changes.
    effect(() => {
      const isDarkMode = this.theme?.() === 'dark';
      const view = this.view;
      if (!view) return;
      view.dispatch({
        effects: this.themeConfig.reconfigure(isDarkMode ? vscodeDark : vscodeLight),
      });
    });
  }

  ngAfterViewInit(): void {
    this.view = new EditorView({
      doc: this.text(),
      extensions: [
        placeholder(this.placeholderText() || ''),
        basicSetup,
        ...this.getModeExtensions(),
        ...this.getEditableExtensions(),
        this.getValueChangeExtension(),
        this.themeConfig.of(this.theme?.() === 'dark' ? vscodeDark : vscodeLight),
      ],
      parent: this.elementRef.nativeElement,
    });
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }

  getModeExtensions(): Extension[] {
    switch (this.mode()) {
      case 'javascript':
        return [javascript()];
      case 'json':
        return [json()];
      case 'markdown':
        return [markdown({ base: markdownLanguage })];
    }
  }

  getEditableExtensions() {
    return !this.editable() ? [EditorState.readOnly.of(true), EditorView.editable.of(false)] : [];
  }

  getValueChangeExtension() {
    return EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        this.text.set(update.state.doc.toString());
      }
    });
  }

  getValue(): string | undefined {
    return this.view?.state.doc.toString();
  }
}
