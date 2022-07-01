import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeItemHeaderComponent } from './tree-item-header.component';

describe('TreeItemHeaderComponent', () => {
  let component: TreeItemHeaderComponent;
  let fixture: ComponentFixture<TreeItemHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeItemHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeItemHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
