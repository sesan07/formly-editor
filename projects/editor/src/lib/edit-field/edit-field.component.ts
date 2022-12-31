import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EDITOR_FIELD_SERVICE, IEditorFormlyField, IFieldService } from '../editor.types';
import { IObjectProperty } from '../property/object-array-properties/object-property.types';
import { PropertyService } from '../property/property.service';
import { IPropertyChange, PropertyType } from '../property/property.types';
import { initRootProperty } from '../property/utils';

@Component({
    selector: 'editor-edit-field',
    templateUrl: './edit-field.component.html',
    styleUrls: ['./edit-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFieldComponent implements OnInit, OnDestroy {
    @Input() field$: Observable<IEditorFormlyField>;
    @Input() isSimplified: boolean;
    @Input() resizeTabHeader$: Observable<void>;

    @Output() fieldChanged: EventEmitter<IPropertyChange> = new EventEmitter();

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    public activeFieldProperty: IObjectProperty;
    public activeFieldTarget: IEditorFormlyField;

    private _destroy$: Subject<void> = new Subject();
    private _cachedFieldId: string;

    constructor(
        public propertyService: PropertyService,
        @Inject(EDITOR_FIELD_SERVICE) private _fieldService: IFieldService,
        private _cdRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.field$.pipe(takeUntil(this._destroy$)).subscribe(field => this._updateActiveField(field));

        this.resizeTabHeader$?.pipe(takeUntil(this._destroy$)).subscribe(() => {
            this.matTabGroup._tabHeader._alignInkBarToSelectedTab();
        });

        setTimeout(() => this.matTabGroup._tabHeader._alignInkBarToSelectedTab(), 1000);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _updateActiveFieldProperty(): void {
        this.activeFieldProperty = this.propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        const childProperties = this._fieldService.getProperties(this.activeFieldTarget.type);
        initRootProperty(this.activeFieldProperty, true, childProperties);
        this._cdRef.markForCheck();
    }

    private _updateActiveField(field: IEditorFormlyField | null): void {
        if (!field) {
            return;
        }

        this.activeFieldTarget = { ...field };

        if (field._info.fieldId !== this._cachedFieldId) {
            this._updateActiveFieldProperty();
        }
    }
}
