import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFieldComponent } from './formly-field.component';

describe('FormlyFieldComponent', () => {
    let component: FormlyFieldComponent;
    let fixture: ComponentFixture<FormlyFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FormlyFieldComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FormlyFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
