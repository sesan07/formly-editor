# Builder Material

## Why This Library Exists

Material runtime fields should work without the editor. The Material library owns
the regular Formly types and reusable rendering components, including `StepperContent`
and `TabsContent`. It must not depend on core editor services just to render a form.

Builder fields have different needs: editing a property reconstructs the Formly
form, but the author should not lose the selected tab or step. This library owns
those editor-only adapters and can depend on core's transient field-state service.
It reuses the same Material components rather than duplicating rendering,
navigation, or accessibility behavior.

The dependency direction is one-way:

- `builder-material` depends on `@formly-editor/core` and `@formly-editor/material`.
- Material does not depend on core or builder-material.
- Core does not depend on either UI library.

This is an internal source library, not a published SDK package.

## Registration

Import `withStepperTypeBuilder()` and `withTabsTypeBuilder()` from
`@formly-editor/builder-material` and place them in a core library configuration's
`builderConfigOptions`. Keep the regular `withStepperType()` and `withTabsType()`
registrations from `@formly-editor/material` in `configOptions`, together with the
`step` and `tab` child types.

Core uses these separate configurations to render builder adapters only in the
authoring context. Preview and regular forms continue to use the runtime types.
Builder registrations retain the runtime type names and defaults, replacing only
their components. The builder components themselves are not public exports.
