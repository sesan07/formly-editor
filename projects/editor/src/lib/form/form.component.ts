import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, shareReplay, takeUntil, tap } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import { FieldOption, IEditorFormlyField, IForm } from '../editor.types';
import { cleanField } from './form.utils';
import { isCategoryOption, isTypeOption, trackByFieldId } from '../editor.utils';
import { selectActiveForm, selectActiveFormId } from '../state/state.selectors';
import { Store } from '@ngrx/store';
import { IEditorState } from '../state/state.types';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuContent, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { TextEditorComponent } from '../text-editor/text-editor.component';
import { FormlyFormComponent } from '../custom-formly/formly-form/formly-form.component';
import { MatTabGroup, MatTab, MatTabContent } from '@angular/material/tabs';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';

@Component({
    selector: 'editor-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        ToolbarComponent,
        NgIf,
        MatTabGroup,
        MatTab,
        FormlyFormComponent,
        MatTabContent,
        TextEditorComponent,
        MatButton,
        MatMenuTrigger,
        MatIcon,
        MatMenu,
        MatMenuContent,
        NgFor,
        MatMenuItem,
        NgTemplateOutlet,
        AsyncPipe,
    ],
})
export class FormComponent implements OnInit, OnDestroy {
    @Input() form: IForm;

    @Output() duplicateForm: EventEmitter<void> = new EventEmitter();
    @Output() exportForm: EventEmitter<void> = new EventEmitter();
    @Output() toggleSidebars: EventEmitter<void> = new EventEmitter();

    public toolbarTabIndex: 0 | 1 = 0;
    public fieldOptions: FieldOption[];

    public formFields$: Observable<IEditorFormlyField[]>;
    public model$: Observable<Record<string, any>>;
    public formFieldsJSON$: Observable<string>;
    public formGroup: UntypedFormGroup = new UntypedFormGroup({});
    public options: FormlyFormOptions = {};

    trackByFieldId = trackByFieldId;
    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$: Subject<void> = new Subject();
    private _cachedFields: IEditorFormlyField[] = [];
    private _cachedModel: Record<string, any> = {};

    private readonly _debounceTime: number = 100;

    constructor(private _editorService: EditorService, private _store: Store<IEditorState>) {}

    public ngOnInit(): void {
        this.fieldOptions = this._editorService.fieldOptions;

        const activeForm$ = this._store.select(selectActiveForm).pipe(
            takeUntil(this._destroy$),
            filter(form => form?.id === this.form.id)
        );

        const activeFields$ = activeForm$.pipe(
            debounceTime(this._debounceTime),
            filter(form => form.fields !== this._cachedFields),
            map(form => form.fields),
            tap(fields => (this._cachedFields = fields)),
            shareReplay(1)
        );

        this.formFields$ = activeFields$.pipe(
            tap(() => {
                this.formGroup = new UntypedFormGroup({});
                this.options = {};
            }),
            map(fields => this._editorService.onDisplayFields(structuredClone(fields), this._cachedModel))
        );

        this.formFieldsJSON$ = activeFields$.pipe(
            map(fields => {
                const fieldsClone: IEditorFormlyField[] = structuredClone(fields);
                fieldsClone.forEach(field => cleanField(field, true, true));
                return JSON.stringify(fieldsClone, null, 2);
            })
        );

        this.model$ = activeForm$.pipe(
            filter(form => form.model !== this._cachedModel),
            map(form => {
                this._cachedModel = form.model;
                return structuredClone(this._cachedModel);
            })
        );
    }

    public ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onEditModeChanged(isEditMode: boolean): void {
        this._editorService.setEditMode(this.form.id, isEditMode);
    }

    onAddField(type: string): void {
        this._editorService.addField(type);
    }

    onFormModelChanged(model: Record<string, any>): void {
        this._editorService.setActiveModel(model);
    }

    onResetModel(): void {
        this.options.resetModel({});
    }
}
