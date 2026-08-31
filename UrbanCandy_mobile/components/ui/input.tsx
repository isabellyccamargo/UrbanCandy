import { type TextInputProps, StyleSheet, Text, TextInput, View } from 'react-native';

export function Input({ label, style, ...props }: TextInputProps & { label: string }) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput placeholderTextColor="#999" style={[styles.input, style]} {...props} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        height: 52,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        backgroundColor: '#fff',
    },
});
