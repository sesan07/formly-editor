import { saveAs } from 'file-saver-es';
import { Observable } from 'rxjs';

export function saveFile(fileName: string, content: string): void {
    const blob: Blob = new Blob([content], { type: 'application/json' });
    saveAs(blob, fileName);
}

export function readFile(file: File): Observable<string> {
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
