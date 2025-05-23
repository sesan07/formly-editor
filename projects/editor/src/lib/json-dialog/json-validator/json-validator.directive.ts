import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
    selector: '[editorJsonValidator]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: JSONValidatorDirective,
            multi: true,
        },
    ],
    standalone: true,
})
export class JSONValidatorDirective implements Validator {
    validate(control: AbstractControl): ValidationErrors | null {
        if (control.value) {
            try {
                JSON.parse(control.value);
                return {};
            } catch {
                return { jsonFormat: true };
            }
        }

        return {};
    }
}
