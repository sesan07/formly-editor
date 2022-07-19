import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    TrackByFunction
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditorService } from '../../editor.service';
import { EditorTypeCategoryOption, EditorTypeOption, IEditorFormlyField } from '../../editor.types';
import { getFieldChildren, getFormattedFieldName } from '../utils';
import { FormService } from '../form.service';

@Component({
    selector: 'editor-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldTreeItemComponent implements OnInit, OnDestroy {
    @Input() public field: IEditorFormlyField;
    @Input() public isExpanded = false;
	@Input() public treeLevel = 0;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public expandParent: EventEmitter<void> = new EventEmitter();

	public isActiveField: boolean;
    public childFields: IEditorFormlyField[];
	public replaceCategories: EditorTypeCategoryOption[];

    private _destroy$: Subject<void> = new Subject();

    constructor(
        public editorService: EditorService,
        private _formService: FormService,
        private _renderer: Renderer2,
        private _elementRef: ElementRef,
        private _cdRef: ChangeDetectorRef) {
    }

	public get hasOptions(): boolean {
		return this.field.canHaveChildren || this.treeLevel !== 0;
	};

	ngOnInit(): void {
		this._renderer.addClass(this._elementRef.nativeElement, 'tree-item');

        this.replaceCategories = this.editorService.fieldCategories.map(category => {
            // Filter fields that can have children and aren't this field
            const options: EditorTypeOption[] = category.typeOptions.filter(option => {
                if (!option.canHaveChildren) {
                    return false;
                }

                // If they're the same type, return based on customType
                if (option.name === this.field.type) {
                    return option.customName !== this.field.customType;
                }
                return true;
            });

            return { ...category, typeOptions: options };
        }).filter(category => category.typeOptions.length > 0); // Remove categories with empty fields

		if (this.field.canHaveChildren) {
			this.childFields = getFieldChildren(this.field);
		}

        this._formService.activeField$
            .pipe(takeUntil(this._destroy$))
            .subscribe((f: IEditorFormlyField) => {
                this.isActiveField = f.formId === this.field.formId && f.fieldId === this.field.fieldId;
                if (this.isActiveField) {
                    this.expandParent.emit();
                }

                this._cdRef.markForCheck();
            });
	}

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    getFormattedFieldName = (f: IEditorFormlyField) => getFormattedFieldName(f);

    onAddChildField(type: string, customType?: string): void {
		if (this.field.canHaveChildren) {
			this.isExpanded = true;
		}

        this._formService.addField(type, customType, this.field.fieldId);
    }

    onRemoveChildField(childField: IEditorFormlyField): void {
        this._formService.removeField(childField.fieldId, this.field.fieldId);
    }

	onReplaceParentField(type: string, customType?: string): void {
		this._formService.replaceParentField(type, this.field.fieldId, customType);
	}

    onSelected(): void {
        this._formService.selectField(this.field.fieldId);
    }

    onExpandParent(): void {
        this.isExpanded = true;
        this.expandParent.emit();
    }

    trackFieldById: TrackByFunction<IEditorFormlyField> = (_, field: IEditorFormlyField) => field.fieldId;
}
