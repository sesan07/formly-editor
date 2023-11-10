import { Inject, Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';

import { cloneDeep } from 'lodash-es';

import { StylesService } from '../edit-field/styles/styles.service';
import { EDITOR_CONFIG, EditorConfig } from '../editor.types';
import { IProperty, PropertyType } from '../property/property.types';
import { getPropertiesMap, getTypeOptions } from './field.service.utils';

@Injectable()
export class FieldService {
    private _fieldConfigMap: Record<string, FormlyFieldConfig>;
    private _fieldPropertiesMap: Record<string, IProperty[]>;

    private _wrappers: string[];
    private _wrapperPropertiesMap: Record<string, IProperty[]>;

    constructor(@Inject(EDITOR_CONFIG) private _config: EditorConfig, private _stylesService: StylesService) {
        const typeOptions = getTypeOptions(_config.fieldOptions);
        this._fieldConfigMap = typeOptions.reduce(
            (acc, option) => ({
                ...acc,
                [option.name]: {
                    type: option.name,
                    ...option.defaultConfig,
                },
            }),
            {}
        );
        this._fieldPropertiesMap = getPropertiesMap(typeOptions);

        const wrapperOptions = _config.wrapperOptions ?? [];
        this._wrappers = wrapperOptions.map(option => option.name);
        this._wrapperPropertiesMap = getPropertiesMap(wrapperOptions);
    }

    public getDefaultField(type: string): FormlyFieldConfig {
        return cloneDeep(this._fieldConfigMap[type] ?? this._config.genericTypeOption.defaultConfig);
    }

    public getProperties(field: FormlyFieldConfig): IProperty[] {
        return [
            {
                name: 'Key',
                key: 'key',
                type: PropertyType.TEXT,
            },
            {
                name: 'Default Value',
                key: 'defaultValue',
                type: PropertyType.TEXT,
                outputRawValue: true,
            },
            {
                name: 'Hide',
                key: 'hide',
                type: PropertyType.BOOLEAN,
            },
            ...this._getFieldProperties(field.type as string),
            {
                name: 'Wrappers',
                key: 'wrappers',
                type: PropertyType.CHIP_LIST,
                options: this._wrappers,
            },
            ...this._getWrapperProperties(field),
            {
                name: 'Classes',
                key: 'className',
                type: PropertyType.CHIP_LIST,
                options: this._stylesService.classNames,
                outputString: true,
            },
            {
                name: 'Field Group Classes',
                key: 'fieldGroupClassName',
                type: PropertyType.CHIP_LIST,
                options: this._stylesService.fieldGroupClassNames,
                outputString: true,
            },
            {
                name: 'Expression Properties',
                key: 'expressionProperties',
                type: PropertyType.EXPRESSION_PROPERTIES,
            },
        ];
    }

    private _getFieldProperties(type: string): IProperty[] {
        return this._fieldPropertiesMap[type] ?? this._config.genericTypeOption.properties ?? [];
    }

    private _getWrapperProperties(field: FormlyFieldConfig): IProperty[] {
        return (field.wrappers ?? []).reduce(
            (acc, wrapper) => [...acc, ...this._wrapperPropertiesMap[wrapper as string]],
            []
        );
    }
}
