import React, { useEffect, useRef, useState } from 'react';
import {
  getUserProfile,
  createUser,
  updateUser,
  updateAddress,
  getEmailVerificationStatus,
  requestEmailVerification,
  confirmEmailVerification,
  requestPreRegistrationEmailVerification,
  requestEmailChange,
  confirmEmailChange,
  uploadUserPhoto,
} from '../../services/Api';
import { lookupCep, ViaCepError } from '../../services/ViaCep';
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

const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const baseUrl = (import.meta.env.VITE_API_URL || window.location.origin)
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');
  const cleanPath = String(imagePath).replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

const MyData = () => {
  const { setUser } = useAuth();
  const photoInputRef = useRef(null);
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
  const [emailVerified, setEmailVerified] = useState(null);
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailChange, setEmailChange] = useState('');
  const [emailChangeCode, setEmailChangeCode] = useState('');
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [avatarColor, setAvatarColor] = useState('dark');
  const [useInitialAvatar, setUseInitialAvatar] = useState(false);

  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    },
    [photoPreview]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: masks[name] ? masks[name](value) : value }));
    if (name === 'email' && !isEditMode) {
      setEmailVerified(null);
      setVerificationRequested(false);
      setVerificationCode('');
    }
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const address = await lookupCep(cep);
      setFormData((prev) => {
        if (prev.cep.replace(/\D/g, '') !== cep) return prev;
        return {
          ...prev,
          ...address,
        };
      });
      toast.success('Endereço preenchido! 📍');
    } catch (error) {
      if (error instanceof ViaCepError && error.code === 'CEP_NOT_FOUND') {
        toast.error('CEP não encontrado. Confira o número informado.');
      } else if (error instanceof ViaCepError && error.code === 'INVALID_CEP') {
        toast.error('Digite um CEP válido com 8 números.');
      } else {
        toast.error('Serviço de CEP temporariamente indisponível. Tente novamente.');
      }
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.warning('Selecione um arquivo de imagem.');
      event.target.value = '';
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    setSelectedPhoto(file);
  };

  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('@UrbanCandy:user'));
      const userId = storedUser?.id_user || storedUser?.id;
      if (userId) {
        setAvatarColor(
          localStorage.getItem(`@UrbanCandy:avatarColor:${userId}`) === 'pink' ? 'pink' : 'dark'
        );
        setUseInitialAvatar(
          localStorage.getItem(`@UrbanCandy:avatarMode:${userId}`) === 'initial'
        );
      }
      if (storedUser?.id_user && localStorage.getItem('@UrbanCandy:token')) {
        try {
          const res = await getUserProfile(storedUser.id_user);
          const person = res.people || {};
          const addr = person.address || person.Addresses?.[0] || {};
          setProfilePhoto(
            getProfileImageUrl(
              person.image || person.foto || res.image || res.foto || storedUser.image || storedUser.foto
            )
          );
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
          try {
            const verification = await getEmailVerificationStatus();
            setEmailVerified(
              verification.verified &&
                (verification.userId == null ||
                  Number(verification.userId) === Number(storedUser.id_user))
            );
            setVerificationRequested(false);
          } catch {
            setEmailVerified(null);
          }
        } catch {
          setProfilePhoto(
            getProfileImageUrl(
              storedUser.people?.image ||
                storedUser.people?.foto ||
                storedUser.image ||
                storedUser.foto
            )
          );
          toast.error('Erro ao carregar dados. 😟');
        }
      }
      setLoading(false);
    };
    loadUserData();
  }, []);

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

    if (!isEditMode && emailVerified !== true) {
      if (!verificationRequested) {
        try {
          await requestPreRegistrationEmailVerification(formData.email.trim());
          setVerificationRequested(true);
          toast.success('Código enviado. Confirme o e-mail antes de criar sua conta.');
        } catch (error) {
          toast.error(
            error.response?.data?.message || error.message || 'Não foi possível enviar o código.'
          );
        }
      } else {
        toast.info('Confirme o código enviado para liberar a criação da conta.');
      }
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        let uploadedImagePath = null;
        await updateUser(formData.id_people, {
          password: formData.password || undefined,
          name: formData.name,
          cpf: rawCpf,
          telephone: rawPhone,
        });
        if (selectedPhoto) {
          const imageData = new FormData();
          imageData.append('image', selectedPhoto);
          const response = await uploadUserPhoto(formData.id_people, imageData);
          uploadedImagePath =
            response?.image ||
            response?.foto ||
            response?.people?.image ||
            response?.people?.foto;
          if (uploadedImagePath) setProfilePhoto(getProfileImageUrl(uploadedImagePath));
        }
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
          ...(uploadedImagePath ? { image: uploadedImagePath, foto: uploadedImagePath } : {}),
        };
        setUser(updatedUser);
        localStorage.setItem('@UrbanCandy:user', JSON.stringify(updatedUser));
        localStorage.setItem(
          `@UrbanCandy:avatarMode:${updatedUser.id_user || updatedUser.id}`,
          useInitialAvatar ? 'initial' : 'photo'
        );
        window.dispatchEvent(
          new CustomEvent('avatarModeChange', {
            detail: {
              userId: updatedUser.id_user || updatedUser.id,
              mode: useInitialAvatar ? 'initial' : 'photo',
            },
          })
        );
        toast.success('Dados atualizados! ✨');
      } else {
        if (selectedPhoto) {
          const registrationData = new FormData();
          registrationData.append('name', formData.name);
          registrationData.append('email', formData.email);
          registrationData.append('password', formData.password);
          registrationData.append('cpf', rawCpf);
          registrationData.append('telephone', rawPhone);
          registrationData.append('cep', rawCep);
          registrationData.append('city', formData.city);
          registrationData.append('neighborhood', formData.neighborhood);
          registrationData.append('road', formData.road);
          registrationData.append('number', formData.number);
          registrationData.append('complement', formData.complement);
          registrationData.append('image', selectedPhoto);
          await createUser(registrationData);
        } else {
          await createUser({
            ...formData,
            cpf: rawCpf,
            telephone: rawPhone,
            cep: rawCep,
          });
        }
        localStorage.setItem(
          `@UrbanCandy:avatarColor:pending:${formData.email.trim().toLowerCase()}`,
          avatarColor
        );
        localStorage.setItem(
          `@UrbanCandy:avatarMode:pending:${formData.email.trim().toLowerCase()}`,
          useInitialAvatar ? 'initial' : 'photo'
        );
        toast.success('Cadastro concluído com e-mail confirmado.');
        setTimeout(() => (window.location.href = '/?login=true'), 1200);
      }
    } catch (err) {
      toast.error(err.message || 'Erro na operação.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestEmailVerification = async () => {
    try {
      await requestEmailVerification();
      setVerificationRequested(true);
      toast.success('Código enviado. Confira sua caixa de entrada.');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Não foi possível enviar o código.');
    }
  };

  const handleConfirmEmailVerification = async () => {
    try {
      await confirmEmailVerification(formData.email, verificationCode);
      setEmailVerified(true);
      toast.success('E-mail confirmado! Agora você pode concluir o cadastro ou receber atualizações dos pedidos.');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Código inválido ou expirado.');
    }
  };

  const handleRequestEmailChange = async () => {
    try {
      await requestEmailChange(emailChange.trim());
      setEmailChangeRequested(true);
      setEmailChangeCode('');
      toast.success('Código enviado para o novo endereço de e-mail.');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Não foi possível enviar o código.');
    }
  };

  const handleConfirmEmailChange = async () => {
    try {
      const result = await confirmEmailChange(emailChange.trim(), emailChangeCode);
      setFormData((prev) => ({ ...prev, email: result.email }));
      const currentUser = JSON.parse(localStorage.getItem('@UrbanCandy:user') || 'null');
      if (currentUser) {
        const updatedUser = { ...currentUser, email: result.email };
        localStorage.setItem('@UrbanCandy:user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      setEmailVerified(true);
      setEmailChange('');
      setEmailChangeCode('');
      setEmailChangeRequested(false);
      toast.success('E-mail atualizado e confirmado.');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Não foi possível alterar o e-mail.');
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <p>Carregando... 🍫</p>
      </div>
    );

  return (
    <div className="orders-page my-data-page animate-entrance">
      <header className="orders-header">
        <h1>{isEditMode ? 'Meus Dados' : 'Criar Conta'}</h1>
        <p>{isEditMode ? 'Mantenha suas informações atualizadas' : 'Junte-se à UrbanCandy'}</p>
      </header>

      <section className="admin-table-container">
        <form onSubmit={handleSubmit} className="grid-form">
          <h2 className="section-title">Dados Pessoais</h2>
          <div className="profile-photo-field">
            {(photoPreview || profilePhoto) && !useInitialAvatar ? (
              <img
                className="profile-photo-preview"
                src={photoPreview || profilePhoto}
                alt="Foto de perfil"
              />
            ) : (
              <span className={`profile-photo-placeholder profile-photo-${avatarColor}`} aria-hidden="true">
                {formData.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
            <div className="profile-photo-actions">
              <strong>Foto de perfil</strong>
              <span>Escolha uma imagem para sua conta.</span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => photoInputRef.current?.click()}
              >
                {selectedPhoto || profilePhoto ? 'Alterar foto' : 'Adicionar foto'}
              </Button>
              <input
                ref={photoInputRef}
                className="profile-photo-input"
                type="file"
                accept="image/*"
                aria-label="Selecionar foto de perfil"
                onChange={handlePhotoChange}
              />
              <label className="avatar-mode-option">
                <input
                  type="checkbox"
                  checked={useInitialAvatar}
                  disabled={!formData.name.trim()}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setUseInitialAvatar(checked);
                    const user = JSON.parse(localStorage.getItem('@UrbanCandy:user') || 'null');
                    const userId = user?.id_user || user?.id;
                    if (userId) {
                      const mode = checked ? 'initial' : 'photo';
                      localStorage.setItem(`@UrbanCandy:avatarMode:${userId}`, mode);
                      window.dispatchEvent(
                        new CustomEvent('avatarModeChange', { detail: { userId, mode } })
                      );
                    }
                  }}
                />
                <span>Usar inicial no lugar da foto</span>
              </label>
              <span>Cor da inicial</span>
              <div className="avatar-color-options" role="group" aria-label="Cor da inicial do perfil">
                {[
                  { value: 'dark', label: 'Preto e branco' },
                  { value: 'pink', label: 'Rosa' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={!useInitialAvatar || !formData.name.trim()}
                    className={`avatar-color-option${avatarColor === option.value ? ' is-selected' : ''}`}
                    aria-pressed={avatarColor === option.value}
                    onClick={() => {
                      setAvatarColor(option.value);
                      const user = JSON.parse(localStorage.getItem('@UrbanCandy:user') || 'null');
                      const userId = user?.id_user || user?.id;
                      if (userId) {
                        localStorage.setItem(`@UrbanCandy:avatarColor:${userId}`, option.value);
                        window.dispatchEvent(
                          new CustomEvent('avatarColorChange', {
                            detail: { userId, color: option.value },
                          })
                        );
                      }
                    }}
                  >
                    <span className={`avatar-color-swatch profile-photo-${option.value}`} aria-hidden="true" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
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

          {(verificationRequested || (isEditMode && emailVerified === false)) && (
            <section aria-live="polite" style={{ margin: '12px 0 20px', width: '100%' }}>
              <p>
                {emailVerified
                  ? 'E-mail confirmado.'
                  : 'Confirme seu e-mail uma vez para receber atualizações dos pedidos.'}
              </p>
              {!emailVerified && (
                <>
                  {!verificationRequested && isEditMode && (
                    <Button type="button" variant="primary" onClick={handleRequestEmailVerification}>
                      Enviar código de confirmação
                    </Button>
                  )}
                  {verificationRequested && (
                    <div className="form-row">
                      <FormField
                        label="Código recebido por e-mail"
                        name="verificationCode"
                        value={verificationCode}
                        onChange={(event) =>
                          setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        inputMode="numeric"
                        maxLength={6}
                      />
                      <Button type="button" variant="primary" onClick={handleConfirmEmailVerification}>
                        Confirmar e-mail
                      </Button>
                      {isEditMode && (
                        <Button type="button" variant="secondary" onClick={handleRequestEmailVerification}>
                          Reenviar código
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {isEditMode && (
            <section aria-label="Alterar e-mail" style={{ margin: '12px 0 20px', width: '100%' }}>
              <h3>Alterar e-mail</h3>
              <p>O endereço atual só será substituído depois da confirmação do novo e-mail.</p>
              <FormField
                label="Novo e-mail"
                name="emailChange"
                type="email"
                value={emailChange}
                onChange={(event) => {
                  setEmailChange(event.target.value);
                  setEmailChangeRequested(false);
                  setEmailChangeCode('');
                }}
              />
              {!emailChangeRequested ? (
                <Button type="button" variant="secondary" onClick={handleRequestEmailChange}>
                  Enviar código para o novo e-mail
                </Button>
              ) : (
                <div className="form-row">
                  <FormField
                    label="Código enviado ao novo e-mail"
                    name="emailChangeCode"
                    value={emailChangeCode}
                    onChange={(event) =>
                      setEmailChangeCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <Button type="button" variant="primary" onClick={handleConfirmEmailChange}>
                    Confirmar novo e-mail
                  </Button>
                </div>
              )}
            </section>
          )}
        </form>
      </section>
    </div>
  );
};

export default MyData;
