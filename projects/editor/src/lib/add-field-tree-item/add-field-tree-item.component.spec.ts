import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFieldTreeItemComponent } from './add-field-tree-item.component';

describe('AddFieldTreeItemComponent', () => {
  let component: AddFieldTreeItemComponent;
  let fixture: ComponentFixture<AddFieldTreeItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AddFieldTreeItemComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFieldTreeItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
