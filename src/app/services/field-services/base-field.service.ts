import { StyleService } from '../style-service/style.service';
import { FieldType, IBaseEditorFormlyField, WrapperType } from '../form-service/form.types';
import { IProperty, PropertyType } from 'src/app/components/property/property.types';
import { IChipListProperty } from 'src/app/components/property/chip-list-property/chip-list-property.types';
import { IObjectProperty } from 'src/app/components/property/object-property/object-property.types';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class BaseFieldService<T extends FormlyTemplateOptions> {
	private _currKey = 0;
	private _currId = 0;

	abstract name: string;
	abstract type: FieldType;

	public constructor(private _styleService: StyleService) { }

	public getNextKey(): string {
		return `${this.type}-${this._currKey++}`;
	}

	public getNextFieldId(): string {
		return this.type + '__' + this._currId++;
	}

	protected _getSharedProperties(): IProperty[] {
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
			},
			{
				key: 'className',
				type: PropertyType.CHIP_LIST,
				options: this._styleService.getClasses(),
				outputString: true,
			} as IChipListProperty,
			{
				key: 'formGroupClassName',
				type: PropertyType.CHIP_LIST,
				options: this._styleService.getClasses(),
				outputString: true,
			} as IChipListProperty,
			{
				key: 'expressionProperties',
				type: PropertyType.OBJECT,
				addOptions: [PropertyType.TEXT],
				childProperties: [],
				populateChildrenFromTarget: true,
			} as IObjectProperty,
		];
	}

	protected _getWrapperProperties(options: WrapperType[]): IProperty[] {
		const properties: IProperty[] = [
			{
				key: 'wrappers',
				type: PropertyType.CHIP_LIST,
				options: [...options],
				notRemovableOptions: [WrapperType.EDITOR],
			} as IChipListProperty,
		];

		// Add wrapper property config to `properties` if wrapper is configurable
		options.forEach(option => {
			switch (option) {
				case WrapperType.EDITOR:
				case WrapperType.FORM_FIELD:
					break;
				default: throw new Error(`Unkown wrapper type: '${option}'`);
			}
		});

		return properties;
	}

	public abstract getDefaultConfig(formId: string, parentFieldId?: string): IBaseEditorFormlyField<T>;
	public abstract getProperties(): IProperty[];
}
