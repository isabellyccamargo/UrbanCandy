import React, { useEffect, useState } from 'react';
import { Button } from '../../../componentes/Button/Button';
import AdminFilterSelect from '../../../componentes/AdminFilterSelect/AdminFilterSelect';
import {
  getAdminRoles,
  getAdminUsers,
  updateAdminPerson,
  updateUserRoles,
} from '../../../services/Api';
import { toast } from 'react-toastify';
import './AdminUsers.css';

const getRows = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  throw new Error('Formato de resposta inválido.');
};

const formatRoleName = (name = '') => {
  const normalized = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
  if (normalized.includes('gerente') || normalized.includes('manager')) return 'Gerente';
  if (normalized.includes('funcionario') || normalized.includes('employee')) return 'Funcionário';
  if (normalized.includes('cliente') || normalized.includes('customer')) return 'Cliente';
  return name;
};

const getPerson = (user) => user.people || user.People || {};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personForm, setPersonForm] = useState({ name: '', telephone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      getAdminUsers(page, 6, roleFilter),
      getAdminRoles(),
    ])
      .then(([usersResponse, rolesResponse]) => {
        if (!active) return;
        const usersBody = usersResponse.data;
        setUsers(getRows(usersResponse));
        setTotalPages(usersBody?.totalPages || 1);
        setRoles(getRows(rolesResponse));
      })
      .catch((error) => {
        if (active) {
          setLoadError(true);
          toast.error(
            error.response?.data?.message || 'Não foi possível carregar usuários e pessoas.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, roleFilter, refreshKey]);

  const handleRoleFilterChange = (value) => {
    setPage(1);
    setLoading(true);
    setLoadError(false);
    setRoleFilter(value);
  };

  const openRoleEditor = (user) => {
    setSelectedUser(user);
    setSelectedRoleIds((user.roles || []).map((role) => Number(role.id_role)));
  };

  const toggleRole = (roleId) => {
    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId]
    );
  };

  const saveRoles = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      await updateUserRoles(selectedUser.id_user, selectedRoleIds);
      setUsers((current) =>
        current.map((user) =>
          user.id_user === selectedUser.id_user
            ? {
                ...user,
                roles: roles.filter((role) => selectedRoleIds.includes(Number(role.id_role))),
              }
            : user
        )
      );
      toast.success('Acessos do usuário atualizados.');
      setSelectedUser(null);
      setLoading(true);
      setLoadError(false);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível atualizar os acessos.');
    } finally {
      setSaving(false);
    }
  };

  const openPersonEditor = (user) => {
    const person = getPerson(user);
    if (!person.id_people) {
      toast.error('Este usuário ainda não possui cadastro de pessoa.');
      return;
    }

    setSelectedPerson(user);
    setPersonForm({
      name: person.name || person.nome || '',
      telephone: person.telephone || '',
    });
  };

  const savePerson = async () => {
    if (!selectedPerson) return;
    const person = getPerson(selectedPerson);
    if (!personForm.name.trim()) {
      toast.warning('Informe o nome da pessoa.');
      return;
    }

    setSaving(true);
    try {
      await updateAdminPerson(person.id_people, {
        name: personForm.name.trim(),
        telephone: personForm.telephone.trim(),
      });
      setUsers((current) =>
        current.map((user) =>
          user.id_user === selectedPerson.id_user
            ? {
                ...user,
                people: {
                  ...getPerson(user),
                  name: personForm.name.trim(),
                  telephone: personForm.telephone.trim(),
                },
              }
            : user
        )
      );
      toast.success('Dados da pessoa atualizados.');
      setSelectedPerson(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível atualizar a pessoa.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page admin-users-page animate-entrance">
      <header className="admin-header">
        <div>
          <h1>Usuários e pessoas</h1>
          <p>Consulte os cadastros e defina os perfis de acesso</p>
        </div>
        <AdminFilterSelect
          label="Perfil"
          value={roleFilter}
          onChange={handleRoleFilterChange}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'employee', label: 'Funcionários' },
            { value: 'customer', label: 'Clientes' },
            { value: 'manager', label: 'Gerentes' },
          ]}
        />
      </header>

      <section className="admin-users-card">
        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pessoa</th>
                <th>Telefone</th>
                <th>Perfil de acesso</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Carregando usuários...</td></tr>
              ) : loadError ? (
                <tr><td colSpan="5">Não foi possível carregar os usuários. Tente novamente.</td></tr>
              ) : users.length ? (
                users.map((user) => {
                  const person = getPerson(user);
                  return (
                    <tr key={user.id_user}>
                      <td>#{user.id_user}</td>
                      <td>
                        <strong>{person.name || person.nome || 'Pessoa sem nome'}</strong>
                        <span className="admin-users-email">{user.email}</span>
                      </td>
                      <td>{person.telephone || 'Não informado'}</td>
                      <td>
                        {(user.roles || []).length
                          ? user.roles.map((role) => formatRoleName(role.name)).join(', ')
                          : 'Cliente'}
                      </td>
                      <td>
                        <button className="admin-users-edit" onClick={() => openPersonEditor(user)}>
                          Editar pessoa
                        </button>
                        <button className="admin-users-edit" onClick={() => openRoleEditor(user)}>
                          Editar acesso
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="5">Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-users-pagination">
            <Button
              variant="secondary"
              disabled={page === 1 || loading}
              onClick={() => {
                setLoading(true);
                setLoadError(false);
                setPage((current) => Math.max(1, current - 1));
              }}
            >
              Anterior
            </Button>
            <span>Página {page} de {totalPages}</span>
            <Button
              variant="secondary"
              disabled={page === totalPages || loading}
              onClick={() => {
                setLoading(true);
                setLoadError(false);
                setPage((current) => Math.min(totalPages, current + 1));
              }}
            >
              Próxima
            </Button>
          </div>
        )}
      </section>

      {selectedUser && (
        <div className="modal-overlay" role="presentation">
          <section
            className="admin-access-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-access-title"
          >
            <h2 id="admin-access-title">Acessos de {getPerson(selectedUser).name || selectedUser.email}</h2>
            <p>Selecione os perfis que este usuário deve possuir.</p>
            <div className="admin-role-options">
              {roles.map((role) => {
                const id = Number(role.id_role);
                return (
                  <label key={id} className="admin-role-option">
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(id)}
                      onChange={() => toggleRole(id)}
                    />
                    <span>
                      <strong>{formatRoleName(role.name)}</strong>
                      {role.description && <small>{role.description}</small>}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="modal-buttons">
              <Button variant="secondary" disabled={saving} onClick={() => setSelectedUser(null)}>
                Cancelar
              </Button>
              <Button variant="primary" disabled={saving} onClick={saveRoles}>
                {saving ? 'Salvando...' : 'Salvar acessos'}
              </Button>
            </div>
          </section>
        </div>
      )}

      {selectedPerson && (
        <div className="modal-overlay" role="presentation">
          <section
            className="admin-access-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-person-title"
          >
            <h2 id="admin-person-title">Dados da pessoa</h2>
            <p>{selectedPerson.email}</p>
            <label className="admin-person-field">
              Nome
              <input
                autoComplete="name"
                maxLength={100}
                value={personForm.name}
                onChange={(event) =>
                  setPersonForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label className="admin-person-field">
              Telefone
              <input
                autoComplete="tel"
                maxLength={20}
                value={personForm.telephone}
                onChange={(event) =>
                  setPersonForm((current) => ({ ...current, telephone: event.target.value }))
                }
              />
            </label>
            <div className="modal-buttons">
              <Button variant="secondary" disabled={saving} onClick={() => setSelectedPerson(null)}>
                Cancelar
              </Button>
              <Button variant="primary" disabled={saving} onClick={savePerson}>
                {saving ? 'Salvando...' : 'Salvar pessoa'}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
