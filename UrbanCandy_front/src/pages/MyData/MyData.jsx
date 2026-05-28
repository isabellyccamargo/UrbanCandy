import React, { useEffect, useState } from 'react';
import { getUserProfile, createUser, updateUser, updateAddress } from '../../services/Api';
import { Button } from '../../componentes/Button/Button';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/AuthContext';
import './MyData.css';

const FormField = ({ label, required, ...props }) => (
  <div className="form-group">
    <label>
      {label} {required && <span style={{ color: 'red' }}>*</span>}
    </label>
    <input {...props} value={props.value || ''} required={required} />
  </div>
);

const MyData = () => {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    cep: '',
    city: '',
    neighborhood: '',
    road: '',
    number: '',
    complement: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const masks = {
    cpf: (v) => {
      const cleaned = v.replace(/\D/g, '').slice(0, 11);
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    },
    telephone: (v) =>
      v
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15),
    cep: (v) =>
      v
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 9),
    number: (v) => v.replace(/\D/g, ''),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: masks[name] ? masks[name](value) : value }));
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          road: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
        }));
        toast.success('Endereço preenchido! 📍');
      }
    } catch {
      toast.error('Erro ao buscar o CEP automaticamente.');
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('@UrbanCandy:user'));
      if (storedUser?.id_user && localStorage.getItem('@UrbanCandy:token')) {
        try {
          const res = await getUserProfile(storedUser.id_user);
          const person = res.people || {};
          const addr = person.address || person.Addresses?.[0] || {};
          setFormData((prev) => ({
            ...prev,
            ...person,
            ...addr,
            email: res.email,
            id_people: person.id_people,
            id_address: addr.id_address,
            cpf: person.cpf ? masks.cpf(person.cpf) : '',
            telephone: person.telephone ? masks.telephone(person.telephone) : '',
            cep: addr.cep ? masks.cep(addr.cep) : '',
          }));
          setIsEditMode(true);
        } catch {
          toast.error('Erro ao carregar dados. 😟');
        }
      }
      setLoading(false);
    };
    loadUserData();
  }, '[]');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawCpf = formData.cpf.replace(/\D/g, '');
    const rawPhone = formData.telephone.replace(/\D/g, '');
    const rawCep = formData.cep.replace(/\D/g, '');

    if (rawCpf.length !== 11) return toast.warning('CPF inválido. 🧐');
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/.test(formData.email))
      return toast.warning('O e-mail deve conter @ e terminar com .com');
    if (!isEditMode && formData.password !== formData.confirmPassword)
      return toast.warning('As senhas não coincidem! 🔑');

    setIsSaving(true);
    try {
      if (isEditMode) {
        await updateUser(formData.id_people, {
          password: formData.password || undefined,
          name: formData.name,
          cpf: rawCpf,
          telephone: rawPhone,
        });
        await updateAddress(formData.id_address, {
          road: formData.road,
          number: parseInt(formData.number, 10),
          neighborhood: formData.neighborhood,
          city: formData.city,
          cep: rawCep,
          complement: formData.complement,
        });

        const updatedUser = {
          ...JSON.parse(localStorage.getItem('@UrbanCandy:user')),
          name: formData.name,
        };
        setUser(updatedUser);
        localStorage.setItem('@UrbanCandy:user', JSON.stringify(updatedUser));
        toast.success('Dados atualizados! ✨');
      } else {
        await createUser({ ...formData, cpf: rawCpf, telephone: rawPhone, cep: rawCep });
        toast.success('Bem-vindo(a)! 🍬');
        setTimeout(() => (window.location.href = '/?login=true'), 2000);
      }
    } catch (err) {
      toast.error(err.message || 'Erro na operação.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <p>Carregando... 🍫</p>
      </div>
    );

  return (
    <div className="orders-page animate-entrance">
      <header className="orders-header">
        <h1>{isEditMode ? 'Meus Dados' : 'Criar Conta'}</h1>
        <p>{isEditMode ? 'Mantenha suas informações atualizadas' : 'Junte-se à UrbanCandy'}</p>
      </header>

      <section className="admin-table-container">
        <form onSubmit={handleSubmit} className="grid-form">
          <h2 className="section-title">Dados Pessoais</h2>
          <div className="form-row triple-row">
            <FormField
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <FormField
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              readOnly={isEditMode}
              className={isEditMode ? 'input-readonly' : ''}
              required
            />
            <FormField
              label="Telefone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row triple-row">
            <FormField
              label="E-mail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly={isEditMode}
              className={isEditMode ? 'input-readonly' : ''}
              required
            />
            {!isEditMode &&
              ['password', 'confirmPassword'].map((field) => (
                <div className="form-group" key={field}>
                  <label>
                    {field === 'password' ? 'Senha' : 'Confirmar'}{' '}
                    <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div className="input-container-simples">
                    <input
                      name={field}
                      type={(field === 'password' ? showPass : showConfirm) ? 'text' : 'password'}
                      value={formData[field]}
                      onChange={handleChange}
                      className="input-com-botao"
                      required
                    />
                    <span
                      className="texto-mostrar"
                      onClick={() =>
                        field === 'password' ? setShowPass(!showPass) : setShowConfirm(!showConfirm)
                      }
                    >
                      {(field === 'password' ? showPass : showConfirm) ? 'Ocultar' : 'Ver'}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <h2 className="section-title" style={{ marginTop: '20px' }}>
            Endereço
          </h2>
          <div className="form-row address-main-row">
            <FormField
              label="CEP"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              onBlur={handleCepBlur}
              required
            />
            <FormField
              label="Cidade"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <FormField
              label="Bairro"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
            />
          </div>

          <div className="form-row address-street-row">
            <FormField
              label="Rua"
              name="road"
              value={formData.road}
              onChange={handleChange}
              required
            />
            <FormField
              label="Número"
              name="number"
              value={formData.number}
              onChange={handleChange}
              required
            />
          </div>

          <div
            style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '30px' }}
          >
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Finalizar Cadastro'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default MyData;
