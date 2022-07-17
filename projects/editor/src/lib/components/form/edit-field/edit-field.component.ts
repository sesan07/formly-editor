import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IEditorFormlyField } from '../../../services/editor-service/editor.types';
import { IObjectProperty } from '../../property/object-array-properties/object-property.types';

@Component({
    selector: 'editor-edit-field',
    templateUrl: './edit-field.component.html',
    styleUrls: ['./edit-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
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

        setTimeout(() => this.matTabGroup._tabHeader._alignInkBarToSelectedTab(), 1000);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
