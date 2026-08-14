import {
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/context/Theme';

export function HomeHeader() {
    const {
        colors,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({

        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,

            flexDirection: 'row',
            alignItems: 'center',

            paddingHorizontal: space.xl,
            paddingTop: 60,
        },

        searchContainer: {
            width: '100%',
            height: 40,

            backgroundColor: colors.white,
            borderRadius: radius.xl,

            flexDirection: 'row',
            alignItems: 'center',

            paddingHorizontal: space.md,
        },

        input: {
            flex: 1,
            height: '100%',

            marginLeft: 6,

            fontSize: fontSize.md,
            color: colors.text,
        },

    });

    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>

                <Ionicons
                    name="search-outline"
                    size={24}
                    color={colors.text}
                />

                <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={colors.textTertiary}
                    returnKeyType="search"
                />

            </View>

        </View>
    );
}