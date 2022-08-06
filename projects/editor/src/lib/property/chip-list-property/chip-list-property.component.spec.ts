import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipListPropertyComponent } from './chip-list-property.component';

describe('ChipListPropertyComponent', () => {
    let component: ChipListPropertyComponent;
    let fixture: ComponentFixture<ChipListPropertyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChipListPropertyComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChipListPropertyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
