import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'lib-container-option',
    templateUrl: './container-option.component.html',
    styleUrls: ['./container-option.component.scss']
})
export class ContainerOptionComponent {
	@Input() label: string;
    @Input() value: string;
    @Input() options: string[];
    @Input() optionDisplayFn: (option: string) => string;

    @Output() selectionChanged: EventEmitter<string> = new EventEmitter();
}
