export const getUserRole = (user) => {
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : Array.isArray(user?.People?.roles)
      ? user.People.roles
      : [];

  const normalizedRoles = roles.map((role) =>
    String(typeof role === 'object' && role !== null ? role.name || role.label : role)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/^role_/, '')
      .trim()
  );

  if (normalizedRoles.some((role) => ['gerente', 'admin', '3'].includes(role))) {
    return 'manager';
  }

  if (normalizedRoles.some((role) => ['funcionario', 'atendente', '2'].includes(role))) {
    return 'employee';
  }

  return null;
};
