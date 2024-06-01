import { importProvidersFrom } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';

import { RepeatingSectionTypeComponent } from './repeating-section-type.component';

export function provideRepeatingSectionType() {
    return importProvidersFrom([
        FormlyModule.forChild({
            types: [
                {
                    name: 'repeating-section',
                    component: RepeatingSectionTypeComponent,
                },
            ],
        }),
    ]);
}
