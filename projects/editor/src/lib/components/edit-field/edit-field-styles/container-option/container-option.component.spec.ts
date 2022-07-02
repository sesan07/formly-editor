import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerOptionComponent } from './container-option.component';

describe('ContainerOptionComponent', () => {
  let component: ContainerOptionComponent;
  let fixture: ComponentFixture<ContainerOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
