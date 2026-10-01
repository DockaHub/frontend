export type CopyMode = 'social_caption' | 'document_free';

export interface StructuredCaption {
    headline: string;
    body: string;
    cta: string;
    hashtags: string;
    notes: string;
}

export interface StructuredDocument {
    title: string;
    body: string;
    notes: string;
}

export interface StructuredCopyContent {
    mode: CopyMode;
    social: StructuredCaption;
    doc: StructuredDocument;
}

const EMPTY_SOCIAL: StructuredCaption = { headline: '', body: '', cta: '', hashtags: '', notes: '' };
const EMPTY_DOCUMENT: StructuredDocument = { title: '', body: '', notes: '' };
const ALLOWED_TAGS = new Set([
    'a', 'article', 'aside', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
    'hr', 'i', 'li', 'ol', 'p', 'pre', 's', 'span', 'strike', 'strong', 'u', 'ul',
]);
const DROP_WITH_CONTENT = new Set(['audio', 'embed', 'iframe', 'object', 'script', 'style', 'svg', 'video']);

const escapeHtml = (value: string): string => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const plainTextToHtml = (value: string): string => escapeHtml(value).replace(/\r?\n/g, '<br>');

const safeStyle = (value: string): string => value
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
        const separator = declaration.indexOf(':');
        if (separator < 0) return '';
        const property = declaration.slice(0, separator).trim().toLowerCase();
        const rawValue = declaration.slice(separator + 1).trim();
        if (property === 'text-align' && /^(left|center|right|justify)$/i.test(rawValue)) return `${property}: ${rawValue}`;
        if (property === 'background-color' && /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i.test(rawValue)) return `${property}: ${rawValue}`;
        if (property === 'color' && /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i.test(rawValue)) return `${property}: ${rawValue}`;
        return '';
    })
    .filter(Boolean)
    .join('; ');

const isSafeLink = (value: string): boolean => {
    const normalized = value.trim().toLowerCase();
    return normalized.startsWith('https://') || normalized.startsWith('http://') || normalized.startsWith('mailto:');
};

export const sanitizeRichText = (html: string): string => {
    if (!html) return '';
    if (typeof DOMParser === 'undefined') return escapeHtml(html);

    const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    const elements = Array.from(parsed.body.querySelectorAll('*')).reverse();

    elements.forEach((element) => {
        const tag = element.tagName.toLowerCase();
        if (DROP_WITH_CONTENT.has(tag)) {
            element.remove();
            return;
        }
        if (!ALLOWED_TAGS.has(tag)) {
            element.replaceWith(...Array.from(element.childNodes));
            return;
        }

        Array.from(element.attributes).forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const keepDataAttribute = name === 'data-allyo-copy-mode' || name === 'data-allyo-field';
            if (keepDataAttribute) return;
            if (name === 'style') {
                const sanitized = safeStyle(attribute.value);
                if (sanitized) element.setAttribute('style', sanitized);
                else element.removeAttribute(attribute.name);
                return;
            }
            if (name === 'class' && attribute.value.split(/\s+/).includes('production-notes')) return;
            if (tag === 'a' && name === 'href' && isSafeLink(attribute.value)) return;
            if (tag === 'a' && name === 'title') return;
            element.removeAttribute(attribute.name);
        });

        if (tag === 'a') {
            element.setAttribute('target', '_blank');
            element.setAttribute('rel', 'noopener noreferrer');
        }
    });

    return parsed.body.innerHTML;
};

