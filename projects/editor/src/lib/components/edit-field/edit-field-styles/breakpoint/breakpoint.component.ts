import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'lib-breakpoint',
    templateUrl: './breakpoint.component.html',
    styleUrls: ['./breakpoint.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreakpointComponent {
	@Input() titleText: string;
    @Input() tooltipText: string;
    @Input() isExpanded: boolean;
}
