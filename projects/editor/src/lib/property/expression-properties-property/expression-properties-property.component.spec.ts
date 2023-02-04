import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressionPropertiesPropertyComponent } from './expression-properties-property.component';

describe('BooleanPropertyComponent', () => {
    let component: ExpressionPropertiesPropertyComponent;
    let fixture: ComponentFixture<ExpressionPropertiesPropertyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExpressionPropertiesPropertyComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ExpressionPropertiesPropertyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
