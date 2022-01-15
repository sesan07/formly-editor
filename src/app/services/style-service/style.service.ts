import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StyleService {

    getClasses(): string[] {
        return [
            'formly-form-section',
            'formly-field-full',
            'formly-field-half',
        ];
    }
}
