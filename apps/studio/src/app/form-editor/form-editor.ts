import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Core } from '@formly-editor/core';

@Component({
  selector: 'app-form-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Core],
  host: { class: 'block h-full' },
  template: `<core-root class="block h-full" />`,
})
export class FormEditorApp {}
