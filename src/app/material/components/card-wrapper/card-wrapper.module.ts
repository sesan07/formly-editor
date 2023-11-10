import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormlyModule } from '@ngx-formly/core';

import { CardWrapperComponent } from './card-wrapper.component';

@NgModule({
    declarations: [CardWrapperComponent],
    imports: [
        CommonModule,
        MatCardModule,
        FormlyModule.forChild({
            wrappers: [
                {
                    name: 'card',
                    component: CardWrapperComponent,
                },
            ],
        }),
    ],
})
export class CardWrapperModule {}
