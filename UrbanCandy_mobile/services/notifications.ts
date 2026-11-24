import api from './api';

export type UserNotification = {
    id_notification: number;
    id_order: number;
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
};

export type NotificationsResponse = {
    notifications: UserNotification[];
    unreadCount: number;
};

export async function getMyNotifications(): Promise<NotificationsResponse> {
    const response = await api.get('/notificacoes');
    return response.data;
}

export async function markNotificationAsRead(id: number): Promise<void> {
    await api.patch(`/notificacoes/${id}/lida`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await api.patch('/notificacoes/lidas');
}
