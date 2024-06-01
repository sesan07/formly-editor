import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormlyModule } from '@ngx-formly/core';

import { CardWrapperComponent } from './card-wrapper.component';

@NgModule({
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
        CardWrapperComponent,
    ],
})
export class CardWrapperModule {}
