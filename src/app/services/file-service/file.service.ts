import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver-es';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FileService {

    constructor() {
    }

    public exportJSONString(content: string, fileName: string): void {
        const blob: Blob = new Blob([content], {type: 'application/json'});
        saveAs(blob, fileName);
    }


    // TODO find better way to load file
    public importJSONString(): Observable<string> {
        const input: HTMLInputElement = document.createElement('input');
        input.type = 'file';
        const subject: Subject<string> = new Subject();

        input.onchange = e => {
            const file: File = (e.target as HTMLInputElement).files[0];

            const reader: FileReader = new FileReader();
            reader.readAsText(file); // this is reading as data url

            reader.onload = readerEvent => {
                const content: string = readerEvent.target.result as string;
                subject.next(content);
                subject.complete();
            };
        };

        setTimeout(() => input.click());
        return subject.asObservable();
    }
}
