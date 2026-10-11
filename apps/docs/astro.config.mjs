// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.formlystudio.com',
  outDir: '../../dist/apps/docs',
  redirects: {
    '/guides/configuring-fields': '/guides/add-and-configure-fields',
    '/guides/creating-a-form': '/guides/add-and-configure-fields',
    '/guides/field-presets': '/guides/add-and-configure-fields',
    '/guides/importing-and-exporting': '/guides/save-import-and-export',
    '/guides/managing-forms-in-workspace': '/guides/manage-your-workspace',
    '/guides/organizing-forms': '/guides/manage-your-workspace',
    '/guides/saving-and-recovering-forms': '/guides/save-import-and-export',
    '/guides/using-form-folders': '/guides/manage-your-workspace',
    '/developers/formly-field-config-quickstart': '/developers/use-an-exported-form',
  },
  integrations: [
    starlight({
      title: 'Formly Editor Docs',
      description:
        'Documentation for Formly Editor, an open-source ngx-formly editor framework, and its Studio demo application.',
      social: [],
      sidebar: [
        { label: 'Project Overview', link: '/' },
        {
          label: 'Studio Demo',
          items: [
            { label: 'Using the demo', link: '/guides/' },
            {
              label: 'Get started',
              items: [
                { label: 'Form Editor quickstart', link: '/guides/form-editor-quickstart/' },
                { label: 'Start a form', link: '/guides/templates/' },
                { label: 'Editor tour', link: '/guides/workspace-tour/' },
              ],
            },
            {
              label: 'Build forms',
              items: [
                { label: 'Add and configure fields', link: '/guides/add-and-configure-fields/' },
                { label: 'Structure fields', link: '/guides/organizing-fields/' },
                { label: 'Layout and styling', link: '/guides/form-layout-and-styling/' },
                { label: 'Preview and test', link: '/guides/previewing-and-testing/' },
              ],
            },
            {
              label: 'Manage and troubleshoot',
              items: [
                { label: 'Manage your workspace', link: '/guides/manage-your-workspace/' },
                { label: 'Save, import, and export', link: '/guides/save-import-and-export/' },
                { label: 'Inspect form JSON', link: '/guides/working-with-json/' },
                { label: 'Troubleshooting', link: '/guides/empty-states-and-recovery/' },
              ],
            },
          ],
        },
        {
          label: 'Demo UI Profiles',
          items: [
            { label: 'Overview', link: '/ui-libraries/' },
            { label: 'Studio Material', link: '/ui-libraries/studio-material/' },
            { label: 'Material', link: '/ui-libraries/material/' },
            { label: 'Ng Zorro', link: '/ui-libraries/ng-zorro/' },
            { label: 'Bootstrap', link: '/ui-libraries/bootstrap/' },
          ],
        },
        {
          label: 'Developers',
          items: [
            { label: 'Overview', link: '/developers/' },
            { label: 'Set up your editor', link: '/developers/set-up-your-editor/' },
            { label: 'Configure a UI profile', link: '/developers/configure-a-ui-profile/' },
            { label: 'Add custom components', link: '/developers/add-custom-components/' },
            { label: 'Use an exported form', link: '/developers/use-an-exported-form/' },
          ],
        },
        {
          label: 'ngx-formly Resources',
          items: [
            {
              label: 'Getting started',
              link: 'https://formly.dev/docs/guide/getting-started',
              attrs: { target: '_blank', rel: 'noopener noreferrer' },
            },
            {
              label: 'Core API',
              link: 'https://formly.dev/docs/api/core',
              attrs: { target: '_blank', rel: 'noopener noreferrer' },
            },
            {
              label: 'ngx-formly on GitHub',
              link: 'https://github.com/ngx-formly/ngx-formly',
              attrs: { target: '_blank', rel: 'noopener noreferrer' },
            },
          ],
        },
      ],
    }),
  ],
});
