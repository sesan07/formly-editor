import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaPropertyComponent } from './textarea-property.component';

describe('TextareaPropertyComponent', () => {
    let component: TextareaPropertyComponent;
    let fixture: ComponentFixture<TextareaPropertyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TextareaPropertyComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TextareaPropertyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
