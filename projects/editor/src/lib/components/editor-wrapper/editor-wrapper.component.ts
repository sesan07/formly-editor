import { Component, HostBinding, HostListener, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { IEditorFormlyField } from '../../services/editor-service/editor.types';
import { EditorService } from '../../services/editor-service/editor.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { EditFieldDialogComponent } from '../edit-field-dialog/edit-field-dialog.component';
import { EditFieldRequest } from '../edit-field-dialog/edit-field-dialog.types';
import { FieldDroplistService } from '../../services/field-droplist-service/field-droplist.service';

@Component({
    selector: 'lib-editor-wrapper',
    templateUrl: './editor-wrapper.component.html',
    styleUrls: ['./editor-wrapper.component.scss'],
})
export class EditorWrapperComponent extends FieldWrapper<IEditorFormlyField> implements OnInit, OnDestroy {
    @ViewChild('fieldComponent', {read: ViewContainerRef, static: true})
    fieldComponent: ViewContainerRef;

    @HostBinding('class.edit-mode') get isEditMode(): boolean { return this.editorService.isEditMode; };
    @HostBinding('class.active') get isActiveField(): boolean { return this._isActiveField; }

	public isMouseInside: boolean;
	public isFirstChild: boolean;
	public isLastChild: boolean;
    public index: number;
	public hideOptions: boolean;

    private _destroy$: Subject<void> = new Subject();
    private _isActiveField: boolean;

    constructor(public editorService: EditorService, private _dialog: MatDialog){ super(); }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        this.editorService.selectField(this.field.formId, this.field.fieldId);
        event.stopPropagation();
    }

    @HostListener('mouseover', ['$event'])
    onMouseOver(event: MouseEvent): void {
        this.isMouseInside = true;
        event.stopPropagation();
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(event: MouseEvent): void {
        this.isMouseInside = false;
    }

    ngOnInit(): void {
        if (this.field.parentFieldId) {
            const parent: IEditorFormlyField = this.editorService.getField(this.field.formId, this.field.parentFieldId);
            const siblings: IEditorFormlyField[] = this.editorService.getChildren(parent);
            this.index = siblings.findIndex(f => f.fieldId === this.field.fieldId);
            this.isFirstChild = this.index === 0;
            this.isLastChild = this.index === siblings.length - 1;
        } else {
            this.isFirstChild = this.isLastChild = true;
        }

        this.hideOptions = this.field.templateOptions.hideEditorWrapperOptions;
		this._checkActiveField();

        this.editorService.fieldSelected$
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => this._checkActiveField());
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onAddChildField(type: string, customType?: string): void {
        this.editorService.addField(type, this.field.formId, customType, this.field.fieldId);
    }

    onRemove(): void {
        this.editorService.removeField(this.field.formId, this.field.fieldId, this.field.parentFieldId);
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
                    this.editorService.updateField(field);
                }
            });
    }

    onMoveUp(): void {
        this.editorService.moveField(this.field.fieldId, this.field.formId, this.index, this.index - 1);
    }

    onMoveDown(): void {
        this.editorService.moveField(this.field.fieldId, this.field.formId, this.index, this.index + 1);
    }

	private _checkActiveField(): void {
		this._isActiveField =  this.editorService.isActiveField(this.field.formId, this.field.fieldId);
	}
}
