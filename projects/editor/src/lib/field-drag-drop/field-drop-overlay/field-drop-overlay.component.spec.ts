import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldDropOverlayComponent } from './field-drop-overlay.component';

describe('FieldDropOverlayComponent', () => {
  let component: FieldDropOverlayComponent;
  let fixture: ComponentFixture<FieldDropOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [FieldDropOverlayComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldDropOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
