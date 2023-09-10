import { Component } from '@angular/core';
import { FieldTypeConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/ui/material';
import { IInputTemplateOptions } from '../../../services/field-services/input/input.types';

@Component({
    selector: 'app-input-type',
    template: `
        <input
            *ngIf="type !== 'number'; else numberTmp"
            matInput
            [id]="id"
            [type]="type || 'text'"
            [readonly]="props.readonly"
            [required]="required"
            [errorStateMatcher]="errorStateMatcher"
            [formControl]="formControl"
            [formlyAttributes]="field"
            [tabIndex]="props.tabindex"
            [placeholder]="props.placeholder"
        />
        <ng-template #numberTmp>
            <input
                matInput
                [id]="id"
                type="number"
                [readonly]="props.readonly"
                [required]="required"
                [errorStateMatcher]="errorStateMatcher"
                [formControl]="formControl"
                [formlyAttributes]="field"
                [tabIndex]="props.tabindex"
                [placeholder]="props.placeholder"
            />
        </ng-template>
    `,
})
export class InputTypeComponent extends FieldType<FieldTypeConfig<IInputTemplateOptions>> {
    get type() {
        return this.props.type || 'text';
    }
}
