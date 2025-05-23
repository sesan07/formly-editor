import { NgClass } from '@angular/common';
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
import { isNil } from 'lodash-es';

@Component({
    selector: 'editor-property-key',
    templateUrl: './property-key.component.html',
    styleUrls: ['./property-key.component.scss'],
    imports: [NgClass],
})
export class PropertyKeyComponent implements OnChanges, AfterViewInit {
    @Input() isEditable: boolean;

    @Output() keyChange = new EventEmitter<string>();

    @ViewChild('keyElement') keyElementRef: ElementRef;

    private _key: string | number;

    @Input()
    get key() {
        return this._key;
    }
    set key(val: string | number) {
        this._key = !isNil(val) ? val : '';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.key && !changes.key.firstChange) {
            this.keyElementRef.nativeElement.innerText = this.key + '';
        }
    }

    ngAfterViewInit(): void {
        this.keyElementRef.nativeElement.innerText = this.key + '';
        this.keyElementRef.nativeElement.addEventListener('blur', () => {
            const text = this.keyElementRef.nativeElement.innerText;
            if (text !== this.key) {
                this.key = text;
                this.keyChange.emit(this.key?.toString());
            }
        });
        this.keyElementRef.nativeElement.addEventListener('click', e => e.stopPropagation());
    }
}
