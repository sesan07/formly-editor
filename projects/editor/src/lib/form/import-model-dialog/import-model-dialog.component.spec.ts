import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportModelDialogComponent } from './import-model-dialog.component';

describe('ImportFormDialogComponent', () => {
    let component: ImportModelDialogComponent;
    let fixture: ComponentFixture<ImportModelDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImportModelDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ImportModelDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
