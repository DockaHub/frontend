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
    purpose: 'Material de apoio' | 'Referência visual';
}

export interface AllyoTaskResources {
    references: AllyoTaskReference[];
    attachments: AllyoTaskAttachment[];
}

const resourcesByTask: Record<string, AllyoTaskResources> = {
    '123456': {
        references: [{ id: '122908', title: 'KV campanha Dia do Cliente', category: 'Design' }, { id: '122741', title: 'Lançamento coleção de verão', category: 'Campanha' }],
        attachments: [{ id: 'fa-1', name: 'Guia da campanha 2027.pdf', extension: 'PDF', size: '4,8 MB', purpose: 'Material de apoio' }, { id: 'fa-2', name: 'Moodboard lançamento.zip', extension: 'ZIP', size: '38,2 MB', purpose: 'Referência visual' }],
    },
    '123457': {
        references: [{ id: '122635', title: 'Storyboard vídeo institucional', category: 'Storyboard' }],
        attachments: [{ id: 'as-1', name: 'Roteiro filme manifesto.docx', extension: 'DOCX', size: '184 KB', purpose: 'Material de apoio' }, { id: 'as-2', name: 'Referências de linguagem.pdf', extension: 'PDF', size: '7,1 MB', purpose: 'Referência visual' }],
    },
    '123458': {
        references: [{ id: '122884', title: 'Motion produto conectado', category: 'Motion' }],
        attachments: [{ id: 'to-1', name: 'Manual de animação.pdf', extension: 'PDF', size: '6,3 MB', purpose: 'Material de apoio' }, { id: 'to-2', name: 'Referências motion.mp4', extension: 'MP4', size: '24,7 MB', purpose: 'Referência visual' }],
    },
    '123459': {
        references: [{ id: '123456', linkedTaskId: '123456', title: 'KV campanha de lançamento', category: 'Design' }],
        attachments: [{ id: 'fa-3', name: 'Captação case anual.zip', extension: 'ZIP', size: '1,2 GB', purpose: 'Material de apoio' }, { id: 'fa-4', name: 'Referência de montagem.mp4', extension: 'MP4', size: '31,4 MB', purpose: 'Referência visual' }],
    },
    '123460': {
        references: [{ id: '122416', title: 'Landing page evento anual', category: 'Digital' }],
        attachments: [{ id: 'ma-1', name: 'Conteúdo aprovado da página.docx', extension: 'DOCX', size: '92 KB', purpose: 'Material de apoio' }, { id: 'ma-2', name: 'Referências de interface.pdf', extension: 'PDF', size: '8,9 MB', purpose: 'Referência visual' }],
    },
    '123461': {
        references: [{ id: '123457', linkedTaskId: '123457', title: 'Storyboard para filme manifesto', category: 'Storyboard' }, { id: '122991', title: 'Peças campanha monitoramento', category: 'Design' }],
        attachments: [{ id: 'as-3', name: 'Copies mídia paga.xlsx', extension: 'XLSX', size: '118 KB', purpose: 'Material de apoio' }, { id: 'as-4', name: 'Banco de imagens selecionado.zip', extension: 'ZIP', size: '86,5 MB', purpose: 'Referência visual' }],
    },
    '123462': {
        references: [{ id: '123458', linkedTaskId: '123458', title: 'Motion para redes sociais', category: 'Motion' }],
        attachments: [{ id: 'to-3', name: 'Conteúdo apresentação.docx', extension: 'DOCX', size: '146 KB', purpose: 'Material de apoio' }, { id: 'to-4', name: 'Apresentação referência.pdf', extension: 'PDF', size: '5,2 MB', purpose: 'Referência visual' }],
    },
    '123463': {
        references: [{ id: '123460', linkedTaskId: '123460', title: 'Landing page institucional', category: 'Digital' }],
        attachments: [{ id: 'ma-3', name: 'Brandbook atual.pdf', extension: 'PDF', size: '12,6 MB', purpose: 'Material de apoio' }, { id: 'ma-4', name: 'Aplicações de marca.zip', extension: 'ZIP', size: '44,8 MB', purpose: 'Referência visual' }],
    },
};

export const getTaskResources = (taskId: string): AllyoTaskResources => resourcesByTask[taskId] || { references: [], attachments: [] };
