import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DndService, DragSource } from '@ng-dnd/core';
import { BehaviorSubject } from 'rxjs';
import { EditorService } from '../editor.service';
import { DragAction, DragType, FieldOption, IEditorFormlyField, IFieldDragData } from '../editor.types';
import { isCategoryOption, isTypeOption, trackByDisplayName } from '../editor.utils';

@Component({
    selector: 'editor-add-field-tree-item',
    templateUrl: './add-field-tree-item.component.html',
    styleUrls: ['./add-field-tree-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFieldTreeItemComponent implements OnInit, OnChanges {
    @Input() public fieldOption: FieldOption;
    @Input() public index: number;
    @Input() public isExpanded = false;
    @Input() public treeLevel = 0;

    public isExpanded$: BehaviorSubject<boolean> = new BehaviorSubject(this.isExpanded);
    public isCategoryOption: boolean;
    public childOptions: FieldOption[] = [];
    public field: IEditorFormlyField;
    public dragSource: DragSource<IFieldDragData, Record<string, never>>;

    trackByDisplayName = trackByDisplayName;

    constructor(private _editorService: EditorService, private _dnd: DndService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.fieldOption) {
            if (isCategoryOption(this.fieldOption)) {
                this.isCategoryOption = true;
                this.childOptions = this.fieldOption.children;
            } else if (isTypeOption(this.fieldOption)) {
                this.field = this._editorService.getDefaultField(this.fieldOption.type) as IEditorFormlyField;
            }
        }

        if (changes.isExpanded) {
            this.isExpanded$.next(this.isExpanded);
        }
    }

    ngOnInit(): void {
        if (!this.isCategoryOption) {
            this._setupDragAndDrop();
        }
    }

    private _setupDragAndDrop(): void {
        this.dragSource = this._dnd.dragSource(DragType.FORMLY_FIELD, {
            beginDrag: () => this._getDragData(),
        });
    }

    private _getDragData(): IFieldDragData {
        return {
            action: DragAction.COPY,
            index: undefined,
            field: this.field,
        };
    }
}
