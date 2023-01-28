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
import { get, isNil } from 'lodash-es';
import { IEditorFormlyField } from '../editor.types';

import { IBaseProperty, IPropertyChange, PropertyChangeType, PropertyType } from './property.types';

@Directive()
export abstract class BasePropertyDirective<P extends IBaseProperty, V> implements OnChanges, AfterViewInit {
    @Input() treeLevel = 0;
    @Input() path?: string;
    @Input() target: Record<string, any> | any[];
    @Input() property: P;
    @Input() isSimplified: boolean;
    @Input() isOverrideMode: boolean;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public keyChanged: EventEmitter<string> = new EventEmitter();
    @Output() public targetChanged: EventEmitter<IPropertyChange> = new EventEmitter();

    @ViewChild('key') keyElement: ElementRef<HTMLElement>;

    public isOverridden: boolean;

    protected currentValue: V;
    protected abstract defaultValue: V;

    @HostBinding('class.tree-item') get isTreeItem(): boolean {
        return !this.isSimplified;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.target) {
            const isFirstChange = !!changes.target?.firstChange;
            const newValue: any = this.path
                ? get(this.target, this.path, this.defaultValue)
                : this.target ?? this.defaultValue;

            const canChange: boolean =
                isFirstChange ||
                this.property.type === PropertyType.OBJECT ||
                this.property.type === PropertyType.ARRAY ||
                newValue !== this.currentValue;

            if (canChange) {
                this.currentValue = newValue;
                this._updateOverrideState();
                this._onChanged(isFirstChange);
            }
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

    onClearOverride(): void {
        const change: IPropertyChange = {
            type: PropertyChangeType.CLEAR_OVERRIDE,
            path: this.path,
            data: null,
        };
        this.targetChanged.emit(change);
    }

    protected _modifyValue(value: any): void {
        const change: IPropertyChange = {
            type: PropertyChangeType.VALUE,
            path: this.path,
            data: value,
        };
        this.targetChanged.emit(change);
    }

    protected _updateOverrideState(): void {
        const fieldOverride = (this.target as IEditorFormlyField)._info?.fieldOverride;
        if (fieldOverride) {
            this.isOverridden = !isNil(get(fieldOverride, this.path));
        } else {
            this.isOverridden = false;
        }
    }

    private _onKeyChanged(newKey: string): void {
        const change: IPropertyChange = {
            type: PropertyChangeType.KEY,
            path: this.path,
            data: newKey,
        };
        this.targetChanged.emit(change);
    }

    private _onKeyClicked(event: MouseEvent): void {
        if (this.property.isKeyEditable) {
            event.stopPropagation();
        }
    }

    protected abstract _onChanged(isFirstChange: boolean): void;
}
