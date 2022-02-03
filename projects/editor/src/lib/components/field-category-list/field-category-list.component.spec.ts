import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldCategoryListComponent } from './field-category-list.component';

describe('FieldCategoryListComponent', () => {
  let component: FieldCategoryListComponent;
  let fixture: ComponentFixture<FieldCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldCategoryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
