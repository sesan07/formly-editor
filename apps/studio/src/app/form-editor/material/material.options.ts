import {
  createArrayProperty,
  createBooleanProperty,
  createCustomValidationProperty,
  createDateProperty,
  createExpressionsProperty,
  createInputProperty,
  createObjectProperty,
  createSelectProperty,
  FieldTypeOption,
  FieldWrapperOption,
} from '@formly-editor/core';

export const labelProp = createInputProperty({
  label: 'Label',
  key: 'props.label',
  dataType: 'text',
  description: 'The visible field label displayed to users.',
});

export const descriptionProp = createInputProperty({
  label: 'Description',
  key: 'props.description',
  dataType: 'text',
  description: 'Helper text displayed below the field to guide users.',
});

export const keyProp = createInputProperty({
  label: 'Key',
  key: 'key',
  dataType: 'text',
  description: `Unique key used to bind the field's value in the form model.`,
});

export const hideProp = createBooleanProperty({
  label: 'Hide',
  key: 'hide',
  description: 'If true, the field is not rendered in the form.',
  colSpan: 1,
});

export const expressionsProp = createExpressionsProperty({
  label: 'Expressions',
  key: 'expressions',
  description: 'Expressions to dynamically change field and model properties.',
});

export const requiredProp = createBooleanProperty({
  label: 'Required',
  key: 'props.required',
  description: 'Mark this field as required for form validation.',
});

export const showValidationProp = createBooleanProperty({
  label: 'Show Validation',
  key: 'validation.show',
  description: 'Toggle whether validation messages are always displayed for this field.',
  colSpan: 1,
});

const formFieldWrapperConfig: FieldWrapperOption = {
  name: 'form-field',
  label: 'Form Field',
  properties: [
    createSelectProperty({
      label: 'Float Label',
      key: 'props.floatLabel',
      options: [
        { label: 'Always', value: 'always' },
        { label: 'Auto', value: 'auto' },
      ],
      description: 'Controls whether and how the label floats above the input.',
    }),
    createBooleanProperty({
      label: 'Hide Label',
      key: 'props.hideLabel',
      description: 'Hide the label visually for this wrapper.',
    }),
    createBooleanProperty({
      label: 'Hide Required Marker',
      key: 'props.hideRequiredMarker',
      description: 'Hide the required indicator (asterisk) for this wrapper.',
    }),
  ],
};

export const formFieldWrapperOptions = [formFieldWrapperConfig];

export const groupTypeConfig: FieldTypeOption = {
  displayName: 'Group',
  name: 'formly-group',
  materialSymbol: 'ad_group',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [keyProp, hideProp, expressionsProp],
};

const placeholderProp = createInputProperty({
  label: 'Placeholder',
  key: 'props.placeholder',
  dataType: 'text',
  description: 'Placeholder text shown inside the input when empty.',
});
const readonlyProp = createBooleanProperty({
  label: 'Readonly',
  key: 'props.readonly',
  description: 'When true, the field is displayed but cannot be edited.',
  colSpan: 1,
});
const minLengthProp = createInputProperty({
  label: 'Min Length',
  key: 'props.minLength',
  dataType: 'number',
  description: 'Minimum number of characters allowed for the field value.',
});
const maxLengthProp = createInputProperty({
  label: 'Max Length',
  key: 'props.maxLength',
  dataType: 'number',
  description: 'Maximum number of characters allowed for the field value.',
});
const patternProp = createInputProperty({
  label: 'Pattern',
  key: 'props.pattern',
  dataType: 'text',
  description: 'Regular expression pattern for input validation.',
});
const customValidationProp = createCustomValidationProperty({
  label: 'Custom Validation',
  key: 'validators.validation',
  validationOptions: [{ label: 'IP Address', value: 'ip' }],
  description: `Configure validators that aren't built-in.`,
});
const asyncValidationProp = createCustomValidationProperty({
  label: 'Async Validation',
  key: 'asyncValidators.validation',
  validationOptions: [{ label: 'IP Address', value: 'ipAsync' }],
  description: 'Configure asynchronous validators registered by the active library.',
});
const defaultValidationConfig = {
  rules: [{ name: 'required', property: requiredProp }],
  displayProperties: [showValidationProp],
};

export const inputTypeConfig: FieldTypeOption = {
  displayName: 'Input',
  name: 'input',
  materialSymbol: 'text_fields',
  keyGenerationPrefix: 'inp',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
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
        { label: 'URL', value: 'url' },
        { label: 'Number', value: 'number' },
      ],
      description: 'The HTML input type to use for this field (affects keyboard and validation).',
    }),
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    ...defaultValidationConfig,
    rules: [
      ...defaultValidationConfig.rules,
      { name: 'minLength', property: minLengthProp },
      { name: 'maxLength', property: maxLengthProp },
      { name: 'pattern', property: patternProp },
    ],
    customValidators: customValidationProp,
    asyncValidators: asyncValidationProp,
  },
};

