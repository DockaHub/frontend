import api from './api';

const decodeVapidKey = (value: string) => {
    const padding = '='.repeat((4 - value.length % 4) % 4);
    const raw = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from([...raw].map(character => character.charCodeAt(0)));
};

export const isWebPushSupported = () =>
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export const getWebPushState = async () => {
    if (!isWebPushSupported()) return { supported: false, active: false, permission: 'denied' as NotificationPermission };
    const registration = await navigator.serviceWorker.register('/sw.js');
    const subscription = await registration.pushManager.getSubscription();
    return { supported: true, active: Boolean(subscription), permission: Notification.permission };
};

export const enableWebPush = async () => {
    if (!isWebPushSupported()) throw new Error('Este navegador não oferece Web Push.');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permissão de notificações não concedida.');

    const registration = await navigator.serviceWorker.register('/sw.js');
    const { data } = await api.get<{ publicKey: string }>('/notifications/push/public-key');
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: decodeVapidKey(data.publicKey),
        });
    }
    await api.post('/notifications/push/subscribe', subscription.toJSON());
};

export const disableWebPush = async () => {
    if (!isWebPushSupported()) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    await api.delete('/notifications/push/subscribe', { data: { endpoint: subscription.endpoint } });
    await subscription.unsubscribe();
};
