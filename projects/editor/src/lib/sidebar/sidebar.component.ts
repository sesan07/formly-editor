import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    QueryList,
    Renderer2,
} from '@angular/core';

import { SidebarSectionComponent } from './sidebar-section/sidebar-section.component';
import { SideBarPosition } from './sidebar.types';

@Component({
    selector: 'editor-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements AfterContentInit {
    @Input() position: SideBarPosition;

    @Output() resizeEnd: EventEmitter<void> = new EventEmitter();

    @ContentChildren(SidebarSectionComponent)
    sections: QueryList<SidebarSectionComponent>;

    public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;

    private _height: number;
    private _width: number;

    private _prevResizeX: number;
    private _prevResizeY: number;
    private _topResizeIndex: number;
    private _bottomResizeIndex: number;
    private _totalResizeDeltaX: number;
    private _sidebarStartWidth: number;
    private _topLimit: number;
    private _bottomLimit: number;
    private _stopMouseMoveListener: () => void;
    private _stopMouseUpListener: () => void;

    constructor(private _renderer: Renderer2, private _elementRef: ElementRef<HTMLElement>) {}

    ngAfterContentInit(): void {
        if (this.sections.length === 0) {
            return;
        }

        // Wait until sidebar is in DOM to setup sections
        const int = setInterval(() => {
            if (this._elementRef.nativeElement.clientHeight > 0) {
                this._setupSections();
                clearInterval(int);
            }
        }, 200);
    }

    onSidebarMouseDown(event: MouseEvent): void {
        this._prevResizeX = event.clientX;
        this._totalResizeDeltaX = 0;

        this._sidebarStartWidth = this._elementRef.nativeElement.clientWidth;

        this._stopMouseMoveListener = this._renderer.listen('window', 'mousemove', (e: MouseEvent) => {
            this._resizeSidebarX(e.clientX);
            e.preventDefault();
        });
        this._stopMouseUpListener = this._renderer.listen('window', 'mouseup', () => {
            this._stopMouseMoveListener();
            this._stopMouseUpListener();
            this.resizeEnd.emit();
        });
    }

    onSectionMouseDown(event: MouseEvent, section: SidebarSectionComponent): void {
        // Make sure top and bottom sections are resizable
        const topSection: SidebarSectionComponent = this.sections
            .toArray()
            .reverse()
            .find(s => !s.isCollapsed && s.index < section.index);
        const bottomSection: SidebarSectionComponent = this.sections.find(
            s => !s.isCollapsed && s.index >= section.index
        );
        if (!(topSection && bottomSection)) {
            return;
        }

        // Set starting values
        this._prevResizeY = event.clientY;
        this._topResizeIndex = topSection.index;
        this._bottomResizeIndex = bottomSection.index;

        // Set max heights for all sections
        this.sections.forEach(s => {
            s.maxHeight =
                s.index === this._topResizeIndex || s.index === this._bottomResizeIndex
                    ? Number.MAX_SAFE_INTEGER
                    : s.height;

            this._renderer.addClass(s.element, 'resizing');
        });

        this._stopMouseMoveListener = this._renderer.listen('window', 'mousemove', (e: MouseEvent) => {
            this._resizeSidebarY(e.clientY);
            e.preventDefault();
        });
        this._stopMouseUpListener = this._renderer.listen('window', 'mouseup', () => {
            this._topLimit = null;
            this._bottomLimit = null;

            this.sections.forEach(s => {
                s.maxHeight = null;
                this._renderer.removeClass(s.element, 'resizing');
            });

            this._stopMouseMoveListener();
            this._stopMouseUpListener();
            this.resizeEnd.emit();
        });
    }

    toggleSection(section: SidebarSectionComponent): void {
        if (section.isCollapsed) {
            this._expandSection(section);
        } else {
            this._collapseSection(section);
        }
    }

    private _collapseSection(section: SidebarSectionComponent): void {
        const bottomSection: SidebarSectionComponent = this.sections.find(
            s => !s.isCollapsed && s.index > section.index
        );

        if (bottomSection) {
            const heightDiff: number = section.height - section.minHeight;
            bottomSection.height += heightDiff;
            section.cachedContentHeight = heightDiff;
            section.height = section.minHeight;
            section.isCollapsed = !section.isCollapsed;
        } else {
            const topSection: SidebarSectionComponent = this.sections
                .toArray()
                .reverse()
                .find(s => !s.isCollapsed && s.index < section.index);

            if (topSection) {
                const heightDiff: number = section.height - section.minHeight;
                topSection.height += heightDiff;
                section.cachedContentHeight = heightDiff;
                section.height = section.minHeight;
                section.isCollapsed = !section.isCollapsed;
            }
        }
    }

    private _expandSection(section: SidebarSectionComponent): void {
        // Resize bottom
        this._bottomResizeIndex = section.index + 1;
        let remainingResize: number = section.cachedContentHeight;
        while (remainingResize > 0 && this._bottomResizeIndex < this.sections.length) {
            const currSection: SidebarSectionComponent = this.sections.toArray()[this._bottomResizeIndex];
            const availableHeight: number = currSection.availableHeight;

            if (availableHeight - remainingResize >= 0) {
                // Has enough space
                currSection.height -= remainingResize;
                remainingResize = 0;
            } else {
                // Not enough space
                currSection.height -= availableHeight;
                remainingResize -= availableHeight;
                this._bottomResizeIndex++;
            }
        }

        // Resize top if bottom is not enough
        if (remainingResize > 0) {
            this._topResizeIndex = section.index - 1;
            while (remainingResize > 0 && this._topResizeIndex >= 0) {
                const currSection: SidebarSectionComponent = this.sections.toArray()[this._topResizeIndex];
                const availableHeight: number = currSection.availableHeight;

                if (availableHeight - remainingResize >= 0) {
                    // Has enough space
                    currSection.height -= remainingResize;
                    remainingResize = 0;
                } else {
                    // Not enough space
                    currSection.height -= availableHeight;
                    remainingResize -= availableHeight;
                    this._topResizeIndex--;
                }
            }
        }

        section.height = section.minHeight + (section.cachedContentHeight - remainingResize);
        section.isCollapsed = !section.isCollapsed;
    }

    private _setupSections(): void {
        const rect: DOMRect = this._elementRef.nativeElement.getBoundingClientRect();
        this._height = rect.height;
        this._width = rect.width;

        const sectionHeight: number = this._height / this.sections.length;

        this.sections.forEach((section, index) => {
            section.setup(this, index, sectionHeight);
        });
    }

    private _getAvailableTopHeight(index: number): number {
        return this.sections
            .toArray()
            .slice(0, index + 1)
            .reduce((prev, curr) => prev + curr.availableHeight, 0);
    }

    private _getAvailableBottomHeight(index: number): number {
        return this.sections
            .toArray()
            .slice(index, this.sections.length)
            .reduce((prev, curr) => prev + curr.availableHeight, 0);
    }

    private _resizeSidebarX(newPositionX: number): void {
        const resizeXDelta: number = newPositionX - this._prevResizeX;
        this._totalResizeDeltaX += this.position === SideBarPosition.LEFT ? -resizeXDelta : resizeXDelta;
        const targetWidth: number = this._sidebarStartWidth - this._totalResizeDeltaX;

        // const sidebar: HTMLElement = document.getElementById(sidebarId);
        this._renderer.setStyle(this._elementRef.nativeElement, 'width', targetWidth + 'px');

        this._prevResizeX = newPositionX;
    }

    private _resizeSidebarY(newPositionY: number): void {
        const resizeYDelta: number = newPositionY - this._prevResizeY;
        let actualResizeYDelta: number;

        if (resizeYDelta >= 0) {
            if (typeof this._bottomLimit === 'number' && newPositionY > this._bottomLimit) {
                return;
            }
            this._bottomLimit = null;

            const availableBottom: number = this._getAvailableBottomHeight(this._bottomResizeIndex);
            actualResizeYDelta = Math.min(availableBottom, resizeYDelta);

            if (availableBottom <= actualResizeYDelta) {
                this._bottomLimit = this._prevResizeY + actualResizeYDelta;
                this._prevResizeY = this._bottomLimit;
            } else {
                this._prevResizeY = newPositionY;
            }
        } else {
            if (typeof this._topLimit === 'number' && newPositionY < this._topLimit) {
                return;
            }
            this._topLimit = null;

            const availableTop: number = this._getAvailableTopHeight(this._topResizeIndex);
            actualResizeYDelta = Math.max(-availableTop, resizeYDelta);

            if (availableTop <= -actualResizeYDelta) {
                this._topLimit = this._prevResizeY + actualResizeYDelta;
                this._prevResizeY = this._topLimit;
            } else {
                this._prevResizeY = newPositionY;
            }
        }

        if (actualResizeYDelta > 0) {
            // Dragging Down
            this._resizeSection(actualResizeYDelta, true);
        } else if (actualResizeYDelta < 0) {
            // Dragging Up
            this._resizeSection(-actualResizeYDelta, false);
        }
    }

    private _resizeSection(resizeAmount: number, isDraggingDown: boolean): void {
        // If dragging down, resize bottom, otherwise resize top
        let remainingResize: number = resizeAmount;
        while (
            remainingResize > 0 &&
            (isDraggingDown ? this._bottomResizeIndex < this.sections.length : this._topResizeIndex >= 0)
        ) {
            const sectionIndex: number = isDraggingDown ? this._bottomResizeIndex : this._topResizeIndex;
            const section: SidebarSectionComponent = this.sections.toArray()[sectionIndex];
            const availableHeight: number = section.availableHeight;

            if (availableHeight - remainingResize >= 0) {
                // Has enough space
                section.height -= remainingResize;
                remainingResize = 0;
            } else {
                // Not enough space
                section.height -= availableHeight;
                remainingResize -= availableHeight;

                if (isDraggingDown) {
                    this._bottomResizeIndex++;
                } else {
                    this._topResizeIndex--;
                }
            }
        }

        // If dragging down, resize top, otherwise resize bottom
        remainingResize = resizeAmount;
        while (
            remainingResize > 0 &&
            (isDraggingDown ? this._bottomResizeIndex < this.sections.length : this._topResizeIndex >= 0)
        ) {
            const sectionIndex: number = isDraggingDown ? this._topResizeIndex : this._bottomResizeIndex;
            const section: SidebarSectionComponent = this.sections.toArray()[sectionIndex];
            if (!section.isCollapsed) {
                if (section.height + remainingResize <= section.maxHeight) {
                    section.height += remainingResize;
                    remainingResize = 0;
                } else {
                    remainingResize = section.height + remainingResize - section.maxHeight;
                    section.height = section.maxHeight;

                    if (isDraggingDown) {
                        this._topResizeIndex++;
                    } else {
                        this._bottomResizeIndex--;
                    }
                }
            } else {
                if (isDraggingDown) {
                    this._topResizeIndex++;
                } else {
                    this._bottomResizeIndex--;
                }
            }
        }
    }
}
