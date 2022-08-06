import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatingSectionTypeComponent } from './repeating-section-type.component';

describe('RepeatingSectionTypeComponent', () => {
    let component: RepeatingSectionTypeComponent;
    let fixture: ComponentFixture<RepeatingSectionTypeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RepeatingSectionTypeComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RepeatingSectionTypeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
