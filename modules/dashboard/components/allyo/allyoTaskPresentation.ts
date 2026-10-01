export type AllyoTaskType =
    | 'social'
    | 'carousel'
    | 'landing'
    | 'presentation'
    | 'storyboard'
    | 'motion'
    | 'video'
    | 'audio'
    | 'branding'
    | 'email'
    | 'copy'
    | 'document'
    | 'generic';

export type AllyoTaskStructure = 'single' | 'cards' | 'slides' | 'scenes' | 'sections' | 'timeline' | 'document';

export interface AllyoTaskPresentationDefinition {
    type: AllyoTaskType;
    label: string;
    structure: AllyoTaskStructure;
    itemLabel: string;
    defaultCount: number;
    approval: string;
    editable: string;
    software: string;
    approvalAccept: string;
    sourceAccept: string;
    creativeNext: string;
    creativeHelper: string;
    clientHelper: string;
}

export interface PresentableTask {
    name?: string;
    category?: string;
    taskType?: string | null;
    deliverables?: Array<{
        id?: string;
        type?: string;
        title?: string;
        format?: string;
        approvalFormat?: string;
        scenes?: Array<{ id?: string; label?: string; title?: string; copy?: string }>;
    }>;
    briefing?: {
        catalogCode?: string | null;
        deliverables?: string[];
        formats?: string[];
    };
}

