import { describe, expect, it } from 'vitest';
import { beautifyCode, flattenToOneLine } from './code-editor-utils';

describe('Code Editor Utils', () => {
  describe('beautifyCode', () => {
    it('formats unformatted JS/JSON code with 2-space indentation', () => {
      const input = 'const x={a:1,b:2};';
      const result = beautifyCode(input);
      expect(result).toContain('const x = {');
      expect(result).toContain('  a: 1,');
    });
  });

  describe('flattenToOneLine', () => {
    it('flattens multi-line JS into a single line', async () => {
      const input = `const a = 1;
const b = 2;`;
      const result = await flattenToOneLine(input);
      expect(result).not.toContain('\n');
      expect(result).toBe('const a=1;const b=2;');
    });
  });
});
