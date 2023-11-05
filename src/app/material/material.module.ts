import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';

import { EditorModule } from '@sesan07/ngx-formly-editor';

import { CheckboxService } from '../field-services/checkbox/checkbox.service';
import { FormlyGroupService } from '../field-services/formly-group/formly-group.service';
import { InputService } from '../field-services/input/input.service';
import { RadioService } from '../field-services/radio/radio.service';
import { SelectService } from '../field-services/select/select.service';
import { TextareaService } from '../field-services/textarea/textarea.service';
import { AppFieldType } from '../field-services/field.types';
import { MaterialRoutingModule } from './material-routing.module';
import { MaterialComponent } from './material.component';
import { RepeatingSectionTypeModule } from './components/repeating-section-type/repeating-section-type.module';
import { RepeatingSectionService } from './field-services/repeating-section/repeating-section.service';

@NgModule({
    declarations: [MaterialComponent],
    imports: [
        CommonModule,
        MaterialRoutingModule,
        RepeatingSectionTypeModule,
        FormlyMaterialModule,
        FormlyModule.forRoot({
            types: [
                { name: AppFieldType.INPUT, defaultOptions: { props: { appearance: 'fill' } } },
                { name: AppFieldType.RADIO, defaultOptions: { props: { appearance: 'fill' } } },
                { name: AppFieldType.SELECT, defaultOptions: { props: { appearance: 'fill' } } },
                { name: AppFieldType.TEXTAREA, defaultOptions: { props: { appearance: 'fill' } } },
            ],
            validationMessages: [{ name: 'required', message: 'This field is required' }],
        }),
        EditorModule.forRoot({
            options: [
                {
                    displayName: 'Input',
                    children: [
                        {
                            displayName: 'Input',
                            type: AppFieldType.INPUT,
                            keyGenerationPrefix: 'inp',
                            service: InputService,
                        },
                        {
                            displayName: 'Number',
                            type: AppFieldType.NUMBER,
                            keyGenerationPrefix: 'num',
                            service: InputService,
                        },
                    ],
                },
                {
                    displayName: 'Checkbox',
                    type: AppFieldType.CHECKBOX,
                    keyGenerationPrefix: 'chk',
                    service: CheckboxService,
                },
                {
                    displayName: 'Radio',
                    type: AppFieldType.RADIO,
                    keyGenerationPrefix: 'rad',
                    service: RadioService,
                },
                {
                    displayName: 'Select',
                    type: AppFieldType.SELECT,
                    keyGenerationPrefix: 'sel',
                    service: SelectService,
                },
                {
                    displayName: 'Textarea',
                    type: AppFieldType.TEXTAREA,
                    keyGenerationPrefix: 'txt',
                    service: TextareaService,
                },
                {
                    displayName: 'Group',
                    type: AppFieldType.FORMLY_GROUP,
                    disableKeyGeneration: true,
                    childrenConfig: {
                        path: 'fieldGroup',
                    },
                    service: FormlyGroupService,
                },
                {
                    displayName: 'Repeating Section',
                    type: AppFieldType.REPEATING_SECTION,
                    keyGenerationPrefix: 'rep',
                    childrenConfig: {
                        path: 'fieldArray',
                        isObject: true,
                    },
                    service: RepeatingSectionService,
                },
            ],
        }),
    ],
})
export class MaterialModule {}
