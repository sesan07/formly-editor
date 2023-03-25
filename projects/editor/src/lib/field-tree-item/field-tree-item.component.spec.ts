import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldTreeItemComponent } from './field-tree-item.component';

describe('FieldTreeItemComponent', () => {
    let component: FieldTreeItemComponent;
    let fixture: ComponentFixture<FieldTreeItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FieldTreeItemComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldTreeItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
