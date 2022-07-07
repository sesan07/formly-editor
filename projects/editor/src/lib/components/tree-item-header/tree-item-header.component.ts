import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatMenuPanel } from '@angular/material/menu';

@Component({
    selector: 'lib-tree-item-header',
    templateUrl: './tree-item-header.component.html',
    styleUrls: ['./tree-item-header.component.scss']
})
export class TreeItemHeaderComponent implements OnInit {
	@Input() treeLevel = 0;
	@Input() isExpanded: boolean;
	@Input() isExpandable: boolean;
	@Input() isActive: boolean;
	@Input() hasOptions: boolean;
	@Input() optionsMenu: MatMenuPanel;

    @Output() isExpandedChange: EventEmitter<boolean> = new EventEmitter();

	public treeLevelPadding: number;
	public sideLinePositions: number[];
    public stickyOptions: boolean;

    @HostBinding('class.active') get isHeaderActive(): boolean { return this.isActive; }

    private readonly _treeIndentation = 18;

    constructor() { }

    @HostListener('mouseenter')
    onMouseEnter(): void {
        this.stickyOptions = true;
    }

    @HostListener('mouseleave')
    onMouseLeave(): void {
        this.stickyOptions = false;
    }

    @HostListener('click', ['$event'])
	onClicked(event: MouseEvent): void {
		if (this.isActive !== false) {
            this.onToggle(event);
		} else {
			this.isExpanded = true;
            this.isExpandedChange.emit(this.isExpanded);
            event.stopPropagation();
        }
	}

    ngOnInit(): void {
        this.treeLevelPadding = this._treeIndentation * this.treeLevel;
        this.sideLinePositions = [ ...Array(this.treeLevel).keys() ].map(i => ((i + 1) * this._treeIndentation));
    }

	onToggle(event: MouseEvent): void {
		this.isExpanded = !this.isExpanded;
        this.isExpandedChange.emit(this.isExpanded);
		event.stopPropagation();
	}
}
