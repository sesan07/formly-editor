import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFormDialogComponent } from './add-form-dialog.component';

describe('AddFormDialogComponent', () => {
    let component: AddFormDialogComponent;
    let fixture: ComponentFixture<AddFormDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AddFormDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AddFormDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
