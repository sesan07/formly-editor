import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';

import { BooleanPropertyComponent } from './boolean-property/boolean-property.component';
import { ChipListPropertyComponent } from './chip-list-property/chip-list-property.component';
import { InputPropertyComponent } from './input-property/input-property.component';
import {
    ObjectPropertyComponent,
    ArrayPropertyComponent,
} from './object-array-properties/object-array-properties.component';
import { TreeItemModule } from '../tree-item/tree-item.module';
import { TextareaPropertyComponent } from './textarea-property/textarea-property.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [
        ObjectPropertyComponent,
        ArrayPropertyComponent,
        InputPropertyComponent,
        BooleanPropertyComponent,
        ChipListPropertyComponent,
        TextareaPropertyComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TreeItemModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatInputModule,
        MatCheckboxModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatDividerModule,
        MatExpansionModule,
    ],
    exports: [
        ObjectPropertyComponent,
        ArrayPropertyComponent,
        InputPropertyComponent,
        BooleanPropertyComponent,
        ChipListPropertyComponent,
        TextareaPropertyComponent,
    ],
})
export class PropertyModule {}
