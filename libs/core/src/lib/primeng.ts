import { palette } from '@primeuix/themes';
import { Preset } from '@primeuix/themes/types';

export const primengPreset: Preset = {
  semantic: {
    colorScheme: {
      light: {
        primary: palette('#3282b8'),
      },
      dark: {
        primary: palette('#5997c5'),
        surface: palette('#38546B'),
      },
    },
  },
  components: {
    splitter: {
      root: {
        borderColor: 'none',
      },
    },
    divider: {
      horizontal: {
        margin: '0',
      },
      vertical: {
        margin: '0',
      },
    },
    tree: {
      root: {
        padding: '0',
        indent: '12px',
      },
      node: {
        padding: '0.25rem',
      },
    },
    panel: {
      toggleableHeader: {
        padding: '0.5rem',
      },
      content: {
        padding: '0 0.5rem 0.5rem 0.5rem',
      },
    },
    inplace: {
      root: {
        padding: '0.25rem 0.5rem',
      },
    },
    menu: {
      item: {
        padding: '0.75rem',
      },
    },
    message: {
      colorScheme: {
        dark: {
          error: {
            background:
              'color-mix(in srgb,color-mix(in srgb,{red.900} 20%,{surface.900}),transparent 20%);',
          },
          success: {
            background:
              'color-mix(in srgb,color-mix(in srgb,{green.900} 20%,{surface.900}),transparent 20%);',
          },
        },
      },
    },
  },
};
