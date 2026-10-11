import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldPresetDialog } from './field-preset/field-preset-dialog';
import { ExportDialog } from './panel/form-panel/export-dialog';
import { FormPreviewDialog } from './panel/form-panel/form-preview-dialog';
import { CreateFormDialog } from './panel/forms-panel/create-form-dialog';
import { ImportDialog } from './panel/forms-panel/import-dialog';
import { FieldTableDialog } from './properties/array/table-dialog';
import { ExpressionDialog } from './properties/expressions/expression-dialog';
import { MarkdownDialog } from './properties/markdown/markdown-dialog';

/** Single host for app-wide dialogs; each dialog owns its own visibility via a companion service. */
@Component({
  selector: 'core-app-dialogs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CreateFormDialog,
    FieldPresetDialog,
    ExpressionDialog,
    MarkdownDialog,
    FormPreviewDialog,
    ExportDialog,
    ImportDialog,
    FieldTableDialog,
  ],
  host: {
    class: 'core-root',
  },
  template: `
    <core-create-form-dialog />
    <core-field-preset-dialog />
    <core-expression-dialog />
    <core-markdown-dialog />
    <core-form-preview-dialog />
    <core-export-dialog />
    <core-import-dialog />
    <core-field-table-dialog />
  `,
})
export class AppDialogs {}
