import {
    StyleSheet,
    View,
} from 'react-native';

import { useTheme } from '@/context/Theme';

import AccountInput from './AccountInput';

type Props = {
    isEditing: boolean;

    name: string;
    cpf: string;
    telephone: string;
    email: string;

    password: string;
    confirmPassword: string;

    onChangeName: (value: string) => void;
    onChangeCpf: (value: string) => void;
    onChangeTelephone: (value: string) => void;
    onChangeEmail: (value: string) => void;

    onChangePassword: (value: string) => void;
    onChangeConfirmPassword: (value: string) => void;
};

export default function PersonalDataForm({
    isEditing,

    name,
    cpf,
    telephone,
    email,

    password,
    confirmPassword,

    onChangeName,
    onChangeCpf,
    onChangeTelephone,
    onChangeEmail,

    onChangePassword,
    onChangeConfirmPassword,
}: Props) {
    const { space } = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: '100%',
        },

        row: {
            flexDirection: 'row',
            gap: space.md,
        },

        half: {
            flex: 1,
        },
    });

    function formatCPF(value: string) {
        const numbers = value
            .replace(/\D/g, '')
            .slice(0, 11);

        if (numbers.length <= 3) {
            return numbers;
        }

        if (numbers.length <= 6) {
            return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        }

        if (numbers.length <= 9) {
            return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
        }

        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }

    function formatTelephone(value: string) {
        const numbers = value
            .replace(/\D/g, '')
            .slice(0, 11);

        if (numbers.length <= 2) {
            return numbers;
        }

        if (numbers.length <= 7) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        }

        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }

    return (
        <View style={styles.container}>
            <AccountInput
                label="Nome"
                value={name}
                onChangeText={onChangeName}
                placeholder="Digite seu nome completo"
            />

            <View style={styles.row}>
                <View style={styles.half}>
                    <AccountInput
                        label="CPF"
                        value={cpf}
                        onChangeText={value =>
                            onChangeCpf(
                                formatCPF(value)
                            )
                        }
                        placeholder="000.000.000-00"
                        keyboardType="numeric"
                        editable={!isEditing}
                    />
                </View>

                <View style={styles.half}>
                    <AccountInput
                        label="Telefone"
                        value={telephone}
                        onChangeText={value =>
                            onChangeTelephone(
                                formatTelephone(value)
                            )
                        }
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                    />
                </View>
            </View>

            <AccountInput
                label="E-mail"
                value={email}
                onChangeText={onChangeEmail}
                placeholder="Digite seu e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isEditing}
            />
            {!isEditing && (
                <>
                    <AccountInput
                        label="Senha"
                        value={password}
                        onChangeText={onChangePassword}
                        placeholder="Digite sua senha"
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <AccountInput
                        label="Confirmar senha"
                        value={confirmPassword}
                        onChangeText={
                            onChangeConfirmPassword
                        }
                        placeholder="Digite sua senha novamente"
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </>
            )}
        </View>
    );
}