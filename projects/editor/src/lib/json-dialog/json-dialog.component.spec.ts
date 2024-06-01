import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JSONDialogComponent } from './json-dialog.component';

describe('ImportFormDialogComponent', () => {
    let component: JSONDialogComponent;
    let fixture: ComponentFixture<JSONDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [JSONDialogComponent],
}).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JSONDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
