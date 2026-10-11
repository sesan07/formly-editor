import {
  Directive,
  inject,
  Injectable,
  Input,
  OnChanges,
  QueryList,
  TemplateRef,
} from '@angular/core';

@Directive({
  // Formly's public template directive selector must remain compatible.
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[formlyTemplate]',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
})
export class FormlyTemplate implements OnChanges {
  // Formly consumes this input through its legacy decorator-based API.
  // eslint-disable-next-line @angular-eslint/prefer-signals
  @Input('formlyTemplate') name = 'formly-group';

  ref = inject(TemplateRef<unknown>);

  ngOnChanges() {
    this.name = this.name || 'formly-group';
  }
}

// workarround for https://github.com/angular/angular/issues/43227#issuecomment-904173738
@Injectable()
export class FormlyFieldTemplates {
  templates!: QueryList<FormlyTemplate>;
}
