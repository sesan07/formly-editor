import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectPropertyComponent } from './object-property.component';

describe('ObjectPropertyComponent', () => {
  let component: ObjectPropertyComponent;
  let fixture: ComponentFixture<ObjectPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectPropertyComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
