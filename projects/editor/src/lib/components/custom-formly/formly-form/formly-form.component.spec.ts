import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFormComponent } from './formly-form.component';

describe('FormlyFormComponent', () => {
  let component: FormlyFormComponent;
  let fixture: ComponentFixture<FormlyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormlyFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
