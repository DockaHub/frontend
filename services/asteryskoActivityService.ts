import api from './api';

const SESSION_KEY = 'asterysko_portal_session_id';
let ensurePromise: Promise<string | null> | null = null;

const newRequestId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getSessionId = () => localStorage.getItem(SESSION_KEY);

const getAttribution = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        source: params.get('utm_source') || undefined,
        medium: params.get('utm_medium') || undefined,
        campaign: params.get('utm_campaign') || undefined,
        referrerHost: document.referrer ? (() => { try { return new URL(document.referrer).hostname; } catch { return undefined; } })() : undefined,
    };
};

const ensureSession = async () => {
    if (ensurePromise) return ensurePromise;
    ensurePromise = api.post('/asterysko/portal/sessions', { sessionId: getSessionId(), attribution: getAttribution() })
        .then(response => {
            const id = String(response.data?.id || '');
            if (id) localStorage.setItem(SESSION_KEY, id);
            return id || null;
        })
        .catch(() => null)
        .finally(() => { ensurePromise = null; });
    return ensurePromise;
};

const track = async (eventName: string, details: {
    processId?: string;
    invoiceId?: string;
    dealId?: string;
    sourceChannel?: string;
    metadata?: Record<string, unknown>;
} = {}) => {
    try {
        const sessionId = getSessionId() || await ensureSession();
        await api.post('/asterysko/portal/activity', {
            eventName,
            sessionId,
            route: `${window.location.pathname}${window.location.search}`,
            requestId: newRequestId(),
            ...details,
        });
    } catch {
        // Telemetry must never interrupt the client journey.
    }
};

const heartbeat = async () => {
    const sessionId = getSessionId() || await ensureSession();
    if (!sessionId) return;
    await api.post('/asterysko/portal/sessions/heartbeat', { sessionId }).catch(() => undefined);
};

const end = async (reason = 'logout') => {
    const sessionId = getSessionId();
    if (!sessionId) return;
    await api.post('/asterysko/portal/sessions/end', { sessionId, reason }).catch(() => undefined);
    localStorage.removeItem(SESSION_KEY);
};

export const asteryskoActivity = { ensureSession, heartbeat, track, end, getSessionId };
