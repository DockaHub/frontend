self.addEventListener('push', event => {
    if (!event.data) return;
    event.waitUntil((async () => {
        const payload = event.data.json();
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        if (windows.some(client => client.visibilityState === 'visible')) return;
        await self.registration.showNotification(payload.title || 'Docka Hub', {
            body: payload.body || '',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: payload.tag,
            data: { url: payload.url || '/dashboard' },
        });
    })());
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil((async () => {
        const target = new URL(event.notification.data?.url || '/dashboard', self.location.origin).href;
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const existing = windows.find(client => client.url.startsWith(self.location.origin));
        if (existing) {
            await existing.focus();
            if ('navigate' in existing) await existing.navigate(target);
            return;
        }
        await self.clients.openWindow(target);
    })());
});
