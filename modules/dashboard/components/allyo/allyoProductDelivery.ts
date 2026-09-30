import type { AllyoCatalogProduct } from '../../../../services/allyoService';
import type { AllyoTaskType, PresentableTask } from './allyoTaskPresentation';

const normalize = (value: unknown) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

const SOFTWARE_EXTENSIONS: Record<string, string[]> = {
    'after effects': ['.aep'],
    'adobe audition': ['.sesx', '.wav'],
    canva: ['.pdf', '.png', '.jpg', '.jpeg', '.pptx'],
    figma: ['.fig'],
    'google slides': ['.ppt', '.pptx'],
    illustrator: ['.ai', '.eps', '.svg'],
    indesign: ['.indd', '.idml'],
    legenda: ['.srt', '.vtt', '.txt'],
    photoshop: ['.psd'],
    powerpoint: ['.ppt', '.pptx', '.pps', '.ppsx'],
    premiere: ['.prproj'],
    word: ['.doc', '.docx'],
};

const CLOUD_EDITORS = new Set(['canva', 'figma', 'google slides']);

const asExtension = (value: string): string | null => {
    const normalized = value.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return null;
    if (/^\.[a-z0-9]+$/.test(normalized)) return normalized;
    if (/^[a-z0-9]+$/.test(normalized)) return `.${normalized}`;
    return null;
};

const unique = (values: Array<string | null | undefined>) => Array.from(new Set(values.filter((value): value is string => Boolean(value))));

export const extensionsFromFormatLabel = (value: unknown): string[] => {
    const text = normalize(value);
    const extensions = unique([
        ...Array.from(text.matchAll(/\.[a-z0-9]+/g), (match) => asExtension(match[0])),
        /\bpng\b/.test(text) ? '.png' : null,
        /\bjpe?g\b/.test(text) ? '.jpg' : null,
        /\bpdf\b/.test(text) ? '.pdf' : null,
        /\bmp4\b/.test(text) ? '.mp4' : null,
        /\bmov\b/.test(text) ? '.mov' : null,
        /\bgif\b/.test(text) ? '.gif' : null,
        /\bmp3\b/.test(text) ? '.mp3' : null,
        /\bwav\b/.test(text) ? '.wav' : null,
        /\bsrt\b/.test(text) ? '.srt' : null,
        /\bzip\b/.test(text) ? '.zip' : null,
        /\bhtml\b/.test(text) ? '.html' : null,
    ]);
    return extensions;
};

export const resolveCatalogProductTaskType = (product: AllyoCatalogProduct): AllyoTaskType => {
    const category = normalize(product.category);
    const name = normalize(product.name);

    if (category.includes('copywriting')) return 'copy';
    if (category.includes('redes sociais')) {
        if (name.includes('carrossel')) return 'carousel';
        if (/animad|video|gif/.test(name)) return 'motion';
        return 'social';
    }
    if (category.includes('impresso')) return 'document';
    if (category.includes('video') || category.includes('audio')) {
        if (name.includes('storyboard')) return 'storyboard';
        if (/roteiro|conteudo|revisao de legenda/.test(name)) return 'copy';
        if (/audio|locucao|transcricao/.test(name)) return 'audio';
        if (/thumbnail/.test(name)) return 'social';
        if (/animacao|animado|gif|dooh/.test(name)) return 'motion';
        return 'video';
    }
    if (category.includes('digital')) {
        if (/apresentacao|slide/.test(name)) return 'presentation';
        if (/e-mail|email|newsletter/.test(name)) return 'email';
        if (/landing|site/.test(name)) return 'landing';
        if (/e-book|ebook|catalogo/.test(name)) return 'document';
        if (/banner|dooh/.test(name)) return 'social';
        return 'generic';
    }
    if (category.includes('criacao')) {
        if (/logo|style guide|identidade|marca/.test(name)) return 'branding';
        if (/naming|slogan/.test(name)) return 'copy';
        return 'generic';
    }
    if (category.includes('ia')) {
        if (/locucao|audio|transcricao/.test(name)) return 'audio';
        if (/video|avatar|legendagem/.test(name)) return 'video';
        if (/animacao/.test(name)) return 'motion';
        return 'generic';
    }
    return 'generic';
};

export interface AllyoProductDeliveryProfile {
    product: AllyoCatalogProduct;
    taskType: AllyoTaskType;
    approvalAccept: string;
    sourceAccept: string;
    approvalLabel: string;
    sourceLabel: string;
    sourceRequired: boolean;
    allowSourceLink: boolean;
}

export const findCatalogProductForTask = (
    task: PresentableTask,
    products: AllyoCatalogProduct[],
): AllyoCatalogProduct | null => {
    const catalogCode = String(task.briefing?.catalogCode || '').trim();
    if (catalogCode) {
        const byCode = products.find((product) => String(product.code) === catalogCode);
        if (byCode) return byCode;
    }

    const taskName = normalize(task.name);
    const exactName = products.find((product) => normalize(product.name) === taskName);
    if (exactName) return exactName;

    const deliverableNames = (task.briefing?.deliverables || []).map(normalize);
    return products.find((product) => deliverableNames.some((name) => name === normalize(product.name))) || null;
};

export const createProductDeliveryProfile = (product: AllyoCatalogProduct): AllyoProductDeliveryProfile => {
    const finalExtensions = unique((product.formats?.final || []).map(asExtension));
    const softwareNames = (product.formats?.editable || []).map(normalize);
    const sourceExtensions = unique(softwareNames.flatMap((software) => SOFTWARE_EXTENSIONS[software] || []));
    const approvalExtensions = finalExtensions.length > 0
        ? finalExtensions
        : unique([...sourceExtensions, '.zip']);
    const sourceAccept = unique([...sourceExtensions, '.zip']);

    return {
        product,
        taskType: resolveCatalogProductTaskType(product),
        approvalAccept: approvalExtensions.join(','),
        sourceAccept: sourceAccept.join(','),
        approvalLabel: finalExtensions.length > 0
            ? finalExtensions.map((extension) => extension.slice(1).toLocaleUpperCase('pt-BR')).join(', ')
            : 'arquivo convertido/editável',
        sourceLabel: product.formats?.editable?.length
            ? product.formats.editable.join(', ')
            : 'não exigido para este produto',
        sourceRequired: finalExtensions.length > 0 && sourceExtensions.length > 0,
        allowSourceLink: softwareNames.some((software) => CLOUD_EDITORS.has(software)),
    };
};
