import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

import { BooleanPropertyComponent } from './boolean-property/boolean-property.component';
import { ChipListPropertyComponent } from './chip-list-property/chip-list-property.component';
import { InputPropertyComponent } from './input-property/input-property.component';
import {
    ObjectPropertyComponent,
    ArrayPropertyComponent,
    ValidatorsPropertyComponent,
} from './cyclic-properties/cyclic-properties.component';
import { TreeItemModule } from '../tree-item/tree-item.module';
import { TextareaPropertyComponent } from './textarea-property/textarea-property.component';
import { MatButtonModule } from '@angular/material/button';
import { ExpressionPropertiesPropertyComponent } from './expression-properties-property/expression-properties-property.component';
import { TextEditorModule } from '../text-editor/text-editor.module';
import { PropertyKeyComponent } from './property-key/property-key.component';
import { SelectPropertyComponent } from './select-property/select-property.component';

@NgModule({
    declarations: [
        ObjectPropertyComponent,
        ArrayPropertyComponent,
        InputPropertyComponent,
        BooleanPropertyComponent,
        ChipListPropertyComponent,
        TextareaPropertyComponent,
        ExpressionPropertiesPropertyComponent,
        PropertyKeyComponent,
        SelectPropertyComponent,
        ValidatorsPropertyComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TreeItemModule,
        TextEditorModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatInputModule,
        MatCheckboxModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatExpansionModule,
        MatSelectModule,
    ],
    exports: [ObjectPropertyComponent, ChipListPropertyComponent],
})
export class PropertyModule {}
