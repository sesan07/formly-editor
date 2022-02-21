import { Directive, Input } from '@angular/core';
import { AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileService } from '../../../services/file-service/file.service';

@Directive({
    selector: '[libJsonFileValidator]',
    providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: JsonFileValidatorDirective, multi: true}]
})
export class JsonFileValidatorDirective implements AsyncValidator {
    @Input('libJsonFileValidator') fileInputElement: HTMLInputElement;

    constructor(private _fileService: FileService) {}

    validate(): Observable<ValidationErrors | null> {
        const file: File = this.fileInputElement.files.item(0);
        if (file) {
            return this._fileService.readFile(file).pipe(map(text => {
                try {
                    JSON.parse(text);
                    return {};
                } catch (e) {
                    return { jsonFormat: true };
                }
            }));
        }
        return of({});
    }

}
