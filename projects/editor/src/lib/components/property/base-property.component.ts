import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IBaseProperty } from './property.types';

@Component({ template: '' })
export class BasePropertyComponent implements OnChanges, OnInit, AfterViewInit {
	@Input() treeLevel = 0;
	@Input() target: Record<string, any> | any[];
	@Input() property: IBaseProperty;
	@Input() isSimplified: boolean;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public keyChanged: EventEmitter<string> = new EventEmitter();
	@Output() public valueChanged: EventEmitter<void> = new EventEmitter();

	@ViewChild('key') keyElement: ElementRef<HTMLElement>;

	public treeLevelPadding: number;

    protected iconSize = 24;

	private _valueChangeSubject: Subject<void> = new Subject();


	constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.treeLevel) {
            this.treeLevelPadding = this.iconSize * this.treeLevel;
        }
    }

	ngOnInit(): void {

		this._valueChangeSubject
			.pipe(debounceTime(this.property.valueChangeDebounce))
			.subscribe(() => {
				this.valueChanged.emit();
			});
	}

	ngAfterViewInit(): void {
        if (this.keyElement) {
            this.keyElement.nativeElement.innerText = (!!this.property.key || this.property.key === 0) ? this.property.key as string : '';
            this.keyElement.nativeElement.addEventListener('blur', () => this.keyChanged.emit(this.keyElement.nativeElement.innerText));
        }
	}

	onValueChanged(): void {
		this._valueChangeSubject.next();
	}
}
