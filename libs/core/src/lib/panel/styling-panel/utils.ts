import { Breakpoint, BreakpointAffix, ClassType, StyleOptionConfig, StylesConfig } from './types';

export const formatVariant = (
  variant: string,
  option: StyleOptionConfig,
  bp: Breakpoint,
  bpAffix: BreakpointAffix,
) => {
  const optionValue = `${option.value ? `${option.value}-` : ''}`;
  switch (bpAffix) {
    case BreakpointAffix.PREFIX:
      return `${bp.value}${optionValue}${variant}`;
    case BreakpointAffix.INFIX:
      return `${optionValue}${bp.value ? `${bp.value}-` : ''}${variant}`;
    case BreakpointAffix.SUFFIX:
      return `${optionValue}${variant}${bp.value}`;
  }
};

export const findVariant = (
  source: string,
  option: StyleOptionConfig,
  bp: Breakpoint,
  bpAffix: BreakpointAffix,
) => {
  const variants = new Map(
    option.variants.map((variant) => [formatVariant(variant, option, bp, bpAffix), variant]),
  );
  for (const token of classTokens(source)) {
    if (variants.has(token)) {
      return variants.get(token);
    }
  }
  return undefined;
};

export const classTokens = (source: string): string[] =>
  source.split(/[\t\n\f\r ]+/).filter((token) => token.length > 0);

export const hasClass = (source: string, value: string): boolean =>
  classTokens(source).includes(value);

export const removeOptionClasses = (
  source: string,
  option: StyleOptionConfig,
  bp: Breakpoint,
  bpAffix: BreakpointAffix,
): string => {
  const classes = new Set(
    option.variants.map((variant) => formatVariant(variant, option, bp, bpAffix)),
  );
  const tokens = classTokens(source);
  const remaining = tokens.filter((token) => !classes.has(token));
  return remaining.length === tokens.length ? source : remaining.join(' ');
};

export const removeInvalidDependencies = (
  previous: Record<ClassType, string>,
  candidate: Record<ClassType, string>,
  config: StylesConfig,
): Record<ClassType, string> => {
  const result = { ...candidate };
  let changed: boolean;
  do {
    changed = false;
    for (const classType of [ClassType.CLASS_NAME, ClassType.FIELD_GROUP_CLASS_NAME]) {
      for (const category of config[classType]) {
        for (const option of category.options) {
          const dependency = option.dependsOn;
          if (
            !dependency ||
            !hasClass(previous[dependency.type], dependency.value) ||
            hasClass(result[dependency.type], dependency.value)
          ) {
            continue;
          }
          for (const breakpoint of config.breakpoints) {
            if (breakpoint.value && !option.hasBreakpoints) {
              continue;
            }
            const cleaned = removeOptionClasses(
              result[classType],
              option,
              breakpoint,
              config.breakpointAffix,
            );
            if (cleaned !== result[classType]) {
              result[classType] = cleaned;
              changed = true;
            }
          }
        }
      }
    }
  } while (changed);
  return result;
};
