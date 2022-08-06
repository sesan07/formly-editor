import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';

import { IBaseProperty } from './property.types';

@Directive()
export abstract class BasePropertyDirective<T extends IBaseProperty> implements OnChanges, AfterViewInit {
    @Input() treeLevel = 0;
    @Input() target: Record<string, any> | any[];
    @Input() property: T;
    @Input() isSimplified: boolean;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public keyChanged: EventEmitter<string> = new EventEmitter();
    @Output() public targetChanged: EventEmitter<void> = new EventEmitter();

    @ViewChild('key') keyElement: ElementRef<HTMLElement>;

    @HostBinding('class.tree-item') get isTreeItem(): boolean {
        return !this.isSimplified;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.target || changes.property) {
            this._onChanged(!!changes.target?.firstChange);
        }
    }

    ngAfterViewInit(): void {
        // TODO emit targetChanged on blur for input-like properties
        if (this.keyElement) {
            this.keyElement.nativeElement.innerText =
                !!this.property.key || this.property.key === 0 ? (this.property.key as string) : '';
            this.keyElement.nativeElement.addEventListener('blur', () =>
                this._onKeyChanged(this.keyElement.nativeElement.innerText)
            );
            this.keyElement.nativeElement.addEventListener('click', e => this._onKeyClicked(e));
        }
    }

    protected _modifyValue(value: any): void {
        this.target[this.property.key] = value;
        this.targetChanged.emit();
    }

    protected _getPropertyValue(defaultValue?: any): any {
        return this.target[this.property.key] ?? defaultValue ?? null;
    }

    private _onKeyChanged(newKey: string): void {
        const value: any = this._getPropertyValue();
        delete this.target[this.property.key];
        this.target[newKey] = value;
        this.property.key = newKey;
        this.targetChanged.emit();
    }

    private _onKeyClicked(event: MouseEvent): void {
        if (this.property.isKeyEditable) {
            event.stopPropagation();
        }
    }

    protected abstract _onChanged(isFirstChange: boolean): void;
}
