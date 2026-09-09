import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/context/Theme';
import { useAppAlert } from '@/components/common/AppAlert';
import { Menu } from '@/components/home/Menu';

import {
    getUserProfile,
    createUser,
    updateUser,
} from '@/services/auth';
import { updateAddress } from '@/services/address';
import api from '@/services/api';

import AccountHeader from '@/components/account/AccountHeader';
import AccountForm from '@/components/account/AccountForm';

function getFullImageUrl(imagePath?: string | null) {
    if (!imagePath) return null;

    if (imagePath.startsWith('file://') || imagePath.startsWith('content://')) {
        return imagePath;
    }

    // Pega o baseURL ex: http://192.168.1.101:3000/api ou http://192.168.1.101:3000
    const rawBaseURL = api.defaults.baseURL || 'http://192.168.1.101:3000';

    // Remove o sufixo '/api' do final da URL se ele existir, pois imagens estáticas ficam na raiz do Express
    const cleanBaseURL = rawBaseURL.replace(/\/api\/?$/, '').replace(/\/$/, '');

    // Garante que o caminho da imagem comece com '/'
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    const fullUrl = `${cleanBaseURL}${cleanPath}`;

    console.log('URL RESTRUTURADA DA FOTO:', fullUrl);

    return `${fullUrl}?t=${Date.now()}`;
}

export default function CadastroScreen() {
    const router = useRouter();
    const { colors, font, fontSize, space, radius } = useTheme();
    const { showMessage } = useAppAlert();
    const { mode } = useLocalSearchParams<{ mode?: string }>();

    const isCreating = mode === 'create';

    const [checking, setChecking] = useState(!isCreating);
    const [authenticated, setAuthenticated] = useState(isCreating);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Guardar a URI local/remota da imagem
    const [imageUri, setImageUri] = useState<string | null>(null);

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

    useEffect(() => {
        initialize();
    }, [mode]);

    const change = (field: keyof typeof form, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
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

    async function initialize() {
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
    }

    async function loadAccount() {
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
            }
        } catch (error) {
            console.error('Erro crítico no loadAccount:', error);
            setAuthenticated(false);
        }
    }

    async function handleLogout() {
        try {
            setImageUri(null);
            await AsyncStorage.multiRemove([
                '@UrbanCandy:token',
                'token',
                '@UrbanCandy:user',
                'user',
            ]);
            router.replace('/welcome' as any);
        } catch (error) {
            showMessage(
                'Erro',
                'Não foi possível sair da conta.',
                undefined,
                'error'
            );
        }
    }

    function validate() {
        const required = [
            form.name,
            form.cpf,
            form.telephone,
            form.email,
            form.cep,
            form.city,
            form.neighborhood,
            form.road,
            form.number,
        ];

        if (required.some(value => !value.trim())) {
            showMessage(
                'Atenção',
                'Preencha todos os campos obrigatórios.',
                undefined,
                'warning'
            );
            return false;
        }

        if (!editing) {
            if (!form.password.trim()) {
                showMessage(
                    'Atenção',
                    'Informe uma senha para continuar.',
                    undefined,
                    'warning'
                );
                return false;
            }

            if (!form.confirmPassword.trim()) {
                showMessage(
                    'Atenção',
                    'Confirme sua senha.',
                    undefined,
                    'warning'
                );
                return false;
            }

            if (form.password !== form.confirmPassword) {
                showMessage(
                    'Atenção',
                    'As senhas não coincidem.',
                    undefined,
                    'warning'
                );
                return false;
            }
        }

        return true;
    }

    async function save() {
        if (!validate()) return;

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

                setImageUri(null);

                showMessage(
                    'Cadastro realizado',
                    'Seu cadastro foi realizado com sucesso!',
                    undefined,
                    'success'
                );

                setTimeout(() => {
                    router.replace('/login' as any);
                }, 1500);

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
                        {...form}
                        imageUri={imageUri}
                        onPickImage={handlePickImage}
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

                    {editing && (
                        <Pressable style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons
                                name="log-out-outline"
                                size={22}
                                color={colors.error ?? '#E53935'}
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