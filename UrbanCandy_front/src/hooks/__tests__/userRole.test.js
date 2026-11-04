import { describe, expect, it } from '@jest/globals';
import { getUserRole } from '../userRole';

describe('getUserRole', () => {
  it('identifies manager roles returned by the login API', () => {
    expect(getUserRole({ roles: ['Gerente'] })).toBe('manager');
    expect(getUserRole({ roles: ['ROLE_ADMIN'] })).toBe('manager');
    expect(getUserRole({ roles: ['3'] })).toBe('manager');
  });

  it('identifies employee roles and nested role records', () => {
    expect(getUserRole({ roles: ['Funcionário'] })).toBe('employee');
    expect(getUserRole({ People: { roles: [{ name: 'Atendente' }] } })).toBe('employee');
    expect(getUserRole({ roles: ['2'] })).toBe('employee');
  });

  it('does not grant staff access to customer accounts', () => {
    expect(getUserRole({ roles: [] })).toBeNull();
    expect(getUserRole(null)).toBeNull();
  });
});
