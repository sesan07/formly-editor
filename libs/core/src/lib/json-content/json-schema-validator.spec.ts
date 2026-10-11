import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import z from 'zod';
import { JSONSchemaValidator } from './json-schema-validator';

describe('JSONSchemaValidator', () => {
  it('flattens treeified Zod errors correctly', () => {
    let validator!: JSONSchemaValidator;
    TestBed.configureTestingModule({ providers: [JSONSchemaValidator] });
    TestBed.runInInjectionContext(() => {
      validator = TestBed.inject(JSONSchemaValidator);
    });

    const tree = {
      errors: ['Global error'],
      properties: {
        user: {
          errors: [],
          properties: {
            age: { errors: ['Expected number, received string'] },
          },
        },
      },
    };

    const result = validator.flattenTreeifiedErrors(tree);
    expect(result).toEqual([
      { path: '', message: 'Global error' },
      { path: 'user.age', message: 'Expected number, received string' },
    ]);
  });

  it('validates control value against provided Zod schema', () => {
    let validator!: JSONSchemaValidator;
    TestBed.configureTestingModule({ providers: [JSONSchemaValidator] });
    TestBed.runInInjectionContext(() => {
      validator = TestBed.inject(JSONSchemaValidator);
    });

    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    Object.defineProperty(validator, 'jsonSchema', {
      value: () => schema,
    });

    const validControl = new FormControl('{"name": "Alice", "age": 30}');
    expect(validator.validate(validControl)).toBeNull();

    const invalidControl = new FormControl('{"name": "Alice", "age": "thirty"}');
    const result = validator.validate(invalidControl);
    expect(result?.['jsonSchema']).toBeDefined();
  });
});
