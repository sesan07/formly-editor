import {
  createArrayProperty,
  createBooleanProperty,
  createInputProperty,
  createMarkdownProperty,
  createObjectProperty,
  createSelectProperty,
  FieldTypeOption,
  FieldWrapperOption,
} from '@formly-editor/core';
import {
  descriptionProp,
  expressionsProp,
  formFieldWrapperOptions,
  groupTypeConfig,
  hideProp,
  keyProp,
  labelProp,
  materialBasicFieldTypeOptions,
  requiredProp,
  showValidationProp,
} from '../material/material.options';

const cardTitleProp = createInputProperty({
  label: 'Card Title',
  key: 'props.cardTitle',
  dataType: 'text',
  description: 'Title text displayed at the top of the card.',
});
const cardSubtitleProp = createInputProperty({
  label: 'Card Subtitle',
  key: 'props.cardSubtitle',
  dataType: 'text',
  description: 'Secondary text displayed below the card title.',
});

const cardWrapperConfig: FieldWrapperOption = {
  name: 'card',
  label: 'Card',
  properties: [cardTitleProp, cardSubtitleProp],
};

const cardWrapperOptions = [cardWrapperConfig];

const cardTypeConfig: FieldTypeOption = {
  displayName: 'Card',
  name: 'card',
  materialSymbol: 'credit_card',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [keyProp, cardTitleProp, cardSubtitleProp, hideProp, expressionsProp],
};

