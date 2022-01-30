import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IBaseProperty } from './property.types';

@Component({ template: '' })
export abstract class BasePropertyComponent implements OnInit, AfterViewInit {
	@Input() treeLevel = 0;
	@Input() target: Record<string, any> | any[];
	@Input() property: IBaseProperty;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public keyChanged: EventEmitter<string> = new EventEmitter();
	@Output() public valueChanged: EventEmitter<void> = new EventEmitter();

	@ViewChild('key') keyElement: ElementRef<HTMLElement>;

	public treeLevelPadding: number;

	private _valueChangeSubject: Subject<void> = new Subject();

	public abstract hasOptions: boolean;

	protected abstract propertyname: string;


	constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

	ngOnInit(): void {
		this.treeLevelPadding = 24 * this.treeLevel;
		this._renderer.addClass(this._elementRef.nativeElement, 'tree-item');

		this._valueChangeSubject
			.pipe(debounceTime(this.property.valueChangeDebounce))
			.subscribe(() => {
				this.valueChanged.emit();
			});
	}

	ngAfterViewInit(): void {
		this.keyElement.nativeElement.innerText = (!!this.property.key || this.property.key === 0) ? this.property.key as string : '';
		this.keyElement.nativeElement.addEventListener('input', () => this.keyChanged.emit(this.keyElement.nativeElement.innerText));
	}

	onValueChanged(): void {
		this._valueChangeSubject.next();
	}
}
