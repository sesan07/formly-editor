import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver-es';
import { Observable } from 'rxjs';

@Injectable()
export class FileService {
    public saveFile(fileName: string, content: string): void {
        const blob: Blob = new Blob([content], { type: 'application/json' });
        saveAs(blob, fileName);
    }

    public readFile(file: File): Observable<string> {
        return new Observable(sub => {
            const reader: FileReader = new FileReader();
            reader.onload = readerEvent => {
                const content: string = readerEvent.target.result as string;
                sub.next(content);
                sub.complete();
            };

            reader.readAsText(file);
        });
    }
}
