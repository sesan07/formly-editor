import { FormlyFieldConfig } from '@ngx-formly/core';
import { get, mergeWith, unset } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { EditorField, FieldInfo } from '../model/types';
import { FieldTypeOption } from '../config/types';
import { defaultTypeOption } from '../config/library';

export function generateFormId(): string {
  return `form-${uuidv4()}`;
}

export function generateFieldId(type: string | undefined): string {
  return `${type || 'generic'}-${uuidv4()}`;
}

function generateFieldKey(prefix?: string): string {
  return `${prefix ?? 'field'}_${Math.random().toString(36).substring(2, 8)}`;
}

export function clearFieldModelValue(
  fieldId: string,
  fieldMap: Record<string, EditorField>,
  model: Record<string, unknown>,
): void {
  const field = fieldMap[fieldId];
  if (!field) return;

  // Walk normalized field ancestry so cleanup does not depend on runtime array indexes.
  const fieldIds = field._info.idPath;
  const clearValue = (container: unknown, pathIndex: number): void => {
    const currentField = fieldMap[fieldIds[pathIndex]];
    if (!currentField) return;

    const key = currentField.key;
    const isTarget = pathIndex === fieldIds.length - 1;
    const hasKey = key !== undefined && key !== null;

    if (!hasKey) {
      // Groups without keys do not own a model property; continue through them.
      if (!isTarget && currentField._info.isFieldArray && Array.isArray(container)) {
        container.forEach((item) => clearValue(item, pathIndex + 1));
      } else if (!isTarget) {
        clearValue(container, pathIndex + 1);
      }
      return;
    }

    if (isTarget) {
      // Remove the replaced field value from its containing model object.
      if (container !== null && typeof container === 'object') {
        unset(container, key);
      }
      return;
    }

    const value = get(container, key);
    if (value === undefined && currentField._info.isParent && !currentField._info.isFieldArray) {
      // Formly flattens keyed group templates inside field arrays into each array item.
      clearValue(container, pathIndex + 1);
      return;
    }

    if (currentField._info.isFieldArray) {
      // Apply the remaining path to every item in this repeater.
      if (Array.isArray(value)) {
        value.forEach((item) => clearValue(item, pathIndex + 1));
      }
      return;
    }

    clearValue(value, pathIndex + 1);
  };

  clearValue(model, 0);
}

/**
 * Converts a FormlyFieldConfig to an IEditorFormlyField, populating _info and generating ids.
 */
export function convertField(
  sourceField: FormlyFieldConfig,
  fieldId: string,
  formId: string,
  parentIdPath: string[] = [],
  fieldMap: Record<string, EditorField>,
  typeOptions: FieldTypeOption[],
  getDefaultField: (type: string) => FormlyFieldConfig,
): EditorField {
  // Special case to specify 'formly-group' type
  if (!sourceField.type && sourceField.fieldGroup) {
    sourceField = {
      type: 'formly-group',
      ...sourceField,
    };
  }

  // Merge with default properties
  const typeOption: FieldTypeOption =
    typeOptions.find((option) => option.name === sourceField.type) ?? defaultTypeOption;
  const baseField: FormlyFieldConfig = getDefaultField(sourceField.type as string);
  mergeWith(baseField, sourceField, (_defaultValue, sourceValue) => {
    if (Array.isArray(sourceValue)) {
      return structuredClone(sourceValue);
    }

    return undefined;
  });

  const idPath = [...parentIdPath, fieldId];
  const isParent = typeOption.isParent;
  const isFieldArray = typeOption.isFieldArray;

  // Recursively convert children
  let childIds: string[] = [];
  if (isFieldArray && baseField.fieldArray) {
    const fieldArray = baseField.fieldArray as FormlyFieldConfig;
    const childField = convertField(
      fieldArray,
      generateFieldId(fieldArray.type as string),
      formId,
      idPath,
      fieldMap,
      typeOptions,
      getDefaultField,
    );
    childIds = [childField._info.id];
  } else if (Array.isArray(baseField.fieldGroup)) {
    childIds = baseField.fieldGroup
      .map((f) =>
        convertField(
          f,
          generateFieldId(f.type as string),
          formId,
          idPath,
          fieldMap,
          typeOptions,
          getDefaultField,
        ),
      )
      .map((child) => child._info.id);
  }

  // Editor information
  const _info: FieldInfo = {
    name: typeOption.displayName,
    id: fieldId,
    formId,
    idPath,
    childIds,
    isParent,
    isFieldArray,
  };

  // Create field
  const editorField: EditorField = {
    _info,
    key:
      baseField.key ||
      (typeOption.disableKeyGeneration
        ? undefined
        : generateFieldKey(typeOption.keyGenerationPrefix)),
    ...baseField,
    fieldGroup: undefined,
    fieldArray: undefined,
  };

  fieldMap[fieldId] = editorField;

  return editorField;
}
