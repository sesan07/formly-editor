import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportFormDialogComponent } from './export-form-dialog.component';

describe('ImportFormDialogComponent', () => {
    let component: ExportFormDialogComponent;
    let fixture: ComponentFixture<ExportFormDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExportFormDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportFormDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
