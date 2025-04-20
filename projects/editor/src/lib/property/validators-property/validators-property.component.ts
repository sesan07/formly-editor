import { ChangeDetectionStrategy, Component, forwardRef, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { FormlyConfig } from '@ngx-formly/core';
import { get, isEmpty, startCase } from 'lodash-es';

import { EDITOR_CONFIG, ValidatorOption } from '../../editor.types';
import { BasePropertyDirective } from '../base-property.directive';
import { createTextProperty } from '../input-property/input-property.types';
import { ObjectPropertyComponent } from '../object-property/object-property.component';
import { createObjectProperty } from '../object-property/object-property.types';
import { IPropertyChange } from '../property.types';
import { modifyPropertyTarget } from '../property.utils';
import { IValidationConfig, IValidationData, IValidatorsProperty, IValidatorsValue } from './validators-property.types';

@Component({
    selector: 'editor-validators-property',
    templateUrl: './validators-property.component.html',
    styleUrls: ['./validators-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatIconButton,
        MatMenuTrigger,
        MatIcon,
        ObjectPropertyComponent,
        MatMenu,
        MatMenuItem,
        forwardRef(() => ObjectPropertyComponent),
    ]
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
        data.forEach(({ name, options, message }) => {
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
