import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  createComponent,
  DestroyRef,
  effect,
  ElementRef,
  EnvironmentInjector,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormPreviewRenderer } from './form-preview-renderer';
import { PreviewDeviceToolbar } from './preview-device-toolbar';
import { PreviewViewportService } from './preview-viewport.service';

@Component({
  selector: 'core-form-preview-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PreviewDeviceToolbar],
  host: { class: 'flex h-full w-full min-h-0 flex-col overflow-hidden' },
  template: `
    <core-preview-device-toolbar [scale]="scale()" />
    <div
      #canvas
      class="min-h-0 grow overflow-hidden px-4 pb-4"
    >
      <div
        class="relative mx-auto overflow-hidden"
        [style.width]="scaledWidth()"
        [style.height.px]="canvasHeight()"
      >
        <iframe
          #previewFrame
          class="block origin-top-left"
          title="Responsive form preview"
          [style.width]="frameWidth()"
          [style.height.px]="frameHeight()"
          [style.transform]="'scale(' + scale() + ')'"
          (load)="initializeFrame()"
        ></iframe>
      </div>
    </div>
  `,
})
export class FormPreviewContent {
  readonly formFields = input<FormlyFieldConfig[]>([]);
  protected readonly viewport = inject(PreviewViewportService);
  private readonly applicationRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly canvas = viewChild.required<ElementRef<HTMLElement>>('canvas');
  private readonly previewFrame = viewChild.required<ElementRef<HTMLIFrameElement>>('previewFrame');
  private rendererRef: ComponentRef<FormPreviewRenderer> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private styleObserver: MutationObserver | null = null;

  protected readonly canvasWidth = signal(0);
  protected readonly canvasHeight = signal(0);
  protected readonly scale = computed(() => {
    const targetWidth = this.viewport.targetWidth();
    if (targetWidth === null) {
      return 1;
    }

    const canvasWidth = this.canvasWidth();
    return canvasWidth > 0 ? Math.min(1, canvasWidth / targetWidth) : 1;
  });
  protected readonly scaledWidth = computed(() => {
    const targetWidth = this.viewport.targetWidth();
    return targetWidth ? `${targetWidth * this.scale()}px` : 'auto';
  });
  protected readonly frameWidth = computed(() => {
    const targetWidth = this.viewport.targetWidth();
    return targetWidth ? `${targetWidth}px` : '100%';
  });
  protected readonly frameHeight = computed(() => {
    const scale = this.scale();
    return scale > 0 ? this.canvasHeight() / scale : 0;
  });

  constructor() {
    effect(() => {
      const fields = this.formFields();
      this.rendererRef?.setInput('formFields', fields);
    });

    afterNextRender(() => this.observeCanvas());
    this.destroyRef.onDestroy(() => this.destroyFrame());
  }

  protected initializeFrame(): void {
    this.destroyRenderer();

    const frameDocument = this.previewFrame().nativeElement.contentDocument;
    if (!frameDocument) {
      return;
    }

    frameDocument.open();
    frameDocument.write('<!doctype html><html><head></head><body></body></html>');
    frameDocument.close();
    this.syncFrameAppearance(frameDocument);
    this.syncFrameStyles(frameDocument);
    this.observeStyles(frameDocument);

    const hostElement = frameDocument.createElement('core-form-preview-renderer');
    frameDocument.body.append(hostElement);
    const rendererRef = createComponent(FormPreviewRenderer, {
      environmentInjector: this.environmentInjector,
      hostElement,
    });
    this.applicationRef.attachView(rendererRef.hostView);
    this.rendererRef = rendererRef;
    rendererRef.setInput('formFields', this.formFields());
  }

  private observeCanvas(): void {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.canvasWidth.set(entry.contentRect.width);
      this.canvasHeight.set(entry.contentRect.height);
    });
    this.resizeObserver.observe(this.canvas().nativeElement);
  }

  private observeStyles(frameDocument: Document): void {
    this.styleObserver?.disconnect();
    this.styleObserver = new MutationObserver(() => {
      this.syncFrameAppearance(frameDocument);
      this.syncFrameStyles(frameDocument);
    });
    this.styleObserver.observe(this.document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  private syncFrameAppearance(frameDocument: Document): void {
    frameDocument.documentElement.className = this.document.documentElement.className;
    frameDocument.documentElement.style.cssText = this.document.documentElement.style.cssText;
  }

  private syncFrameStyles(frameDocument: Document): void {
    frameDocument.head.replaceChildren(
      ...Array.from(this.document.head.querySelectorAll('link[rel="stylesheet"], style')).map(
        (node) => node.cloneNode(true),
      ),
    );
  }

  private destroyRenderer(): void {
    const rendererRef = this.rendererRef;
    if (rendererRef) {
      this.applicationRef.detachView(rendererRef.hostView);
      rendererRef.destroy();
      this.rendererRef = null;
    }
  }

  private destroyFrame(): void {
    this.resizeObserver?.disconnect();
    this.styleObserver?.disconnect();
    this.destroyRenderer();
  }
}
