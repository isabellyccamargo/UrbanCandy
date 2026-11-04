
import { Image } from 'expo-image';
import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/context/Theme';

import AccountInput from './AccountInput';

type Props = {
    isEditing: boolean;
    errors: Set<string>;

    imageUri?: string | null;
    onPickImage?: () => void;
    avatarColor: 'dark' | 'pink';
    onChangeAvatarColor: (color: 'dark' | 'pink') => void;
    useInitialAvatar: boolean;
    onChangeUseInitialAvatar: (enabled: boolean) => void;

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
    errors,


    imageUri,
    onPickImage,
    avatarColor,
    onChangeAvatarColor,
    useInitialAvatar,
    onChangeUseInitialAvatar,

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
    const { colors, font, fontSize, space } = useTheme();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const styles = StyleSheet.create({
        container: {
            width: '100%',
        },

        avatarContainer: {
            alignItems: 'center',
            marginBottom: space.md,
        },

        avatarPressable: {
            position: 'relative',
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: avatarColor === 'pink' ? '#D63384' : '#222222',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: avatarColor === 'pink' ? '#D63384' : '#222222',
        },

        avatarImage: {
            width: '100%' as const,
            height: '100%' as const,
            borderRadius: 50,
        },

        avatarInitial: {
            color: '#FFFFFF',
            fontFamily: font.bold,
            fontSize: 42,
        },

        cameraBadge: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: colors.primary,
            padding: 6,
            borderRadius: 15,
        },

        avatarText: {
            marginTop: space.xs,
            fontFamily: font.medium,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
        },

        avatarColorOptions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: space.sm,
            marginTop: space.sm,
        },

        avatarColorOption: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.xs,
            paddingHorizontal: space.sm,
            paddingVertical: space.xs,
            borderWidth: 1,
            borderColor: colors.border || '#DDDDDD',
            borderRadius: 18,
        },

        avatarColorOptionSelected: {
            borderColor: colors.text,
            borderWidth: 2,
        },

        avatarColorOptionDisabled: {
            backgroundColor: '#F3F3F3',
            borderColor: '#E5E5E5',
            opacity: 0.55,
        },

        avatarColorSwatch: {
            width: 16,
            height: 16,
            borderRadius: 8,
        },

        avatarColorLabel: {
            color: colors.text,
            fontFamily: font.medium,
            fontSize: fontSize.xs,
        },

        avatarModeOption: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.xs,
            marginTop: space.sm,
        },

        avatarModeOptionDisabled: {
            opacity: 0.55,
        },

        avatarModeCheckbox: {
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.textSecondary,
            borderRadius: 4,
        },

        avatarModeCheckboxSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
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
            {onPickImage && (
                <View style={styles.avatarContainer}>
                    <Pressable
                        style={styles.avatarPressable}
                        onPress={onPickImage}
                    >
                        {imageUri && !useInitialAvatar ? (
                            <Image
                                source={imageUri}
                                style={styles.avatarImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                transition={150}
                            />
                        ) : (
                            <Text style={styles.avatarInitial}>
                                {name.trim().charAt(0).toUpperCase() || '?'}
                            </Text>
                        )}
                        <View style={styles.cameraBadge}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </View>
                    </Pressable>
                    <Text style={styles.avatarText}>Alterar foto de perfil</Text>
                    <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{
                            checked: useInitialAvatar,
                            disabled: !name.trim(),
                        }}
                        disabled={!name.trim()}
                        onPress={() => onChangeUseInitialAvatar(!useInitialAvatar)}
                        style={[
                            styles.avatarModeOption,
                            !name.trim() && styles.avatarModeOptionDisabled,
                        ]}
                    >
                        <View style={[
                            styles.avatarModeCheckbox,
                            useInitialAvatar && styles.avatarModeCheckboxSelected,
                        ]}>
                            {useInitialAvatar && (
                                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            )}
                        </View>
                        <Text style={styles.avatarColorLabel}>
                            Usar inicial no lugar da foto
                        </Text>
                    </Pressable>
                    <View style={styles.avatarColorOptions}>
                        {[
                            { value: 'dark' as const, label: 'Preto e branco' },
                            { value: 'pink' as const, label: 'Rosa' },
                        ].map(option => (
                            <Pressable
                                key={option.value}
                                accessibilityRole="radio"
                                accessibilityState={{
                                    selected: avatarColor === option.value,
                                    disabled: !useInitialAvatar || !name.trim(),
                                }}
                                disabled={!useInitialAvatar || !name.trim()}
                                onPress={() => onChangeAvatarColor(option.value)}
                                style={[
                                    styles.avatarColorOption,
                                    avatarColor === option.value && styles.avatarColorOptionSelected,
                                    (!useInitialAvatar || !name.trim()) && styles.avatarColorOptionDisabled,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.avatarColorSwatch,
                                        { backgroundColor: option.value === 'pink' ? '#D63384' : '#222222' },
                                    ]}
                                />
                                <Text style={styles.avatarColorLabel}>{option.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}

            <AccountInput
                label="Nome"
                value={name}
                onChangeText={onChangeName}
                placeholder="Digite seu nome completo"
                error={errors.has('name')}
            />

            <View style={styles.row}>
                <View style={styles.half}>
                    <AccountInput
                        label="CPF"
                        value={cpf}
                        onChangeText={value =>
                            onChangeCpf(formatCPF(value))
                        }
                        placeholder="000.000.000-00"
                        keyboardType="numeric"
                        editable={!isEditing}
                        error={errors.has('cpf')}
                    />
                </View>

                <View style={styles.half}>
                    <AccountInput
                        label="Telefone"
                        value={telephone}
                        onChangeText={value =>
                            onChangeTelephone(formatTelephone(value))
                        }
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                        error={errors.has('telephone')}
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
                error={errors.has('email')}
            />

            {!isEditing && (
                <>
                    <AccountInput
                        label="Senha"
                        value={password}
                        onChangeText={onChangePassword}
                        placeholder="Digite sua senha"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        isPassword
                        showPassword={showPassword}
                        onToggleShowPassword={() => setShowPassword(prev => !prev)}
                        error={errors.has('password')}
                    />

                    <AccountInput
                        label="Confirmar senha"
                        value={confirmPassword}
                        onChangeText={onChangeConfirmPassword}
                        placeholder="Digite sua senha novamente"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        isPassword
                        showPassword={showConfirmPassword}
                        onToggleShowPassword={() => setShowConfirmPassword(prev => !prev)}
                        error={errors.has('confirmPassword')}
                    />
                </>
            )}
        </View>
    );
}