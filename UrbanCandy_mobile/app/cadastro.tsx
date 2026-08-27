import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '@/context/Theme';
import { useAppAlert } from '@/components/common/AppAlert';
import { Menu } from '@/components/home/Menu';

import {
    getUserProfile,
    createUser,
    updateUser,
} from '@/services/auth';
import { updateAddress } from '@/services/address';

import AccountHeader from '@/components/account/AccountHeader';
import AccountForm from '@/components/account/AccountForm';

export default function CadastroScreen() {
    const router = useRouter();
    const { colors, space } = useTheme();
    const { showMessage } = useAppAlert();
    const { mode } = useLocalSearchParams<{ mode?: string }>();

    const isCreating = mode === 'create';

    const [checking, setChecking] = useState(!isCreating);
    const [authenticated, setAuthenticated] = useState(isCreating);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const change = (
        field: keyof typeof form,
        value: string
    ) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    async function initialize() {
        if (isCreating) {
            setEditing(false);
            setAuthenticated(true);
            setChecking(false);
            return;
        }

        try {
            const token = await AsyncStorage.getItem(
                '@UrbanCandy:token'
            );

            if (!token) {
                setAuthenticated(false);
                return;
            }

            setAuthenticated(true);
            await loadAccount();
        } catch {
            setAuthenticated(false);
        } finally {
            setChecking(false);
        }
    }

    async function loadAccount() {
        try {
            const stored = await AsyncStorage.getItem(
                '@UrbanCandy:user'
            );

            if (!stored) {
                setAuthenticated(false);
                return;
            }

            const user = JSON.parse(stored);

            if (!user?.id_user) {
                setAuthenticated(false);
                return;
            }

            const profile = await getUserProfile(user.id_user);

            const people = profile.people ?? profile;
            const address =
                people.address ??
                profile.address ??
                people.address?.[0];

            setEditing(true);

            setIds({
                user: user.id_user,
                people: people.id_people ?? null,
                address: address?.id_address ?? null,
            });

            setForm({
                name: people.name ?? '',
                cpf: people.cpf ?? '',
                telephone:
                    people.telephone ??
                    people.phone ??
                    '',
                email: profile.email ?? '',
                password: '',
                confirmPassword: '',
                cep: address?.cep ?? '',
                city: address?.city ?? '',
                neighborhood: address?.neighborhood ?? '',
                road: address?.road ?? '',
                number:
                    address?.number != null
                        ? String(address.number)
                        : '',
                complement: address?.complement ?? '',
            });
        } catch {
            showMessage(
                'Erro',
                'Não foi possível carregar seus dados.',
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
                const { confirmPassword, ...userData } = form;

                await createUser({
                    ...userData,
                    cpf: form.cpf.replace(/\D/g, ''),
                    telephone: form.telephone.replace(/\D/g, ''),
                    cep: form.cep.replace(/\D/g, ''),
                    number: Number(form.number),
                });

                showMessage(
                    'Cadastro realizado',
                    'Seu cadastro foi realizado com sucesso!',
                    undefined,
                    'success'
                );

                setTimeout(() => {
                    router.replace('/login');
                }, 1500);

                return;
            }

            if (!ids.user) {
                showMessage(
                    'Erro',
                    'Usuário não encontrado.',
                    undefined,
                    'error'
                );
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

            const stored = await AsyncStorage.getItem(
                '@UrbanCandy:user'
            );

            if (stored) {
                const user = JSON.parse(stored);

                await AsyncStorage.setItem(
                    '@UrbanCandy:user',
                    JSON.stringify({
                        ...user,
                        name: form.name.trim(),
                    })
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            padding: space.lg,
            paddingBottom: 120,
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
                        loading={loading}
                        onChangeName={value => change('name', value)}
                        onChangeCpf={value => change('cpf', value)}
                        onChangeTelephone={value =>
                            change('telephone', value)
                        }
                        onChangeEmail={value =>
                            change('email', value)
                        }
                        onChangePassword={value =>
                            change('password', value)
                        }
                        onChangeConfirmPassword={value =>
                            change('confirmPassword', value)
                        }
                        onChangeCep={value => change('cep', value)}
                        onChangeCity={value => change('city', value)}
                        onChangeNeighborhood={value =>
                            change('neighborhood', value)
                        }
                        onChangeRoad={value =>
                            change('road', value)
                        }
                        onChangeNumber={value =>
                            change('number', value)
                        }
                        onChangeComplement={value =>
                            change('complement', value)
                        }
                        onSubmit={save}
                    />
                </ScrollView>

                {editing && <Menu />}
            </KeyboardAvoidingView>
        </View>
    );
}  