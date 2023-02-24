import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    Renderer2,
    SimpleChanges,
} from '@angular/core';

import { SidebarComponent } from '../sidebar.component';

@Component({
    selector: 'editor-sidebar-section',
    templateUrl: './sidebar-section.component.html',
    styleUrls: ['./sidebar-section.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarSectionComponent implements OnChanges {
    @Input() isCollapsible = true;
    @Input() isCollapsed: boolean;

    public element: HTMLElement;
    public index = 0;
    public availableHeight: number;
    public contentHeight: number;
    public cachedContentHeight: number;
    public minContentHeight = 50;
    public minHeight = 0;
    public maxHeight = 0;

    private readonly _headerHeight = 48;
    private readonly _dividerHeight = 4;
    private _sideBar: SidebarComponent;

    private _height: number;

    constructor(private _renderer: Renderer2, private _cdRef: ChangeDetectorRef, elementRef: ElementRef<HTMLElement>) {
        this.element = elementRef.nativeElement;
    }

    public get height(): number {
        return this._height;
    }
    public set height(newHeight: number) {
        this._height = newHeight;
        this.contentHeight = this._height - this.minHeight;
        this.availableHeight = this._height - (this.minHeight + (this.isCollapsed ? 0 : this.minContentHeight));

        this._renderer.setStyle(this.element, 'height', this._height + 'px');
        this._cdRef.markForCheck();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.isCollapsed && !changes.isCollapsed.firstChange) {
            this._sideBar.toggleSection(this);
        }
    }

    onSectionMouseDown(event: MouseEvent): void {
        this._sideBar.onSectionMouseDown(event, this);
    }

    onToggleExpansionClicked(): void {
        this._sideBar.toggleSection(this);
    }

    setup(sidebar: SidebarComponent, index: number, height: number): void {
        this._sideBar = sidebar;
        this.index = index;
        this.minHeight = this._headerHeight + (this.index === 0 ? 0 : this._dividerHeight);
        this.height = height;
        this._sideBar.toggleSection(this);
    }
}
