import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
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
    imports: [],
})
export class SidebarComponent implements AfterContentInit {
    @Input() position: SideBarPosition;

    @Output() resizeEnd = new EventEmitter<void>();

    @ContentChildren(SidebarSectionComponent)
    sections: QueryList<SidebarSectionComponent>;

    @HostBinding('class.editor-resizing') isResizing: boolean;

    public typeOfSideBarPosition: typeof SideBarPosition = SideBarPosition;

    private _height: number;

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

    constructor(
        private _renderer: Renderer2,
        private _elementRef: ElementRef<HTMLElement>
    ) {}

    ngAfterContentInit(): void {
        if (this.sections.length === 0) {
            return;
        }

        this._setupSections();
    }

    onSidebarMouseDown(event: MouseEvent): void {
        this.isResizing = true;
        this._prevResizeX = event.clientX;
        this._totalResizeDeltaX = 0;
        this._sidebarStartWidth = this._elementRef.nativeElement.clientWidth;

        this._stopMouseMoveListener = this._renderer.listen('window', 'mousemove', (e: MouseEvent) => {
            this._resizeSidebarX(e.clientX);
            e.preventDefault();
        });
        this._stopMouseUpListener = this._renderer.listen('window', 'mouseup', () => {
            this.isResizing = false;
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

            this._renderer.addClass(s.element, 'editor-resizing');
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
                this._renderer.removeClass(s.element, 'editor-resizing');
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
            const heightDiff: number = section.height - section.headerHeight;
            bottomSection.height += heightDiff;
            section.cachedCollapseHeight = heightDiff;
            section.height = section.headerHeight;
            section.isCollapsed = true;
        } else {
            const topSection: SidebarSectionComponent = this.sections
                .toArray()
                .reverse()
                .find(s => !s.isCollapsed && s.index < section.index);

            if (topSection) {
                const heightDiff: number = section.height - section.headerHeight;
                topSection.height += heightDiff;
                section.cachedCollapseHeight = heightDiff;
                section.height = section.headerHeight;
                section.isCollapsed = true;
            }
        }
    }

    private _expandSection(section: SidebarSectionComponent): void {
        // Resize bottom
        this._bottomResizeIndex = section.index + 1;
        const targetResize = section.cachedCollapseHeight || section.minContentHeight;
        let remainingResize: number = targetResize;
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

        section.height = section.headerHeight + (targetResize - remainingResize);
        section.isCollapsed = false;
    }

    private _setupSections(): void {
        const rect: DOMRect = this._elementRef.nativeElement.getBoundingClientRect();
        this._height = rect.height;
        const minContentHeight = this._height * 0.25;

        // Set up all collapsed
        let usedHeight = 0;
        this.sections.forEach((section, index) => {
            if (section.isCollapsed) {
                section.sideBar = this;
                section.index = index;
                section.height = section.headerHeight;
                section.minContentHeight = minContentHeight;
                usedHeight += section.headerHeight;
            }
        });

        // Set up all expanded with remaining height
        const expandedSections = this.sections.filter(section => !section.isCollapsed);
        const remainingHeight = this._height - usedHeight;
        const sectionHeight: number = remainingHeight / expandedSections.length;

        this.sections.forEach((section, index) => {
            if (!section.isCollapsed) {
                section.sideBar = this;
                section.index = index;
                section.height = sectionHeight;
                section.minContentHeight = this._height * 0.25;
            }
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
