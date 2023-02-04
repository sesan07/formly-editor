import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyKeyComponent } from './property-key.component';

describe('PropertyKeyComponent', () => {
  let component: PropertyKeyComponent;
  let fixture: ComponentFixture<PropertyKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyKeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
