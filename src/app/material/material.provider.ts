import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';

import { provideCardWrapper } from './components/card-wrapper/card-wrapper.provider';
import { provideRepeatingSectionType } from './components/repeating-section-type/repeating-section-type.provider';
import { ipAsyncValidator, ipValidator, ipValidatorMessage } from './material.utils';

export function provideMaterial(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideCardWrapper(),
        provideRepeatingSectionType(),
        importProvidersFrom([
            FormlyMaterialModule,
            FormlyModule.forRoot({
                validators: [
                    { name: 'ip', validation: ipValidator },
                    { name: 'ipAsync', validation: ipAsyncValidator },
                ],
                validationMessages: [
                    { name: 'ip', message: ipValidatorMessage },
                    { name: 'ipAsync', message: 'This is not a valid IP Address' },
                    { name: 'required', message: 'This field is required' },
                ],
            }),
        ]),
    ]);
}
