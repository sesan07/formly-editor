import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IEditorFormlyField } from '../../services/editor-service/editor.types';
import { IObjectProperty } from '../property/object-property/object-property.types';
import { IProperty } from '../property/property.types';

@Component({
    selector: 'lib-edit-field',
    templateUrl: './edit-field.component.html',
    styleUrls: ['./edit-field.component.scss']
})
export class EditFieldComponent implements OnInit, OnDestroy {
    @Input() field: IEditorFormlyField;
    @Input() property: IObjectProperty;
    @Input() isSimplified: boolean;
    @Input() resizeTabHeader$: Observable<void>;

	@Output() fieldChanged: EventEmitter<void> = new EventEmitter();

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    private _destroy$: Subject<void> = new Subject();

    constructor() { }

    ngOnInit(): void {
        this.resizeTabHeader$
            ?.pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this.matTabGroup._tabHeader._alignInkBarToSelectedTab();
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
