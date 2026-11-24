import React, { useEffect, useState } from 'react';
import { Button } from '../../../componentes/Button/Button';
import {
  getAdminPermissions,
  getAdminRoles,
  updateRolePermissions,
} from '../../../services/Api';
import { toast } from 'react-toastify';
import './AccessManagement.css';

const getRows = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  throw new Error('Formato de resposta inválido.');
};

const AccessManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedByRole, setSelectedByRole] = useState({});
  const [savingRole, setSavingRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([getAdminRoles(), getAdminPermissions()])
      .then(([rolesResponse, permissionsResponse]) => {
        if (!active) return;
        const roleRows = getRows(rolesResponse);
        setRoles(roleRows);
        setPermissions(getRows(permissionsResponse));
        setSelectedByRole(
          Object.fromEntries(
            roleRows.map((role) => [
              role.id_role,
              (role.permissions || []).map((permission) => Number(permission.id_permission)),
            ])
          )
        );
      })
      .catch((error) => {
        if (active) {
          setLoadError(true);
          toast.error(error.response?.data?.message || 'Não foi possível carregar as permissões.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const togglePermission = (roleId, permissionId) => {
    setSelectedByRole((current) => {
      const selected = current[roleId] || [];
      const next = selected.includes(permissionId)
        ? selected.filter((id) => id !== permissionId)
        : [...selected, permissionId];
      return { ...current, [roleId]: next };
    });
  };

  const saveRole = async (role) => {
    setSavingRole(role.id_role);
    try {
      await updateRolePermissions(role.id_role, selectedByRole[role.id_role] || []);
      toast.success(`Permissões de ${role.name} atualizadas.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível salvar as permissões.');
    } finally {
      setSavingRole(null);
    }
  };

  return (
    <div className="admin-page access-management-page animate-entrance">
      <header className="admin-header">
        <div>
          <h1>Permissões</h1>
          <p>Defina o que cada perfil pode visualizar e gerenciar</p>
        </div>
      </header>

      {loading ? (
        <section className="access-management-card" role="status">Carregando permissões...</section>
      ) : loadError ? (
        <section className="access-management-card" role="alert">
          Não foi possível carregar os perfis e permissões.
        </section>
      ) : roles.length ? (
        <div className="access-role-list">
          {roles.map((role) => {
            const selectedIds = selectedByRole[role.id_role] || [];
            return (
              <section className="access-management-card" key={role.id_role}>
                <header className="access-role-header">
                  <div>
                    <h2>{role.name}</h2>
                    {role.description && <p>{role.description}</p>}
                  </div>
                  <Button
                    variant="primary"
                    disabled={savingRole === role.id_role}
                    onClick={() => saveRole(role)}
                  >
                    {savingRole === role.id_role ? 'Salvando...' : 'Salvar permissões'}
                  </Button>
                </header>
                <div className="access-permission-grid">
                  {permissions.map((permission) => {
                    const id = Number(permission.id_permission);
                    return (
                      <label key={id} className="access-permission-option">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(id)}
                          onChange={() => togglePermission(role.id_role, id)}
                        />
                        <span>
                          <strong>{permission.description || permission.name}</strong>
                          {permission.description && permission.name !== permission.description && (
                            <small>{permission.name}</small>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="access-management-card">Nenhum perfil de acesso cadastrado.</section>
      )}
    </div>
  );
};

export default AccessManagement;
