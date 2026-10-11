import { describe, expect, it } from 'vitest';
import { BreakpointAffix, ClassType, StyleOptionConfig, StylesConfig } from './types';
import {
    findVariant,
    formatVariant,
    hasClass,
    removeInvalidDependencies,
    removeOptionClasses,
} from './utils';

const option: StyleOptionConfig = {
  name: 'Width',
  value: 'w',
  variants: ['1', '1.5', '1/2', '4', '8', '[2px]', 'a+b'],
};
const defaultBreakpoint = { name: 'Default', description: '', value: '' };

describe('styling class tokens', () => {
  it.each(Object.values(BreakpointAffix))('round trips exact %s variants', (affix) => {
    const breakpoint = { ...defaultBreakpoint, value: 'sm:' };
    for (const variant of option.variants) {
      const token = formatVariant(variant, option, breakpoint, affix);
      expect(findVariant(`custom ${token} other`, option, breakpoint, affix)).toBe(variant);
      expect(removeOptionClasses(`custom ${token} other`, option, breakpoint, affix)).toBe(
        'custom other',
      );
      expect(findVariant(`prefix${token}`, option, breakpoint, affix)).toBeUndefined();
      expect(findVariant(`${token}suffix`, option, breakpoint, affix)).toBeUndefined();
    }
  });

  it('does not interpret decimal variants as regex patterns', () => {
    expect(findVariant('w-1x5', option, defaultBreakpoint, BreakpointAffix.PREFIX)).toBeUndefined();
    expect(
      removeOptionClasses('w-1x5 w-1.5', option, defaultBreakpoint, BreakpointAffix.PREFIX),
    ).toBe('w-1x5');
  });

  it('preserves unrelated responsive classes and removes every conflict', () => {
    expect(
      removeOptionClasses(
        'w-4\tw-8\nw-4\fcustom\rsm:w-4 hover:sm:w-4 custom',
        option,
        defaultBreakpoint,
        BreakpointAffix.PREFIX,
      ),
    ).toBe('custom sm:w-4 hover:sm:w-4 custom');
    expect(findVariant('w-8 w-4', option, defaultBreakpoint, BreakpointAffix.PREFIX)).toBe('8');
  });

  it('checks literal dependency tokens and handles empty input', () => {
    expect(hasClass('grid-cols-2 sm:grid', 'grid')).toBe(false);
    expect(hasClass('custom\tgrid\nother', 'grid')).toBe(true);
    expect(hasClass('a+b', 'a+b')).toBe(true);
    expect(findVariant('', option, defaultBreakpoint, BreakpointAffix.PREFIX)).toBeUndefined();
    expect(removeOptionClasses('', option, defaultBreakpoint, BreakpointAffix.PREFIX)).toBe('');
  });

  it('removes chained dependencies regardless of category order and preserves parent dependencies', () => {
    const config: StylesConfig = {
      breakpointAffix: BreakpointAffix.PREFIX,
      breakpoints: [defaultBreakpoint],
      className: [
        {
          name: 'Dependencies',
          options: [
            {
              name: 'Second',
              variants: ['second'],
              dependsOn: { type: ClassType.CLASS_NAME, value: 'first' },
            },
            {
              name: 'First',
              variants: ['first'],
              dependsOn: { type: ClassType.FIELD_GROUP_CLASS_NAME, value: 'grid' },
            },
            {
              name: 'Parent',
              variants: ['child'],
              dependsOnParent: { type: ClassType.FIELD_GROUP_CLASS_NAME, value: 'grid' },
            },
          ],
        },
      ],
      fieldGroupClassName: [],
    };
    const previous = { className: 'first second child custom', fieldGroupClassName: 'grid' };
    expect(
      removeInvalidDependencies(previous, { ...previous, fieldGroupClassName: 'flex' }, config),
    ).toEqual({ className: 'child custom', fieldGroupClassName: 'flex' });
  });
});
