export interface AllyoTaskReference {
    id: string;
    title: string;
    category: string;
    linkedTaskId?: string;
}

export interface AllyoTaskAttachment {
    id: string;
    name: string;
    extension: string;
    size: string;
    purpose: 'Material de apoio' | 'Referência visual' | 'Upload do cliente';
    previewUrl?: string;
    downloadUrl?: string;
}

export interface AllyoTaskLink {
    id: string;
    url: string;
    title: string;
    domain: string;
    category: 'figma' | 'drive' | 'dropbox' | 'wetransfer' | 'canva' | 'social' | 'video' | 'web';
}

export interface AllyoTaskResources {
    references: AllyoTaskReference[];
    attachments: AllyoTaskAttachment[];
    links: AllyoTaskLink[];
    archiveUrl?: string;
}

const resourcesByTask: Record<string, AllyoTaskResources> = {
    '123456': {
        references: [{ id: '122908', title: 'KV campanha Dia do Cliente', category: 'Design' }, { id: '122741', title: 'Lançamento coleção de verão', category: 'Campanha' }],
        attachments: [{ id: 'fa-1', name: 'Guia da campanha 2027.pdf', extension: 'PDF', size: '4,8 MB', purpose: 'Material de apoio' }, { id: 'fa-2', name: 'Moodboard lançamento.zip', extension: 'ZIP', size: '38,2 MB', purpose: 'Referência visual' }, { id: 'fa-5', name: 'KV campanha anterior.ai', extension: 'AI', size: '28,6 MB', purpose: 'Referência visual' }],
        links: [{ id: 'link-123456-1', url: 'https://fauves.com.br/', title: 'Site Fauves', domain: 'fauves.com.br', category: 'web' }],
    },
    '123457': {
        references: [{ id: '122635', title: 'Storyboard vídeo institucional', category: 'Storyboard' }],
        attachments: [{ id: 'as-1', name: 'Roteiro filme manifesto.docx', extension: 'DOCX', size: '184 KB', purpose: 'Material de apoio' }, { id: 'as-2', name: 'Referências de linguagem.pdf', extension: 'PDF', size: '7,1 MB', purpose: 'Referência visual' }],
        links: [],
    },
    '123458': {
        references: [{ id: '122884', title: 'Motion produto conectado', category: 'Motion' }],
        attachments: [{ id: 'to-1', name: 'Manual de animação.pdf', extension: 'PDF', size: '6,3 MB', purpose: 'Material de apoio' }, { id: 'to-2', name: 'Referências motion.mp4', extension: 'MP4', size: '24,7 MB', purpose: 'Referência visual' }],
        links: [],
    },
    '123459': {
        references: [{ id: '123456', linkedTaskId: '123456', title: 'KV campanha de lançamento', category: 'Design' }],
        attachments: [{ id: 'fa-3', name: 'Captação case anual.zip', extension: 'ZIP', size: '1,2 GB', purpose: 'Material de apoio' }, { id: 'fa-4', name: 'Referência de montagem.mp4', extension: 'MP4', size: '31,4 MB', purpose: 'Referência visual' }],
        links: [],
    },
    '123460': {
        references: [{ id: '122416', title: 'Landing page evento anual', category: 'Digital' }],
        attachments: [{ id: 'ma-1', name: 'Conteúdo aprovado da página.docx', extension: 'DOCX', size: '92 KB', purpose: 'Material de apoio' }, { id: 'ma-2', name: 'Referências de interface.pdf', extension: 'PDF', size: '8,9 MB', purpose: 'Referência visual' }],
        links: [],
    },
    '123461': {
        references: [{ id: '123457', linkedTaskId: '123457', title: 'Storyboard para filme manifesto', category: 'Storyboard' }, { id: '122991', title: 'Peças campanha monitoramento', category: 'Design' }],
        attachments: [{ id: 'as-3', name: 'Copies mídia paga.xlsx', extension: 'XLSX', size: '118 KB', purpose: 'Material de apoio' }, { id: 'as-4', name: 'Banco de imagens selecionado.zip', extension: 'ZIP', size: '86,5 MB', purpose: 'Referência visual' }],
        links: [],
    },
    '123462': {
        references: [{ id: '123458', linkedTaskId: '123458', title: 'Motion para redes sociais', category: 'Motion' }],
        attachments: [{ id: 'to-3', name: 'Conteúdo apresentação.docx', extension: 'DOCX', size: '146 KB', purpose: 'Material de apoio' }, { id: 'to-4', name: 'Apresentação referência.pdf', extension: 'PDF', size: '5,2 MB', purpose: 'Referência visual' }, { id: 'to-5', name: 'Catálogo institucional.indd', extension: 'INDD', size: '41,3 MB', purpose: 'Referência visual' }],
        links: [],
    },
    '123463': {
        references: [{ id: '123460', linkedTaskId: '123460', title: 'Landing page institucional', category: 'Digital' }],
        attachments: [{ id: 'ma-3', name: 'Brandbook atual.pdf', extension: 'PDF', size: '12,6 MB', purpose: 'Material de apoio' }, { id: 'ma-4', name: 'Aplicações de marca.zip', extension: 'ZIP', size: '44,8 MB', purpose: 'Referência visual' }],
        links: [],
    },
};

