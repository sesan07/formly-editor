import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormlyConfig, FormlyField, FormlyFieldTemplates } from '@ngx-formly/core';
import { Subject, takeUntil } from 'rxjs';

import { EditorService } from '../../../services/editor-service/editor.service';
import { IEditorFormlyField } from '../../../services/editor-service/editor.types';
import { getFieldChildren, getFormattedFieldName } from '../../../utils';
import { EditFieldDialogComponent } from '../../edit-field/edit-field-dialog/edit-field-dialog.component';
import { EditFieldRequest } from '../../edit-field/edit-field-dialog/edit-field-dialog.types';
import { FormService } from '../../form/form.service';

@Component({
    selector: 'editor-root-formly-field',
    template: '<ng-template #container></ng-template>'
})
export class RootFormlyFieldComponent extends FormlyField { }

@Component({
  selector: 'editor-formly-field',
  templateUrl: './formly-field.component.html',
  styleUrls: ['./formly-field.component.scss']
})
export class FormlyFieldComponent extends FormlyField implements OnInit, OnDestroy {
    @Input() override field: IEditorFormlyField;

	public isMouseInside: boolean;
	public isFirstChild: boolean;
	public isLastChild: boolean;
    public index: number;
	public hideOptions: boolean;

    private _isActiveField: boolean;
    private _isEditMode: boolean;
    private _destroy$: Subject<void> = new Subject();

    constructor(
        public editorService: EditorService,
        private _formService: FormService,
        private _dialog: MatDialog,
        private _cdRef: ChangeDetectorRef,
        config: FormlyConfig,
        renderer: Renderer2,
        elementRef: ElementRef,
        hostContainerRef: ViewContainerRef,
        @Optional() form: FormlyFieldTemplates,
    ) { super(config, renderer, elementRef, hostContainerRef, form); }

    @HostBinding('class.edit-mode') get isEditMode(): boolean { return this._isEditMode; };
    @HostBinding('class.active') get isActiveField(): boolean { return this._isActiveField; }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        this._formService.selectField(this.field.fieldId);
        event.stopPropagation();
    }

    @HostListener('mouseover', ['$event'])
    onMouseOver(event: MouseEvent): void {
        this.isMouseInside = true;
        event.stopPropagation();
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(): void {
        this.isMouseInside = false;
    }

    override ngOnInit(): void {
        super.ngOnInit();

        if (this.field.parentFieldId) {
            const parent: IEditorFormlyField = this._formService.getField(this.field.parentFieldId);
            const siblings: IEditorFormlyField[] = getFieldChildren(parent);
            this.index = siblings.findIndex(f => f.fieldId === this.field.fieldId);
            this.isFirstChild = this.index === 0;
            this.isLastChild = this.index === siblings.length - 1;
        } else {
            this.isFirstChild = this.isLastChild = true;
        }

        this.hideOptions = this.field.templateOptions.hideEditorWrapperOptions;

        this._formService.activeField$
            .pipe(takeUntil(this._destroy$))
            .subscribe(f => {
                this._isActiveField = f.fieldId === this.field.fieldId;
                this._cdRef.markForCheck();
            });
        this._formService.isEditMode$
            .pipe(takeUntil(this._destroy$))
            .subscribe(v => {
                this._isEditMode = v;
                this._cdRef.markForCheck();
            });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this._destroy$.next();
        this._destroy$.complete();
    }

    getFormattedFieldName = (f: IEditorFormlyField) => getFormattedFieldName(f);

    onAddChildField(type: string, customType?: string): void {
        this._formService.addField(type, customType, this.field.fieldId);
    }

    onRemove(): void {
        this._formService.removeField(this.field.fieldId, this.field.parentFieldId);
    }

    onEditField(): void {
        const config: MatDialogConfig<EditFieldRequest> = {
            data: {
                formId: this.field.formId,
                fieldId: this.field.fieldId
            }
        };

        const dialogRef: MatDialogRef<EditFieldDialogComponent, IEditorFormlyField> =
            this._dialog.open(EditFieldDialogComponent, config);

        dialogRef.afterClosed()
            .subscribe(field => {
                if (field) {
                    this._formService.updateField(field);
                }
            });
    }

    onMoveUp(): void {
        this._formService.moveField(this.field.fieldId, this.index, this.index - 1);
    }

    onMoveDown(): void {
        this._formService.moveField(this.field.fieldId, this.index, this.index + 1);
    }
}
