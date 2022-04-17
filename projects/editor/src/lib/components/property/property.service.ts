import { Injectable } from '@angular/core';
import { isMoment } from 'moment';
import { IArrayProperty } from './array-property/array-property.types';
import { IChipListProperty } from './chip-list-property/chip-list-property.types';
import { IInputProperty } from './input-property/input-property.types';
import { IObjectProperty } from './object-property/object-property.types';
import { PropertyType, IProperty, IBaseProperty } from './property.types';

@Injectable({
	providedIn: 'root'
})
export class PropertyService {

	public readonly possibleArrayAddTypes: PropertyType[] = [
		PropertyType.BOOLEAN,
		PropertyType.OBJECT,
		PropertyType.NUMBER,
		PropertyType.TEXT
	];

	private _currKeyId = 0;

	public getAsArrayProperty(property: IProperty): IArrayProperty {
		return property as IArrayProperty;
	}

	public getAsChiplistProperty(property: IProperty): IChipListProperty {
		return property as IChipListProperty;
	}

	public getAsInputProperty(property: IProperty): IInputProperty {
		return property as IInputProperty;
	}

	public getAsObjectProperty(property: IProperty): IObjectProperty {
		return property as IObjectProperty;
	}

	public getDefaultProperty(type: PropertyType, key?: string | number, arrayChildType?: PropertyType): IProperty {
		key = (!!key || key === 0)
			? key
			: 'key' + this._currKeyId++;

		// Properties added by the user should have editable keys and be deletable
		const baseProperty: IBaseProperty = {
			type,
			key,
			isKeyEditable: true,
			isDeletable: true,
		};

		switch (type) {
			case PropertyType.BOOLEAN:
			case PropertyType.TEXT:
				return baseProperty;
			case PropertyType.NUMBER:
                return {
                    ...baseProperty,
                    outputRawValue: true
                } as IInputProperty;
			case PropertyType.OBJECT:
				return {
					...baseProperty,
					addOptions: [PropertyType.ARRAY, PropertyType.BOOLEAN, PropertyType.NUMBER, PropertyType.OBJECT, PropertyType.TEXT],
					childProperties: [],
					populateChildrenFromTarget: true
				} as IObjectProperty;
			case PropertyType.ARRAY:
				if (!arrayChildType) {
					throw new SyntaxError('arrayChildType parameter is required when adding an array type');
				}

				return {
					...baseProperty,
					canAdd: true,
					childProperty: this.getDefaultProperty(arrayChildType)
				} as IArrayProperty;
		}
	}

	public getDefaultPropertyFromValue(value: any, key?: string): IProperty | undefined {
		const propertyType: PropertyType | undefined = this.getPropertyType(value);
		if (!propertyType) {
			return undefined;
		}

		switch (propertyType) {
			case PropertyType.ARRAY:
				if ((value as []).length > 0) {
					const childPropertyType: PropertyType | undefined = this.getPropertyType(value[0]);
					if (!childPropertyType) {
						return undefined;
					}

					return this.getDefaultProperty(PropertyType.ARRAY, key, childPropertyType) as IArrayProperty;

				} else {
					return undefined;
				}
			case PropertyType.OBJECT:
				const property: IObjectProperty = this.getDefaultProperty(PropertyType.OBJECT, key) as IObjectProperty;

				return property;
			default:
				return this.getDefaultProperty(propertyType, key);
		}
	}

	public getPropertyType(value: any): PropertyType | undefined {
		switch (typeof value) {
			case 'object':
				if (value === null) {
					return undefined;
				} else if (Array.isArray(value)) {
					return PropertyType.ARRAY;
				} else if (isMoment(value)) {
					return PropertyType.TEXT;
				}

				return PropertyType.OBJECT;
			case 'boolean':
				return PropertyType.BOOLEAN;
			case 'number':
				return PropertyType.NUMBER;
			case 'string':
				return PropertyType.TEXT;
			default:
				return undefined;
		}
	}
}