export function isReferenceOrLinkItem(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    return (
        /^refer[eê]ncia[s]?:\s*(https?:\/\/|[a-z0-9.-]+\.[a-z]{2,})/i.test(trimmed) ||
        /^link[s]?:\s*(https?:\/\/|[a-z0-9.-]+\.[a-z]{2,})/i.test(trimmed) ||
        /^arquivo[s]?:\s*(https?:\/\/|[a-z0-9.-]+\.[a-z]{2,})/i.test(trimmed) ||
        /^https?:\/\//i.test(trimmed) ||
        /^(www\.)?[a-z0-9-]+\.(com|org|net|io|co|br|app|design|figma|drive|dropbox|adobe)/i.test(trimmed)
    );
}

export function extractUrl(text: string): string | null {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/https?:\/\/[^\s"',;)\]>]+/i);
    if (match) return match[0];
    const plainDomainMatch = text.match(/(?:^|\s)((?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s"',;)\]>]*)?)/i);
    if (plainDomainMatch && plainDomainMatch[1] && plainDomainMatch[1].includes('.')) {
        return `https://${plainDomainMatch[1].replace(/^https?:\/\//i, '')}`;
    }
    return null;
}

export function categorizeLink(urlStr: string): { category: AllyoTaskLink['category']; domain: string; title: string } {
    try {
        const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
        const hostname = parsed.hostname.replace(/^www\./i, '').toLowerCase();

        if (hostname.includes('figma.com')) {
            return { category: 'figma', domain: hostname, title: 'Arquivo no Figma' };
        }
        if (hostname.includes('drive.google.com') || hostname.includes('docs.google.com')) {
            return { category: 'drive', domain: hostname, title: 'Google Drive / Docs' };
        }
        if (hostname.includes('dropbox.com')) {
            return { category: 'dropbox', domain: hostname, title: 'Arquivo no Dropbox' };
        }
        if (hostname.includes('wetransfer.com')) {
            return { category: 'wetransfer', domain: hostname, title: 'Transferência WeTransfer' };
        }
        if (hostname.includes('canva.com')) {
            return { category: 'canva', domain: hostname, title: 'Design no Canva' };
        }
        if (hostname.includes('instagram.com') || hostname.includes('pinterest.com') || hostname.includes('behance.net') || hostname.includes('dribbble.com') || hostname.includes('linkedin.com')) {
            const serviceName = hostname.split('.')[0];
            const capitalized = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
            return { category: 'social', domain: hostname, title: `Referência no ${capitalized}` };
        }
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be') || hostname.includes('vimeo.com') || hostname.includes('loom.com')) {
            return { category: 'video', domain: hostname, title: 'Vídeo de referência' };
        }

        const namePart = hostname.split('.')[0];
        const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        return { category: 'web', domain: hostname, title: cleanName ? `Site ${cleanName}` : hostname };
    } catch {
        return { category: 'web', domain: urlStr, title: 'Link de referência' };
    }
}

export function formatBytes(bytes?: number): string {
    if (!bytes || isNaN(bytes) || bytes <= 0) return 'Upload enviado';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1).replace('.', ',')} GB`;
}

export function getFileExtension(filename?: string, contentType?: string): string {
    if (filename && filename.includes('.')) {
        const ext = filename.split('.').pop()?.toUpperCase() || 'FILE';
        if (ext.length <= 5) return ext;
    }
    if (contentType) {
        if (contentType.includes('pdf')) return 'PDF';
        if (contentType.includes('zip')) return 'ZIP';
        if (contentType.includes('png')) return 'PNG';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'JPG';
        if (contentType.includes('svg')) return 'SVG';
        if (contentType.includes('word') || contentType.includes('docx')) return 'DOCX';
        if (contentType.includes('sheet') || contentType.includes('excel') || contentType.includes('xlsx')) return 'XLSX';
        if (contentType.includes('video') || contentType.includes('mp4')) return 'MP4';
    }
    return 'ARQ';
}

export function buildTaskResources(task: any, demand?: any): AllyoTaskResources {
    const taskId = String(task?.id || '');
    const mockData = resourcesByTask[taskId];

    const rawLinks: string[] = [];
    const attachments: AllyoTaskAttachment[] = [];
    const references: AllyoTaskReference[] = [];

    // 1. Gather all link candidates from task and demand briefings
    if (Array.isArray(task?.briefing?.referenceLinks)) {
        rawLinks.push(...task.briefing.referenceLinks);
    }
    if (Array.isArray(demand?.briefing?.referenceLinks)) {
        rawLinks.push(...demand.briefing.referenceLinks);
    }
    if (Array.isArray(task?.briefing?.creativeDirection)) {
        for (const item of task.briefing.creativeDirection) {
            const url = extractUrl(item);
            if (url) rawLinks.push(url);
        }
    }
    if (Array.isArray(demand?.briefing?.creativeDirection)) {
        for (const item of demand.briefing.creativeDirection) {
            const url = extractUrl(item);
            if (url) rawLinks.push(url);
        }
    }
    if (typeof task?.briefing?.references === 'string') {
        const url = extractUrl(task.briefing.references);
        if (url) rawLinks.push(url);
    }
    if (typeof demand?.briefing?.references === 'string') {
        const url = extractUrl(demand.briefing.references);
        if (url) rawLinks.push(url);
    }
    if (typeof task?.briefing?.overview === 'string') {
        const url = extractUrl(task.briefing.overview);
        if (url) rawLinks.push(url);
    }

    // Deduplicate and process links
    const seenUrls = new Set<string>();
    const links: AllyoTaskLink[] = [];

    for (const raw of rawLinks) {
        const cleanUrl = extractUrl(raw) || (raw.startsWith('http') ? raw : null);
        if (!cleanUrl) continue;
        const normalized = cleanUrl.trim().replace(/\/$/, '');
        if (seenUrls.has(normalized)) continue;
        seenUrls.add(normalized);

        const { category, domain, title } = categorizeLink(normalized);
        links.push({
            id: `link-${links.length + 1}`,
            url: normalized,
            title,
            domain,
            category,
        });

        // If the URL directly points to a downloadable file, also expose it as attachment
        const matchFileExt = normalized.match(/\.([a-z0-9]{2,5})(?:\?|#|$)/i);
        if (matchFileExt) {
            const ext = matchFileExt[1].toUpperCase();
            if (['PDF', 'ZIP', 'RAR', 'PNG', 'JPG', 'JPEG', 'WEBP', 'MP4', 'MOV', 'AI', 'PSD', 'DOCX', 'XLSX'].includes(ext)) {
                const fileName = decodeURIComponent(normalized.split('/').pop()?.split('?')[0] || `arquivo.${ext.toLowerCase()}`);
                attachments.push({
                    id: `url-file-${attachments.length + 1}`,
                    name: fileName,
                    extension: ext,
                    size: 'Arquivo externo',
                    purpose: 'Upload do cliente',
                    previewUrl: normalized,
                    downloadUrl: normalized,
                });
            }
        }
    }

    // 2. Process uploaded files from demand or task
    const rawFiles = [
        ...(Array.isArray(task?.files) ? task.files : []),
        ...(Array.isArray(demand?.files) ? demand.files : []),
    ];
    const seenFileIds = new Set<string>();

    for (const file of rawFiles) {
        if (!file || !file.name) continue;
        const fileId = String(file.id || file.fileKey || file.name);
        if (seenFileIds.has(fileId)) continue;
        seenFileIds.add(fileId);

        const ext = getFileExtension(file.name, file.contentType);
        attachments.push({
            id: fileId,
            name: file.name,
            extension: ext,
            size: formatBytes(file.sizeBytes),
            purpose: file.category === 'briefing' ? 'Material de apoio' : 'Upload do cliente',
            previewUrl: file.fileUrl || file.downloadUrl,
            downloadUrl: file.downloadUrl || file.fileUrl,
        });
    }

    // 3. Process mock data if exists
    if (mockData) {
        if (attachments.length === 0 && mockData.attachments) {
            attachments.push(...mockData.attachments);
        }
        if (mockData.references) {
            references.push(...mockData.references);
        }
        if (links.length === 0 && mockData.links) {
            links.push(...mockData.links);
        }
    }

    // 4. Process referenced tasks from project
    if (Array.isArray(demand?.tasksList)) {
        const dependsOnList: string[] = Array.isArray(task?.dependsOn) ? task.dependsOn : [];
        for (const siblingTask of demand.tasksList) {
            if (siblingTask.id === task.id) continue;
            if (dependsOnList.includes(siblingTask.id) || dependsOnList.includes(siblingTask.publicId)) {
                if (!references.some((r) => r.id === siblingTask.id || r.id === siblingTask.publicId)) {
                    references.push({
                        id: siblingTask.publicId || siblingTask.id,
                        title: siblingTask.title || 'Tarefa relacionada',
                        category: siblingTask.team || demand.service || 'Design',
                        linkedTaskId: siblingTask.id,
                    });
                }
            }
        }
    }

    const archiveUrl = mockData?.archiveUrl || (attachments.find((a) => a.extension === 'ZIP')?.downloadUrl);

    return {
        references,
        attachments,
        links,
        archiveUrl,
    };
}

export const getTaskResources = (taskId: string): AllyoTaskResources => resourcesByTask[taskId] || buildTaskResources({ id: taskId });
