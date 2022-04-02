import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, Renderer2 } from '@angular/core';
import { MatMenuPanel } from '@angular/material/menu';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
    selector: 'lib-sidebar-section',
    templateUrl: './sidebar-section.component.html',
    styleUrls: ['./sidebar-section.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarSectionComponent {
    @Input() sectionTitle: string;
    @Input() menuPanel: MatMenuPanel;
    @Input() isCollapsible = true;
    @Input() isCollapsed: boolean;

    public element: HTMLElement;
    public index: number;
    public cachedContentHeight: number;
    public minContentHeight = 50;
    public minHeight: number;
    public maxHeight: number;
    public get height(): number { return this._height; }
    public set height(newHeight: number) {
        this._height = newHeight;
        this._renderer.setStyle(this.element, 'height', this._height + 'px');
        this._cdRef.markForCheck();
    }

    public get contentHeight(): number { return this.height - this.minHeight; }
    public get availableHeight(): number {
        return this.height - (this.minHeight + (this.isCollapsed ? 0 : this.minContentHeight));
    }

    private readonly _headerHeight = 48;
    private readonly _dividerHeight = 4;
    private _sideBar: SidebarComponent;

    private _height: number;

    constructor(private _renderer: Renderer2, private _cdRef: ChangeDetectorRef, elementRef: ElementRef<HTMLElement>) {
        this.element = elementRef.nativeElement;
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
    }
}
