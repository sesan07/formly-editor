import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FormlyMatFormFieldModule } from '@ngx-formly/ui/material/form-field';
import { FormlyModule } from '@ngx-formly/core';
import { InputTypeComponent } from './input-type.component';

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
                    name: 'input',
                    component: InputTypeComponent,
                    wrappers: ['form-field'],
                },
                { name: 'string', extends: 'input' },
                {
                    name: 'number',
                    extends: 'input',
                    defaultOptions: {
                        props: {
                            type: 'number',
                        },
                    },
                },
                {
                    name: 'integer',
                    extends: 'input',
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
