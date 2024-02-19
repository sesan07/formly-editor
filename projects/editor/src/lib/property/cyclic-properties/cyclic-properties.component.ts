import { ChangeDetectionStrategy, Component, Directive, Input, OnInit, TrackByFunction, inject } from '@angular/core';
import { FormlyConfig } from '@ngx-formly/core';
import { get, isEmpty, startCase } from 'lodash-es';

import { EDITOR_CONFIG, ValidatorOption } from '../../editor.types';
import { BasePropertyDirective } from '../base-property.directive';
import { createTextProperty } from '../input-property/input-property.types';
import { PropertyService } from '../property.service';
import { IProperty, IPropertyChange, PropertyType } from '../property.types';
import { modifyPropertyTarget } from '../utils';
import { IArrayProperty } from './array-property.types';
import { IObjectProperty, createObjectProperty } from './object-property.types';
import { IValidationConfig, IValidationData, IValidatorsProperty, IValidatorsValue } from './validators-property.types';

@Directive()
export abstract class ObjectArrayPropertyDirective<P extends IArrayProperty | IObjectProperty, V>
    extends BasePropertyDirective<P, V>
    implements OnInit
{
    @Input() isExpanded: boolean;
    public canAdd: boolean;
    public hasOptions: boolean;
    public addOptions: PropertyType[] = [
        PropertyType.ARRAY,
        PropertyType.BOOLEAN,
        PropertyType.NUMBER,
        PropertyType.OBJECT,
        PropertyType.TEXT,
        PropertyType.TEXTAREA,
    ];

    public typeofProperty: typeof PropertyType = PropertyType;
    public childProperties: IProperty[] = [];
    public childrenTreeLevel: number;

    constructor(public propertyService: PropertyService) {
        super();
    }

    protected abstract get _canAdd(): boolean;

    trackByPropertyKey: TrackByFunction<IProperty> = (_, property: IProperty) => property.key;

    ngOnInit(): void {
        this.childrenTreeLevel = this.treeLevel + 1;
    }

    getChildPath(key: string | number): string[] {
        return [...this.path, ...key.toString().split('.')];
    }

    protected _onChanged(): void {
        this.canAdd = this.property.canAdd;
        this.hasOptions = this.property.isRemovable || this._canAdd;
        this._populateChildren();
    }

    protected abstract _populateChildren(): void;
}

