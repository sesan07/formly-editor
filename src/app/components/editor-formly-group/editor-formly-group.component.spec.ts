import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorFormlyGroupComponent } from './editor-formly-group.component';

describe('EditorFormlyGroupComponent', () => {
  let component: EditorFormlyGroupComponent;
  let fixture: ComponentFixture<EditorFormlyGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorFormlyGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorFormlyGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
