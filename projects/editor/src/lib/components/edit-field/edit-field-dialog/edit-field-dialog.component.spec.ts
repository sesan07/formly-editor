import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFieldDialogComponent } from './edit-field-dialog.component';

describe('EditFieldDialogComponent', () => {
  let component: EditFieldDialogComponent;
  let fixture: ComponentFixture<EditFieldDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFieldDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFieldDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