export const richTextToPlainText = (html: string): string => {
    if (!html) return '';
    if (typeof DOMParser === 'undefined') return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const parsed = new DOMParser().parseFromString(sanitizeRichText(html), 'text/html');
    parsed.body.querySelectorAll('br').forEach((element) => element.replaceWith('\n'));
    parsed.body.querySelectorAll('p,div,h1,h2,h3,li,blockquote,pre,aside').forEach((element) => element.append('\n'));
    return (parsed.body.textContent || '')
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export const getDeliverableCaption = (data: StructuredCaption): string => [
    data.headline,
    data.body,
    data.cta,
    data.hashtags,
].map((part) => part.trim()).filter(Boolean).join('\n\n');

export const getDeliverableDocText = (data: StructuredDocument): string => [
    data.title.trim(),
    richTextToPlainText(data.body),
].filter(Boolean).join('\n\n');

export const serializeSocialCaption = (data: StructuredCaption): string => {
    const fields = [
        data.headline.trim() ? `<h1 data-allyo-field="headline">${plainTextToHtml(data.headline.trim())}</h1>` : '',
        data.body.trim() ? `<div data-allyo-field="body">${plainTextToHtml(data.body.trim())}</div>` : '',
        data.cta.trim() ? `<p data-allyo-field="cta"><strong>${plainTextToHtml(data.cta.trim())}</strong></p>` : '',
        data.hashtags.trim() ? `<p data-allyo-field="hashtags">${plainTextToHtml(data.hashtags.trim())}</p>` : '',
        data.notes.trim() ? `<aside data-allyo-field="notes"><strong>Orientações complementares</strong><br>${plainTextToHtml(data.notes.trim())}</aside>` : '',
    ].filter(Boolean);

    return fields.length ? `<article data-allyo-copy-mode="social_caption">${fields.join('')}</article>` : '';
};

export const serializeDocument = (data: StructuredDocument): string => {
    const fields = [
        data.title.trim() ? `<h1 data-allyo-field="title">${plainTextToHtml(data.title.trim())}</h1>` : '',
        data.body.trim() ? `<div data-allyo-field="body">${sanitizeRichText(data.body)}</div>` : '',
        data.notes.trim() ? `<aside data-allyo-field="notes"><strong>Notas e referências</strong><br>${plainTextToHtml(data.notes.trim())}</aside>` : '',
    ].filter(Boolean);

    return fields.length ? `<article data-allyo-copy-mode="document_free">${fields.join('')}</article>` : '';
};

const textFromField = (element: Element | null): string => {
    if (!element) return '';
    return richTextToPlainText(element.innerHTML);
};

const parseStructuredHtml = (raw: string): StructuredCopyContent | null => {
    if (typeof DOMParser === 'undefined' || !raw.includes('data-allyo-copy-mode')) return null;
    const parsed = new DOMParser().parseFromString(raw, 'text/html');
    const root = parsed.body.querySelector<HTMLElement>('[data-allyo-copy-mode]');
    if (!root) return null;
    const field = (name: string) => root.querySelector(`[data-allyo-field="${name}"]`);
    const mode = root.dataset.allyoCopyMode === 'social_caption' ? 'social_caption' : 'document_free';

    return {
        mode,
        social: mode === 'social_caption' ? {
            headline: textFromField(field('headline')),
            body: textFromField(field('body')),
            cta: textFromField(field('cta')),
            hashtags: textFromField(field('hashtags')),
            notes: textFromField(field('notes')).replace(/^(?:Orienta(?:coes|ções) complementares|Observa(?:coes|ções) da produ(?:cao|ção))\s*/i, '').trim(),
        } : { ...EMPTY_SOCIAL },
        doc: mode === 'document_free' ? {
            title: textFromField(field('title')),
            body: sanitizeRichText(field('body')?.innerHTML || ''),
            notes: textFromField(field('notes')).replace(/^(?:Notas e refer(?:encias|ências)|Notas do redator)\s*/i, '').trim(),
        } : { ...EMPTY_DOCUMENT },
    };
};

const parseLegacyDocument = (raw: string): StructuredDocument => {
    if (typeof DOMParser !== 'undefined' && /<\/?[a-z][\s\S]*>/i.test(raw)) {
        const parsed = new DOMParser().parseFromString(sanitizeRichText(raw), 'text/html');
        const title = parsed.body.querySelector('h1');
        const notes = parsed.body.querySelector('.production-notes');
        const result: StructuredDocument = {
            title: title?.textContent?.trim() || '',
            body: '',
            notes: notes?.textContent?.replace(/^.*?Observa(?:coes|ções) do redator:\s*/i, '').trim() || '',
        };
        title?.remove();
        notes?.remove();
        result.body = parsed.body.innerHTML.trim();
        return result;
    }

    const notesMatch = raw.match(/\n*---\s*\n(?:[^\n]*Observa(?:coes|ções) do redator:\s*\n)?([\s\S]*)$/i);
    const withoutNotes = notesMatch ? raw.slice(0, notesMatch.index).trim() : raw.trim();
    const titleMatch = withoutNotes.match(/^#\s+([^\n]+)\n*/);
    return {
        title: titleMatch?.[1]?.trim() || '',
        body: escapeHtml(titleMatch ? withoutNotes.slice(titleMatch[0].length).trim() : withoutNotes).replace(/\r?\n/g, '<br>'),
        notes: notesMatch?.[1]?.trim() || '',
    };
};

export const parseCopyContent = (raw: string, isSocialDefault: boolean): StructuredCopyContent => {
    const structured = parseStructuredHtml(raw || '');
    if (structured) return structured;
    if (!raw.trim()) {
        return {
            mode: isSocialDefault ? 'social_caption' : 'document_free',
            social: { ...EMPTY_SOCIAL },
            doc: { ...EMPTY_DOCUMENT },
        };
    }

    const socialMode = isSocialDefault || /#[a-z0-9_]+/i.test(raw);
    if (socialMode) {
        const notesMatch = raw.match(/\n*---\s*\n(?:[^\n]*Observa(?:coes|ções) da produ(?:cao|ção):\s*\n)?([\s\S]*)$/i);
        return {
            mode: 'social_caption',
            social: {
                ...EMPTY_SOCIAL,
                body: (notesMatch ? raw.slice(0, notesMatch.index) : raw).trim(),
                notes: notesMatch?.[1]?.trim() || '',
            },
            doc: { ...EMPTY_DOCUMENT },
        };
    }

    return {
        mode: 'document_free',
        social: { ...EMPTY_SOCIAL },
        doc: parseLegacyDocument(raw),
    };
};

export const hasSubstantiveCopyContent = (raw: string): boolean => {
    const parsed = parseCopyContent(raw, false);
    return parsed.mode === 'social_caption'
        ? Boolean(getDeliverableCaption(parsed.social).trim())
        : Boolean(getDeliverableDocText(parsed.doc).trim());
};
