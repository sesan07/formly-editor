import { DefaultForm } from '@formly-editor/core';

export const formTemplates: DefaultForm[] = [
  {
    name: 'Ng Zorro Showcase',
    libraryId: 'form-ng-zorro',
    icon: 'dashboard',
    description: 'A team profile demonstrating the complete Ng Zorro field catalog.',
    fields: [
      {
        type: 'formly-group',
        key: 'teamProfile',
        fieldGroup: [
          {
            type: 'input',
            key: 'name',
            props: {
              label: 'Name',
              placeholder: 'Jane Smith',
              required: true,
            },
          },
          {
            type: 'input',
            key: 'email',
            props: {
              label: 'Email',
              type: 'email',
              placeholder: 'jane@example.com',
              required: true,
            },
          },
          {
            type: 'number',
            key: 'teamSize',
            props: {
              label: 'Team size',
              min: 1,
              max: 100,
            },
          },
          {
            type: 'select',
            key: 'department',
            props: {
              label: 'Department',
              options: [
                { value: 'engineering', label: 'Engineering' },
                { value: 'design', label: 'Design' },
                { value: 'support', label: 'Support' },
              ],
              required: true,
            },
          },
          {
            type: 'radio',
            key: 'experience',
            props: {
              label: 'Experience',
              options: [
                { value: 'junior', label: 'Junior' },
                { value: 'senior', label: 'Senior' },
              ],
            },
          },
          {
            type: 'checkbox',
            key: 'termsAccepted',
            props: {
              label: 'I accept the terms',
              required: true,
            },
          },
          {
            type: 'textarea',
            key: 'notes',
            props: {
              label: 'Notes',
              placeholder: 'Additional details',
              rows: 4,
            },
          },
        ],
      },
    ],
    model: {
      teamProfile: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        teamSize: 6,
        department: 'engineering',
        experience: 'senior',
        termsAccepted: true,
        notes: 'Works across the design system and application teams.',
      },
    },
  },
];
