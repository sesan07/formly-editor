import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';

export interface MarkdownPropertyConfig extends BasePropertyConfig {
  type: PropertyType.MARKDOWN;
  placeholder?: string;
  clearOnEmpty?: boolean;
}

export const createMarkdownProperty: PropertyCreator<
  MarkdownPropertyConfig,
  MarkdownPropertyConfig
> = (v) => ({
  ...v,
  type: PropertyType.MARKDOWN,
});
