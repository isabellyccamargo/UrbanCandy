import { type PressableProps, Pressable, StyleSheet, Text } from 'react-native';

export function Button({
    title,
    style,
    variant = 'primary',
    ...props
}: PressableProps & { title: string; variant?: 'primary' | 'secondary' }) {
    return (
        <Pressable
            style={[styles.button, variant === 'secondary' ? styles.secondary : styles.primary, style]}
            {...props}
        >
            <Text style={[styles.text, variant === 'secondary' ? styles.secondaryText : styles.primaryText]}>
                {title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
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
        fontWeight: '700',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#DD2E8A',
    },
});