export const ALLYO_TASK_PRESENTATIONS: Record<AllyoTaskType, AllyoTaskPresentationDefinition> = {
    social: { type: 'social', label: 'Peça para redes sociais', structure: 'single', itemLabel: 'peça', defaultCount: 1, approval: 'PNG, JPG ou PDF', editable: 'arquivo aberto', software: 'Photoshop, Illustrator ou Figma', approvalAccept: '.png,.jpg,.jpeg,.pdf', sourceAccept: '.psd,.ai,.fig,.zip', creativeNext: 'Produzir a versão atual', creativeHelper: 'Confira formato, copy e área segura antes de anexar a peça.', clientHelper: 'Revise a composição, a legibilidade e a mensagem da peça.' },
    carousel: { type: 'carousel', label: 'Carrossel', structure: 'cards', itemLabel: 'card', defaultCount: 1, approval: 'PNG ou PDF', editable: 'arquivo aberto do carrossel', software: 'Photoshop, Illustrator ou Figma', approvalAccept: '.png,.jpg,.jpeg,.pdf', sourceAccept: '.psd,.ai,.fig,.zip', creativeNext: 'Concluir os cards', creativeHelper: 'Revise a sequência, a continuidade visual e o CTA do último card.', clientHelper: 'Navegue pela sequência e revise cada card antes de aprovar.' },
    landing: { type: 'landing', label: 'Landing page', structure: 'sections', itemLabel: 'seção', defaultCount: 1, approval: 'PNG ou PDF', editable: 'arquivo ou link editável', software: 'Figma', approvalAccept: '.png,.jpg,.jpeg,.pdf', sourceAccept: '.fig,.zip', creativeNext: 'Concluir as seções da página', creativeHelper: 'Revise copy, responsividade e continuidade entre as seções.', clientHelper: 'Revise a página por seções e confira a jornada até o CTA.' },
    presentation: { type: 'presentation', label: 'Apresentação', structure: 'slides', itemLabel: 'slide', defaultCount: 1, approval: 'PDF', editable: 'arquivo editável', software: 'PowerPoint, Keynote ou InDesign', approvalAccept: '.pdf', sourceAccept: '.ppt,.pptx,.key,.ai,.indd,.zip', creativeNext: 'Revisar os slides', creativeHelper: 'Confira narrativa, hierarquia e consistência antes de enviar PDF e editável.', clientHelper: 'Revise a narrativa slide a slide e registre comentários no PDF.' },
    storyboard: { type: 'storyboard', label: 'Storyboard', structure: 'scenes', itemLabel: 'cena', defaultCount: 1, approval: 'PDF', editable: 'arquivo aberto', software: 'Allyo, PowerPoint ou Illustrator', approvalAccept: '.pdf', sourceAccept: '.ppt,.pptx,.psd,.ai,.zip', creativeNext: 'Montar e revisar as cenas', creativeHelper: 'Confira frame, duração, locução, lettering e movimento de cada cena.', clientHelper: 'Revise a narrativa cena a cena antes do início da produção.' },
    motion: { type: 'motion', label: 'Motion design', structure: 'timeline', itemLabel: 'cena', defaultCount: 1, approval: 'MP4 ou MOV', editable: 'projeto aberto', software: 'After Effects', approvalAccept: '.mp4,.mov,.webm', sourceAccept: '.aep,.zip', creativeNext: 'Finalizar animação e áudio', creativeHelper: 'Revise timing, transições, lettering, trilha e duração final.', clientHelper: 'Assista ao vídeo completo e revise movimento, texto e áudio.' },
    video: { type: 'video', label: 'Vídeo', structure: 'timeline', itemLabel: 'cena', defaultCount: 1, approval: 'MP4 ou MOV', editable: 'projeto e mídias', software: 'Premiere, DaVinci ou Final Cut', approvalAccept: '.mp4,.mov,.webm', sourceAccept: '.prproj,.drp,.fcpbundle,.zip', creativeNext: 'Finalizar edição do vídeo', creativeHelper: 'Confira cortes, áudio, legendas, cor e duração antes do envio.', clientHelper: 'Assista ao vídeo completo e registre comentários nos pontos necessários.' },
    audio: { type: 'audio', label: 'Áudio', structure: 'timeline', itemLabel: 'faixa', defaultCount: 1, approval: 'MP3 ou WAV', editable: 'projeto de áudio', software: 'Adobe Audition ou editor de áudio', approvalAccept: '.mp3,.wav,.m4a,.aac,.ogg', sourceAccept: '.sesx,.wav,.zip', creativeNext: 'Finalizar e revisar o áudio', creativeHelper: 'Confira clareza, duração, volume e cortes antes do envio.', clientHelper: 'Ouça o material completo e registre os ajustes necessários.' },
    branding: { type: 'branding', label: 'Identidade visual', structure: 'document', itemLabel: 'aplicação', defaultCount: 1, approval: 'PDF ou imagem', editable: 'arquivos vetoriais', software: 'Illustrator, InDesign ou Figma', approvalAccept: '.pdf,.png,.jpg,.jpeg', sourceAccept: '.ai,.indd,.fig,.svg,.zip', creativeNext: 'Consolidar a identidade', creativeHelper: 'Revise conceito, assinaturas, paleta, tipografia e aplicações.', clientHelper: 'Revise o conceito e a consistência das aplicações apresentadas.' },
    email: { type: 'email', label: 'E-mail marketing', structure: 'sections', itemLabel: 'bloco', defaultCount: 1, approval: 'PNG, PDF ou HTML', editable: 'HTML ou arquivo de design', software: 'Figma ou editor HTML', approvalAccept: '.png,.jpg,.jpeg,.pdf,.html', sourceAccept: '.html,.fig,.zip', creativeNext: 'Revisar conteúdo e responsividade', creativeHelper: 'Confira assunto, hierarquia, links, CTA e comportamento mobile.', clientHelper: 'Revise conteúdo, links e hierarquia dos blocos do e-mail.' },
    copy: { type: 'copy', label: 'Conteúdo e copy', structure: 'document', itemLabel: 'bloco', defaultCount: 1, approval: 'PDF ou documento', editable: 'documento editável', software: 'Google Docs ou Word', approvalAccept: '.pdf,.doc,.docx,.txt', sourceAccept: '.doc,.docx,.txt,.zip', creativeNext: 'Finalizar o conteúdo', creativeHelper: 'Revise objetivo, tom, gramática, CTA e limites de caracteres.', clientHelper: 'Revise o texto, o tom de voz e a aderência ao objetivo.' },
    document: { type: 'document', label: 'Documento editorial', structure: 'document', itemLabel: 'página', defaultCount: 1, approval: 'PDF', editable: 'arquivo diagramado', software: 'InDesign, Illustrator ou PowerPoint', approvalAccept: '.pdf', sourceAccept: '.indd,.ai,.ppt,.pptx,.doc,.docx,.zip', creativeNext: 'Revisar o documento', creativeHelper: 'Confira paginação, sumário, hierarquia, imagens e fechamento do arquivo.', clientHelper: 'Revise o documento página a página e registre os ajustes necessários.' },
    generic: { type: 'generic', label: 'Entrega criativa', structure: 'single', itemLabel: 'entrega', defaultCount: 1, approval: 'PDF, imagem ou vídeo', editable: 'arquivo aberto', software: 'Software da especialidade', approvalAccept: '.pdf,.png,.jpg,.jpeg,.mp4,.mov,.webm', sourceAccept: '.zip,.psd,.ai,.fig,.indd,.ppt,.pptx,.aep,.doc,.docx', creativeNext: 'Preparar a entrega', creativeHelper: 'Siga o briefing e anexe a visualização junto do arquivo aberto correspondente.', clientHelper: 'Revise a entrega conforme o objetivo e os formatos definidos no briefing.' },
};