@Component({
    selector: 'editor-array-property',
    templateUrl: './array-property.component.html',
    styleUrls: ['./array-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayPropertyComponent extends ObjectArrayPropertyDirective<IArrayProperty, unknown[]> {
    protected defaultValue = [];

    protected get _canAdd(): boolean {
        return this.property.canAdd;
    }

    onAddChild(type: PropertyType): void {
        const childValue: any = this.propertyService.getDefaultPropertyValue(type);
        const newValue = [...this.currentValue, childValue];
        this._modifyValue(newValue);

        this.isExpanded = true;
    }

    onRemoveChild(index: number): void {
        const newValue = this.currentValue.filter((_, i) => i !== index);
        this._modifyValue(newValue);
    }

    protected override _isValidProperty(x: any): x is IArrayProperty {
        return this._isBaseProperty(x);
    }

    protected _populateChildren(): void {
        this.childProperties = this.currentValue.map((childValue, index) => {
            let childProperty: IProperty;
            if (this.property.childProperty) {
                childProperty = structuredClone(this.property.childProperty);
            } else {
                childProperty = this.propertyService.getDefaultPropertyFromValue(childValue ?? '');
            }
            childProperty.key = index;
            childProperty.isKeyEditable = false;

            return childProperty;
        });
    }
}

@Component({
    selector: 'editor-object-property',
    templateUrl: './object-property.component.html',
    styleUrls: ['./object-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectPropertyComponent extends ObjectArrayPropertyDirective<IObjectProperty, Record<string, unknown>> {
    @Input() useExpansionPanel = true;
    @Input() showCount = true;

    public childrenTreeMode: boolean;

    protected defaultValue = {};

    protected get _canAdd(): boolean {
        return this.property.canAdd;
    }

    onAddChild(type: PropertyType): void {
        const childValue: any = this.propertyService.getDefaultPropertyValue(type);
        const newValue = {
            ...this.currentValue,
            '': childValue,
        };
        this._modifyValue(newValue);

        this.isExpanded = true;
    }

    onRemoveChild(index: number): void {
        const childProperty: IProperty = this.childProperties[index];

        const newValue = { ...this.currentValue };
        delete newValue[childProperty.key];
        this._modifyValue(newValue);
    }

    protected override _isValidProperty(x: any): x is IObjectProperty {
        return Array.isArray(x.childProperties) && this._isBaseProperty(x);
    }

    protected _populateChildren(): void {
        this.childrenTreeMode = this.property.childrenTreeMode || this.treeMode;
        if (this.property.populateChildrenFromTarget) {
            this._populateChildrenFromTarget();
        } else {
            this._populateChildrenFromProperty();
        }
    }

    private _populateChildrenFromProperty() {
        this.childProperties = [...this.property.childProperties];
    }

    private _populateChildrenFromTarget() {
        this.childProperties = [];

        Object.entries(this.currentValue ?? {}).forEach(([key, value]) => {
            const childProperty = this.propertyService.getDefaultPropertyFromValue(value, key);
            if (childProperty) {
                this.childProperties.push(childProperty);
            }
        });
    }
}

@Component({
    selector: 'editor-validators-property',
    templateUrl: './validators-property.component.html',
    styleUrls: ['./validators-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidatorsPropertyComponent extends BasePropertyDirective<IValidatorsProperty, IValidatorsValue> {
    public isExpanded: boolean;
    public addOptions: ValidatorOption[] = [];
    public validationConfigs: IValidationConfig[] = [];

    protected defaultValue = {};

    private readonly _messagesPath = ['validation', 'messages'];
    private _formlyConfig = inject(FormlyConfig);
    private _editorConfig = inject(EDITOR_CONFIG);
    private _defaultMessages: Record<string, string>;
    private _validatorNameMap: Record<string, string>;

    trackByConfigName: TrackByFunction<IValidationConfig> = (_, property: IValidationConfig) => property.data.name;

    onAddChild(option: ValidatorOption): void {
        const newData: IValidationData[] = [...this.validationConfigs.map(v => v.data), { name: option.key }];
        this._updateValue(newData);
        this.isExpanded = true;
    }

    onRemoveChild(index: number): void {
        const removed = this.validationConfigs[index].data;
        const newData: IValidationData[] = this.validationConfigs.filter((_, i) => i !== index).map(v => v.data);
        this._updateValue(newData, removed);
    }

    onChildChanged(change: IPropertyChange, index: number): void {
        const newData: IValidationData[] = this.validationConfigs.map(({ data }, i) =>
            i === index ? modifyPropertyTarget(this.validationConfigs[index].data, change) : data
        );

        this._updateValue(newData);
    }

    protected _onChanged(isFirstChange: boolean): void {
        if (isFirstChange) {
            if (this.property.key === 'validators') {
                this.addOptions = this._editorConfig.validatorOptions ?? [];
            } else if (this.property.key === 'asyncValidators') {
                this.addOptions = this._editorConfig.asyncValidatorOptions ?? [];
            }
            this._validatorNameMap = this.addOptions.reduce(
                (acc, option) => ({ ...acc, [option.key]: option.name }),
                {}
            );

            this._defaultMessages = Object.entries(this._formlyConfig.messages).reduce(
                (acc, [key, message]) => ({
                    ...acc,
                    [key]: typeof message === 'function' ? 'Function' : message,
                }),
                {}
            );
        }

        this._populateChildrenFromTarget();
    }

    protected override _isValidProperty(x: any): x is IValidatorsProperty {
        return this._isBaseProperty(x);
    }

    private _populateChildrenFromTarget() {
        const messages = this._getCurrentMessages();
        this.validationConfigs = [];
        Object.entries(this.currentValue).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                this.validationConfigs.push(...value.map(v => this._getValidationConfig(messages, v)));
            } else {
                this.validationConfigs.push(this._getValidationConfig(messages, key, value.options));
            }
        });
    }

    private _updateValue(data: IValidationData[], removed?: IValidationData): void {
        const validation: string[] = [];
        const validationObjects: Record<string, IValidationData> = {};
        const messages = this._getCurrentMessages();
        data.forEach(({ name, options, message }, i) => {
            if (isEmpty(options)) {
                validation.push(name);
            } else {
                validationObjects[name] = { name, options };
            }

            if (message) {
                messages[name] = message;
            } else {
                delete messages[name];
            }
        });

        if (removed) {
            delete messages[removed.name];
        }

        // Modify validator
        this._modifyValue({ ...(validation.length ? { validation } : {}), ...validationObjects });
        // Modify validation messages
        this._modifyValue(!isEmpty(messages) ? messages : undefined, this._messagesPath);
    }

    private _getCurrentMessages(): Record<string, string> {
        return { ...get(this.target as Record<string, any>, this._messagesPath, {}) };
    }

    private _getValidationConfig(
        messages: Record<string, string>,
        key: string,
        options?: Record<string, any>
    ): IValidationConfig {
        return {
            data: {
                name: key,
                message: messages[key],
                options,
            },
            property: createObjectProperty({
                name: startCase(key),
                isRemovable: true,
                childProperties: [
                    createTextProperty({
                        name: 'Message',
                        key: 'message',
                        placeholder: `Default: ${this._defaultMessages[key] ?? '[not configured]'}`,
                    }),
                    createObjectProperty({
                        name: 'Options',
                        key: 'options',
                        canAdd: true,
                        populateChildrenFromTarget: true,
                        isKeyEditable: true,
                        childrenTreeMode: true,
                        childProperties: [],
                    }),
                ],
            }),
        };
    }
}
