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

import { IBaseProperty, IPropertyChange, PropertyChangeType } from './property.types';
import { isParentProperty } from './utils';

@Directive()
export abstract class BasePropertyDirective<P extends IBaseProperty, V> implements OnChanges {
    @Input() treeLevel = 0;
    @Input() path: string[] = [];
    @Input() target?: Record<string, any> | any[];
    @Input() property?: P;
    @Input() treeMode: boolean;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public keyChanged: EventEmitter<string> = new EventEmitter();
    @Output() public targetChanged: EventEmitter<IPropertyChange> = new EventEmitter();

    protected currentValue: V;
    protected abstract defaultValue: V;

    @HostBinding('class.tree-item') get isTreeItem(): boolean {
        return this.treeMode;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.target || changes.property) {
            const isFirstChange = !!changes.target?.firstChange;
            const newValue: any = this.path.length
                ? get(this.target, this.path, this.defaultValue)
                : this.target ?? this.defaultValue;

            const canChange: boolean =
                isFirstChange || isParentProperty(this.property) || newValue !== this.currentValue;

            if (canChange) {
                this.currentValue = newValue;
                this._onChanged(isFirstChange);
            }
        }
    }

    public onKeyChanged(newKey: string): void {
        this._modifyKey(this.path, [...this.path.slice(0, -1), newKey]);
    }

    protected _modifyKey(currPath: string[], newPath: string[]): void {
        const change: IPropertyChange = {
            type: PropertyChangeType.KEY,
            path: currPath,
            newPath,
        };
        this.targetChanged.emit(change);
    }

    protected _modifyValue(value: any, path: string[] = this.path): void {
        const change: IPropertyChange = {
            type: PropertyChangeType.VALUE,
            path,
            value,
        };
        this.targetChanged.emit(change);
    }

    protected abstract _onChanged(isFirstChange: boolean): void;
}
