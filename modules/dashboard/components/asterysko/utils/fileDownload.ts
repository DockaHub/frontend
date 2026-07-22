import { getBackendUrl } from '../../../../../services/api';

/**
 * Resolves a full URL if a relative path is provided.
 */
export const resolveFileUrl = (url: string): string => {
    if (!url || url === '#') return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }
    const backendUrl = getBackendUrl();
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendUrl}${cleanPath}`;
};

/**
 * Triggers an automatic file download in the browser without opening a new tab.
 */
export const forceDownloadFile = async (rawUrl: string, defaultFileName: string = 'documento.pdf') => {
    const url = resolveFileUrl(rawUrl);
    if (!url) return;

    try {
        const token = localStorage.getItem('token');
        let fetchUrl = url;
        if (token && !url.includes('token=')) {
            fetchUrl = `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = defaultFileName;
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
            window.URL.revokeObjectURL(blobUrl);
        }, 300);
    } catch (error) {
        console.warn('Direct blob fetch failed, falling back to standard anchor trigger:', error);
        const token = localStorage.getItem('token');
        let downloadUrl = url;
        if (token && !url.includes('token=')) {
            downloadUrl = `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
        }

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = defaultFileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
        }, 300);
    }
};
