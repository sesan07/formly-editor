import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    ViewChild
} from '@angular/core';
import { IBaseProperty } from './property.types';

@Component({ template: '' })
export class BasePropertyComponent implements AfterViewInit {
	@Input() treeLevel = 0;
	@Input() target: Record<string, any> | any[];
	@Input() property: IBaseProperty;
	@Input() isSimplified: boolean;

    @Output() public remove: EventEmitter<void> = new EventEmitter();
    @Output() public keyChanged: EventEmitter<string> = new EventEmitter();
    @Output() public targetChanged: EventEmitter<void> = new EventEmitter();

	@ViewChild('key') keyElement: ElementRef<HTMLElement>;

    @HostBinding('class.tree-item') get isTreeItem(): boolean { return !this.isSimplified; }

	ngAfterViewInit(): void {
        // TODO emit targetChanged on blur for input-like properties
        if (this.keyElement) {
            this.keyElement.nativeElement.innerText = (!!this.property.key || this.property.key === 0) ? this.property.key as string : '';
            this.keyElement.nativeElement.addEventListener('blur', () => this.onKeyChanged(this.keyElement.nativeElement.innerText));
        }
	}

    addValue(key: string | number, value: any): void {
        this.target[key] = value;
        this.targetChanged.emit();
    }

    modifyValue(key: string | number, value: any): void {
        this.target[key] = value;
        this.targetChanged.emit();
    }

    removeValue(key: string | number): void {
        if (Array.isArray(this.target)) {
            this.target.splice(+key, 1);
        } else {
            delete this.target[key];
        }
        this.targetChanged.emit();
    }

	onKeyChanged(newKey: string): void {
        const value: any = this.target[this.property.key];
        delete this.target[this.property.key];
        this.target[newKey] = value;
        this.property.key = newKey;
        this.targetChanged.emit();
	}
}
