import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { isEqual } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { EditorField, FieldInfo } from '../model/types';
import {
  createGroupProperty,
  createWrappersProperty,
  type GroupChildPropertyConfig,
} from '../properties';
import { PropertyConfig, PropertyType } from '../properties/types';
import type { FieldValidationConfig } from '../properties/validation-messages/validation.types';
import { CoreLibraryService } from './core-library.service';
import {
  CORE_EDITOR_CONFIG,
  CORE_LIBRARY_CONFIGS,
  FieldCategoryOption,
  FieldCategoryPreset,
  FieldTypeOption,
  FieldTypePreset,
} from './types';

interface LibraryProperties {
  presetStorageKey: string;
  fieldCategoryOptions: FieldCategoryOption[];
  fieldTypeOptions: FieldTypeOption[];
  fieldTypeMap: Record<string, FieldTypeOption>;
}

@Injectable()
export class CoreFieldService {
  protected readonly editorConfig = inject(CORE_EDITOR_CONFIG);
  protected readonly libraryConfigs = inject(CORE_LIBRARY_CONFIGS);
  protected readonly libraryService = inject(CoreLibraryService);

  protected activeLibraryId = this.libraryService.activeLibraryId;
  protected readonly libraryPropertyMap: Record<string, LibraryProperties> = {};

  protected readonly basePresetStorageKey = 'formly-studio-presets';
  defaultTypeOption = this.editorConfig.defaultTypeOption;

  protected readonly activeFieldTypeMap = computed(() => {
    const activeLibraryId = this.activeLibraryId();
    if (!activeLibraryId) {
      return {};
    }
    return this.libraryPropertyMap[activeLibraryId]?.fieldTypeMap ?? {};
  });

  readonly activeFieldCategoryOptions = computed(() => {
    const activeLibraryId = this.activeLibraryId();
    if (!activeLibraryId) {
      return [];
    }
    const fieldCategoryOptions =
      this.libraryPropertyMap[activeLibraryId]?.fieldCategoryOptions ?? [];
    return fieldCategoryOptions.map((category) => ({
      ...category,
      children: [...category.children].sort((first, second) =>
        first.displayName.localeCompare(second.displayName, undefined, { sensitivity: 'base' }),
      ),
    }));
  });

  readonly activeFieldTypeOptions = computed(() => {
    const activeLibraryId = this.activeLibraryId();
    if (!activeLibraryId) {
      return [];
    }
    return this.libraryPropertyMap[activeLibraryId]?.fieldTypeOptions ?? [];
  });

  readonly classNamePath: string[] = ['className'];
  readonly fieldGroupClassNamePath: string[] = ['fieldGroupClassName'];
  readonly filterPaths: string[] = ['key', 'props.label', 'templateOptions.label'];
  readonly validationMessagesPath: string[] = ['validation', 'messages'];

  readonly fieldCategoryPresets = signal<FieldCategoryPreset[]>([]);

  constructor() {
    effect(() => {
      const activeLibraryId = this.activeLibraryId();
      if (!activeLibraryId) {
        this.fieldCategoryPresets.set([]);
        return;
      }

      this.updatePresetCategories(activeLibraryId);
    });

    this.libraryConfigs.forEach((config) => {
      const presetStorageKey = `${this.basePresetStorageKey}-${config.id}`;
      const fieldCategoryOptions = config.fieldCategoryOptions;
      const fieldTypeOptions = fieldCategoryOptions.flatMap((option) => option.children);
      const fieldTypeMap = fieldTypeOptions.reduce(
        (acc, option) => {
          acc[option.name] = {
            ...option,
            defaultConfig: {
              ...option.defaultConfig,
              type: option.name,
            },
          };
          return acc;
        },
        {} as Record<string, FieldTypeOption>,
      );
      this.libraryPropertyMap[config.id] = {
        presetStorageKey,
        fieldCategoryOptions,
        fieldTypeOptions,
        fieldTypeMap,
      };

      this.setupInitialPresets(config.id);
    });
  }

  getTypeOptions(libraryId: string): FieldTypeOption[] {
    const configProperties = this.libraryPropertyMap[libraryId];
    return configProperties?.fieldTypeOptions ?? [];
  }

  getTypeOption(type: string): FieldTypeOption | undefined {
    return this.activeFieldTypeMap()[type] as FieldTypeOption | undefined;
  }

  getDefaultField(type: string, configId: string): FormlyFieldConfig {
    const configProperties = this.libraryPropertyMap[configId];
    const { fieldTypeMap } = configProperties;

    return structuredClone(
      fieldTypeMap[type]?.defaultConfig ?? this.defaultTypeOption.defaultConfig,
    );
  }

  getProperties(field: FormlyFieldConfig): PropertyConfig[] {
    const activeLibraryId = this.activeLibraryId();
    if (!activeLibraryId) {
      return [];
    }

    const configProperties = this.libraryPropertyMap[activeLibraryId];
    const type = field.type as string;
    const wrappers = field.wrappers ?? [];
    const typeOption = this.getTypeOptionForProperties(type, configProperties);
    const wrapperOptions = typeOption.wrapperOptions ?? [];
    return [
      ...this.getFieldProperties(type as string, configProperties),
      ...(wrapperOptions.length
        ? [
            createWrappersProperty({
              label: 'Wrappers',
              key: 'wrappers',
              options: wrapperOptions.map(({ name, label }) => ({ label, value: name })),
              description: 'Wrappers applied to the field. The selected order is preserved.',
            }),
          ]
        : []),
      ...this.getWrapperProperties(wrappers as string[], typeOption),
    ];
  }

