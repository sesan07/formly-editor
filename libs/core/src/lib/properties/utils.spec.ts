import { describe, expect, it } from 'vitest';
import { PropertyChangeType, PropertyType } from './types';
import {
  getChildPath,
  getDefaultProperty,
  getDefaultPropertyFromValue,
  getDefaultPropertyValue,
  modifyPropertyTarget,
  trackByPropertyKey,
} from './utils';

describe('Property Utils', () => {
  describe('trackByPropertyKey', () => {
    it('returns the property key', () => {
      const prop = { type: PropertyType.INPUT, key: 'testKey' };
      expect(trackByPropertyKey(0, prop as never)).toBe('testKey');
    });
  });

  describe('getChildPath', () => {
    it('appends key to path', () => {
      expect(getChildPath(['root'], 'child')).toEqual(['root', 'child']);
    });

    it('splits dot notation in key', () => {
      expect(getChildPath(['root'], 'nested.key')).toEqual(['root', 'nested', 'key']);
    });

    it('throws when key is undefined', () => {
      expect(() => getChildPath(['root'], undefined)).toThrow('key is undefined');
    });
  });

  describe('modifyPropertyTarget', () => {
    it('modifies target value', () => {
      const target = { name: 'old' };
      const updated = modifyPropertyTarget(target, {
        type: PropertyChangeType.VALUE,
        path: ['name'],
        value: 'new',
      });
      expect(updated.name).toBe('new');
    });

    it('clears target property', () => {
      const target = { name: 'old', age: 30 };
      const updated = modifyPropertyTarget(target, {
        type: PropertyChangeType.CLEAR,
        path: ['age'],
      });
      expect(updated.age).toBeUndefined();
    });

    it('modifies target key at top level', () => {
      const target = { oldKey: 'val' };
      const updated = modifyPropertyTarget(target, {
        type: PropertyChangeType.KEY,
        path: ['oldKey'],
        newPath: ['newKey'],
      });
      expect(updated).toEqual({ newKey: 'val' });
    });

    it('throws when newPath is missing for key modification', () => {
      expect(() =>
        modifyPropertyTarget({ k: 'v' }, { type: PropertyChangeType.KEY, path: ['k'] }),
      ).toThrow('Unable to modify target key without newPath');
    });
  });

  describe('getDefaultProperty', () => {
    it('creates default input property', () => {
      const prop = getDefaultProperty(PropertyType.INPUT, 'myInput', 'number');
      expect(prop.type).toBe(PropertyType.INPUT);
      expect(prop.key).toBe('myInput');
      expect((prop as never)['dataType']).toBe('number');
    });

    it('creates default object property', () => {
      const prop = getDefaultProperty(PropertyType.OBJECT, 'myObj');
      expect(prop.type).toBe(PropertyType.OBJECT);
      expect((prop as never)['childProperties']).toEqual([]);
    });

    it('creates default array property with child property type', () => {
      const prop = getDefaultProperty(PropertyType.ARRAY, 'arr', 'text', PropertyType.BOOLEAN);
      expect(prop.type).toBe(PropertyType.ARRAY);
      expect((prop as { childProperty?: { type: PropertyType } }).childProperty?.type).toBe(
        PropertyType.BOOLEAN,
      );
    });

    it('throws for unhandled property types', () => {
      expect(() => getDefaultProperty('UNKNOWN' as never)).toThrow();
    });
  });

  describe('getDefaultPropertyFromValue', () => {
    it('infers property type from string value', () => {
      const prop = getDefaultPropertyFromValue('hello', 'str');
      expect((prop as { type: PropertyType }).type).toBe(PropertyType.INPUT);
      expect((prop as never)['dataType']).toBe('text');
    });

    it('infers property type from number value', () => {
      const prop = getDefaultPropertyFromValue(42, 'num');
      expect((prop as { type: PropertyType }).type).toBe(PropertyType.INPUT);
      expect((prop as never)['dataType']).toBe('number');
    });

    it('infers property type from array value', () => {
      const prop = getDefaultPropertyFromValue([1, 2], 'arr');
      expect(prop?.type).toBe(PropertyType.ARRAY);
    });

    it('returns undefined for null or unknown types', () => {
      expect(getDefaultPropertyFromValue(null)).toBeUndefined();
    });
  });

  describe('getDefaultPropertyValue', () => {
    it('returns default values for various types', () => {
      expect(getDefaultPropertyValue(PropertyType.ARRAY)).toEqual([]);
      expect(getDefaultPropertyValue(PropertyType.OBJECT)).toEqual({});
      expect(getDefaultPropertyValue(PropertyType.BOOLEAN)).toBe(false);
      expect(getDefaultPropertyValue(PropertyType.INPUT, 'number')).toBe(0);
      expect(getDefaultPropertyValue(PropertyType.INPUT, 'text')).toBe('');
      expect(getDefaultPropertyValue(PropertyType.MARKDOWN)).toBe('');
      expect(getDefaultPropertyValue(PropertyType.DATE)).toBeInstanceOf(Date);
    });
  });
});