const normalize = (value: unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const explicitAliases: Record<string, AllyoTaskType> = {
    social: 'social', static: 'social', estatico: 'social', post: 'social',
    carousel: 'carousel', carrossel: 'carousel',
    landing: 'landing', landing_page: 'landing', lp: 'landing',
    presentation: 'presentation', apresentacao: 'presentation', slides: 'presentation',
    storyboard: 'storyboard', roteiro_visual: 'storyboard',
    motion: 'motion', motion_design: 'motion', animation: 'motion', animacao: 'motion',
    video: 'video', video_editing: 'video',
    audio: 'audio', locucao: 'audio', voiceover: 'audio',
    branding: 'branding', brand: 'branding', identidade_visual: 'branding',
    email: 'email', email_marketing: 'email', newsletter: 'email',
    copy: 'copy', content: 'copy', conteudo: 'copy',
    document: 'document', editorial: 'document',
    generic: 'generic',
};

export const resolveAllyoTaskType = (task: PresentableTask): AllyoTaskType => {
    const explicit = normalize(task.taskType).replace(/[\s-]+/g, '_');
    if (explicitAliases[explicit]) return explicitAliases[explicit];

    const searchable = normalize([
        task.briefing?.catalogCode,
        task.name,
        task.category,
        ...(task.briefing?.deliverables || []),
        ...(task.briefing?.formats || []),
        ...(task.deliverables || []).flatMap((item) => [item.type, item.title]),
    ].filter(Boolean).join(' '));

    if (/carrossel|carousel/.test(searchable)) return 'carousel';
    if (/landing|\blp\b|hotsite|pagina de captura/.test(searchable)) return 'landing';
    if (/apresenta|slide|pitch deck|powerpoint|keynote/.test(searchable)) return 'presentation';
    if (/storyboard|roteiro visual|animatic/.test(searchable)) return 'storyboard';
    if (/audio|locucao|voice.?over|\.mp3|\.wav/.test(searchable)) return 'audio';
    if (/motion|animacao|after effects|lettering animado/.test(searchable)) return 'motion';
    if (/video|filme|edicao|premiere|davinci|reels/.test(searchable)) return 'video';
    if (/branding|identidade|logo|logotipo|marca|brandbook|manual de marca/.test(searchable)) return 'branding';
    if (/e-mail|email|newsletter|mailing/.test(searchable)) return 'email';
    if (/copy|redacao|conteudo|legenda|artigo|texto|traducao|revisao|roteiro|slogan|naming/.test(searchable)) return 'copy';
    if (/ebook|e-book|relatorio|catalogo|folder|folheto|documento|editorial/.test(searchable)) return 'document';
    if (/social|instagram|facebook|linkedin|post|feed|story|estatico|banner|display/.test(searchable)) return 'social';
    return 'generic';
};

export const getAllyoTaskPresentation = (task: PresentableTask) => ALLYO_TASK_PRESENTATIONS[resolveAllyoTaskType(task)];

const STRUCTURED_TASKS = new Set<AllyoTaskStructure>(['cards', 'slides', 'scenes', 'sections', 'timeline']);

export const getDeclaredItemCount = (value: unknown): number | null => {
    const text = normalize(value);
    const match = text.match(/\b(\d{1,3})\s*(?:cards?|pecas?|slides?|cenas?|paginas?|secoes?|telas?|frames?)\b/i)
        || text.match(/\b(?:com|contendo)\s+(\d{1,3})\b/i);
    if (!match) return null;
    const count = Number(match[1]);
    return Number.isInteger(count) && count > 0 && count <= 100 ? count : null;
};

export interface AllyoTaskStructureItem {
    id: string;
    title: string;
    description: string;
}

const itemTitle = (label: string, index: number) => `${label.charAt(0).toLocaleUpperCase('pt-BR')}${label.slice(1)} ${index + 1}`;

export const getAllyoTaskStructureItems = (
    task: PresentableTask,
    definition = getAllyoTaskPresentation(task),
    itemCountOverride?: number,
): AllyoTaskStructureItem[] => {
    const expand = (source: { id?: string; title?: string; format?: string; approvalFormat?: string; scenes?: Array<{ id?: string; label?: string; title?: string; copy?: string }> }, sourceIndex: number) => {
        const sourceId = source.id || `deliverable-${sourceIndex}`;
        if (Array.isArray(source.scenes) && source.scenes.length > 0) {
            return source.scenes.map((scene, sceneIndex) => ({
                id: `${sourceId}-${scene.id || sceneIndex + 1}`,
                title: scene.title || scene.label || itemTitle(definition.itemLabel, sceneIndex),
                description: scene.copy || source.title || 'Conteúdo conforme briefing',
            }));
        }

        const count = STRUCTURED_TASKS.has(definition.structure)
            ? getDeclaredItemCount(source.title) || (sourceIndex === 0 ? itemCountOverride : null)
            : null;
        if (count && count > 1) {
            return Array.from({ length: count }, (_, itemIndex) => ({
                id: `${sourceId}-${itemIndex + 1}`,
                title: itemTitle(definition.itemLabel, itemIndex),
                description: `${itemIndex + 1} de ${count} · ${source.title || 'Conteúdo conforme briefing'}`,
            }));
        }

        return [{
            id: sourceId,
            title: source.title || itemTitle(definition.itemLabel, 0),
            description: [source.format, source.approvalFormat].filter(Boolean).join(' · ') || 'Conforme briefing',
        }];
    };

    const detailed = (task.deliverables || []).flatMap(expand);
    if (detailed.length > 0) return detailed;

    return (task.briefing?.deliverables || []).flatMap((title, index) => expand({ id: `brief-${index}`, title }, index));
};

export const getAllyoTaskItemCount = (task: PresentableTask, definition = getAllyoTaskPresentation(task), itemCountOverride?: number) => {
    const structuredItems = task.deliverables?.reduce((total, deliverable) => total + (deliverable.scenes?.length || 0), 0) || 0;
    if (structuredItems > 0 && ['cards', 'slides', 'scenes', 'sections', 'timeline'].includes(definition.structure)) return structuredItems;
    if (STRUCTURED_TASKS.has(definition.structure)) {
        const declaredCounts = (task.deliverables?.length
            ? task.deliverables.map((item) => getDeclaredItemCount(item.title))
            : (task.briefing?.deliverables || []).map(getDeclaredItemCount)
        ).filter((count): count is number => Boolean(count));
        if (declaredCounts.length > 0) return declaredCounts.reduce((total, count) => total + count, 0);
        if (itemCountOverride && itemCountOverride > 0) return itemCountOverride;
    }
    const explicitDeliverables = task.deliverables?.length || task.briefing?.deliverables?.length || 0;
    return explicitDeliverables || definition.defaultCount;
};
