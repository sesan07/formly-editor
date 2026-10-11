import { DefaultForm } from '@formly-editor/core';
import { FormlyFieldConfig } from '@ngx-formly/core';

const studioMaterialShowcaseFields: FormlyFieldConfig[] = [
  {
    type: 'formly-group',
    fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    fieldGroup: [
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Input', cardSubtitle: 'Single-line text entry.' },
        fieldGroup: [
          {
            type: 'input',
            key: 'inputValue',
            props: { label: 'Input', placeholder: 'Text value' },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Text', cardSubtitle: 'Plain text value.' },
        fieldGroup: [
          {
            type: 'string',
            key: 'stringValue',
            props: { label: 'String', placeholder: 'String value' },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Number', cardSubtitle: 'Numeric value with bounds.' },
        fieldGroup: [
          {
            type: 'number',
            key: 'numberValue',
            props: { label: 'Number', min: 0, max: 100 },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Textarea', cardSubtitle: 'Multi-line text entry.' },
        fieldGroup: [
          {
            type: 'textarea',
            key: 'textareaValue',
            props: { label: 'Textarea', rows: 2 },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Date', cardSubtitle: 'Calendar date selection.' },
        fieldGroup: [
          {
            type: 'datepicker',
            key: 'dateValue',
            props: { label: 'Datepicker' },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Select', cardSubtitle: 'Single choice from options.' },
        fieldGroup: [
          {
            type: 'select',
            key: 'selectValue',
            props: {
              label: 'Select',
              options: [
                { value: 'one', label: 'Option one' },
                { value: 'two', label: 'Option two' },
              ],
            },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Radio', cardSubtitle: 'Visible single-choice options.' },
        fieldGroup: [
          {
            type: 'radio',
            key: 'radioValue',
            props: {
              label: 'Radio',
              options: [
                { value: 'one', label: 'Option one' },
                { value: 'two', label: 'Option two' },
              ],
            },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Multi Checkbox', cardSubtitle: 'Multiple independent choices.' },
        fieldGroup: [
          {
            type: 'multicheckbox',
            key: 'multicheckboxValue',
            props: {
              label: 'Multicheckbox',
              options: [
                { value: 'one', label: 'Option one' },
                { value: 'two', label: 'Option two' },
              ],
            },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Checkbox', cardSubtitle: 'Single boolean value.' },
        fieldGroup: [
          {
            type: 'checkbox',
            key: 'checkboxValue',
            props: { label: 'Checkbox' },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Toggle', cardSubtitle: 'Compact boolean switch.' },
        fieldGroup: [
          {
            type: 'toggle',
            key: 'toggleValue',
            props: { label: 'Toggle' },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Button Group', cardSubtitle: 'Grouped single-choice buttons.' },
        fieldGroup: [
          {
            type: 'button-group',
            key: 'buttonGroupValue',
            props: {
              label: 'Button Group',
              options: [
                { value: 'one', label: 'One' },
                { value: 'two', label: 'Two' },
              ],
            },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1',
        props: { cardTitle: 'Postal Code', cardSubtitle: 'Masked regional postal input.' },
        fieldGroup: [
          {
            type: 'postal-code',
            key: 'postalCodeValue',
            props: {
              autoCapitalize: true,
              autocompleteContext: 'unscoped',
              inputMode: 'text',
              label: 'Postal Code',
              mask: 'A0A 0A0',
              placeholder: 'A0A 0A0',
            },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1 md:col-span-2',
        props: { cardTitle: 'Markdown', cardSubtitle: 'Rendered formatted content.' },
        fieldGroup: [
          {
            type: 'markdown',
            props: {
              text: `# Markdown Showcase

Explore **bold text**, *emphasis*, and a [link](https://angular.dev).

## Lists and quotes

- Unordered list item
- Another item with \`inline code\`

1. Ordered list item
2. Another item

> Blockquotes add context to a section.

## Code and data

\`\`\`typescript
const fieldType = 'markdown';
\`\`\`

| Feature | Supported |
| --- | --- |
| Tables | Yes |
| Links | Yes |

---

Markdown content is sanitized before rendering.
              `.trim(),
            },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1 md:col-span-2',
        props: { cardTitle: 'Divider', cardSubtitle: 'Visual section separator.' },
        fieldGroup: [{ type: 'divider' }],
      },
      {
        type: 'card',
        className: 'col-span-1 md:col-span-2',
        props: { cardTitle: 'Group', cardSubtitle: 'Layout container for fields.' },
        fieldGroup: [
          {
            type: 'formly-group',
            fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-4',
            fieldGroup: [
              {
                type: 'input',
                key: 'groupInput',
                props: { label: 'Group field' },
              },
              {
                type: 'number',
                key: 'groupNumber',
                props: { label: 'Group number' },
              },
            ],
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1 md:col-span-2',
        props: { cardTitle: 'Card', cardSubtitle: 'Empty card container.' },
        fieldGroup: [],
      },
      {
        type: 'card',
        className: 'col-span-1 md:col-span-2',
        props: { cardTitle: 'Repeater', cardSubtitle: 'Repeatable field collection.' },
        fieldGroup: [
          {
            type: 'repeating-section',
            key: 'repeatItems',
            props: { addText: 'Add item', cardTitle: 'Items' },
            fieldArray: {
              fieldGroup: [
                {
                  type: 'input',
                  key: 'label',
                  props: { label: 'Label' },
                },
                {
                  type: 'number',
                  key: 'value',
                  props: { label: 'Value' },
                },
              ],
            },
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1 md:col-span-2',
        props: { cardTitle: 'Stepper', cardSubtitle: 'Sequential multi-step flow.' },
        fieldGroup: [
          {
            type: 'stepper',
            key: 'steps',
            props: { ariaLabel: 'Showcase steps', linear: false, orientation: 'horizontal' },
            fieldGroup: [
              {
                type: 'step',
                props: { label: 'First step' },
                fieldGroup: [
                  {
                    type: 'input',
                    key: 'stepValue',
                    props: { label: 'Step field' },
                  },
                ],
              },
              {
                type: 'step',
                props: { label: 'Second step', optional: true },
                fieldGroup: [
                  {
                    type: 'checkbox',
                    key: 'optionalStepValue',
                    props: { label: 'Optional step' },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'card',
        className: 'col-span-1 md:col-span-2',
        props: { cardTitle: 'Tabs', cardSubtitle: 'Tabbed content panels.' },
        fieldGroup: [
          {
            type: 'tabs',
            key: 'tabs',
            props: { alignTabs: 'start', dynamicHeight: true, headerPosition: 'above' },
            fieldGroup: [
              {
                type: 'tab',
                props: { label: 'First tab' },
                fieldGroup: [
                  {
                    type: 'input',
                    key: 'tabValue',
                    props: { label: 'Tab field' },
                  },
                ],
              },
              {
                type: 'tab',
                props: { label: 'Second tab' },
                fieldGroup: [
                  {
                    type: 'toggle',
                    key: 'secondTabValue',
                    props: { label: 'Second tab field' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const studioMaterialShowcaseModel: Record<string, unknown> = {
  inputValue: 'Sample text',
  stringValue: 'String value',
  numberValue: 42,
  textareaValue: 'Multiline value',
  dateValue: new Date('2026-09-20'),
  selectValue: 'one',
  radioValue: 'one',
  multicheckboxValue: ['one'],
  checkboxValue: true,
  toggleValue: true,
  buttonGroupValue: 'one',
  postalCodeValue: 'A1A 1A1',
  groupInput: 'Grouped value',
  groupNumber: 7,
  repeatItems: [{ label: 'Item one', value: 1 }],
  stepValue: 'Step value',
  optionalStepValue: false,
  tabValue: 'Tab value',
  secondTabValue: true,
};

export const studioMaterialShowcaseForm: DefaultForm = {
  name: 'Studio Material Showcase',
  libraryId: 'form-studio-material',
  icon: 'dashboard',
  description: 'A field catalog demonstrating the complete Studio Material library.',
  fields: studioMaterialShowcaseFields,
  model: studioMaterialShowcaseModel,
};

// ============================================================================
// FORM 4: Expense Report - Numeric line items in a repeater
// ============================================================================

const expenseReportFormFields: FormlyFieldConfig[] = [
  {
    fieldGroup: [
      {
        fieldGroup: [
          {
            type: 'input',
            key: 'reportTitle',
            className: 'col-span-1 lg:col-span-3',
            props: {
              label: 'Report Title',
              placeholder: 'Q3 Travel Expenses',
              required: true,
            },
          },
          {
            type: 'select',
            key: 'period',
            className: 'col-span-1',
            props: {
              label: 'Period',
              required: true,
              options: [
                { value: 'q1', label: 'Q1' },
                { value: 'q2', label: 'Q2' },
                { value: 'q3', label: 'Q3' },
                { value: 'q4', label: 'Q4' },
              ],
            },
          },
          {
            type: 'datepicker',
            key: 'submittedDate',
            className: 'col-span-1',
            props: {
              label: 'Submitted Date',
              required: true,
            },
          },
          {
            type: 'input',
            key: 'submitter',
            className: 'col-span-1',
            props: {
              label: 'Submitter',
              placeholder: 'Employee name',
              required: true,
            },
          },
        ],
        fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        key: 'header',
        wrappers: ['card'],
        props: {
          cardTitle: 'Report Header',
        },
      },
      {
        type: 'repeating-section',
        key: 'lineItems',
        props: {
          addText: 'Add Line Item',
          cardTitle: 'Expense Line Items',
        },
        fieldArray: {
          fieldGroup: [
            {
              type: 'input',
              key: 'description',
              className: 'col-span-1 md:col-span-3',
              props: {
                label: 'Description',
                placeholder: 'Taxi from airport',
                required: true,
              },
            },
            {
              type: 'select',
              key: 'category',
              className: 'col-span-1',
              props: {
                label: 'Category',
                required: true,
                options: [
                  { value: 'travel', label: 'Travel' },
                  { value: 'meals', label: 'Meals' },
                  { value: 'lodging', label: 'Lodging' },
                  { value: 'supplies', label: 'Supplies' },
                  { value: 'other', label: 'Other' },
                ],
              },
            },
            {
              type: 'datepicker',
              key: 'date',
              className: 'col-span-1',
              props: {
                label: 'Date',
                required: true,
              },
            },
            {
              type: 'number',
              key: 'amount',
              className: 'col-span-1',
              props: {
                label: 'Amount',
                placeholder: '0.00',
                required: true,
                min: 0,
              },
            },
            {
              type: 'toggle',
              key: 'receipt',
              className: 'col-span-1',
              props: {
                label: 'Receipt attached',
              },
            },
            {
              type: 'textarea',
              key: 'notes',
              className: 'col-span-1 md:col-span-2',
              props: {
                label: 'Notes',
                placeholder: 'Optional details',
                rows: 2,
              },
            },
          ],
          fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-3 gap-4',
        },
        wrappers: ['card'],
      },
    ],
    key: 'expenseReport',
    fieldGroupClassName: 'flex flex-col gap-4',
  },
];

const expenseReportFormModel: Record<string, unknown> = {
  expenseReport: {
    header: {
      reportTitle: 'Q3 Conference Travel',
      period: 'q3',
      submittedDate: new Date('2025-10-02'),
      submitter: 'Jane Smith',
    },
    lineItems: [
      {
        description: 'Flight to conference',
        category: 'travel',
        date: new Date('2025-09-18'),
        amount: 420,
        receipt: true,
        notes: 'Economy round trip.',
      },
      {
        description: 'Hotel - 3 nights',
        category: 'lodging',
        date: new Date('2025-09-19'),
        amount: 540,
        receipt: true,
        notes: '',
      },
    ],
  },
};

export const expenseReportForm: DefaultForm = {
  name: 'Expense Report',
  libraryId: 'form-studio-material',
  icon: 'receipt_long',
  description: 'Reimbursement form with categories, dates, amounts, and receipt flags.',
  fields: expenseReportFormFields,
  model: expenseReportFormModel,
};

const starterFormFields: FormlyFieldConfig[] = [
  {
    key: 'name',
    type: 'input',
    props: {
      label: 'Name',
      placeholder: 'Your name',
      required: true,
    },
  },
  {
    key: 'email',
    type: 'input',
    props: {
      label: 'Email address',
      placeholder: 'you@example.com',
      type: 'email',
      required: true,
    },
  },
  {
    key: 'topic',
    type: 'select',
    props: {
      label: 'Topic',
      placeholder: 'Choose a topic',
      required: true,
      options: [
        { label: 'General question', value: 'general' },
        { label: 'Product feedback', value: 'feedback' },
        { label: 'Support request', value: 'support' },
      ],
    },
  },
  {
    key: 'message',
    type: 'textarea',
    props: {
      label: 'Message',
      placeholder: 'How can we help?',
      rows: 4,
      required: true,
      minLength: 10,
    },
  },
  {
    key: 'updates',
    type: 'checkbox',
    props: {
      label: 'Send me product updates',
    },
  },
];

export const starterForm: DefaultForm = {
  name: 'Starter Form',
  libraryId: 'form-studio-material',
  icon: 'edit_note',
  description: 'A simple contact form with common fields, choices, and validation.',
  fields: starterFormFields,
  model: {},
};

export const formTemplates: DefaultForm[] = [
  starterForm,
  studioMaterialShowcaseForm,
  expenseReportForm,
];
