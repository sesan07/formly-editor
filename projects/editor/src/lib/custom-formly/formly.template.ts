import { Directive, Injectable, Input, OnChanges, QueryList, TemplateRef } from '@angular/core';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({
    selector: '[formlyTemplate]',
    standalone: false
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
