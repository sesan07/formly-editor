import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { IBaseProperty, IPropertyValueChange } from './property.types';

@Component({ template: '' })
export class BasePropertyComponent implements OnChanges, AfterViewInit {
	@Input() treeLevel = 0;
	@Input() path = '';
	@Input() target: Record<string, any> | any[];
	@Input() property: IBaseProperty;
	@Input() isSimplified: boolean;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public keyChanged: EventEmitter<string> = new EventEmitter();
	@Output() public valueChanged: EventEmitter<IPropertyValueChange> = new EventEmitter();

	@ViewChild('key') keyElement: ElementRef<HTMLElement>;

	public treeLevelPadding: number;

    protected iconSize = 24;

	constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.treeLevel) {
            this.treeLevelPadding = this.iconSize * this.treeLevel;
        }
    }

	ngAfterViewInit(): void {
        if (this.keyElement) {
            this.keyElement.nativeElement.innerText = (!!this.property.key || this.property.key === 0) ? this.property.key as string : '';
            this.keyElement.nativeElement.addEventListener('blur', () => this.keyChanged.emit(this.keyElement.nativeElement.innerText));
        }
	}

	onValueChanged(change: IPropertyValueChange): void {
        this.valueChanged.emit(change);
	}
}
