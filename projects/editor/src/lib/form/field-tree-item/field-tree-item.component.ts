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
    TrackByFunction,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditorService } from '../../editor.service';
import { EditorTypeCategoryOption, IEditorFormlyField, IEditorFieldInfo } from '../../editor.types';
import { getFieldChildren, getReplaceCategories, trackByFieldId } from '../form.utils';
import { FormService } from '../form.service';
import { isEmpty } from 'lodash-es';

@Component({
    selector: 'editor-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldTreeItemComponent implements OnInit, OnDestroy {
    @Input() public field: IEditorFormlyField;
    @Input() public isExpanded = false;
    @Input() public treeLevel = 0;

    @Output() public expandParent: EventEmitter<void> = new EventEmitter();

    public isActiveField: boolean;
    public childFields: IEditorFormlyField[] = [];
    public replaceCategories: EditorTypeCategoryOption[];
    public fieldInfo: IEditorFieldInfo;
    public isOverridden: boolean;
    public isOverrideMode$: Observable<boolean>;

    trackByFieldId = trackByFieldId;

    private _destroy$: Subject<void> = new Subject();

    constructor(
        public editorService: EditorService,
        private _formService: FormService,
        private _renderer: Renderer2,
        private _elementRef: ElementRef,
        private _cdRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this._renderer.addClass(this._elementRef.nativeElement, 'tree-item');
        this.isOverrideMode$ = this._formService.isOverrideMode$;

        this.fieldInfo = this.field._info;
        this.replaceCategories = getReplaceCategories(
            this.editorService.fieldCategories,
            this.field.type,
            this.field.customType
        );

        if (this.fieldInfo.canHaveChildren) {
            this.childFields = getFieldChildren(this.field);
        }

        this._formService.activeField$.pipe(takeUntil(this._destroy$)).subscribe((f: IEditorFormlyField | null) => {
            if (!f) {
                return;
            }

            this.isOverridden = !isEmpty(this.fieldInfo.fieldOverride);
            this.isActiveField = f._info.formId === this.fieldInfo.formId && f._info.fieldId === this.fieldInfo.fieldId;
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

    onAddChildField(type: string, customType?: string): void {
        if (this.fieldInfo.canHaveChildren) {
            this.isExpanded = true;
        }

        this._formService.addField(type, customType, this.fieldInfo.fieldId);
    }

    onRemove(): void {
        this._formService.removeField(this.fieldInfo.fieldId, this.fieldInfo.parentFieldId);
    }

    onReplaceParentField(type: string, customType?: string): void {
        this._formService.replaceParentField(type, this.fieldInfo.fieldId, customType);
    }

    onSelected(): void {
        this._formService.selectField(this.fieldInfo.fieldId);
    }

    onExpandParent(): void {
        this.isExpanded = true;
        this.expandParent.emit();
    }
}
