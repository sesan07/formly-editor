import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTypeModule } from './input-type/input-type.module';
import { FormlyModule } from '@ngx-formly/core';
import { AppFieldType } from 'src/app/services/field-services/field.types';
import { RepeatingSectionTypeModule } from './repeating-section-type/repeating-section-type.module';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        InputTypeModule,
        RepeatingSectionTypeModule,
        FormlyModule.forChild({
            types: [
                {
                    name: AppFieldType.FORMLY_GROUP_CARD,
                    extends: 'formly-group',
                    wrappers: ['card'],
                },
            ],
        }),
    ],
})
export class TypesModule {}
