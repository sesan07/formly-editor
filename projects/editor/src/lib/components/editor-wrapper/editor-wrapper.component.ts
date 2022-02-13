import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { IBaseEditorFormlyField } from '../../services/editor-service/editor.types';
import { EditorService } from '../../services/editor-service/editor.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'lib-editor-wrapper',
    templateUrl: './editor-wrapper.component.html',
    styleUrls: ['./editor-wrapper.component.scss'],
})
export class EditorWrapperComponent extends FieldWrapper<IBaseEditorFormlyField> implements OnInit, OnDestroy {
    @ViewChild('fieldComponent', {read: ViewContainerRef, static: true})
    fieldComponent: ViewContainerRef;

	public isActiveField: boolean;

    private _destroy$: Subject<void> = new Subject();

    constructor(public editorService: EditorService) { super(); }

    ngOnInit(): void {
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

    onClick(event: MouseEvent): void {
        this.editorService.selectField(this.field.formId, this.field.fieldId);
        event.stopPropagation();
    }

	private _checkActiveField(): void {
		this.isActiveField =  this.editorService.isActiveField(this.field.formId, this.field.fieldId);
	}
}
