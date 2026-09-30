import { getBackendUrl } from '../../../../services/api';

export const resolveAllyoFileUrl = (rawUrl: string) => {
    if (!rawUrl || rawUrl === '#') return '';
    if (/^(https?:|blob:|data:)/i.test(rawUrl)) return rawUrl;
    return `${getBackendUrl()}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
};

const withTrustedToken = (rawUrl: string) => {
    const url = resolveAllyoFileUrl(rawUrl);
    const token = localStorage.getItem('token');
    if (!url || !token || url.includes('token=')) return url;

    try {
        const targetOrigin = new URL(url, window.location.origin).origin;
        const backendOrigin = new URL(getBackendUrl(), window.location.origin).origin;
        if (targetOrigin !== window.location.origin && targetOrigin !== backendOrigin) return url;
    } catch {
        return url;
    }

    return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
};

export const downloadAllyoFile = async (rawUrl: string, fileName: string) => {
    const url = withTrustedToken(rawUrl);
    if (!url) return;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Falha no download (${response.status})`);
        const blobUrl = window.URL.createObjectURL(await response.blob());
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = fileName || 'arquivo';
        document.body.appendChild(link);
        link.click();
        window.setTimeout(() => {
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        }, 10_000);
    } catch (error) {
        console.warn('[Allyo] Download por Blob indisponível; usando download isolado.', error);
        const frameName = `allyo-download-${Date.now()}`;
        const frame = document.createElement('iframe');
        frame.name = frameName;
        frame.style.display = 'none';
        document.body.appendChild(frame);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = fileName || 'arquivo';
        link.rel = 'noopener';
        link.target = frameName;
        document.body.appendChild(link);
        link.click();
        window.setTimeout(() => {
            link.remove();
            frame.remove();
        }, 10_000);
    }
};
