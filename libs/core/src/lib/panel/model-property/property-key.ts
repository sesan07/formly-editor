import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnChanges,
  output,
  SimpleChanges,
} from '@angular/core';
import { PropertyConfig } from '../../properties/types';

@Component({
  selector: 'core-model-property-key',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  host: {
    class: 'model-property-key',
    spellcheck: 'false',
    '[class.p-inputtext]': 'property().isKeyEditable',
    '[class.editable]': 'property().isKeyEditable',
    '[attr.contenteditable]': 'property().isKeyEditable ? "plaintext-only" : null',
    '(blur)': 'emitKeyChange()',
    '(keydown.enter)': 'emitKeyChange()',
  },
  template: '',
})
export class ModelPropertyKey implements OnChanges {
  readonly property = input.required<PropertyConfig>();
  keyChange = output<string>();

  elementRef = inject<ElementRef<HTMLSpanElement>>(ElementRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property']) {
      this.elementRef.nativeElement.innerText =
        this.property().key?.toString() || this.property().label || '';
    }
  }

  emitKeyChange(): void {
    const text = this.elementRef.nativeElement.innerText;
    if (text !== this.property().key) {
      this.keyChange.emit(text);
    }
  }
}
