import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';

import { SidebarComponent } from '../sidebar.component';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
    selector: 'editor-sidebar-section',
    templateUrl: './sidebar-section.component.html',
    styleUrls: ['./sidebar-section.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatIcon],
})
export class SidebarSectionComponent implements OnChanges {
    @Input() isCollapsed: boolean;

    public element: HTMLElement;
    public index = 0;
    public cachedCollapseHeight: number;
    public minContentHeight: number;
    public maxHeight = 0;
    public sideBar: SidebarComponent;

    private readonly _headerHeight = 48;
    private readonly _dividerHeight = 4;
    private _height: number;

    constructor(
        private _cdRef: ChangeDetectorRef,
        elementRef: ElementRef<HTMLElement>
    ) {
        this.element = elementRef.nativeElement;
    }

    public get headerHeight(): number {
        return this._headerHeight + (this.index === 0 ? 0 : this._dividerHeight);
    }

    public get availableHeight(): number {
        return this.height - this.headerHeight - (this.isCollapsed ? 0 : this.minContentHeight);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    @HostBinding('style.height.px')
    public get height(): number {
        return this._height;
    }
    public set height(val: number) {
        this._height = val;
        this._cdRef.markForCheck();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.isCollapsed && !changes.isCollapsed.firstChange) {
            this.sideBar.toggleSection(this);
        }
    }

    onSectionMouseDown(event: MouseEvent): void {
        this.sideBar.onSectionMouseDown(event, this);
    }

    onToggleExpansionClicked(): void {
        this.sideBar.toggleSection(this);
    }
}
