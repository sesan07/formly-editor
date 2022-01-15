import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { IBaseProperty } from './property.types';

@Component({ template: '' })
export abstract class BasePropertyComponent implements OnInit, AfterViewInit {
	@Input() treeLevel = 0;
	@Input() target: Record<string, any> | any[];
	@Input() property: IBaseProperty;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public keyChanged: EventEmitter<string> = new EventEmitter();

	@ViewChild('key') keyElement: ElementRef<HTMLElement>;

	public treeLevelPadding: number;
	public abstract hasOptions: boolean;

	protected abstract propertyname: string;

	constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

	ngOnInit(): void {
		this.treeLevelPadding = 24 * this.treeLevel;
		this._renderer.addClass(this._elementRef.nativeElement, 'tree-item');
	}

	ngAfterViewInit(): void {
		this.keyElement.nativeElement.innerText = (!!this.property.key || this.property.key === 0) ? this.property.key as string : '';
		this.keyElement.nativeElement.addEventListener('input', () => this.keyChanged.emit(this.keyElement.nativeElement.innerText));
	}

	abstract onValueChanged(): void;
}
