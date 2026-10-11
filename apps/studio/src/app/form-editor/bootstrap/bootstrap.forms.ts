import { DefaultForm } from '@formly-editor/core';

export const formTemplates: DefaultForm[] = [
  {
    name: 'Bootstrap Showcase',
    libraryId: 'form-bootstrap',
    icon: 'dashboard',
    description: 'An employee profile demonstrating the Bootstrap field catalog.',
    fields: [
      {
        type: 'formly-group',
        key: 'employeeProfile',
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
            key: 'yearsExperience',
            props: {
              label: 'Years of experience',
              min: 0,
              max: 50,
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
            key: 'experienceLevel',
            props: {
              label: 'Experience level',
              options: [
                { value: 'junior', label: 'Junior' },
                { value: 'senior', label: 'Senior' },
              ],
            },
          },
          {
            type: 'multicheckbox',
            key: 'skills',
            props: {
              label: 'Skills',
              options: [
                { value: 'typescript', label: 'TypeScript' },
                { value: 'angular', label: 'Angular' },
                { value: 'testing', label: 'Testing' },
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
      employeeProfile: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        yearsExperience: 8,
        department: 'engineering',
        experienceLevel: 'senior',
        skills: ['typescript', 'angular'],
        termsAccepted: true,
        notes: 'Available for the next product planning cycle.',
      },
    },
  },
];
