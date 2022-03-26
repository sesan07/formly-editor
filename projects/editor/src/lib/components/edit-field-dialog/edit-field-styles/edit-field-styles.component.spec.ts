import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFieldStylesComponent } from './edit-field-styles.component';

describe('StyleChildrenComponent', () => {
  let component: EditFieldStylesComponent;
  let fixture: ComponentFixture<EditFieldStylesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFieldStylesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFieldStylesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
