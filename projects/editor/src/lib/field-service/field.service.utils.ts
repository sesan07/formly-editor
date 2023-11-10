import { FieldOption, FieldTypeOption } from '../editor.types';
import { isCategoryOption } from '../editor.utils';
import { IProperty } from '../property/property.types';

export const getTypeOptions = (options: FieldOption[]) =>
    options.reduce<FieldTypeOption[]>(
        (a, b): FieldTypeOption[] => [...a, ...(isCategoryOption(b) ? getTypeOptions(b.children) : [b])],
        []
    );

export const getPropertiesMap = (options: { name: string; properties?: IProperty[] }[]) =>
    options.reduce(
        (acc, option) => ({
            ...acc,
            [option.name]: option.properties ?? [],
        }),
        {}
    );
