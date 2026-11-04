import { ApiException } from '../exception/ApiException.js';

const managerRoleNames = new Set(['manager', 'gerente', 'admin', '3']);

export function isManagerRoleName(name: string): boolean {
  const normalizedName = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
  return managerRoleNames.has(normalizedName);
}

export function isEmployeeRoleName(name: string): boolean {
  const normalizedName = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
  return ['employee', 'funcionario', 'atendente', '2'].includes(normalizedName);
}

export function parseIdList(value: unknown, field: string): number[] {
  if (
    !Array.isArray(value) ||
    value.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
    new Set(value).size !== value.length
  ) {
    throw new ApiException('INVALID_REQUEST_BODY', 400, field);
  }

  return value;
}
