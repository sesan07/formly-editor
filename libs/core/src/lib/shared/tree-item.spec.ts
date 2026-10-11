import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { MouseInsideService } from '../editor/mouse-inside.service';
import { TreeItem } from './tree-item';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TreeItem],
  template: `
    <core-tree-item
      [level]="level()"
      [isTabRoot]="isTabRoot()"
      [isParent]="hasChildren()"
      [canInteract]="canInteract()"
      [alwaysShowActions]="alwaysShowActions()"
      [isExpanded]="isExpanded()"
      (toggleClicked)="isExpanded.set(!isExpanded())"
    >
      <span class="custom-content">My Node</span>
      <div
        actions
        class="custom-actions"
      >
        <button aria-label="Action Button">Action</button>
      </div>
    </core-tree-item>
  `,
})
class TestHostComponent {
  readonly level = signal(0);
  readonly isTabRoot = signal(false);
  readonly hasChildren = signal(false);
  readonly canInteract = signal(true);
  readonly alwaysShowActions = signal(false);
  readonly isExpanded = signal(false);
}

describe('TreeItem', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let mouseInsideService: MouseInsideService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [MouseInsideService],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    mouseInsideService = TestBed.inject(MouseInsideService);
    fixture.detectChanges();
  });

  it('renders projected content and default states', () => {
    expect(fixture.nativeElement.textContent).toContain('My Node');
    expect(fixture.nativeElement.textContent).toContain('Action');

    const treeItemEl = fixture.nativeElement.querySelector('core-tree-item') as HTMLElement;
    expect(treeItemEl.getAttribute('tabindex')).toBe('-1');
    expect(treeItemEl.classList.contains('cursor-pointer')).toBe(true);
  });

  it('sets tabindex="0" when isTabRoot is true', () => {
    hostComponent.isTabRoot.set(true);
    fixture.detectChanges();

    const treeItemEl = fixture.nativeElement.querySelector('core-tree-item') as HTMLElement;
    expect(treeItemEl.getAttribute('tabindex')).toBe('0');
  });

  it('disables interaction styling when canInteract is false', () => {
    hostComponent.canInteract.set(false);
    fixture.detectChanges();

    const treeItemEl = fixture.nativeElement.querySelector('core-tree-item') as HTMLElement;
    expect(treeItemEl.classList.contains('cursor-pointer')).toBe(false);
  });

  it('renders indentation lines and padding based on level', () => {
    hostComponent.level.set(3);
    fixture.detectChanges();

    const treeItemDebug = fixture.debugElement.query(By.directive(TreeItem));
    const treeItemInstance = treeItemDebug.componentInstance as TreeItem;

    expect(treeItemInstance.lines().length).toBe(3);
    expect(treeItemInstance.paddingLeft()).toContain('3');

    const treeItemEl = treeItemDebug.nativeElement as HTMLElement;
    const lines = treeItemEl.querySelectorAll('span.border-r');
    expect(lines.length).toBe(3);
  });

  it('shows invisible toggle button when hasChildren is false', () => {
    hostComponent.hasChildren.set(false);
    fixture.detectChanges();

    const toggleBtn = fixture.nativeElement.querySelector(
      'button[aria-label="Toggle children"]',
    ) as HTMLElement;
    expect(toggleBtn.classList.contains('invisible')).toBe(true);
  });

  it('shows toggle button and toggles isExpanded on click when hasChildren is true', () => {
    hostComponent.hasChildren.set(true);
    hostComponent.isExpanded.set(false);
    fixture.detectChanges();

    const toggleBtn = fixture.nativeElement.querySelector(
      'button[aria-label="Toggle children"]',
    ) as HTMLButtonElement;
    expect(toggleBtn.classList.contains('invisible')).toBe(false);

    const chevronIcon = toggleBtn.querySelector('i') as HTMLElement;
    expect(chevronIcon.classList.contains('rotate-90')).toBe(false);

    toggleBtn.click();
    fixture.detectChanges();

    expect(hostComponent.isExpanded()).toBe(true);
    expect(chevronIcon.classList.contains('rotate-90')).toBe(true);

    toggleBtn.click();
    fixture.detectChanges();

    expect(hostComponent.isExpanded()).toBe(false);
  });

  it('manages mouse inside states and actions visibility', () => {
    const treeItemEl = fixture.nativeElement.querySelector('core-tree-item') as HTMLElement;
    const actionsWrapper = treeItemEl.querySelector('span.shrink-0') as HTMLElement;

    expect(actionsWrapper.classList.contains('opacity-0')).toBe(true);

    treeItemEl.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(actionsWrapper.classList.contains('opacity-100')).toBe(true);

    treeItemEl.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(actionsWrapper.classList.contains('opacity-0')).toBe(true);
    expect(actionsWrapper.classList.contains('opacity-100')).toBe(false);

    hostComponent.alwaysShowActions.set(true);
    fixture.detectChanges();
    expect(actionsWrapper.classList.contains('opacity-100')).toBe(true);
  });

  it('updates root mouse inside guide line indicator opacity', () => {
    const treeItemEl = fixture.nativeElement.querySelector('core-tree-item') as HTMLElement;
    const rootLineContainer = treeItemEl.querySelector('span.pointer-events-none') as HTMLElement;

    expect(rootLineContainer.classList.contains('opacity-0')).toBe(true);

    mouseInsideService.setMouseInside(true);
    fixture.detectChanges();
    expect(rootLineContainer.classList.contains('opacity-100')).toBe(true);

    mouseInsideService.setMouseInside(false);
    fixture.detectChanges();
    expect(rootLineContainer.classList.contains('opacity-0')).toBe(true);
  });
});
