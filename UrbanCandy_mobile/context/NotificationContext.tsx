import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppAlert } from '@/components/common/AppAlert';
import { useAuth } from '@/context/AuthContext';
import {
    getMyNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    type UserNotification,
} from '@/services/notifications';

type NotificationContextValue = {
    notifications: UserNotification[];
    unreadCount: number;
    loadNotifications: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { showMessage } = useAppAlert();
    const [notificationState, setNotificationState] = useState<{
        userId: number;
        notifications: UserNotification[];
        unreadCount: number;
    }>({ userId: 0, notifications: [], unreadCount: 0 });
    const seenNotificationIds = useRef(new Set<number>());
    const hasLoadedForUser = useRef(false);
    const requestInProgress = useRef(false);
    const requestErrorLogged = useRef(false);
    const authUserId = Number(user?.id_user || user?.id || 0);
    const [storedUserId, setStoredUserId] = useState(0);
    const userId = authUserId || storedUserId;

    useEffect(() => {
        let cancelled = false;

        if (authUserId) {
            return undefined;
        }

        const restoreUserId = async () => {
            try {
                const [storedUser, token] = await Promise.all([
                    AsyncStorage.getItem('@UrbanCandy:user').then(
                        (value) => value || AsyncStorage.getItem('user')
                    ),
                    AsyncStorage.getItem('@UrbanCandy:token').then(
                        (value) =>
                            value ||
                            AsyncStorage.getItem('user_token').then(
                                (fallback) => fallback || AsyncStorage.getItem('token')
                            )
                    ),
                ]);
                if (!cancelled && storedUser && token) {
                    const parsedUser = JSON.parse(storedUser);
                    setStoredUserId(Number(parsedUser?.id_user || parsedUser?.id || 0));
                } else if (!cancelled) {
                    setStoredUserId(0);
                }
            } catch (error) {
                console.error('Não foi possível restaurar a sessão para notificações:', error);
                if (!cancelled) setStoredUserId(0);
            }
        };

        void restoreUserId();
        return () => {
            cancelled = true;
        };
    }, [authUserId]);

    const loadNotifications = useCallback(async () => {
        if (!userId || requestInProgress.current) return;

        requestInProgress.current = true;
        try {
            const result = await getMyNotifications();
            const incoming = result.notifications || [];

            if (hasLoadedForUser.current) {
                const newlyArrived = incoming.find(
                    (item) =>
                        !seenNotificationIds.current.has(item.id_notification) &&
                        !item.read_at
                );
                if (newlyArrived) {
                    showMessage({
                        title: newlyArrived.title,
                        message: newlyArrived.message,
                        type: 'success',
                    });
                }
            }

            seenNotificationIds.current = new Set(
                incoming.map((item) => item.id_notification)
            );
            hasLoadedForUser.current = true;
            setNotificationState({
                userId,
                notifications: incoming,
                unreadCount: result.unreadCount || 0,
            });
            requestErrorLogged.current = false;
        } catch (error) {
            if (!requestErrorLogged.current) {
                console.error('Não foi possível carregar as notificações:', error);
                requestErrorLogged.current = true;
            }
        } finally {
            requestInProgress.current = false;
        }
    }, [showMessage, userId]);

    useEffect(() => {
        seenNotificationIds.current.clear();
        hasLoadedForUser.current = false;
        requestErrorLogged.current = false;

        if (!userId) return undefined;

        const initialLoad = setTimeout(() => {
            void loadNotifications();
        }, 0);
        const interval = setInterval(() => {
            if (AppState.currentState === 'active') {
                void loadNotifications();
            }
        }, 10_000);

        const appStateListener = AppState.addEventListener(
            'change',
            (state: AppStateStatus) => {
                if (state === 'active') void loadNotifications();
            }
        );

        return () => {
            clearTimeout(initialLoad);
            clearInterval(interval);
            appStateListener.remove();
        };
    }, [loadNotifications, userId]);

    const markAsRead = useCallback(async (id: number) => {
        await markNotificationAsRead(id);
        const readAt = new Date().toISOString();
        setNotificationState((current) => {
            if (current.userId !== userId) return current;
            const notification = current.notifications.find(
                (item) => item.id_notification === id
            );
            return {
                ...current,
                unreadCount: Math.max(
                    0,
                    current.unreadCount - (notification && !notification.read_at ? 1 : 0)
                ),
                notifications: current.notifications.map((item) =>
                    item.id_notification === id ? { ...item, read_at: readAt } : item
                ),
            };
        });
    }, [userId]);

    const markAllAsRead = useCallback(async () => {
        await markAllNotificationsAsRead();
        const readAt = new Date().toISOString();
        setNotificationState((current) =>
            current.userId === userId
                ? {
                      ...current,
                      unreadCount: 0,
                      notifications: current.notifications.map((item) => ({
                          ...item,
                          read_at: item.read_at || readAt,
                      })),
                  }
                : current
        );
    }, [userId]);

    const notifications =
        notificationState.userId === userId ? notificationState.notifications : [];
    const unreadCount = notificationState.userId === userId ? notificationState.unreadCount : 0;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loadNotifications,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications deve ser usado dentro de NotificationProvider.');
    }
    return context;
}
