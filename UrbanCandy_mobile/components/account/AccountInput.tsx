import { StyleSheet, Text, View, TextInput, Pressable, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/Theme';

interface Props extends TextInputProps {
    label: string;
    isPassword?: boolean;
    showPassword?: boolean;
    onToggleShowPassword?: () => void;
}

export default function AccountInput({
    label,
    isPassword,
    showPassword,
    onToggleShowPassword,
    style,
    ...rest
}: Props) {
    const { colors, font, fontSize, radius, sizes, space } = useTheme();

    const styles = StyleSheet.create({
        container: {
            marginBottom: space.sm,
            width: '100%',
        },

        label: {
            fontFamily: font.medium,
            fontSize: fontSize.sm,
            color: colors.text,
            marginBottom: space.xs,
        },

        inputWrapper: {
            position: 'relative',
            width: '100%',
            justifyContent: 'center',
        },

        input: {
            height: sizes.inputHeight,
            backgroundColor: colors.white,
            borderRadius: radius.md,
            paddingHorizontal: space.md,
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.text,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },

        inputDisabled: {
            backgroundColor: colors.background,
            color: colors.textSecondary,
            elevation: 0,
            shadowOpacity: 0,
        },

        inputWithIcon: {
            paddingRight: 48,
        },

        eyeButton: {
            position: 'absolute',
            right: 12,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 6,
        },
    });

    const isEditable = rest.editable !== false;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        !isEditable && styles.inputDisabled,
                        isPassword && styles.inputWithIcon,
                        style,
                    ]}
                    placeholderTextColor={colors.textTertiary}
                    {...rest}
                />

                {isPassword && (
                    <Pressable
                        onPress={onToggleShowPassword}
                        style={styles.eyeButton}
                        hitSlop={10}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color={colors.textSecondary}
                        />
                    </Pressable>
                )}
            </View>
        </View>
    );
}