import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/context/Theme';
import { useNotifications } from '@/context/NotificationContext';
import { useAppAlert } from '@/components/common/AppAlert';
import { Menu } from '@/components/home/Menu';
import type { UserNotification } from '@/services/notifications';

export default function NotificationsScreen() {
    const { colors, font, fontSize, space, radius } = useTheme();
    const { notifications, loadNotifications, markAsRead, markAllAsRead } = useNotifications();
    const { showMessage } = useAppAlert();
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);

    useFocusEffect(
        useCallback(() => {
            let active = true;
            setLoading(true);
            void loadNotifications().finally(() => {
                if (active) setLoading(false);
            });
            return () => {
                active = false;
            };
        }, [loadNotifications])
    );

    const openNotification = async (notification: UserNotification) => {
        try {
            if (!notification.read_at) {
                await markAsRead(notification.id_notification);
            }
            router.push('/protected/orders');
        } catch (error) {
            console.error('Não foi possível abrir a notificação:', error);
            showMessage({
                title: 'Não foi possível abrir',
                message: 'Tente novamente em alguns instantes.',
                type: 'error',
            });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
        } catch (error) {
            console.error('Não foi possível marcar as notificações como lidas:', error);
            showMessage({
                title: 'Erro',
                message: 'Não foi possível atualizar as notificações.',
                type: 'error',
            });
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            minHeight: 125,
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 40,
            paddingHorizontal: space.xl,
        },
        backButton: {
            width: 40,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: space.sm,
        },
        headerText: {
            flex: 1,
        },
        title: {
            fontFamily: font.semibold,
            fontSize: fontSize.xxl,
            color: colors.white,
        },
        subtitle: {
            fontFamily: font.regular,
            color: colors.white,
            fontSize: fontSize.sm,
            marginTop: 2,
        },
        markAll: {
            padding: space.sm,
        },
        markAllText: {
            fontFamily: font.semibold,
            fontSize: fontSize.xs,
            color: colors.white,
            textAlign: 'right',
        },
        list: {
            padding: space.lg,
            paddingBottom: 120,
        },
        notification: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            backgroundColor: colors.white,
            borderRadius: radius.lg,
            padding: space.lg,
            marginBottom: space.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        unread: {
            borderColor: colors.primary,
            backgroundColor: '#FFF8FC',
        },
        notificationIcon: {
            width: 42,
            height: 42,
            borderRadius: radius.circle,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.secondary,
            marginRight: space.md,
        },
        notificationBody: {
            flex: 1,
        },
        notificationTitle: {
            fontFamily: font.semibold,
            fontSize: fontSize.md,
            color: colors.text,
        },
        notificationMessage: {
            fontFamily: font.regular,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            marginTop: space.xs,
            lineHeight: 18,
        },
        timestamp: {
            fontFamily: font.regular,
            fontSize: fontSize.xs,
            color: colors.textTertiary,
            marginTop: space.sm,
        },
        unreadDot: {
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: colors.primary,
            marginLeft: space.sm,
            marginTop: 5,
        },
        empty: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: space.xxxl,
            paddingTop: 100,
        },
        emptyText: {
            fontFamily: font.medium,
            fontSize: fontSize.md,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: space.md,
        },
        loading: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    const renderNotification = ({ item }: { item: UserNotification }) => (
        <Pressable
            accessibilityRole="button"
            onPress={() => void openNotification(item)}
            style={[styles.notification, !item.read_at && styles.unread]}
        >
            <View style={styles.notificationIcon}>
                <Ionicons name="cube" size={21} color={colors.primary} />
            </View>
            <View style={styles.notificationBody}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.timestamp}>
                    {new Date(item.created_at).toLocaleString('pt-BR')}
                </Text>
            </View>
            {!item.read_at && <View style={styles.unreadDot} />}
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={25} color={colors.white} />
                </Pressable>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Notificações</Text>
                    <Text style={styles.subtitle}>Acompanhe seus pedidos</Text>
                </View>
                {notifications.some((item) => !item.read_at) && (
                    <Pressable onPress={() => void handleMarkAllAsRead()} style={styles.markAll}>
                        <Text style={styles.markAllText}>Marcar{'\n'}como lidas</Text>
                    </Pressable>
                )}
            </View>

            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="notifications-off-outline" size={48} color={colors.textTertiary} />
                    <Text style={styles.emptyText}>Você ainda não tem notificações.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => String(item.id_notification)}
                    renderItem={renderNotification}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Menu />
        </View>
    );
}