export const textTypeConfig: FieldTypeOption = {
  displayName: 'Text',
  name: 'string',
  materialSymbol: 'match_case',
  keyGenerationPrefix: 'txt',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    ...defaultValidationConfig,
    rules: [
      ...defaultValidationConfig.rules,
      { name: 'minLength', property: minLengthProp },
      { name: 'maxLength', property: maxLengthProp },
      { name: 'pattern', property: patternProp },
    ],
  },
  initialPresets: [
    {
      id: 'email',
      displayName: 'Email',
      field: {
        type: 'input',
        props: {
          label: 'Email',
          type: 'email',
        },
      },
    },
  ],
};

export const numberTypeConfig: FieldTypeOption = {
  displayName: 'Number',
  name: 'number',
  materialSymbol: 'numbers',
  keyGenerationPrefix: 'num',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'number',
      description: 'Default numeric value populated into the field when the form loads.',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    ...defaultValidationConfig,
    rules: [
      ...defaultValidationConfig.rules,
      {
        name: 'min',
        property: createInputProperty({
          label: 'Min',
          key: 'props.min',
          dataType: 'number',
          description: 'Minimum numeric value allowed for this field.',
        }),
      },
      {
        name: 'max',
        property: createInputProperty({
          label: 'Max',
          key: 'props.max',
          dataType: 'number',
          description: 'Maximum numeric value allowed for this field.',
        }),
      },
    ],
  },
};

export const textareaTypeConfig: FieldTypeOption = {
  displayName: 'Textarea',
  name: 'textarea',
  materialSymbol: 'subject',
  keyGenerationPrefix: 'txt',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    createInputProperty({
      label: 'Rows',
      key: 'props.rows',
      dataType: 'number',
      description: 'Number of visible rows for the textarea.',
    }),
    createBooleanProperty({
      label: 'Auto Size',
      key: 'props.autosize',
      description: 'Automatically grow or shrink textarea height based on content.',
    }),
    createInputProperty({
      label: 'Auto Size Min Rows',
      key: 'props.autosizeMinRows',
      dataType: 'number',
      description: 'Minimum number of rows when autosize is enabled.',
      colSpan: 1,
    }),
    createInputProperty({
      label: 'Auto Size Max Rows',
      key: 'props.autosizeMaxRows',
      dataType: 'number',
      description: 'Maximum number of rows when autosize is enabled.',
      colSpan: 1,
    }),
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    ...defaultValidationConfig,
    rules: [
      ...defaultValidationConfig.rules,
      { name: 'minLength', property: minLengthProp },
      { name: 'maxLength', property: maxLengthProp },
    ],
  },
};

