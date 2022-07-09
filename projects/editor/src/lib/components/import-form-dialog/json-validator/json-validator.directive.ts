import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
    selector: '[editorJsonValidator]',
    providers: [{ provide: NG_VALIDATORS, useExisting: JsonValidatorDirective, multi: true }]
})
export class JsonValidatorDirective implements Validator {

    constructor() { }

    validate(control: AbstractControl): ValidationErrors | null {
        if (control.value) {
            try {
                JSON.parse(control.value);
                return {};
            } catch (e) {
                return { jsonFormat: true };
            }
        }

        return {};
    }
}
