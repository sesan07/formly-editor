import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { JSONFormatValidator } from './json-format-validator';

describe('JSONFormatValidator', () => {
  const validator = new JSONFormatValidator();

  it('returns null for valid JSON string', () => {
    const control = new FormControl('{"a": 1}');
    expect(validator.validate(control)).toBeNull();
  });

  it('returns null for empty control value', () => {
    const control = new FormControl('');
    expect(validator.validate(control)).toBeNull();
  });

  it('returns error object for invalid JSON string', () => {
    const control = new FormControl('{ invalid json }');
    const result = validator.validate(control);
    expect(result).not.toBeNull();
    expect(result?.['jsonFormat']).toBeDefined();
    expect(result?.['jsonFormat'][0].label).toBe('Format');
  });
});
