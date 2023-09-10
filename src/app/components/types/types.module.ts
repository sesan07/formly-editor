import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTypeModule } from './input-type/input-type.module';
import { FormlyModule } from '@ngx-formly/core';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        InputTypeModule,
        FormlyModule.forChild({
            types: [
                {
                    name: 'formly-group-card',
                    extends: 'formly-group',
                    wrappers: ['card'],
                    defaultOptions: {
                        props: {
                            cardTitle: 'Hello!',
                        },
                    },
                },
            ],
        }),
    ],
})
export class TypesModule {}