export const datepickerTypeConfig: FieldTypeOption = {
  displayName: 'Date',
  name: 'datepicker',
  materialSymbol: 'event',
  keyGenerationPrefix: 'dtp',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createDateProperty({
      label: 'Default Value',
      key: 'defaultValue',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    createSelectProperty({
      label: 'Start View',
      key: 'props.datepickerOptions.startView',
      options: [
        { label: 'Month', value: 'month' },
        { label: 'Year', value: 'year' },
        { label: 'Multi-Year', value: 'multi-year' },
      ],
      description: 'Initial calendar view when the datepicker is opened.',
    }),
    createSelectProperty({
      label: 'Toggle Position',
      key: 'props.datepickerOptions.datepickerTogglePosition',
      options: [
        { label: 'Prefix', value: 'prefix' },
        { label: 'Suffix', value: 'suffix' },
      ],
      description: 'Position of the datepicker toggle relative to the input.',
    }),
    createBooleanProperty({
      label: 'Touch UI',
      key: 'props.datepickerOptions.touchUi',
      description: 'Use touch-friendly UI for the datepicker (larger targets).',
    }),
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const checkboxTypeConfig: FieldTypeOption = {
  displayName: 'Checkbox',
  name: 'checkbox',
  materialSymbol: 'check_box',
  keyGenerationPrefix: 'chk',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createBooleanProperty({
      label: 'Default Value',
      key: 'defaultValue',
      description: 'Default boolean value for the checkbox when the form loads.',
    }),
    labelProp,
    descriptionProp,
    createSelectProperty({
      label: 'Label Position',
      key: 'props.labelPosition',
      options: [
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
      ],
      description: 'Position of the label relative to the checkbox control.',
    }),
    createBooleanProperty({
      label: 'Indeterminate',
      key: 'props.indeterminate',
      description: 'Render the checkbox in an indeterminate (mixed) visual state.',
    }),
    hideProp,
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const radioTypeConfig: FieldTypeOption = {
  displayName: 'Radio',
  name: 'radio',
  materialSymbol: 'radio_button_checked',
  keyGenerationPrefix: 'rad',
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
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    descriptionProp,
    createSelectProperty({
      label: 'Label Position',
      key: 'props.labelPosition',
      options: [
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
      ],
      description: 'Position of the label relative to the control.',
    }),
    hideProp,
    createArrayProperty({
      label: 'Options',
      key: 'props.options',
      canAdd: true,
      useTableDialog: true,
      description: 'A list of options used to populate the field choices.',
      childProperty: createObjectProperty({
        isRemovable: true,
        childProperties: [
          createInputProperty({
            label: 'Label',
            key: 'label',
            dataType: 'text',
            description: 'Text displayed for this option.',
          }),
          createInputProperty({
            label: 'Value',
            key: 'value',
            dataType: 'text',
            description: 'Value stored in the model when this option is selected.',
            colSpan: 1,
          }),
          createBooleanProperty({
            label: 'Disabled',
            key: 'disabled',
            description: 'If true, this option is disabled and cannot be selected.',
            colSpan: 1,
          }),
        ],
      }),
    }),
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const multicheckboxTypeConfig: FieldTypeOption = {
  displayName: 'Multi Checkbox',
  name: 'multicheckbox',
  materialSymbol: 'check_box',
  keyGenerationPrefix: 'mcb',
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
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    descriptionProp,
    createSelectProperty({
      label: 'Label Position',
      key: 'props.labelPosition',
      options: [
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
      ],
    }),
    hideProp,
    createArrayProperty({
      label: 'Options',
      key: 'props.options',
      canAdd: true,
      useTableDialog: true,
      description: 'A list of options used to populate the field choices.',
      childProperty: createObjectProperty({
        isRemovable: true,
        childProperties: [
          createInputProperty({
            label: 'Label',
            key: 'label',
            dataType: 'text',
            description: 'Text displayed for this option.',
          }),
          createInputProperty({
            label: 'Value',
            key: 'value',
            dataType: 'text',
            description: 'Value stored in the model when this option is selected.',
            colSpan: 1,
          }),
          createBooleanProperty({
            label: 'Disabled',
            key: 'disabled',
            description: 'If true, this option is disabled and cannot be selected.',
            colSpan: 1,
          }),
        ],
      }),
    }),
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const toggleTypeConfig: FieldTypeOption = {
  displayName: 'Toggle',
  name: 'toggle',
  materialSymbol: 'toggle_on',
  keyGenerationPrefix: 'tgl',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createBooleanProperty({
      label: 'Default Value',
      key: 'defaultValue',
      description: 'Default boolean value for the toggle when the form loads.',
    }),
    labelProp,
    descriptionProp,
    createSelectProperty({
      label: 'Label Position',
      key: 'props.labelPosition',
      options: [
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
      ],
      description: 'Position of the label relative to the toggle control.',
    }),
    hideProp,
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const selectTypeConfig: FieldTypeOption = {
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
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    createBooleanProperty({
      label: 'Multiple Selections',
      key: 'props.multiple',
      description: 'Allow selecting multiple options from the list.',
    }),
    createInputProperty({
      label: 'Select All Options Label',
      key: 'props.selectAllOption',
      dataType: 'text',
      description: 'Label used for the "select all" option when multiple selection is enabled.',
    }),
    hideProp,
    createArrayProperty({
      label: 'Options',
      key: 'props.options',
      canAdd: true,
      useTableDialog: true,
      description: 'A list of options used to populate the control choices.',
      childProperty: createObjectProperty({
        isRemovable: true,
        childProperties: [
          createInputProperty({
            label: 'Label',
            key: 'label',
            dataType: 'text',
            description: 'Text displayed for this option.',
            isRequired: true,
          }),
          createInputProperty({
            label: 'Value',
            key: 'value',
            dataType: 'text',
            description: 'Value stored in the model when this option is selected.',
            isRequired: true,
            colSpan: 1,
          }),
          createBooleanProperty({
            label: 'Disabled',
            key: 'disabled',
            description: 'If true, this option is disabled and cannot be selected.',
            colSpan: 1,
          }),
        ],
      }),
    }),
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const materialBasicFieldTypeOptions = [
  inputTypeConfig,
  textTypeConfig,
  numberTypeConfig,
  textareaTypeConfig,
  datepickerTypeConfig,
  multicheckboxTypeConfig,
  toggleTypeConfig,
  checkboxTypeConfig,
  radioTypeConfig,
  selectTypeConfig,
];

export const materialContainerTypeOptions = [groupTypeConfig];

export const materialFieldCategoryOptions = [
  {
    displayName: 'Form Controls',
    children: materialBasicFieldTypeOptions,
  },
  {
    displayName: 'Containers',
    children: materialContainerTypeOptions,
  },
];
