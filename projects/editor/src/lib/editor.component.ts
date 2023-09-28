import { AfterViewInit, Component, OnInit, TrackByFunction } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EditorService } from './editor.service';
import { IForm, IEditorFormlyField, FieldOption } from './editor.types';
import { isCategoryOption, isTypeOption, trackByFieldId } from './editor.utils';
import { cleanField } from './form/form.utils';
import { JSONDialogComponent } from './json-dialog/json-dialog.component';
import { ImportJSONData, ImportJSONValue } from './json-dialog/json-dialog.types';
import { IObjectProperty } from './property/object-array-properties/object-property.types';
import { PropertyService } from './property/property.service';
import { IPropertyChange, PropertyType } from './property/property.types';
import { initRootProperty } from './property/utils';
import { FileService } from './shared/services/file-service/file.service';
import { SideBarPosition } from './sidebar/sidebar.types';
import {
    selectForms,
    selectActiveForm,
    selectActiveFormIndex,
    selectActiveField,
    selectActiveModel,
} from './state/state.selectors';
import { IEditorState } from './state/state.types';

const githubIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 4 24 24">
    <path fill="#444444" d="M16 5.343c-6.196 0-11.219 5.023-11.219 11.219 0 4.957 3.214 9.162 7.673 10.645 0.561 0.103 0.766-0.244 
    0.766-0.54 0-0.267-0.010-1.152-0.016-2.088-3.12 0.678-3.779-1.323-3.779-1.323-0.511-1.296-1.246-1.641-1.246-1.641-1.020-0.696 
    0.077-0.682 0.077-0.682 1.126 0.078 1.72 1.156 1.72 1.156 1.001 1.715 2.627 1.219 3.265 0.931 0.102-0.723 0.392-1.219 
    0.712-1.498-2.49-0.283-5.11-1.246-5.11-5.545 0-1.226 0.438-2.225 1.154-3.011-0.114-0.285-0.501-1.426 0.111-2.97 0 0 0.941-0.301 
    3.085 1.15 0.894-0.25 1.854-0.373 2.807-0.377 0.953 0.004 1.913 0.129 2.809 0.379 2.14-1.453 3.083-1.15 3.083-1.15 0.613 1.545 
    0.227 2.685 0.112 2.969 0.719 0.785 1.153 1.785 1.153 3.011 0 4.31-2.624 5.259-5.123 5.537 0.404 0.348 0.761 1.030 0.761 2.076 
    0 1.5-0.015 2.709-0.015 3.079 0 0.299 0.204 0.648 0.772 0.538 4.455-1.486 7.666-5.69 7.666-10.645 
    0-6.195-5.023-11.219-11.219-11.219z">
    </path>
</svg>
`;

@Component({
    selector: 'editor-main',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit {
    public forms$: Observable<ReadonlyArray<IForm>>;
    public activeFormIndex$: Observable<number>;
    public activeField$: Observable<IEditorFormlyField>;
    public resizeEnd$: Observable<void>;

    public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;
    public showSidebars = true;
    public toolbarTabIndex: 0 | 1 = 0;

    public activeForm: IForm;
    public activeModel: Record<string, unknown>;
    public modelProperty: IObjectProperty;
    public fieldOptions: FieldOption[];

    public canShowMain = false;

    trackByFieldId = trackByFieldId;
    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$: Subject<void> = new Subject();
    private _resizeEnd$: Subject<void> = new Subject();

    constructor(
        iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private _editorService: EditorService,
        private _store: Store<IEditorState>,
        private _dialog: MatDialog,
        private _fileService: FileService,
        private _propertyService: PropertyService
    ) {
        iconRegistry.addSvgIconLiteral('github', sanitizer.bypassSecurityTrustHtml(githubIcon));
    }

    trackFormById: TrackByFunction<IForm> = (_, form: IForm) => form.id;

    ngOnInit(): void {
        this.forms$ = this._store.select(selectForms).pipe(takeUntil(this._destroy$));
        this.activeFormIndex$ = this._store.select(selectActiveFormIndex).pipe(takeUntil(this._destroy$));
        this.activeField$ = this._store.select(selectActiveField).pipe(takeUntil(this._destroy$));
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
        const fieldsClone: IEditorFormlyField[] = cloneDeep(this.activeForm.fields);
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
                this._fileService.saveFile(res.name, res.json);
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
                this._fileService.saveFile(res.name, res.json);
            }
        });
    }

    onResizeEnd(): void {
        this._resizeEnd$.next();
    }

    private _getModelProperty(): IObjectProperty {
        const property = this._propertyService.getDefaultProperty(PropertyType.OBJECT) as IObjectProperty;
        initRootProperty(property);
        return property;
    }
}
