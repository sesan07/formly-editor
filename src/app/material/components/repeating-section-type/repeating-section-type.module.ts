import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormlyModule } from '@ngx-formly/core';

import { AppFieldType } from '../../../field-services/field.types';
import { RepeatingSectionTypeComponent } from './repeating-section-type.component';

@NgModule({
    declarations: [RepeatingSectionTypeComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        FormlyModule.forChild({
            types: [
                {
                    name: AppFieldType.REPEATING_SECTION,
                    component: RepeatingSectionTypeComponent,
                },
            ],
        }),
    ],
    exports: [RepeatingSectionTypeComponent],
})
export class RepeatingSectionTypeModule {}
