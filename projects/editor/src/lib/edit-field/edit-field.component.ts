import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';

import { map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { EditorService } from '../editor.service';
import { IEditorFormlyField } from '../editor.types';
import { ObjectPropertyComponent } from '../property/object-property/object-property.component';
import { IObjectProperty } from '../property/object-property/object-property.types';
import { IPropertyChange, PropertyType } from '../property/property.types';
import { getDefaultProperty, initRootProperty } from '../property/property.utils';
import { StylesComponent } from './styles/styles.component';

@Component({
    selector: 'editor-edit-field',
    templateUrl: './edit-field.component.html',
    styleUrls: ['./edit-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTabGroup, MatTab, ObjectPropertyComponent, StylesComponent, AsyncPipe]
})
export class EditFieldComponent implements OnInit, OnDestroy {
    @Input() resizeTabHeader$: Observable<void>;

    @Output() fieldChanged = new EventEmitter<IPropertyChange>();

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    public field$: Observable<IEditorFormlyField | null>;
    public parentField$: Observable<IEditorFormlyField | null>;
    public property$: Observable<IObjectProperty>;

    private _destroy$ = new Subject<void>();
    private _cachedField: IEditorFormlyField;
    private _cachedProperty: IObjectProperty;

    constructor(
        private _editorService: EditorService,
        private _store: Store
    ) {}

    ngOnInit(): void {
        const activeField$ = this._store.select(this._editorService.feature.selectActiveField).pipe(shareReplay());
        this.field$ = activeField$;
        this.parentField$ = activeField$.pipe(map(field => this._editorService.getField(field?._info.parentFieldId)));
        this.property$ = activeField$.pipe(
            tap(field => {
                if (!field) {
                    this._cachedProperty = this._getProperty(null);
                } else if (
                    field._info.formId !== this._cachedField?._info.formId ||
                    field._info.fieldId !== this._cachedField?._info.fieldId ||
                    field.wrappers !== this._cachedField?.wrappers
                ) {
                    this._cachedProperty = this._getProperty(field);
                }
                this._cachedField = field;
            }),
            map(() => this._cachedProperty)
        );

        this.resizeTabHeader$?.pipe(takeUntil(this._destroy$)).subscribe(() => {
            this.matTabGroup?._tabHeader._alignInkBarToSelectedTab();
        });
        setTimeout(() => this.matTabGroup?._tabHeader._alignInkBarToSelectedTab(), 1000);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onFieldChanged(change: IPropertyChange): void {
        this.fieldChanged.emit(change);
    }

    private _getProperty(field: IEditorFormlyField | null): IObjectProperty {
        const property = getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        const childProperties = field ? this._editorService.getFieldProperties(field) : [];
        initRootProperty(property, true, childProperties);
        return property;
    }
}
