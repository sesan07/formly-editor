import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';

export function provideBootstrap(): EnvironmentProviders {
    return makeEnvironmentProviders([
        importProvidersFrom([
            FormlyBootstrapModule,
            FormlyModule.forRoot({
                validationMessages: [{ name: 'required', message: 'This field is required' }],
            }),
        ]),
    ]);
}
