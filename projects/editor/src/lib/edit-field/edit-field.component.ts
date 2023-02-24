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
import { MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { EditorService } from '../editor.service';

import { IEditorFormlyField } from '../editor.types';
import { IObjectProperty } from '../property/object-array-properties/object-property.types';
import { PropertyService } from '../property/property.service';
import { IPropertyChange, PropertyType } from '../property/property.types';
import { initRootProperty } from '../property/utils';
import { selectActiveField, selectActiveForm } from '../state/state.selectors';
import { IEditorState } from '../state/state.types';

@Component({
    selector: 'editor-edit-field',
    templateUrl: './edit-field.component.html',
    styleUrls: ['./edit-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFieldComponent implements OnInit, OnDestroy {
    @Input() resizeTabHeader$: Observable<void>;

    @Output() fieldChanged: EventEmitter<IPropertyChange> = new EventEmitter();

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    public field$: Observable<IEditorFormlyField | null>;
    public parentField$: Observable<IEditorFormlyField | null>;
    public property$: Observable<IObjectProperty>;
    public isOverrideMode$: Observable<boolean>;

    private _destroy$: Subject<void> = new Subject();
    private _cachedField: IEditorFormlyField;
    private _cachedProperty: IObjectProperty;

    constructor(
        public propertyService: PropertyService,
        private _editorService: EditorService,
        private _store: Store<IEditorState>
    ) {}

    ngOnInit(): void {
        this.field$ = this._store.select(selectActiveField).pipe(takeUntil(this._destroy$));
        this.parentField$ = this._store.select(selectActiveField).pipe(
            takeUntil(this._destroy$),
            map(field => this._editorService.getField(field?._info.parentFieldId))
        );
        this.property$ = this._store.select(selectActiveField).pipe(
            takeUntil(this._destroy$),
            map(field => {
                if (!field) {
                    this._cachedProperty = this._getProperty(null);
                } else if (
                    field._info.formId !== this._cachedField?._info.formId ||
                    field._info.fieldId !== this._cachedField?._info.fieldId
                ) {
                    this._cachedProperty = this._getProperty(field);
                }
                this._cachedField = field;
                return this._cachedProperty;
            })
        );
        this.isOverrideMode$ = this._store.select(selectActiveForm).pipe(
            takeUntil(this._destroy$),
            map(form => form?.isOverrideMode)
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
        const property = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        const childProperties = this._editorService.getFieldProperties(field?.type);
        initRootProperty(property, true, childProperties);
        return property;
        // this._cdRef.markForCheck();
    }

    // private _updateActiveField(): void {
    //     if (this.field) {
    //         this.activeFieldTarget = this.field;

    //         if (this.field._info.fieldId !== this._cachedField?._info.fieldId) {
    //             this.parentField = this._formService.getField(this.field._info.parentFieldId);
    //             this._getProperty();
    //         }
    //     } else {
    //         this.activeFieldProperty = null;
    //         this.parentField = null;
    //     }

    //     this._cachedField = this.field;
    // }
}
