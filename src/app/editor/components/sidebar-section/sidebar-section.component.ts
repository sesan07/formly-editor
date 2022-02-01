import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatMenuPanel } from '@angular/material/menu';

@Component({
	selector: 'app-sidebar-section',
	templateUrl: './sidebar-section.component.html',
	styleUrls: ['./sidebar-section.component.scss']
})
export class SidebarSectionComponent implements OnInit {
	@Input() sectionTitle: string;
	@Input() menuPanel: MatMenuPanel;
	@Input() isCollapsible: boolean = true;
	@Input() isCollapsed: boolean;

	@ViewChild('contentWrapper', { read: ElementRef }) contentWrapper: ElementRef<HTMLElement>;

	constructor(private _renderer: Renderer2, private _elementRef: ElementRef<HTMLElement>) { }

	ngOnInit(): void {
	}

	onToggleExpansionClicked(): void {
		this.isCollapsed = !this.isCollapsed;
		if (this.isCollapsed) {
			this._renderer.addClass(this._elementRef.nativeElement, 'collapsed');
			this._renderer.addClass(this.contentWrapper.nativeElement, 'collapsed');
		} else {
			this._renderer.removeClass(this._elementRef.nativeElement, 'collapsed');
			this._renderer.removeClass(this.contentWrapper.nativeElement, 'collapsed');
		}
	}
}
