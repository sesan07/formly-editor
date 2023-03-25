import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Optional,
    Output,
    Self,
    ViewChild,
} from '@angular/core';
import { NgControl, Validators } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Editor, EditorConfiguration, EditorFromTextArea, fromTextArea } from 'codemirror';
import { Subject } from 'rxjs';

@Component({
    selector: 'editor-text-editor',
    template: '<textarea #ref></textarea>',
    styles: [':host { display: block; height: 100%; }'],
    providers: [
        {
            provide: MatFormFieldControl,
            useExisting: TextEditorComponent,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextEditorComponent implements AfterViewInit {
    private static _nextId = 0;

    @Input() mode: 'application/javascript' | 'application/json';
    @Input() updateOn: 'blur' | 'change' = 'change';

    @Output() valueChange: EventEmitter<string> = new EventEmitter();

    @HostBinding() id = `editor-text-editor-${TextEditorComponent._nextId++}`;

    @ViewChild('ref') ref: ElementRef<HTMLTextAreaElement>;

    editorInstance: EditorFromTextArea;
    stateChanges: Subject<void> = new Subject();
    placeholder = '';
    shouldLabelFloat = true;
    disabled = false;
    focused = false;
    touched = false;
    controlType = 'editor-text-editor';

    private _value = '';
    private _required: boolean | undefined;
    private _readonly = false;
    private _onChange: (_: any) => void;
    private _onTouch: (_: any) => void;

    constructor(@Optional() @Self() public ngControl: NgControl) {
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
    }

    @Input()
    get value() {
        return this._value;
    }
    set value(val: string) {
        if (val !== this._value) {
            this._setValue(val);
            this.editorInstance?.setValue(this.value || '');
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    @Input()
    get required(): boolean {
        return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
    }
    set required(value: BooleanInput) {
        this._required = coerceBooleanProperty(value);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    @Input()
    get readonly(): boolean {
        return this._readonly;
    }
    set readonly(value: BooleanInput) {
        this._readonly = coerceBooleanProperty(value);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get empty() {
        return !this.value;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get errorState(): boolean {
        return this.touched && !!this.ngControl?.errors;
    }

    ngAfterViewInit(): void {
        const options: EditorConfiguration = {
            mode: this.mode,
            readOnly: this.readonly,
            theme: 'elegant',
            lineNumbers: true,
            styleActiveLine: true,
        };
        this.editorInstance = fromTextArea(this.ref.nativeElement, options);
        this.editorInstance.setValue(this.value || '');
        this.editorInstance.setSize('100%', '100%');

        this.editorInstance.on('focus', () => (this.focused = true));
        this.editorInstance.on('blur', () => {
            this.focused = false;
            this.touched = true;
            this.ngControl?.control.updateValueAndValidity();
        });
        this.editorInstance.on(this.updateOn, (editor: Editor) => {
            const newValue = editor.getDoc().getValue();
            if (newValue !== this.value) {
                this._setValue(newValue);
                this.ngControl?.control.setValue(newValue);
                this.valueChange.emit(this.value);
            }
        });
        setTimeout(() => {
            this.editorInstance.refresh();
        }, 500);
    }

    writeValue(val: string): void {
        this.value = val;
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouch = fn;
    }

    setDescribedByIds(ids: string[]) {}

    onContainerClick(event: MouseEvent) {
        this.editorInstance.focus();
    }

    private _setValue(val: string): void {
        this._value = val || '';
        this.stateChanges.next();
    }
}
