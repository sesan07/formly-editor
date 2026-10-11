declare module '@dragdroptouch/drag-drop-touch' {
  interface DragDropTouchOptions {
    isPressHoldMode?: boolean;
    pressHoldDelayMS?: number;
  }

  export function enableDragDropTouch(
    dragRoot?: HTMLElement,
    dropRoot?: HTMLElement,
    options?: DragDropTouchOptions,
  ): void;
}
