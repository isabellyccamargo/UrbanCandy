import {
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export function HomeHeader() {

    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>

                <Ionicons
                    name="search-outline"
                    size={24}
                    color="#000000"
                />

                <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor="#777777"
                    returnKeyType="search"
                />

            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 20,
        paddingTop: 60,
    },

    searchContainer: {
        width: '100%',
        height: 40,

        backgroundColor: '#FFFFFF',
        borderRadius: 22,

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 12,
    },

    input: {
        flex: 1,
        height: '100%',

        marginLeft: 6,

        fontSize: 16,
        color: '#3B1E36',
    },

});