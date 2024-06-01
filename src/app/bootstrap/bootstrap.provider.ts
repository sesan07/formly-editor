import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';

export function provideBootstrap(): EnvironmentProviders {
    return makeEnvironmentProviders([
        importProvidersFrom([
            FormlyModule.forRoot({
                validationMessages: [{ name: 'required', message: 'This field is required' }],
            }),
        ]),
    ]);
}
