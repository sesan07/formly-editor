import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormToolbarComponent } from './form-toolbar.component';

describe('FormToolbarComponent', () => {
  let component: FormToolbarComponent;
  let fixture: ComponentFixture<FormToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
