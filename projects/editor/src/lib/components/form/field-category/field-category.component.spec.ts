import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldCategoryComponent } from './field-category.component';

describe('FieldCategoryComponent', () => {
  let component: FieldCategoryComponent;
  let fixture: ComponentFixture<FieldCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
