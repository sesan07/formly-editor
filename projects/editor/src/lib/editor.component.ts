import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject, debounceTime, takeUntil } from 'rxjs';

import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';

import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/javascript/javascript';

import { AddFieldTreeItemComponent } from './add-field-tree-item/add-field-tree-item.component';
import { EditFieldComponent } from './edit-field/edit-field.component';
import { EditorService } from './editor.service';
import { FieldOption, IDefaultForm, IEditorFormlyField, IForm } from './editor.types';
import { isCategoryOption, isTypeOption } from './editor.utils';
import { FieldNamePipe } from './field-name/field-name.pipe';
import { FieldTreeItemComponent } from './field-tree-item/field-tree-item.component';
import { saveFile } from './file/file.utils';
import { FormComponent } from './form/form.component';
import { cleanField } from './form/form.utils';
import { JSONDialogComponent } from './json-dialog/json-dialog.component';
import { ImportJSONData, ImportJSONValue } from './json-dialog/json-dialog.types';
import { ObjectPropertyComponent } from './property/object-property/object-property.component';
import { IObjectProperty } from './property/object-property/object-property.types';
import { IPropertyChange, PropertyType } from './property/property.types';
import { getDefaultProperty, initRootProperty } from './property/property.utils';
import { SidebarSectionComponent } from './sidebar/sidebar-section/sidebar-section.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SideBarPosition } from './sidebar/sidebar.types';

@Component({
    selector: 'editor-main',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    standalone: true,
    imports: [
        SidebarComponent,
        SidebarSectionComponent,
        MatIconButton,
        MatMenuTrigger,
        MatIcon,
        FieldTreeItemComponent,
        AddFieldTreeItemComponent,
        MatTabGroup,
        MatTab,
        MatTabLabel,
        FormComponent,
        MatButton,
        EditFieldComponent,
        ObjectPropertyComponent,
        MatMenu,
        MatMenuContent,
        MatMenuItem,
        NgTemplateOutlet,
        AsyncPipe,
        FieldNamePipe,
    ],
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
    public forms$: Observable<ReadonlyArray<IForm>>;
    public activeFormIndex$: Observable<number>;
    public activeField$: Observable<IEditorFormlyField>;
    public resizeEnd$: Observable<void>;

    public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public showSidebars = true;
    public toolbarTabIndex: 0 | 1 = 0;

    public defaultForm?: IDefaultForm;
    public activeForm: IForm;
    public activeModel: object;
    public modelProperty: IObjectProperty;
    public fieldOptions: FieldOption[];

    public canShowMain = false;

    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$: Subject<void> = new Subject();
    private _resizeEnd$: Subject<void> = new Subject();

    constructor(
        private _editorService: EditorService,
        private _store: Store,
        private _dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.defaultForm = this._editorService.config.defaultForm;

        const { selectForms, selectActiveFormIndex, selectActiveField, selectActiveForm, selectActiveModel } =
            this._editorService.feature;
        this.forms$ = this._store.select(selectForms);
        this.activeFormIndex$ = this._store.select(selectActiveFormIndex).pipe(
            debounceTime(0) // allows tab header to render properly when non-zero index on startup
        );
        this.activeField$ = this._store.select(selectActiveField);
        this._store
            .select(selectActiveForm)
            .pipe(takeUntil(this._destroy$))
            .subscribe(form => (this.activeForm = form));
        this._store
            .select(selectActiveModel)
            .pipe(takeUntil(this._destroy$))
            .subscribe(model => (this.activeModel = model));
        this.modelProperty = this._getModelProperty();
        this.fieldOptions = this._editorService.fieldOptions;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.canShowMain = true;
        }, 250);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onAddForm(): void {
        const dialogRef = this._dialog.open<JSONDialogComponent, ImportJSONData, ImportJSONValue>(JSONDialogComponent, {
            data: {
                title: 'Add Form',
                primaryActionText: 'Add',
                name: {
                    placeholder: 'Form Name',
                },
                defaultValue: {
                    json: '[]',
                },
            },
        });
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                const parsed = JSON.parse(res.json);
                this._editorService.addForm(res.name, Array.isArray(parsed) ? parsed : [parsed]);
            }
        });
    }

    onRemoveForm(index: number): void {
        this._editorService.removeForm(index);
    }

    onTabChange(index: number): void {
        this._editorService.setActiveForm(index);
    }

    onTabLabelMouseDown(event: MouseEvent, index: number): void {
        if (event.button === 1) {
            this.onRemoveForm(index);
        }
    }

    onDuplicateForm(): void {
        this._editorService.duplicateForm(this.activeForm.id);
    }

    onExportForm(): void {
        const fieldsClone: IEditorFormlyField[] = structuredClone(this.activeForm.fields);
        fieldsClone.forEach(field => cleanField(field, true, true));

        const dialogRef = this._dialog.open<JSONDialogComponent, ImportJSONData, ImportJSONValue>(JSONDialogComponent, {
            data: {
                title: 'Export Form',
                primaryActionText: 'Export',
                name: {
                    placeholder: 'file-name.json',
                    pattern: /.+\.json$/,
                },
                defaultValue: {
                    name: this.activeForm.name + '.json',
                    json: JSON.stringify(fieldsClone, null, 2),
                },
            },
        });
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                saveFile(res.name, res.json);
            }
        });
    }

    onAddField(type: string): void {
        this._editorService.addField(type);
    }
    onActiveFieldChanged(change: IPropertyChange): void {
        this._editorService.modifyActiveField(change);
    }

    onActiveModelChanged(change: IPropertyChange): void {
        this._editorService.modifyActiveModel(change);
    }

    onImportModel(): void {
        const dialogRef = this._dialog.open<JSONDialogComponent, ImportJSONData, ImportJSONValue>(JSONDialogComponent, {
            data: {
                title: 'Import Model',
                primaryActionText: 'Import',
                canSelectFile: true,
                defaultValue: {
                    json: '{}',
                },
            },
        });
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._editorService.setActiveModel(JSON.parse(res.json));
            }
        });
    }

    onExportModel(): void {
        const dialogRef = this._dialog.open<JSONDialogComponent, ImportJSONData, ImportJSONValue>(JSONDialogComponent, {
            data: {
                title: 'Export Model',
                primaryActionText: 'Export',
                name: {
                    placeholder: 'file-name.json',
                    pattern: /.+\.json$/,
                },
                defaultValue: {
                    name: this.activeForm.name + '.model.json',
                    json: JSON.stringify(this.activeModel, null, 2),
                },
            },
        });
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                saveFile(res.name, res.json);
            }
        });
    }

    onResizeEnd(): void {
        this._resizeEnd$.next();
    }

    loadDefaultForm(): void {
        this._editorService.addForm(this.defaultForm.name, this.defaultForm.fields, this.defaultForm.model);
    }

    private _getModelProperty(): IObjectProperty {
        const property = getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        initRootProperty(property);
        return property;
    }
}
