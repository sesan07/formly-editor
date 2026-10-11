import { BasePropertyConfig, PropertyCreator, PropertyType } from '../types';

export type ExpressionsPropertyConfig = BasePropertyConfig & {
  type: PropertyType.EXPRESSIONS;
  key:
    | 'expressions'
    | 'expressionProperties'
    | 'widget.formlyConfig.expressions'
    | 'widget.formlyConfig.expressionProperties';
};

export const createExpressionsProperty: PropertyCreator<
  ExpressionsPropertyConfig,
  ExpressionsPropertyConfig
> = (v) => ({
  ...v,
  type: PropertyType.EXPRESSIONS,
});
