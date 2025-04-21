import { Directive, Injectable, Input, OnChanges, QueryList, TemplateRef } from '@angular/core';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[formlyTemplate]',
    // eslint-disable-next-line @angular-eslint/prefer-standalone
    standalone: false,
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class FormlyTemplate implements OnChanges {
    @Input('formlyTemplate') name: string;

    constructor(public ref: TemplateRef<any>) {}

    ngOnChanges() {
        this.name = this.name || 'formly-group';
    }
}

// workarround for https://github.com/angular/angular/issues/43227#issuecomment-904173738
@Injectable()
export class FormlyFieldTemplates {
    templates!: QueryList<FormlyTemplate>;
}
