import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeItemComponent } from './tree-item.component';

describe('TreeItemHeaderComponent', () => {
    let component: TreeItemComponent;
    let fixture: ComponentFixture<TreeItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TreeItemComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TreeItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
