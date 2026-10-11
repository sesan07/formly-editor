import { withStepperTypeBuilder, withTabsTypeBuilder } from '@formly-editor/builder-material';
import {
  withButtonGroupType,
  withCardType,
  withCardWrapper,
  withDividerType,
  withMarkdownType,
  withPostalCodeType,
  withRepeatingSectionType,
  withStepperType,
  withStepType,
  withTabsType,
  withTabType,
} from '@formly-editor/material';
import { ConfigOption } from '@ngx-formly/core';
import { materialConfigOptions } from '../material/material.config';

export function studioMaterialConfigOptions(): ConfigOption[] {
  return [
    ...materialConfigOptions(),
    withButtonGroupType(),
    withCardType(),
    withCardWrapper(),
    withDividerType(),
    withMarkdownType(),
    withPostalCodeType(),
    withRepeatingSectionType(),
    withTabType(),
    withStepType(),
    withTabsType(),
    withStepperType(),
  ];
}

export function studioMaterialBuilderConfigOptions(): ConfigOption[] {
  return [withStepperTypeBuilder(), withTabsTypeBuilder()];
}
