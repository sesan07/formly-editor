import beautify from 'js-beautify';
import { minify } from 'terser';

export function beautifyCode(code: string): string {
  return beautify.js(code, {
    indent_size: 2,
  });
}

/**
 * Flatten code into a single line using terser (minify).
 * Falls back to a simple newline removal if terser isn't available.
 */
export async function flattenToOneLine(code: string): Promise<string> {
  try {
    const result = await minify(code, {
      compress: false,
      mangle: false,
      format: {
        semicolons: true,
        beautify: false,
        comments: false,
        wrap_iife: false,
        quote_style: 1,
      },
    });

    if (result && typeof result.code === 'string') {
      return result.code.replace(/\s*\n\s*/g, ' ').trim();
    }
  } catch (e) {
    // minify may error — fall back
    console.warn('Failed to minify, using fall back..', e);
  }

  // Fallback: naive collapse of whitespace/newlines into single spaces
  return code
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
