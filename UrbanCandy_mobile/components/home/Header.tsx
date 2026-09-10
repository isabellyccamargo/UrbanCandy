import React, { useState, useCallback } from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { useTheme } from '@/context/Theme';
import { api } from '@/services/api'; 
import { getUserProfile } from '@/services/auth'; 

function getFullImageUrl(imagePath?: string | null) {
    if (!imagePath) return null;

    if (imagePath.startsWith('file://') || imagePath.startsWith('content://')) {
        return imagePath;
    }

    const rawBaseURL = api?.defaults?.baseURL || 'http://172.20.10.3:3000';
    const cleanBaseURL = rawBaseURL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${cleanBaseURL}${cleanPath}?t=${Date.now()}`;
}

export function HomeHeader() {
    const {
        colors,
        fontSize,
        font,
        space,
        radius,
    } = useTheme();

    const router = useRouter();
    const [userName, setUserName] = useState<string>('Visitante');
    const [userImage, setUserImage] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            async function loadUserData() {
                try {
                    const stored =
                        (await AsyncStorage.getItem('@UrbanCandy:user')) ||
                        (await AsyncStorage.getItem('user'));

                    if (stored) {
                        const user = JSON.parse(stored);

                        // Nome vindo do AsyncStorage
                        const fullName = user?.nome || user?.name || user?.people?.name || 'Visitante';
                        const firstName = fullName.trim().split(' ')[0];
                        setUserName(firstName);

                        const userId = user?.id_user || user?.id;

                        if (userId) {
                            try {
                                // Usa exatamente o mesmo serviço que a tela de cadastro usa!
                                const profile = await getUserProfile(userId);
                                const people = profile?.people ?? profile ?? {};

                                const rawImage =
                                    people?.image ||
                                    people?.foto ||
                                    profile?.image ||
                                    profile?.foto ||
                                    null;

                                const formattedUrl = getFullImageUrl(rawImage);
                                setUserImage(formattedUrl);
                            } catch (apiError) {
                                console.log('Erro ao buscar foto do usuário na API:', apiError);
                            }
                        }
                    }
                } catch (error) {
                    console.log('Erro ao carregar dados do usuário no header:', error);
                }
            }

            loadUserData();
        }, [])
    );

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

        headerCard: {
            width: '100%',
            backgroundColor: colors.white,
            borderRadius: radius.xl,

            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',

            paddingHorizontal: space.md,
            paddingVertical: space.sm,

            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },

        textContainer: {
            flex: 1,
            marginRight: 8,
        },

        greetingText: {
            fontFamily: font?.semibold || 'System',
            fontSize: fontSize.md,
            color: colors.text,
        },

        subtitleText: {
            fontFamily: font?.medium || 'System',
            fontSize: fontSize.xs || 12,
            color: colors.textSecondary || '#777',
            marginTop: 2,
        },

        avatarPressable: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.background || '#F0F0F0',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: colors.primary,
        },

        avatarImage: {
            width: '100%',
            height: '100%',
            borderRadius: 22,
        },
    });

    const handleProfilePress = () => {
        router.push('/cadastro' as any);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerCard}>
                <View style={styles.textContainer}>
                    <Text style={styles.greetingText} numberOfLines={1}>
                        Olá, {userName} 👋
                    </Text>
                    <Text style={styles.subtitleText} numberOfLines={1}>
                        O que vamos pedir hoje?
                    </Text>
                </View>

                <Pressable
                    style={styles.avatarPressable}
                    onPress={handleProfilePress}
                >
                    {userImage ? (
                        <Image
                            source={{ uri: userImage }}
                            style={styles.avatarImage}
                            resizeMode="cover"
                            onError={() => setUserImage(null)}
                        />
                    ) : (
                        <Ionicons
                            name="person"
                            size={20}
                            color={colors.primary}
                        />
                    )}
                </Pressable>
            </View>
        </View>
    );
}