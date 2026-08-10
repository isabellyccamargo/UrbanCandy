import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';


const { height } = Dimensions.get('window');

export default function IndexScreen() {
    const router = useRouter();

    const translateY = useRef(
        new Animated.Value(height * 0.5)
    ).current;

    const opacity = useRef(
        new Animated.Value(0)
    ).current;

    const scale = useRef(
        new Animated.Value(0.85)
    ).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 900,
                useNativeDriver: true,
            }),

            Animated.timing(opacity, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),

            Animated.spring(scale, {
                toValue: 1,
                friction: 7,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            router.replace('/welcome');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router, opacity, scale, translateY]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.logoWrapper,
                    {
                        opacity,
                        transform: [
                            { translateY },
                            { scale },
                        ],
                    },
                ]}
            >
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            <StatusBar style="dark" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3D6E7',
    },

    logoWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    logo: {
        width: 260,
        height: 260,
    },
});