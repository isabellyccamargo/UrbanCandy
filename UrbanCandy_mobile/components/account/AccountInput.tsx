
import {
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useTheme } from '@/context/Theme';

type Props = {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    secureTextEntry?: boolean;
    editable?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export default function AccountInput({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    secureTextEntry = false,
    editable = true,
    autoCapitalize = 'sentences',
}: Props) {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        container: {
            marginBottom: space.md,
        },

        label: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.text,
            marginBottom: space.xs,
        },

        input: {
            height: 48,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: space.md,
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.text,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },

        disabled: {
            backgroundColor: colors.background,
            color: colors.textTertiary,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
            </Text>

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textTertiary}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                editable={editable}
                autoCapitalize={autoCapitalize}
                style={[
                    styles.input,
                    !editable && styles.disabled,
                ]}
            />
        </View>
    );
}
