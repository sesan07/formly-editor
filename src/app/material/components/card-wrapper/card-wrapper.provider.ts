import { importProvidersFrom } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';

import { CardWrapperComponent } from './card-wrapper.component';

export function provideCardWrapper() {
    return importProvidersFrom([
        FormlyModule.forChild({
            wrappers: [
                {
                    name: 'card',
                    component: CardWrapperComponent,
                },
            ],
        }),
    ]);
}
