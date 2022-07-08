import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorFormlyFieldComponent } from './editor-formly-field.component';

describe('EditorFormlyFieldComponent', () => {
  let component: EditorFormlyFieldComponent;
  let fixture: ComponentFixture<EditorFormlyFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorFormlyFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorFormlyFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
