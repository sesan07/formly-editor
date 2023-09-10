import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { EditorService } from '../editor.service';
import { IEditorFormlyField, IEditorFieldInfo, FieldOption } from '../editor.types';
import { getFieldChildren } from '../form/form.utils';
import { isCategoryOption, isTypeOption, trackByFieldId } from '../editor.utils';
import { Store } from '@ngrx/store';
import { IEditorState } from '../state/state.types';
import { selectActiveField } from '../state/state.selectors';

@Component({
    selector: 'editor-field-tree-item',
    templateUrl: './field-tree-item.component.html',
    styleUrls: ['./field-tree-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldTreeItemComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public field: IEditorFormlyField;
    @Input() public fieldOptions: FieldOption[];
    @Input() public isExpanded = false;
    @Input() public treeLevel = 0;

    @Output() public expandParent: EventEmitter<void> = new EventEmitter();

    public isActiveField$: Observable<boolean>;
    public childFields: IEditorFormlyField[] = [];
    public fieldInfo: IEditorFieldInfo;

    trackByFieldId = trackByFieldId;
    isCategoryOption = isCategoryOption;
    isTypeOption = isTypeOption;

    private _destroy$: Subject<void> = new Subject();

    constructor(private _editorService: EditorService, private _store: Store<IEditorState>) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.field) {
            this.fieldInfo = this.field._info;

            if (this.fieldInfo.canHaveChildren) {
                this.childFields = getFieldChildren(this.field);
            }
        }
    }

    ngOnInit(): void {
        this.isActiveField$ = this._store.select(selectActiveField).pipe(
            takeUntil(this._destroy$),
            map(field => this.fieldInfo.fieldId === field?._info.fieldId),
            tap(isActiveField => {
                if (isActiveField) {
                    this.expandParent.emit();
                }
            })
        );
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    addField = (type: string) => {
        if (this.fieldInfo.canHaveChildren) {
            this.isExpanded = true;
        }
        this._editorService.addField(type, this.fieldInfo.fieldId);
    };

    replaceField = (type: string) => this._editorService.replaceField(type, this.fieldInfo.fieldId);

    onRemove(): void {
        this._editorService.removeField(this.fieldInfo.fieldId, this.fieldInfo.parentFieldId);
    }

    onSelected(): void {
        this._editorService.setActiveField(this.fieldInfo.fieldId);
    }

    onExpandParent(): void {
        this.isExpanded = true;
        this.expandParent.emit();
    }
}
