import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormlyModule } from '@ngx-formly/core';

import { CardWrapperComponent } from './card-wrapper.component';
import { AppWrapperType } from '../../../field-services/field.types';

@NgModule({
    declarations: [CardWrapperComponent],
    imports: [
        CommonModule,
        MatCardModule,
        FormlyModule.forChild({
            wrappers: [
                {
                    name: AppWrapperType.CARD,
                    component: CardWrapperComponent,
                },
            ],
        }),
    ],
})
export class CardWrapperModule {}
