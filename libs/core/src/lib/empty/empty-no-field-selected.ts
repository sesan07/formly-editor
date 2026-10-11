import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Empty } from './empty';

@Component({
  selector: 'core-empty-no-field-selected',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Empty],
  template: `
    <core-empty
      label="No field selected"
      description="Select a field to edit its properties."
    />
  `,
})
export class EmptyNoFieldSelected {}
