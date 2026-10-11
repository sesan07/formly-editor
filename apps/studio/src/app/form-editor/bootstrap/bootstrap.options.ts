import {
  createArrayProperty,
  createBooleanProperty,
  createExpressionsProperty,
  createInputProperty,
  createObjectProperty,
  createSelectProperty,
  FieldTypeOption,
  FieldWrapperOption,
} from '@formly-editor/core';

const keyProp = createInputProperty({
  label: 'Key',
  key: 'key',
  dataType: 'text',
  description: `Unique key used to bind the field's value in the form model.`,
});
const labelProp = createInputProperty({
  label: 'Label',
  key: 'props.label',
  dataType: 'text',
  description: 'The visible field label displayed to users.',
});
const placeholderProp = createInputProperty({
  label: 'Placeholder',
  key: 'props.placeholder',
  dataType: 'text',
  description: 'Placeholder text shown inside the input when empty.',
});
const descriptionProp = createInputProperty({
  label: 'Description',
  key: 'props.description',
  dataType: 'text',
  description: 'Helper text displayed below the field.',
});
const requiredProp = createBooleanProperty({
  label: 'Required',
  key: 'props.required',
  description: 'Mark this field as required for validation.',
  colSpan: 1,
});
const showValidationProp = createBooleanProperty({
  label: 'Show Validation',
  key: 'validation.show',
  description: 'Toggle whether validation messages are always displayed for this field.',
  colSpan: 1,
});
const hideProp = createBooleanProperty({
  label: 'Hide',
  key: 'hide',
  description: 'If true, the field is not rendered.',
});
const expressionsProp = createExpressionsProperty({
  label: 'Expressions',
  key: 'expressions',
  description: 'Expressions that dynamically change field and model properties.',
});

const inputProperties = [
  keyProp,
  labelProp,
  placeholderProp,
  descriptionProp,
  createSelectProperty({
    label: 'Type',
    key: 'props.type',
    options: [
      { label: 'Text', value: 'text' },
      { label: 'Email', value: 'email' },
      { label: 'Password', value: 'password' },
      { label: 'Telephone', value: 'tel' },
    ],
    description: 'HTML input type used by the field.',
  }),
  hideProp,
  expressionsProp,
];

const defaultValidationConfig = {
  rules: [{ name: 'required', property: requiredProp }],
  displayProperties: [showValidationProp],
};

const optionsProperty = createArrayProperty({
  label: 'Options',
  key: 'props.options',
  canAdd: true,
  useTableDialog: true,
  description: 'Choices displayed by select, radio, and checkbox fields.',
  childProperty: createObjectProperty({
    isRemovable: true,
    childProperties: [
      createInputProperty({ label: 'Label', key: 'label', dataType: 'text', isRequired: true }),
      createInputProperty({ label: 'Value', key: 'value', dataType: 'text', isRequired: true }),
      createBooleanProperty({ label: 'Disabled', key: 'disabled' }),
    ],
  }),
});

const formFieldWrapperConfig: FieldWrapperOption = {
  name: 'form-field',
  label: 'Form Field',
  properties: [
    createBooleanProperty({ label: 'Hide Label', key: 'props.hideLabel' }),
    createBooleanProperty({ label: 'Hide Required Marker', key: 'props.hideRequiredMarker' }),
  ],
};

const formFieldWrapperOptions = [formFieldWrapperConfig];

const inputTypeConfig: FieldTypeOption = {
  displayName: 'Input',
  name: 'input',
  materialSymbol: 'text_fields',
  keyGenerationPrefix: 'inp',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: inputProperties,
  validationConfig: defaultValidationConfig,
};

const numberTypeConfig: FieldTypeOption = {
  displayName: 'Number',
  name: 'number',
  materialSymbol: 'numbers',
  keyGenerationPrefix: 'num',
  defaultConfig: { props: { type: 'number' } },
  wrapperOptions: formFieldWrapperOptions,
  properties: [keyProp, labelProp, placeholderProp, descriptionProp, hideProp, expressionsProp],
  validationConfig: {
    ...defaultValidationConfig,
    rules: [
      {
        name: 'min',
        property: createInputProperty({
          label: 'Min',
          key: 'props.min',
          dataType: 'number',
          colSpan: 1,
        }),
      },
      {
        name: 'max',
        property: createInputProperty({
          label: 'Max',
          key: 'props.max',
          dataType: 'number',
          colSpan: 1,
        }),
      },
      ...defaultValidationConfig.rules,
    ],
  },
};

const textareaTypeConfig: FieldTypeOption = {
  displayName: 'Textarea',
  name: 'textarea',
  materialSymbol: 'subject',
  keyGenerationPrefix: 'txt',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    labelProp,
    placeholderProp,
    descriptionProp,
    createInputProperty({ label: 'Rows', key: 'props.rows', dataType: 'number' }),
    hideProp,
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

const selectTypeConfig: FieldTypeOption = {
  displayName: 'Select',
  name: 'select',
  materialSymbol: 'list',
  keyGenerationPrefix: 'sel',
  defaultConfig: {
    props: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    },
  },
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    labelProp,
    placeholderProp,
    descriptionProp,
    createBooleanProperty({ label: 'Multiple Selections', key: 'props.multiple' }),
    optionsProperty,
    hideProp,
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

const radioTypeConfig: FieldTypeOption = {
  displayName: 'Radio',
  name: 'radio',
  materialSymbol: 'radio_button_checked',
  keyGenerationPrefix: 'rdo',
  defaultConfig: {
    props: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    },
  },
  wrapperOptions: formFieldWrapperOptions,
  properties: [keyProp, labelProp, descriptionProp, optionsProperty, hideProp, expressionsProp],
  validationConfig: defaultValidationConfig,
};

const multicheckboxTypeConfig: FieldTypeOption = {
  displayName: 'Multi Checkbox',
  name: 'multicheckbox',
  materialSymbol: 'check_box',
  keyGenerationPrefix: 'mch',
  defaultConfig: {
    props: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    },
  },
  wrapperOptions: formFieldWrapperOptions,
  properties: [keyProp, labelProp, descriptionProp, optionsProperty, hideProp, expressionsProp],
  validationConfig: defaultValidationConfig,
};

const checkboxTypeConfig: FieldTypeOption = {
  displayName: 'Checkbox',
  name: 'checkbox',
  materialSymbol: 'check_box_outline_blank',
  keyGenerationPrefix: 'chk',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [keyProp, labelProp, descriptionProp, hideProp, expressionsProp],
  validationConfig: defaultValidationConfig,
};

const groupTypeConfig: FieldTypeOption = {
  displayName: 'Group',
  name: 'formly-group',
  materialSymbol: 'ad_group',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: { fieldGroup: [] },
  properties: [keyProp, hideProp, expressionsProp],
};

export const bootstrapFieldCategoryOptions = [
  {
    displayName: 'Form Controls',
    children: [
      inputTypeConfig,
      numberTypeConfig,
      textareaTypeConfig,
      selectTypeConfig,
      radioTypeConfig,
      multicheckboxTypeConfig,
      checkboxTypeConfig,
    ],
  },
  {
    displayName: 'Containers',
    children: [groupTypeConfig],
  },
];
