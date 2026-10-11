import { describe, expect, it } from 'vitest';
import * as z from 'zod';
import { createBooleanProperty, createInputProperty } from '../properties';
import { generateTypeOptionSchema } from './schema';

describe('generateTypeOptionSchema', () => {
  it('includes validation controls and messages in the generated field schema', () => {
    const shape = generateTypeOptionSchema(
      {
        properties: [createInputProperty({ label: 'Key', key: 'key', dataType: 'text' })],
        validationConfig: {
          rules: [
            {
              name: 'required',
              property: createBooleanProperty({ label: 'Required', key: 'props.required' }),
            },
          ],
          displayProperties: [
            createBooleanProperty({ label: 'Show Validation', key: 'validation.show' }),
          ],
        },
      },
      ['validation', 'messages'],
    );
    const schema = z.object(shape);

    expect(
      schema.safeParse({
        key: 'email',
        props: { required: true },
        validation: {
          show: true,
          messages: { required: 'Required', external: { expression: 'dynamic' } },
        },
      }).success,
    ).toBe(true);
  });
});
