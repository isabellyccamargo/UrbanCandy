import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/AuthContext';
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/Api';
import './NotificationCenter.css';

export function NotificationCenter() {
  const { user, setIsLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id_user || user?.id;
  const [notificationState, setNotificationState] = useState({
    userId: null,
    notifications: [],
    unreadCount: 0,
  });
  const [openForUserId, setOpenForUserId] = useState(null);
  const seenNotificationIds = useRef(new Set());
  const hasLoaded = useRef(false);
  const requestInProgress = useRef(false);
  const requestErrorLogged = useRef(false);

  const loadNotifications = useCallback(async () => {
    if (!userId || requestInProgress.current) return;

    requestInProgress.current = true;
    try {
      const { data } = await getMyNotifications();
      if (!Array.isArray(data.notifications) || !Number.isInteger(data.unreadCount)) {
        throw new Error('Resposta inválida ao carregar notificações.');
      }

      const incoming = data.notifications;
      if (hasLoaded.current) {
        const newNotification = incoming.find(
          (notification) =>
            !seenNotificationIds.current.has(notification.id_notification) &&
            !notification.read_at
        );
        if (newNotification) toast.info(newNotification.message);
      }

      seenNotificationIds.current = new Set(
        incoming.map((notification) => notification.id_notification)
      );
      hasLoaded.current = true;
      setNotificationState({
        userId,
        notifications: incoming,
        unreadCount: data.unreadCount,
      });
      requestErrorLogged.current = false;
    } catch (error) {
      if (!requestErrorLogged.current) {
        console.error('Não foi possível carregar as notificações:', error);
        toast.error('Não foi possível carregar suas notificações.');
        requestErrorLogged.current = true;
      }
    } finally {
      requestInProgress.current = false;
    }
  }, [userId]);

  useEffect(() => {
    seenNotificationIds.current.clear();
    hasLoaded.current = false;
    requestErrorLogged.current = false;
    if (!userId) return undefined;

    const initialLoad = setTimeout(() => void loadNotifications(), 0);
    const interval = setInterval(() => void loadNotifications(), 10_000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadNotifications, userId]);

  const openNotification = async (notification) => {
    try {
      if (!notification.read_at) {
        await markNotificationAsRead(notification.id_notification);
        const readAt = new Date().toISOString();
        setNotificationState((current) => {
          if (current.userId !== userId) return current;
          return {
            ...current,
            unreadCount: Math.max(0, current.unreadCount - 1),
            notifications: current.notifications.map((item) =>
              item.id_notification === notification.id_notification
                ? { ...item, read_at: readAt }
                : item
            ),
          };
        });
      }
      setOpenForUserId(null);
      navigate(`/pedidos?pedido=${notification.id_order}`);
    } catch (error) {
      console.error('Não foi possível abrir a notificação:', error);
      toast.error('Não foi possível abrir a notificação. Tente novamente.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      const readAt = new Date().toISOString();
      setNotificationState((current) =>
        current.userId === userId
          ? {
              ...current,
              unreadCount: 0,
              notifications: current.notifications.map((notification) => ({
                ...notification,
                read_at: notification.read_at || readAt,
              })),
            }
          : current
      );
    } catch (error) {
      console.error('Não foi possível marcar as notificações como lidas:', error);
      toast.error('Não foi possível atualizar as notificações.');
    }
  };

  const isOpen = Boolean(userId) && openForUserId === userId;
  const notifications =
    notificationState.userId === userId ? notificationState.notifications : [];
  const unreadCount = notificationState.userId === userId ? notificationState.unreadCount : 0;

  return (
    <div className="notification-center">
      <button
        className="notification-trigger"
        type="button"
        aria-label={
          userId
            ? `Notificações${unreadCount ? `, ${unreadCount} não lidas` : ''}`
            : 'Entre para ver notificações'
        }
        aria-expanded={isOpen}
        onClick={() => {
          if (!userId) {
            setIsLoginModalOpen(true);
            return;
          }
          setOpenForUserId(isOpen ? null : userId);
        }}
      >
        <Bell size={23} color="#5D4037" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <section className="notification-panel" aria-label="Central de notificações">
          <div className="notification-panel-header">
            <h2>Notificações</h2>
            {unreadCount > 0 && (
              <button type="button" onClick={() => void handleMarkAllAsRead()}>
                Marcar todas como lidas
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="notification-empty">Você ainda não tem notificações.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li key={notification.id_notification}>
                  <button
                    className={`notification-item${notification.read_at ? '' : ' is-unread'}`}
                    type="button"
                    onClick={() => void openNotification(notification)}
                  >
                    <span className="notification-item-title">{notification.title}</span>
                    <span>{notification.message}</span>
                    <time dateTime={notification.created_at}>
                      {new Date(notification.created_at).toLocaleString('pt-BR')}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
