import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { FieldType, IBaseEditorFormlyField } from '../../services/form-service/form.types';
import { FormService } from '../../services/form-service/form.service';
import { EditorWrapperService } from '../../services/editor-wrapper-service/editor-wrapper.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-editor-wrapper',
    templateUrl: './editor-wrapper.component.html',
    styleUrls: ['./editor-wrapper.component.scss'],
})
export class EditorWrapperComponent extends FieldWrapper<IBaseEditorFormlyField> implements OnInit, OnDestroy {
    @ViewChild('fieldComponent', {read: ViewContainerRef, static: true})
    fieldComponent: ViewContainerRef;

    // public canHaveChildren: boolean;
	public isActiveField: boolean;

    private _destroy$: Subject<void> = new Subject();

    constructor(public formService: FormService,
                public wrapperService: EditorWrapperService
    ) {
        super();
    }

    ngOnInit(): void {
        // this.canHaveChildren = this.formService.canHaveChildren(this.field);
		this._checkActiveField();

        this.formService.fieldSelected$
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => this._checkActiveField());
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onAddChildField(type: string, customType?: string): void {
        this.formService.addField(type, this.field.formId, customType, this.field.fieldId);
    }

    onRemove(): void {
        this.formService.removeField(this.field.formId, this.field.fieldId, this.field.parentFieldId);
    }

    onClick(event: MouseEvent): void {
        this.formService.selectField(this.field.formId, this.field.fieldId);
        event.stopPropagation();
    }

	private _checkActiveField(): void {
		this.isActiveField =  this.formService.isActiveField(this.field.formId, this.field.fieldId);
	}
}
