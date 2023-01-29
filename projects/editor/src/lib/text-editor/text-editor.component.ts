import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { EditorConfiguration, EditorFromTextArea, fromTextArea } from 'codemirror';
import { TextEditorMode } from './text-editor.types';

@Component({
    selector: 'editor-text-editor',
    template: '<textarea #ref></textarea>',
    styles: [':host { display: block; }'],
})
export class TextEditorComponent implements OnChanges, AfterViewInit {
    @Input() value = '';
    @Input() mode: TextEditorMode;
    @Input() readOnly: boolean;

    @Output() valueChange: EventEmitter<string> = new EventEmitter();

    @ViewChild('ref') ref: ElementRef<HTMLTextAreaElement>;

    editorInstance: EditorFromTextArea;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.value && this.editorInstance) {
            this.editorInstance.setValue(this.value);
        }
    }

    ngAfterViewInit(): void {
        const options: EditorConfiguration = {
            mode: this.mode,
            readOnly: this.readOnly,
            theme: 'material',
        };
        this.editorInstance = fromTextArea(this.ref.nativeElement, options);
        this.editorInstance.setValue(this.value);
        this.editorInstance.setSize('100%', '100%');

        this.editorInstance.on('change', editor => {
            const newValue = editor.getDoc().getValue();
            if (newValue !== this.value) {
                this.value = newValue;
                this.valueChange.emit();
            }
        });
    }
}