const repeatTypeConfig: FieldTypeOption = {
  displayName: 'Repeater',
  name: 'repeating-section',
  materialSymbol: 'repeat',
  keyGenerationPrefix: 'rep',
  isParent: true,
  isFieldArray: true,
  defaultConfig: {
    fieldArray: {},
  },
  wrapperOptions: cardWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Add Button Text',
      key: 'props.addText',
      dataType: 'text',
      description: 'Text displayed on the button that adds a new repeat section.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const stepTypeConfig: FieldTypeOption = {
  displayName: 'Step',
  name: 'step',
  materialSymbol: 'step',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [
    keyProp,
    labelProp,
    createBooleanProperty({
      label: 'Optional',
      key: 'props.optional',
      description: 'Allow users to advance without completing this step.',
    }),
    createBooleanProperty({
      label: 'Disable Edit',
      key: 'props.disableEdit',
      description: 'Prevent users from returning to this step after completing it.',
    }),
    createInputProperty({
      label: 'Previous Button Label',
      key: 'props.previousButtonLabel',
      dataType: 'text',
      description: 'Text displayed on the button that returns to the previous step.',
    }),
    createInputProperty({
      label: 'Next Button Label',
      key: 'props.nextButtonLabel',
      dataType: 'text',
      description: 'Text displayed on the button that advances to the next step.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const stepperTypeConfig: FieldTypeOption = {
  displayName: 'Stepper',
  name: 'stepper',
  materialSymbol: 'view_timeline',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [
    keyProp,
    createBooleanProperty({
      label: 'Linear',
      key: 'props.linear',
      description: 'Require each non-optional step to be valid before advancing.',
      clearOnFalse: false,
    }),
    createSelectProperty({
      label: 'Orientation',
      key: 'props.orientation',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
      description: 'Direction used to lay out the step headers and content.',
    }),
    createInputProperty({
      label: 'Accessible Label',
      key: 'props.ariaLabel',
      dataType: 'text',
      description: 'Accessible name announced for the stepper.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const tabTypeConfig: FieldTypeOption = {
  displayName: 'Tab',
  name: 'tab',
  materialSymbol: 'tab',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [
    keyProp,
    labelProp,
    createBooleanProperty({
      label: 'Disabled',
      key: 'props.disabled',
      description: 'Prevent users from selecting this tab.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const tabsTypeConfig: FieldTypeOption = {
  displayName: 'Tabs',
  name: 'tabs',
  materialSymbol: 'tab_group',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [
    keyProp,
    createBooleanProperty({
      label: 'Dynamic Height',
      key: 'props.dynamicHeight',
      description: 'Grow the tab group to match the active tab content height.',
    }),
    createSelectProperty({
      label: 'Header Position',
      key: 'props.headerPosition',
      options: [
        { label: 'Above', value: 'above' },
        { label: 'Below', value: 'below' },
      ],
      description: 'Position of the tab headers relative to the tab content.',
    }),
    createSelectProperty({
      label: 'Tab Alignment',
      key: 'props.alignTabs',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
      ],
      description: 'Alignment of the tab labels within the header.',
    }),
    createBooleanProperty({
      label: 'Disable Stretch Tabs',
      key: 'props.disableStretchTabs',
      description: 'Disable stretching tab labels to fill the available header width.',
      clearOnFalse: false,
    }),
    createBooleanProperty({
      label: 'Fit Ink Bar to Content',
      key: 'props.fitInkBarToContent',
      description: 'Fit the active indicator to the tab label content.',
    }),
    createBooleanProperty({
      label: 'Preserve Content',
      key: 'props.preserveContent',
      description: 'Keep inactive tab content mounted after it has been visited.',
      clearOnFalse: false,
    }),
    hideProp,
    expressionsProp,
  ],
};

const optionsProperty = createArrayProperty({
  label: 'Options',
  key: 'props.options',
  canAdd: true,
  useTableDialog: true,
  description: 'A list of buttons used to populate the control choices.',
  childProperty: createObjectProperty({
    isRemovable: true,
    childProperties: [
      createInputProperty({
        label: 'Label',
        key: 'label',
        dataType: 'text',
        description: 'Text displayed for this button.',
        isRequired: true,
      }),
      createInputProperty({
        label: 'Value',
        key: 'value',
        dataType: 'text',
        description: 'String value stored in the model when this button is selected.',
        isRequired: true,
        colSpan: 1,
      }),
      createBooleanProperty({
        label: 'Disabled',
        key: 'disabled',
        description: 'If true, this button cannot be selected.',
        colSpan: 1,
      }),
    ],
  }),
});

export const buttonGroupTypeConfig: FieldTypeOption = {
  displayName: 'Button Group',
  name: 'button-group',
  materialSymbol: 'view_week',
  keyGenerationPrefix: 'btn',
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
      description: 'String value selected when the form loads.',
    }),
    labelProp,
    descriptionProp,
    hideProp,
    optionsProperty,
    expressionsProp,
  ],
  validationConfig: {
    rules: [{ name: 'required', property: requiredProp }],
    displayProperties: [showValidationProp],
  },
};

export const postalCodeTypeConfig: FieldTypeOption = {
  displayName: 'Postal Code',
  name: 'postal-code',
  materialSymbol: 'location_on',
  keyGenerationPrefix: 'postal',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default postal code populated when the form loads.',
    }),
    labelProp,
    createInputProperty({
      label: 'Placeholder',
      key: 'props.placeholder',
      dataType: 'text',
      description: 'Example postal code shown while the field is empty.',
    }),
    descriptionProp,
    createInputProperty({
      label: 'Mask',
      key: 'props.mask',
      dataType: 'text',
      description: 'Fixed input mask using 0 for digits, A for letters, and * for either.',
    }),
    createSelectProperty({
      label: 'Input Mode',
      key: 'props.inputMode',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Numeric', value: 'numeric' },
      ],
      description: 'Virtual keyboard suggested to browsers on supported devices.',
    }),
    createBooleanProperty({
      label: 'Auto-capitalize',
      key: 'props.autoCapitalize',
      description: 'Uppercase entered letters and request uppercase virtual-keyboard input.',
      clearOnFalse: false,
    }),
    createBooleanProperty({
      label: 'Store Raw Value',
      key: 'props.storeRawValue',
      description: 'Store only letters and digits while displaying the formatted postal code.',
    }),
    createSelectProperty({
      label: 'Autocomplete Context',
      key: 'props.autocompleteContext',
      options: [
        { label: 'Unscoped', value: 'unscoped' },
        { label: 'Shipping', value: 'shipping' },
        { label: 'Billing', value: 'billing' },
      ],
      description: 'Address context used by browser postal-code autofill.',
    }),
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    rules: [
      { name: 'required', property: requiredProp },
      {
        name: 'postalCodePattern',
        property: createInputProperty({
          label: 'Postal Code Pattern',
          key: 'props.postalCodePattern',
          dataType: 'text',
          description: 'Regular expression matched against the formatted uppercase value.',
        }),
      },
    ],
    displayProperties: [showValidationProp],
  },
  initialPresets: [
    {
      id: 'us-zip-code',
      displayName: 'US ZIP Code',
      isRemovable: false,
      field: {
        type: 'postal-code',
        props: {
          label: 'ZIP Code',
          mask: '00000',
          inputMode: 'numeric',
          autoCapitalize: false,
          autocompleteContext: 'unscoped',
          postalCodePattern: '^[0-9]{5}$',
        },
      },
    },
    {
      id: 'canada-postal-code',
      displayName: 'Canada Postal Code',
      isRemovable: false,
      field: {
        type: 'postal-code',
        props: {
          label: 'Postal Code',
          mask: 'A0A 0A0',
          inputMode: 'text',
          autoCapitalize: true,
          autocompleteContext: 'unscoped',
          postalCodePattern:
            '^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] [0-9][ABCEGHJ-NPRSTV-Z][0-9]$',
        },
      },
    },
  ],
};

export const markdownTypeConfig: FieldTypeOption = {
  displayName: 'Markdown',
  name: 'markdown',
  materialSymbol: 'markdown',
  disableKeyGeneration: true,
  defaultConfig: {
    props: {
      text: '## Markdown\n\nWrite formatted content here.',
    },
  },
  properties: [
    createMarkdownProperty({
      label: 'Text',
      key: 'props.text',
      description: 'Markdown content rendered by the field.',
      placeholder: 'Write Markdown content...',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const dividerTypeConfig: FieldTypeOption = {
  displayName: 'Divider',
  name: 'divider',
  materialSymbol: 'horizontal_rule',
  disableKeyGeneration: true,
  defaultConfig: {
    props: {},
  },
  properties: [
    createBooleanProperty({
      label: 'Vertical',
      key: 'props.vertical',
      description: 'Render the divider vertically instead of horizontally.',
    }),
    createBooleanProperty({
      label: 'Inset',
      key: 'props.inset',
      description: 'Inset the divider from the content edges.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const studioMaterialFieldCategoryOptions = [
  {
    displayName: 'Display',
    children: [markdownTypeConfig, dividerTypeConfig],
  },
  {
    displayName: 'Form Controls',
    children: [...materialBasicFieldTypeOptions, buttonGroupTypeConfig, postalCodeTypeConfig],
  },
  {
    displayName: 'Containers',
    children: [
      { ...groupTypeConfig, wrapperOptions: cardWrapperOptions },
      cardTypeConfig,
      repeatTypeConfig,
      tabTypeConfig,
      tabsTypeConfig,
      stepTypeConfig,
      stepperTypeConfig,
    ],
  },
];
