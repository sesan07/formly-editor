import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorFormlyFormComponent } from './editor-formly-form.component';

describe('EditorFormlyFormComponent', () => {
  let component: EditorFormlyFormComponent;
  let fixture: ComponentFixture<EditorFormlyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorFormlyFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorFormlyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
