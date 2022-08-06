import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportFormDialogComponent } from './import-form-dialog.component';

describe('ImportFormDialogComponent', () => {
    let component: ImportFormDialogComponent;
    let fixture: ComponentFixture<ImportFormDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImportFormDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ImportFormDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
