import { useCallback, useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/context/Theme';
import { useAuth } from '@/context/AuthContext';
import { useAppAlert } from '@/components/common/AppAlert';
import { Menu } from '@/components/home/Menu';

import {
    getUserProfile,
    createUser,
    updateUser,
    getEmailVerificationStatus,
    requestEmailVerification,
    confirmEmailVerification,
    requestPreRegistrationEmailVerification,
    requestEmailChange,
    confirmEmailChange,
} from '@/services/auth';
import { updateAddress } from '@/services/address';
import api, { API_BASE_URL } from '@/services/api';

import AccountHeader from '@/components/account/AccountHeader';
import AccountForm from '@/components/account/AccountForm';

function getFullImageUrl(imagePath?: string | null) {
    if (!imagePath) return null;

    if (
        imagePath.startsWith('file://') ||
        imagePath.startsWith('content://')
    ) {
        return imagePath;
    }

    const baseUrl = (
        api.defaults.baseURL || API_BASE_URL
    )
        .replace(/\/api\/?$/, '')
        .replace(/\/$/, '');

    const cleanPath = imagePath.startsWith('/')
        ? imagePath
        : `/${imagePath}`;

    return `${baseUrl}${cleanPath}`;
}

function getEmailVerificationErrorMessage(error: unknown) {
    const status = (
        error as { response?: { status?: number } } | null
    )?.response?.status;

    if (status === 400) {
        return 'O código está incorreto ou expirou. Confira o código ou solicite um novo.';
    }

    if (status === 429) {
        return 'O limite de tentativas foi atingido. Solicite um novo código e tente novamente.';
    }

    if (status === 503) {
        return 'Não foi possível confirmar o código agora. Tente novamente mais tarde.';
    }

    if (!status) {
        return 'Não foi possível conectar ao serviço de confirmação. Verifique sua conexão e tente novamente.';
    }

    return 'Não foi possível confirmar o código. Confira os dados e tente novamente.';
}

export default function CadastroScreen() {
    const router = useRouter();
    const { colors, font, fontSize, space, radius } = useTheme();
    const { showMessage } = useAppAlert();
    const { signOut } = useAuth();
    const { mode } = useLocalSearchParams<{ mode?: string }>();

    const isCreating = mode === 'create';

    const [checking, setChecking] = useState(!isCreating);
    const [authenticated, setAuthenticated] = useState(isCreating);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationRequested, setVerificationRequested] = useState(false);
    const [emailChange, setEmailChange] = useState('');
    const [emailChangeCode, setEmailChangeCode] = useState('');
    const [emailChangeRequested, setEmailChangeRequested] = useState(false);

    // Guardar a URI local/remota da imagem
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [avatarColor, setAvatarColor] = useState<'dark' | 'pink'>('dark');
    const [useInitialAvatar, setUseInitialAvatar] = useState(false);

    const [ids, setIds] = useState({
        user: null as number | null,
        people: null as number | null,
        address: null as number | null,
    });

    const [form, setForm] = useState({
        name: '',
        cpf: '',
        telephone: '',
        email: '',
        password: '',
        confirmPassword: '',
        cep: '',
        city: '',
        neighborhood: '',
        road: '',
        number: '',
        complement: '',
    });

    const [errors, setErrors] = useState<Set<keyof typeof form>>(
        new Set()
    );

    const change = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (field === 'email' && !editing) {
            setEmailVerified(null);
            setVerificationRequested(false);
            setVerificationCode('');
        }

        if (value.trim()) {
            setErrors(prev => {
                const next = new Set(prev);
                next.delete(field);
                return next;
            });
        }
    };

    async function handlePickImage() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showMessage(
                'Permissão necessária',
                'Precisamos de permissão para acessar sua galeria.',
                undefined,
                'warning'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setImageUri(result.assets[0].uri);
        }
    }

    async function handleAvatarColorChange(color: 'dark' | 'pink') {
        const previousColor = avatarColor;
        setAvatarColor(color);
        const userId = ids.user;
        if (userId) {
            try {
                await AsyncStorage.setItem(`@UrbanCandy:avatarColor:${userId}`, color);
            } catch (error) {
                console.error('Não foi possível salvar a cor do avatar:', error);
                setAvatarColor(previousColor);
                showMessage(
                    'Erro ao salvar',
                    'Não foi possível salvar a cor do avatar. Tente novamente.',
                    undefined,
                    'warning'
                );
            }
        }
    }

    async function handleUseInitialAvatarChange(enabled: boolean) {
        setUseInitialAvatar(enabled);
        const userId = ids.user;
        if (userId) {
            try {
                await AsyncStorage.setItem(
                    `@UrbanCandy:avatarMode:${userId}`,
                    enabled ? 'initial' : 'photo'
                );
            } catch (error) {
                console.error('Não foi possível salvar a preferência do avatar:', error);
                setUseInitialAvatar(!enabled);
                showMessage(
                    'Erro ao salvar',
                    'Não foi possível salvar a preferência do avatar. Tente novamente.',
                    undefined,
                    'warning'
                );
            }
        }
    }

    const loadAccount = useCallback(async () => {
        try {
            const stored =
                (await AsyncStorage.getItem('@UrbanCandy:user')) ||
                (await AsyncStorage.getItem('user'));

            if (!stored) {
                setAuthenticated(false);
                return;
            }

            const user = JSON.parse(stored);
            const userId = user?.id_user || user?.people?.id_user || user?.id;

            if (!userId) {
                setAuthenticated(false);
                return;
            }

            setEditing(true);
            setAvatarColor(
                (await AsyncStorage.getItem(
                    `@UrbanCandy:avatarColor:${userId}`
                )) === 'pink'
                    ? 'pink'
                    : 'dark'
            );
            setUseInitialAvatar(
                (await AsyncStorage.getItem(`@UrbanCandy:avatarMode:${userId}`)) === 'initial'
            );

            try {
                const profile = await getUserProfile(userId);

                // Extrai a estrutura respeitando o retorno da API/Storage (user.people)
                const people = profile?.people ?? user?.people ?? profile ?? {};
                const address = people?.address ?? profile?.address ?? {};

                setIds({
                    user: userId,
                    people: people?.id_people ?? user?.id_people ?? null,
                    address: address?.id_address ?? null,
                });

                // Captura a imagem em user.people.image, people.image ou variações
                const rawImage =
                    people?.image ||
                    people?.foto ||
                    profile?.people?.image ||
                    profile?.people?.foto ||
                    profile?.image ||
                    profile?.foto ||
                    user?.people?.image ||
                    user?.people?.foto ||
                    user?.image ||
                    user?.foto ||
                    null;

                console.log('Imagem encontrada:', rawImage);
                setImageUri(getFullImageUrl(rawImage));

                setForm({
                    name: people?.name ?? user?.name ?? user?.nome ?? '',
                    cpf: people?.cpf ?? user?.cpf ?? '',
                    telephone: people?.telephone ?? user?.telephone ?? '',
                    email: profile?.email ?? user?.email ?? '',
                    password: '',
                    confirmPassword: '',
                    cep: address?.cep ?? '',
                    city: address?.city ?? '',
                    neighborhood: address?.neighborhood ?? '',
                    road: address?.road ?? '',
                    number: address?.number != null ? String(address.number) : '',
                    complement: address?.complement ?? '',
                });

                setAuthenticated(true);
                try {
                    const verification = await getEmailVerificationStatus();
                    setEmailVerified(
                        verification.verified &&
                        (verification.userId == null ||
                            Number(verification.userId) === Number(userId))
                    );
                } catch {
                    console.warn('Não foi possível consultar a confirmação do e-mail.');
                }
            } catch (apiError: any) {
                console.warn('[PERFIL] Falha na API, usando dados locais:', apiError?.message);

                const people = user?.people ?? {};
                const rawImage =
                    people?.image ||
                    people?.foto ||
                    user?.image ||
                    user?.foto ||
                    null;

                setImageUri(getFullImageUrl(rawImage));

                setForm(prev => ({
                    ...prev,
                    name: people?.name || user?.name || user?.nome || '',
                    email: user?.email || '',
                    cpf: people?.cpf || user?.cpf || '',
                    telephone: people?.telephone || user?.telephone || '',
                }));

                setAuthenticated(true);
                setEmailVerified(null);
            }
        } catch (error) {
            console.error('Erro crítico no loadAccount:', error);
            setAuthenticated(false);
        }
    }, []);

    const initialize = useCallback(async () => {
        setImageUri(null);

        if (isCreating) {
            setEditing(false);
            setAuthenticated(true);
            setChecking(false);
            return;
        }

        try {
            const token =
                (await AsyncStorage.getItem('@UrbanCandy:token')) ||
                (await AsyncStorage.getItem('token'));

            if (!token) {
                setAuthenticated(false);
                setChecking(false);
                return;
            }

            await loadAccount();
        } catch (error) {
            console.error('Erro na inicialização:', error);
            setAuthenticated(false);
        } finally {
            setChecking(false);
        }
    }, [isCreating, loadAccount]);

    useEffect(() => {
        const initializeTimer = setTimeout(() => {
            void initialize();
        }, 0);

        return () => clearTimeout(initializeTimer);
    }, [initialize, mode]);

    async function handleLogout() {
        try {
            setImageUri(null);
            await signOut();
            router.replace('/welcome' as any);
        } catch (error) {
            console.error('Não foi possível sair da conta:', error);
            showMessage(
                'Erro',
                'Não foi possível sair da conta.',
                undefined,
                'error'
            );
        }
    }

    function validate() {
        const required: (keyof typeof form)[] = [
            'name',
            'cpf',
            'telephone',
            'email',
            'cep',
            'city',
            'neighborhood',
            'road',
            'number',
        ];

        if (!editing) {
            required.push('password', 'confirmPassword');
        }

        const emptyFields = new Set(
            required.filter(field => !form[field].trim())
        );

        setErrors(emptyFields);

        if (emptyFields.size) {
            showMessage(
                'Atenção',
                'Preencha todos os campos obrigatórios. (Em vermelho).',
                undefined,
                'warning'
            );
            return false;
        }

        if (!editing && form.password !== form.confirmPassword) {
            showMessage(
                'Atenção',
                'As senhas não coincidem.',
                undefined,
                'warning'
            );
            return false;
        }

        return true;
    }

    async function save() {
        if (!validate()) return;

        if (!editing && emailVerified !== true) {
            if (!verificationRequested) {
                try {
                    await requestPreRegistrationEmailVerification(form.email.trim());
                    setVerificationRequested(true);
                    showMessage(
                        'Código enviado',
                        'Confirme seu e-mail antes de criar a conta.',
                        undefined,
                        'success'
                    );
                } catch (error: any) {
                    showMessage(
                        'Não foi possível enviar',
                        error?.response?.data?.message ?? error?.message ?? 'Tente novamente mais tarde.',
                        undefined,
                        'error'
                    );
                }
            } else {
                showMessage(
                    'Confirme seu e-mail',
                    'Digite o código enviado para liberar a criação da conta.',
                    undefined,
                    'warning'
                );
            }
            return;
        }

        try {
            setLoading(true);

            if (!editing) {
                // CADASTRO DE NOVO USUÁRIO
                const formData = new FormData();
                formData.append('name', form.name.trim());
                formData.append('email', form.email.trim());
                formData.append('password', form.password);
                formData.append('cpf', form.cpf.replace(/\D/g, ''));
                formData.append('telephone', form.telephone.replace(/\D/g, ''));
                formData.append('cep', form.cep.replace(/\D/g, ''));
                formData.append('city', form.city.trim());
                formData.append('neighborhood', form.neighborhood.trim());
                formData.append('road', form.road.trim());
                formData.append('number', form.number);
                formData.append('complement', form.complement.trim());

                if (imageUri && (imageUri.startsWith('file://') || imageUri.startsWith('content://'))) {
                    const filename = imageUri.split('/').pop() || 'profile.jpg';
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : 'image/jpeg';

                    formData.append('image', {
                        uri: imageUri,
                        name: filename,
                        type,
                    } as any);
                }

                await createUser(formData as any);
                await AsyncStorage.setItem(
                    `@UrbanCandy:avatarColor:pending:${form.email.trim().toLowerCase()}`,
                    avatarColor
                );
                await AsyncStorage.setItem(
                    `@UrbanCandy:avatarMode:pending:${form.email.trim().toLowerCase()}`,
                    useInitialAvatar ? 'initial' : 'photo'
                );

                setImageUri(null);
                showMessage(
                    'Cadastro concluído',
                    'Seu e-mail está confirmado e sua conta foi criada.',
                    () => router.replace('/welcome' as any),
                    'success'
                );

                return;
            }

            // EDIÇÃO DE PERFIL EXISTENTE
            if (!ids.user) {
                showMessage('Erro', 'Usuário não encontrado.', undefined, 'error');
                return;
            }

            await updateUser(
                ids.user,
                {},
                {
                    id_people: ids.people ?? undefined,
                    name: form.name.trim(),
                    telephone: form.telephone.replace(/\D/g, ''),
                }
            );

            if (ids.address) {
                await updateAddress(ids.address, {
                    cep: form.cep.replace(/\D/g, ''),
                    city: form.city.trim(),
                    neighborhood: form.neighborhood.trim(),
                    road: form.road.trim(),
                    number: Number(form.number),
                    complement: form.complement.trim(),
                });
            }

            await AsyncStorage.setItem(
                `@UrbanCandy:avatarMode:${ids.user}`,
                useInitialAvatar ? 'initial' : 'photo'
            );

            let newUploadedImage = null;

            // Envia nova foto se tiver sido selecionada
            if (ids.people && imageUri && (imageUri.startsWith('file://') || imageUri.startsWith('content://'))) {
                const photoData = new FormData();
                const filename = imageUri.split('/').pop() || 'profile.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                photoData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type,
                } as any);

                const uploadRes = await api.patch(
                    `/pessoa/upload-foto/${ids.people}`,
                    photoData
                );

                newUploadedImage =
                    uploadRes.data?.image ||
                    uploadRes.data?.foto ||
                    uploadRes.data?.people?.image ||
                    uploadRes.data?.people?.foto ||
                    null;

                if (newUploadedImage) {
                    setImageUri(getFullImageUrl(newUploadedImage));
                }
            }

            // Atualiza o AsyncStorage com as duas nomenclaturas
            const stored = await AsyncStorage.getItem('@UrbanCandy:user');
            if (stored) {
                const user = JSON.parse(stored);
                const updatedUser = {
                    ...user,
                    name: form.name.trim(),
                    ...(newUploadedImage
                        ? { image: newUploadedImage, foto: newUploadedImage }
                        : {}),
                };

                await AsyncStorage.setItem(
                    '@UrbanCandy:user',
                    JSON.stringify(updatedUser)
                );
            }

            showMessage(
                'Dados atualizados',
                'Seus dados foram atualizados com sucesso!',
                undefined,
                'success'
            );

            setTimeout(() => {
                router.back();
            }, 1500);
        } catch (error: any) {
            showMessage(
                'Erro',
                error?.response?.data?.message ??
                error?.message ??
                'Não foi possível salvar seus dados.',
                undefined,
                'error'
            );
        } finally {
            setLoading(false);
        }
    }

    if (checking) return null;

    if (!isCreating && !authenticated) {
        return <Redirect href="/login" />;
    }

    const errorColor = (colors as any).error || '#E53935';

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            padding: space.lg,
            paddingBottom: 120,
        },
        logoutButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: space.lg,
            paddingVertical: space.md,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: errorColor,
            backgroundColor: 'transparent',
            gap: space.xs,
        },
        logoutText: {
            fontFamily: font.medium,
            fontSize: fontSize.md,
            color: errorColor,
        },
        verificationCard: {
            marginTop: space.md,
            padding: space.md,
            gap: space.sm,
            borderRadius: radius.md,
            backgroundColor: colors.white,
        },
        verificationTitle: {
            color: colors.text,
            fontFamily: font.semibold,
            fontSize: fontSize.md,
        },
        verificationDescription: {
            color: colors.textSecondary,
            fontFamily: font.regular,
            fontSize: fontSize.sm,
        },
        verificationFieldLabel: {
            color: colors.text,
            fontFamily: font.medium,
            fontSize: fontSize.sm,
        },
        verificationInput: {
            minHeight: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: space.md,
            color: colors.text,
        },
        verificationButton: {
            minHeight: 48,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: space.md,
            borderRadius: radius.md,
            backgroundColor: colors.primary,
        },
        verificationButtonText: {
            color: colors.white,
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            textAlign: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <AccountHeader
                title={editing ? 'Meus Dados' : 'Crie uma conta'}
                isCreating={!editing}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <AccountForm
                        isEditing={editing}
                        errors={errors}
                        {...form}
                        imageUri={imageUri}
                        onPickImage={handlePickImage}
                        avatarColor={avatarColor}
                        onChangeAvatarColor={handleAvatarColorChange}
                        useInitialAvatar={useInitialAvatar}
                        onChangeUseInitialAvatar={handleUseInitialAvatarChange}
                        loading={loading}
                        onChangeName={value => change('name', value)}
                        onChangeCpf={value => change('cpf', value)}
                        onChangeTelephone={value => change('telephone', value)}
                        onChangeEmail={value => change('email', value)}
                        onChangePassword={value => change('password', value)}
                        onChangeConfirmPassword={value => change('confirmPassword', value)}
                        onChangeCep={value => change('cep', value)}
                        onChangeCity={value => change('city', value)}
                        onChangeNeighborhood={value => change('neighborhood', value)}
                        onChangeRoad={value => change('road', value)}
                        onChangeNumber={value => change('number', value)}
                        onChangeComplement={value => change('complement', value)}
                        onSubmit={save}
                    />

                    {!editing && verificationRequested && (
                        <View style={styles.verificationCard}>
                            <Text style={styles.verificationTitle}>
                                Confirmação de e-mail
                            </Text>
                            <Text style={styles.verificationDescription}>
                                {emailVerified
                                    ? 'E-mail confirmado. Agora finalize o formulário para criar sua conta.'
                                    : 'Confirme seu e-mail antes de criar a conta para receber atualizações dos pedidos.'}
                            </Text>
                            {!emailVerified && (
                                <>
                                    <Text style={styles.verificationFieldLabel}>
                                        Código de confirmação
                                    </Text>
                                    <Text style={styles.verificationDescription}>
                                        Digite o código de 6 dígitos enviado para {form.email}.
                                    </Text>
                                    <TextInput
                                        value={verificationCode}
                                        onChangeText={value => setVerificationCode(value.replace(/\D/g, '').slice(0, 6))}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        placeholder="Digite o código"
                                        style={styles.verificationInput}
                                    />
                                    <Pressable
                                        style={styles.verificationButton}
                                        onPress={async () => {
                                            if (verificationCode.length !== 6) {
                                                showMessage('Código incompleto', 'Digite os 6 dígitos enviados para seu e-mail.', undefined, 'warning');
                                                return;
                                            }
                                            try {
                                                await confirmEmailVerification(form.email, verificationCode);
                                                setEmailVerified(true);
                                                showMessage('E-mail confirmado', 'Agora você pode concluir seu cadastro.', undefined, 'success');
                                            } catch (error: any) {
                                                showMessage('Código não confirmado', getEmailVerificationErrorMessage(error), undefined, 'error');
                                            }
                                        }}
                                    >
                                        <Text style={styles.verificationButtonText}>Confirmar e-mail</Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    )}

                    {editing && emailVerified === false && (
                        <View style={styles.verificationCard}>
                            <Text style={styles.verificationTitle}>
                                Confirmação de e-mail
                            </Text>
                            <Text style={styles.verificationDescription}>
                                Confirme seu e-mail uma vez para receber atualizações dos pedidos.
                            </Text>
                            {!verificationRequested ? (
                                <Pressable
                                    style={styles.verificationButton}
                                    onPress={async () => {
                                        try {
                                            await requestEmailVerification();
                                            setVerificationRequested(true);
                                            showMessage('Código enviado', 'Confira sua caixa de entrada.', undefined, 'success');
                                        } catch (error: any) {
                                            showMessage('Não foi possível enviar', error?.response?.data?.message ?? error?.message ?? 'Tente novamente mais tarde.', undefined, 'error');
                                        }
                                    }}
                                >
                                    <Text style={styles.verificationButtonText}>Enviar código de confirmação</Text>
                                </Pressable>
                            ) : (
                                <>
                                    <Text style={styles.verificationFieldLabel}>
                                        Código de confirmação
                                    </Text>
                                    <Text style={styles.verificationDescription}>
                                        Digite o código de 6 dígitos enviado para {form.email}.
                                    </Text>
                                    <TextInput
                                        value={verificationCode}
                                        onChangeText={value => setVerificationCode(value.replace(/\D/g, '').slice(0, 6))}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        placeholder="Digite o código"
                                        style={styles.verificationInput}
                                    />
                                    <Pressable
                                        style={styles.verificationButton}
                                        onPress={async () => {
                                            if (verificationCode.length !== 6) {
                                                showMessage('Código incompleto', 'Digite os 6 dígitos enviados para seu e-mail.', undefined, 'warning');
                                                return;
                                            }
                                            try {
                                                await confirmEmailVerification(form.email, verificationCode);
                                                setEmailVerified(true);
                                                showMessage('E-mail confirmado', 'Você receberá atualizações dos pedidos neste endereço.', undefined, 'success');
                                            } catch (error: any) {
                                                showMessage('Código não confirmado', getEmailVerificationErrorMessage(error), undefined, 'error');
                                            }
                                        }}
                                    >
                                        <Text style={styles.verificationButtonText}>Confirmar e-mail</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={async () => {
                                            try {
                                                await requestEmailVerification();
                                                showMessage('Novo código enviado', 'Confira sua caixa de entrada.', undefined, 'success');
                                            } catch (error: any) {
                                                showMessage('Não foi possível enviar', error?.response?.data?.message ?? error?.message ?? 'Tente novamente mais tarde.', undefined, 'error');
                                            }
                                        }}
                                    >
                                        <Text style={{ color: '#9B542E', textAlign: 'center' }}>Reenviar código</Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    )}

                    {editing && (
                        <View style={styles.verificationCard}>
                            <Text style={styles.verificationTitle}>
                                Alterar e-mail
                            </Text>
                            <Text style={styles.verificationDescription}>
                                O endereço atual só será substituído depois da confirmação do novo e-mail.
                            </Text>
                            <Text style={styles.verificationFieldLabel}>
                                Novo e-mail
                            </Text>
                            <TextInput
                                value={emailChange}
                                onChangeText={value => {
                                    setEmailChange(value);
                                    setEmailChangeRequested(false);
                                    setEmailChangeCode('');
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="Digite o novo e-mail"
                                style={styles.verificationInput}
                            />
                            {!emailChangeRequested ? (
                                <Pressable
                                    style={styles.verificationButton}
                                    onPress={async () => {
                                        if (!emailChange.trim()) {
                                            showMessage('E-mail necessário', 'Digite o novo endereço de e-mail para continuar.', undefined, 'warning');
                                            return;
                                        }
                                        try {
                                            await requestEmailChange(emailChange.trim());
                                            setEmailChangeRequested(true);
                                            showMessage('Código enviado', 'Confira o novo endereço de e-mail.', undefined, 'success');
                                        } catch (error: any) {
                                            showMessage('Não foi possível enviar', error?.response?.data?.message ?? error?.message ?? 'Tente novamente mais tarde.', undefined, 'error');
                                        }
                                    }}
                                >
                                    <Text style={styles.verificationButtonText}>Enviar código para o novo e-mail</Text>
                                </Pressable>
                            ) : (
                                <>
                                    <Text style={styles.verificationFieldLabel}>
                                        Código de confirmação
                                    </Text>
                                    <Text style={styles.verificationDescription}>
                                        Digite o código enviado para {emailChange.trim()}.
                                    </Text>
                                    <TextInput
                                        value={emailChangeCode}
                                        onChangeText={value => setEmailChangeCode(value.replace(/\D/g, '').slice(0, 6))}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        placeholder="Digite o código"
                                        style={styles.verificationInput}
                                    />
                                    <Pressable
                                        style={styles.verificationButton}
                                        onPress={async () => {
                                            if (emailChangeCode.length !== 6) {
                                                showMessage('Código incompleto', 'Digite os 6 dígitos enviados para o novo e-mail.', undefined, 'warning');
                                                return;
                                            }
                                            try {
                                                const result = await confirmEmailChange(emailChange.trim(), emailChangeCode);
                                                setForm(prev => ({ ...prev, email: result.email }));
                                                const storedUser = await AsyncStorage.getItem('@UrbanCandy:user');
                                                if (storedUser) {
                                                    const updatedUser = { ...JSON.parse(storedUser), email: result.email };
                                                    await AsyncStorage.setItem('@UrbanCandy:user', JSON.stringify(updatedUser));
                                                    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                                                }
                                                setEmailVerified(true);
                                                setEmailChange('');
                                                setEmailChangeCode('');
                                                setEmailChangeRequested(false);
                                                showMessage('E-mail atualizado', 'O novo endereço foi confirmado.', undefined, 'success');
                                            } catch (error: any) {
                                                showMessage('Não foi possível alterar', getEmailVerificationErrorMessage(error), undefined, 'error');
                                            }
                                        }}
                                    >
                                        <Text style={styles.verificationButtonText}>Confirmar novo e-mail</Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    )}

                    {editing && (
                        <Pressable style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons
                                name="log-out-outline"
                                size={22}
                                color={colors.danger ?? '#E53935'}
                            />
                            <Text style={styles.logoutText}>Sair da Conta</Text>
                        </Pressable>
                    )}
                </ScrollView>

                {editing && <Menu />}
            </KeyboardAvoidingView>
        </View>
    );
}