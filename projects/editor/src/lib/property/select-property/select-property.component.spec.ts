import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPropertyComponent } from './select-property.component';

describe('SelectPropertyComponent', () => {
  let component: SelectPropertyComponent;
  let fixture: ComponentFixture<SelectPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SelectPropertyComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(SelectPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
