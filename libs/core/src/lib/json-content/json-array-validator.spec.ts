import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JSONArrayValidator } from './json-array-validator';

describe('JSONArrayValidator', () => {
  it('validates array root when enabled', () => {
    let validator!: JSONArrayValidator;
    TestBed.configureTestingModule({ providers: [JSONArrayValidator] });
    TestBed.runInInjectionContext(() => {
      validator = TestBed.inject(JSONArrayValidator);
    });

    const validControl = new FormControl('[1, 2]');
    expect(validator.validate(validControl)).toBeNull();

    const invalidControl = new FormControl('{"a": 1}');
    const res = validator.validate(invalidControl);
    expect(res?.['jsonArray']).toBeDefined();
  });
});
