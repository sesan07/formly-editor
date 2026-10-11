import { InjectionToken } from '@angular/core';

export enum ClassType {
  CLASS_NAME = 'className',
  FIELD_GROUP_CLASS_NAME = 'fieldGroupClassName',
}

export enum BreakpointAffix {
  PREFIX = 'prefix',
  INFIX = 'infix',
  SUFFIX = 'suffix',
}

interface StyleDependency {
  type: ClassType;
  value: string;
}

export interface StyleOptionConfig {
  name: string;
  value?: string;
  variants: string[];
  hasBreakpoints?: boolean;
  spanWidth?: boolean;
  dependsOn?: StyleDependency;
  dependsOnParent?: StyleDependency;
}

export interface StylesConfig {
  breakpointAffix: BreakpointAffix;
  breakpoints: Breakpoint[];
  className: StyleOptionCategory[];
  fieldGroupClassName: StyleOptionCategory[];
}

export interface StyleOptionCategory {
  name: string;
  options: StyleOptionConfig[];
}

export interface Breakpoint {
  name: string;
  description: string;
  value: string;
}

export const CORE_STYLES_CONFIG = new InjectionToken<StylesConfig>('CORE_STYLES_CONFIG ');
