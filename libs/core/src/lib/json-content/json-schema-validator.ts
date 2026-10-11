import { Directive, forwardRef, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { treeifyError, ZodError, ZodType } from 'zod';
import { JSONValidationError } from './types';

interface TreeifiedError {
  errors: string[];
  properties?: Record<string, TreeifiedError>;
  items?: (TreeifiedError | null | undefined)[];
}

@Directive({
  selector: '[coreJsonSchema]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => JSONSchemaValidator),
      multi: true,
    },
  ],
})
export class JSONSchemaValidator implements Validator {
  readonly jsonSchema = input<ZodType<unknown> | null>(undefined, { alias: 'coreJsonSchema' });

  validate(control: AbstractControl): ValidationErrors | null {
    const schema = this.jsonSchema();
    if (!schema || !control.value) {
      return null;
    }

    try {
      const parseResult = schema.safeParse(JSON.parse(control.value));
      if (parseResult.success) {
        return null;
      }

      const errors = this.getValidationErrors(parseResult.error);
      return errors.length ? { jsonSchema: errors } : null;
    } catch (error) {
      console.warn('Error validating schema', error);
      return null;
    }
  }

  getValidationErrors(error: ZodError<unknown>): JSONValidationError[] {
    const treeifiedError = treeifyError(error);
    const flattenedErrors: JSONValidationError[] = this.flattenTreeifiedErrors(treeifiedError)
      .filter((e) => e.message !== 'ignore')
      .reduce(
        (acc, err) => {
          if (!acc.find((e) => e.path === err.path)) {
            acc.push(err);
          }
          return acc;
        },
        [] as { path: string; message: string }[],
      )
      .map((err) => ({
        label: 'Schema',
        messages: [err.path, err.message],
      }));

    return flattenedErrors;
  }

  flattenTreeifiedErrors(
    tree: TreeifiedError,
    parentPath = '',
  ): { path: string; message: string }[] {
    const result: { path: string; message: string }[] = [];

    if (tree.errors && tree.errors.length > 0) {
      for (const message of tree.errors) {
        result.push({ path: parentPath, message });
      }
    }

    if (tree.properties) {
      for (const [key, childTree] of Object.entries(tree.properties)) {
        const fullPath = parentPath ? `${parentPath}.${key}` : key;
        result.push(...this.flattenTreeifiedErrors(childTree, fullPath));
      }
    }

    if (tree.items) {
      tree.items.forEach((itemTree, index) => {
        if (itemTree) {
          const fullPath = parentPath ? `${parentPath}.${index}` : `${index}`;
          result.push(...this.flattenTreeifiedErrors(itemTree, fullPath));
        }
      });
    }

    return result;
  }
}
