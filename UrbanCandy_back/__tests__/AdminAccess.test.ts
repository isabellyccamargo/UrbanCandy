import { describe, expect, test } from '@jest/globals';
import {
  isEmployeeRoleName,
  isManagerRoleName,
  parseIdList,
} from '../src/utils/AdminAccess.js';

describe('admin access helpers', () => {
  test.each(['manager', ' MANAGER ', 'Gerente', 'admin', '3'])(
    'recognizes manager role name %s',
    (name) => {
      expect(isManagerRoleName(name)).toBe(true);
    }
  );

  test('normalizes diacritics and spacing in role names', () => {
    expect(isManagerRoleName(' GERÉNTE ')).toBe(true);
  });

  test.each(['employee', 'Funcionário', 'Atendente', '2'])(
    'recognizes employee role name %s',
    (name) => {
      expect(isEmployeeRoleName(name)).toBe(true);
    }
  );

  test('accepts empty and unique positive integer id lists', () => {
    expect(parseIdList([], 'id_roles')).toEqual([]);
    expect(parseIdList([1, 2], 'id_roles')).toEqual([1, 2]);
  });

  test.each([
    { value: null },
    { value: '1' },
    { value: [0] },
    { value: [-1] },
    { value: [1.5] },
    { value: [Number.MAX_SAFE_INTEGER + 1] },
    { value: [1, 1] },
  ])('rejects invalid id list $value', ({ value }) => {
    expect(() => parseIdList(value, 'id_roles')).toThrow();
  });
});
