import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyGroupComponent } from './formly-group.component';

describe('FormlyGroupComponent', () => {
    let component: FormlyGroupComponent;
    let fixture: ComponentFixture<FormlyGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FormlyGroupComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FormlyGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
