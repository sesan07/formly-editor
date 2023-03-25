import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { FormComponent } from './form.component';
import { CustomFormlyModule } from '../custom-formly/custom-formly.module';
import { TextEditorModule } from '../text-editor/text-editor.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
    declarations: [ToolbarComponent, FormComponent],
    imports: [
        CommonModule,
        FormsModule,
        CustomFormlyModule,
        TextEditorModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatTabsModule,
    ],
    exports: [FormComponent],
})
export class FormModule {}
