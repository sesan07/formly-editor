import { AfterViewInit, Component } from '@angular/core';

@Component({
    selector: 'editor-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit {
    public canShowMain = false;

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.canShowMain = true;
        }, 250);
    }
}
