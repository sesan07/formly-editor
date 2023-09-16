import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { FormlyModule } from '@ngx-formly/core';
import { InputTypeComponent } from './input-type.component';
import { AppFieldType } from 'src/app/services/field-services/field.types';

@NgModule({
    declarations: [InputTypeComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        FormlyMatFormFieldModule,
        FormlyModule.forChild({
            types: [
                {
                    name: AppFieldType.INPUT,
                    component: InputTypeComponent,
                    wrappers: ['form-field'],
                },
                { name: 'string', extends: 'input' },
                {
                    name: AppFieldType.NUMBER,
                    extends: AppFieldType.INPUT,
                    defaultOptions: {
                        props: {
                            type: 'number',
                        },
                    },
                },
                {
                    name: AppFieldType.INTEGER,
                    extends: AppFieldType.INPUT,
                    defaultOptions: {
                        props: {
                            type: 'number',
                        },
                    },
                },
            ],
        }),
    ],
    exports: [InputTypeComponent],
})
export class InputTypeModule {}
