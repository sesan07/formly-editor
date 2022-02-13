import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { EditorService } from '../../../services/editor-service/editor.service';
import { IBaseEditorFormlyField, IForm } from '../../../services/editor-service/editor.types';

@Component({
    selector: 'lib-form-view',
    templateUrl: './form-view.component.html',
    styleUrls: ['./form-view.component.scss'],
})
export class FormViewComponent implements OnInit, OnDestroy {
    @Input() form: IForm;
    @Input() formChanged$: Observable<void>;

    public fields: IBaseEditorFormlyField[];
    public formGroup: FormGroup = new FormGroup({});
    public model: any = {};
    public options: FormlyFormOptions = {};

    private _destroy$: Subject<void> = new Subject();

    constructor(private _editorService: EditorService) {
    }

    public ngOnInit(): void {
        this._updateForm();
        this.formChanged$
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => this._updateForm());
    }

    public ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _updateForm(): void {
		this.fields = cloneDeep(this.form.fields);
		this.formGroup = new FormGroup({});
		this.options = {};
		this.model = cloneDeep(this.form.model);

		const logClone: IBaseEditorFormlyField[] = cloneDeep(this.form.fields);
		logClone.forEach(field => this._editorService.cleanField(field, true, true));
		console.log('FIELDS', JSON.stringify(logClone, null, 4));
    }
}
