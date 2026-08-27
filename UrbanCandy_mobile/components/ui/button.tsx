import {
    Pressable,
    StyleSheet,
    Text,
    type PressableProps,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { Fonts } from '@/constants/fonts';

type ButtonProps = PressableProps & {
    title: string;
    variant?: 'primary' | 'secondary';
    style?: StyleProp<ViewStyle>;
};

export function Button({
    title,
    style,
    variant = 'primary',
    ...props
}: ButtonProps) {
    return (
        <Pressable
            {...props}
            style={[
                styles.button,
                variant === 'secondary'
                    ? styles.secondary
                    : styles.primary,
                style,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    variant === 'secondary'
                        ? styles.secondaryText
                        : styles.primaryText,
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    primary: {
        backgroundColor: '#DD2E8A',
    },

    secondary: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DD2E8A',
    },

    text: {
        fontSize: 16,
        fontFamily: Fonts.bold,
    },

    primaryText: {
        color: '#FFFFFF',
    },

    secondaryText: {
        color: '#DD2E8A',
    },
});