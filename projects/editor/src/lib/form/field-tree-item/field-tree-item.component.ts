import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditorService } from '../../editor.service';
import { EditorTypeCategoryOption, IEditorFormlyField, IEditorFieldInfo } from '../../editor.types';
import { getFieldChildren } from '../form.utils';
import { isEmpty } from 'lodash-es';
import { trackByFieldId } from '../../editor.utils';
import { Store } from '@ngrx/store';
import { IEditorState } from '../../state/state.types';
import { selectActiveField, selectActiveForm } from '../../state/state.selectors';

@Component({
    selector: 'editor-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldTreeItemComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public field: IEditorFormlyField;
    @Input() public fieldCategories: EditorTypeCategoryOption[];
    @Input() public isExpanded = false;
    @Input() public treeLevel = 0;

    @Output() public expandParent: EventEmitter<void> = new EventEmitter();

    public isActiveField: boolean;
    public childFields: IEditorFormlyField[] = [];
    public fieldInfo: IEditorFieldInfo;
    public isOverridden: boolean;
    public isOverrideMode: boolean;

    trackByFieldId = trackByFieldId;

    private _destroy$: Subject<void> = new Subject();

    constructor(
        private _editorService: EditorService,
        private _store: Store<IEditorState>,
        private _cdRef: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.field) {
            this.fieldInfo = this.field._info;
            this.isOverridden = !isEmpty(this.fieldInfo.fieldOverride);

            if (this.fieldInfo.canHaveChildren) {
                this.childFields = getFieldChildren(this.field);
            }
        }
    }

    ngOnInit(): void {
        this._store
            .select(selectActiveForm)
            .pipe(takeUntil(this._destroy$))
            .subscribe(form => {
                this.isOverrideMode = form?.isOverrideMode;
                this._cdRef.markForCheck();
            });
        this._store
            .select(selectActiveField)
            .pipe(takeUntil(this._destroy$))
            .subscribe(field => {
                this.isActiveField = this.fieldInfo.fieldId === field?._info.fieldId;
                if (this.isActiveField) {
                    this.expandParent.emit();
                    setTimeout(() => this._cdRef.markForCheck());
                }
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

        this._editorService.addField(type, customType, this.fieldInfo.fieldId);
    }

    onRemove(): void {
        this._editorService.removeField(this.fieldInfo.fieldId, this.fieldInfo.parentFieldId);
    }

    onReplaceParentField(type: string, customType?: string): void {
        this._editorService.replaceField(type, this.fieldInfo.fieldId, customType);
    }

    onSelected(): void {
        this._editorService.setActiveField(this.fieldInfo.fieldId);
    }

    onExpandParent(): void {
        this.isExpanded = true;
        // this._cdRef.detectChanges();
        this.expandParent.emit();
    }
}
