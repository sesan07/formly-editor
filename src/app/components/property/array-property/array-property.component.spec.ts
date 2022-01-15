import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrayPropertyComponent } from './array-property.component';

describe('ArrayPropertyComponent', () => {
  let component: ArrayPropertyComponent;
  let fixture: ComponentFixture<ArrayPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArrayPropertyComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArrayPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
