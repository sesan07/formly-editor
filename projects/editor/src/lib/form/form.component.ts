import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import { EditorTypeCategoryOption, IEditorFormlyField, IForm } from '../editor.types';
import { cleanField } from './form.utils';
import { trackByFieldId } from '../editor.utils';
import { selectActiveForm } from '../state/state.selectors';
import { Store } from '@ngrx/store';
import { IEditorState } from '../state/state.types';

@Component({
    selector: 'editor-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit, OnDestroy {
    @Input() form: IForm;

    @Output() duplicateForm: EventEmitter<void> = new EventEmitter();
    @Output() exportForm: EventEmitter<void> = new EventEmitter();
    @Output() toggleSidebars: EventEmitter<void> = new EventEmitter();

    public toolbarTabIndex: 0 | 1 = 0;
    public fieldCategories: EditorTypeCategoryOption[];

    public formFields$: Observable<IEditorFormlyField[]>;
    public model$: Observable<Record<string, any>>;
    public formFieldsJSON: string;
    public formGroup: FormGroup = new FormGroup({});
    public options: FormlyFormOptions = {};

    trackByFieldId = trackByFieldId;

    private _destroy$: Subject<void> = new Subject();
    private _cachedFields: IEditorFormlyField[] = [];

    private readonly _debounceTime: number = 100;

    constructor(
        private _editorService: EditorService,
        private _cdRef: ChangeDetectorRef,
        private _store: Store<IEditorState>
    ) {}

    public ngOnInit(): void {
        this.fieldCategories = this._editorService.fieldCategories;

        this.formFields$ = this._store.select(selectActiveForm).pipe(
            takeUntil(this._destroy$),
            filter(form => form && form.id === this.form.id && form.fields !== this._cachedFields),
            debounceTime(this._debounceTime),
            tap(form => {
                this._cachedFields = form.fields;
                this.formGroup = new FormGroup({});
                this.options = {};

                if (form.isOverrideMode) {
                    this.formFieldsJSON = JSON.stringify(form.override, null, 2);
                } else {
                    const fieldsClone: IEditorFormlyField[] = cloneDeep(form.fields);
                    fieldsClone.forEach(field => cleanField(field, true, true));
                    this.formFieldsJSON = JSON.stringify(fieldsClone, null, 2);
                }

                this._cdRef.markForCheck();
            }),
            map(form => cloneDeep(form.fields))
        );

        this.model$ = this._store.select(selectActiveForm).pipe(
            takeUntil(this._destroy$),
            filter(form => form && form.id === this.form.id),
            map(form => cloneDeep(form.model))
        );
    }

    public ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onEditModeChanged(isEditMode: boolean): void {
        this._editorService.setEditMode(this.form.id, isEditMode);
    }

    onOverrideModeChanged(isOverrideMode: boolean): void {
        this._editorService.setOverrideMode(this.form.id, isOverrideMode);
    }

    onAddField(type: string, customType?: string): void {
        this._editorService.addField(type, customType);
    }

    onFormModelChanged(model: Record<string, any>): void {
        this._editorService.setActiveModel(model);
    }

    onResetModel(): void {
        this.options.resetModel({});
    }
}