  getValidationConfig(field: FormlyFieldConfig): FieldValidationConfig | undefined {
    const activeLibraryId = this.activeLibraryId();
    if (!activeLibraryId) {
      return undefined;
    }

    const configProperties = this.libraryPropertyMap[activeLibraryId];
    const type = field.type as string;
    return this.getFieldValidationConfig(type, configProperties);
  }

  getFieldIcon(field: EditorField): string | undefined {
    const type = field.type as string;
    const typeOption = this.activeFieldTypeMap()[type];
    return typeOption?.materialSymbol;
  }

  isFieldEqual(a: EditorField, b: EditorField) {
    const aType = a.type;
    const bType = b.type;
    const aWrappers = a.wrappers;
    const bWrappers = b.wrappers;
    return aType === bType && isEqual(aWrappers, bWrappers);
  }

  savePreset(displayName: string, field: FormlyFieldConfig) {
    const activeLibraryId = this.activeLibraryId();
    if (!activeLibraryId) {
      throw new Error('No active configuration is set.');
    }

    const presetMap = this.getPresetMap(activeLibraryId);
    const type = (field.type as string) || '';
    const typePresets = presetMap[type] ?? [];
    typePresets.push({ id: uuidv4(), displayName, field, isRemovable: true });
    presetMap[type] = typePresets;
    this.storePresetMap(presetMap, activeLibraryId);
    this.updatePresetCategories(activeLibraryId);
  }

  protected getFieldProperties(
    type: string,
    configProperties: LibraryProperties,
  ): PropertyConfig[] {
    return this.getTypeOptionForProperties(type, configProperties).properties ?? [];
  }

  protected getFieldValidationConfig(
    type: string,
    configProperties: LibraryProperties,
  ): FieldValidationConfig | undefined {
    const { fieldTypeMap } = configProperties;
    return fieldTypeMap[type]?.validationConfig ?? this.defaultTypeOption.validationConfig;
  }

  protected getWrapperProperties(
    wrappers: string[],
    typeOption: FieldTypeOption,
  ): PropertyConfig[] {
    const wrapperOptionMap = Object.fromEntries(
      (typeOption.wrapperOptions ?? []).map((option) => [option.name, option]),
    );
    return wrappers.flatMap((wrapper) => {
      const wrapperOption = wrapperOptionMap[wrapper];
      const childProperties = (wrapperOption?.properties ?? []).filter(isGroupChildProperty);
      if (!childProperties.length) {
        return [];
      }

      return [
        createGroupProperty({
          key: `wrapper-${wrapperOption.name}`,
          label: `${wrapperOption.label} Wrapper Options`,
          childProperties,
          description: `${wrapperOption.label} wrapper options.`,
        }),
      ];
    });
  }

  protected getTypeOptionForProperties(
    type: string,
    configProperties: LibraryProperties,
  ): FieldTypeOption {
    return configProperties.fieldTypeMap[type] ?? this.defaultTypeOption;
  }

  protected setupInitialPresets(configId: string) {
    const configProperties = this.libraryPropertyMap[configId];
    const { presetStorageKey, fieldCategoryOptions } = configProperties;

    if (localStorage.getItem(presetStorageKey)) {
      return;
    }

    const presetMapEntries: [string, FieldTypePreset[]][] = fieldCategoryOptions.flatMap(
      (category) => {
        const presetsEntries: [string, FieldTypePreset[]][] = category.children
          .map((typeOption) => {
            const presetsEntry: [string, FieldTypePreset[]] = [
              typeOption.name,
              typeOption.initialPresets ?? [],
            ];
            return presetsEntry;
          })
          .filter(([, presets]) => presets.length);

        return presetsEntries;
      },
    );

    const presetMap = Object.fromEntries(presetMapEntries);
    this.storePresetMap(presetMap, configId);
  }

  protected updatePresetCategories(configId: string) {
    const customPresetsMap = this.getPresetMap(configId);

    const configProperties = this.libraryPropertyMap[configId];
    const { fieldCategoryOptions } = configProperties;

    this.fieldCategoryPresets.set(
      fieldCategoryOptions.map((category) => ({
        displayName: category.displayName,
        children: category.children
          .flatMap((typeOption) =>
            (customPresetsMap[typeOption.name] ?? []).map((preset) => ({ ...preset, typeOption })),
          )
          .sort((first, second) =>
            first.displayName.localeCompare(second.displayName, undefined, { sensitivity: 'base' }),
          ),
      })),
    );
  }

  protected getPresetMap(configId: string): Record<string, FieldTypePreset[]> {
    const configProperties = this.libraryPropertyMap[configId];
    const { presetStorageKey } = configProperties;
    return JSON.parse(localStorage.getItem(presetStorageKey) || '{}');
  }

  protected storePresetMap(presetMap: Record<string, FieldTypePreset[]>, configId: string) {
    const configProperties = this.libraryPropertyMap[configId];
    const { presetStorageKey } = configProperties;
    localStorage.setItem(presetStorageKey, JSON.stringify(presetMap));
  }

  getKey(field: EditorField): string {
    return (field['key'] as string) || '';
  }

  getKeyPath(fieldInfo: FieldInfo, fieldMap: Record<string, EditorField>): string {
    return fieldInfo.idPath
      .map((id) => fieldMap[id]['key'])
      .filter((key) => !!key)
      .join('.');
  }

  getChildIds(fieldInfo: FieldInfo): string[] {
    return fieldInfo.childIds;
  }
}

function isGroupChildProperty(property: PropertyConfig): property is GroupChildPropertyConfig {
  return (
    property.type === PropertyType.BOOLEAN ||
    property.type === PropertyType.INPUT ||
    property.type === PropertyType.SELECT
  );
}
