export interface ActivityDetail {
    key: string;
    label: string;
    value: string;
}

const STATUS_LABELS: Record<string, string> = {
    UPLOADED: 'Enviado',
    SENT: 'Enviado',
    RECEIVED: 'Recebido',
    CONFIRMED: 'Confirmado',
    RECEIVED_IN_CASH: 'Recebido em dinheiro',
    SKIPPED: 'Não necessário',
    FAILED: 'Falhou',
    ERROR: 'Erro',
    PENDING: 'Pendente',
    WAITING_PAYMENT: 'Aguardando pagamento',
    PAID: 'Pago',
    REFUNDED: 'Estornado',
    OVERDUE: 'Vencido',
    VALIDATED: 'Validado',
    READY_TO_FILE: 'Pronto para protocolar',
    LEADS: 'Novo lead',
    CONTATO_INICIADO: 'Contato iniciado',
    EM_CONVERSA: 'Em conversa',
    PREPARATION: 'Preparação',
    VIABILITY: 'Viabilidade',
    PROPOSTA: 'Proposta',
    CONTRACT: 'Contrato',
    SERVICE_PAYMENT: 'Pagamento do serviço',
    DOCUMENTATION: 'Procuração e documentos',
    FEDERAL_FEE: 'Taxa federal (GRU)',
    FILED: 'Protocolado no INPI',
    EXAMINATION: 'Exame de mérito',
    OPPOSITION: 'Oposição ou exigência',
    GRANTED: 'Deferido',
    WON: 'Concluído',
};

const VALUE_LABELS: Record<string, string> = {
    TAX: 'Taxa federal (GRU)',
    SERVICE: 'Serviço da Asterysko',
    INPI: 'INPI',
    ASTERYSKO_TEAM: 'Equipe Asterysko',
    WHATSAPP: 'WhatsApp',
    EMAIL: 'E-mail',
    ASAAS: 'Asaas',
    INFINITEPAY: 'InfinitePay',
    EXISTING_SESSION: 'Acesso já autenticado',
    PORTAL: 'Portal do cliente',
    WEB: 'Site',
    DIRECT: 'Acesso direto',
    SYSTEM: 'Sistema Asterysko',
    HOME: 'Início',
    DETAILS: 'Detalhes do processo',
    PROFILE: 'Dados cadastrais',
    CONTRACTS: 'Contratos',
    NEW_REGISTRATION: 'Novo registro',
    FORMALIZATION: 'Formalização',
    PAYMENTS: 'Pagamentos',
    DOCUMENTS: 'Documentos',
    NAME: 'Nome da marca',
    PRESENTATION: 'Apresentação da marca',
    SEGMENT: 'Segmento de atuação',
    LOGO: 'Logotipo',
    ACTIVITY: 'Produtos e serviços',
    CLASSES: 'Classes da marca',
    PLAN: 'Plano e pagamento',
    REVIEW: 'Revisão',
    LOGOUT: 'Saída do portal',
    SILENT_MODE: 'Notificações desativadas',
    MOBILE: 'Celular ou tablet',
    DESKTOP: 'Computador',
    SIGNED_PROXY: 'Procuração assinada',
    PROXY_TEMPLATE: 'Modelo de procuração',
    FEDERAL_FEE_RECEIPT: 'Comprovante da taxa federal',
    REQUEST_FAILED: 'Falha no envio',
    MONTHLY: 'Mensal',
    INSTALLMENTS: 'Parcelado',
    UPFRONT: 'À vista',
};

const SIMPLE_FIELDS: Record<string, string> = {
    type: 'Tipo',
    recipient: 'Destinatário',
    status: 'Situação',
    browser: 'Navegador',
    operatingSystem: 'Sistema',
    deviceType: 'Dispositivo',
    source: 'Origem da visita',
    medium: 'Canal da campanha',
    campaign: 'Campanha',
    referrerHost: 'Site de origem',
    reason: 'Motivo',
    view: 'Área acessada',
    tab: 'Aba acessada',
    step: 'Etapa',
    steps: 'Total de etapas',
    billingMode: 'Forma de pagamento',
    documentCount: 'Documentos enviados',
    hasLogo: 'Logotipo enviado',
    onboarding: 'Cadastro inicial',
    formalizationPending: 'Formalização pendente',
    extension: 'Formato do arquivo',
    kind: 'Documento',
    provider: 'Pagamento processado por',
    channel: 'Canal',
    subject: 'Assunto',
    stage: 'Etapa do processo',
    confirmationSource: 'Confirmado por',
    gruStatus: 'Situação da GRU',
    proxySignStatus: 'Situação da procuração',
    opportunityCode: 'Oportunidade',
    rpiNumber: 'Edição da RPI',
    dispatchCode: 'Código do despacho',
    dispatchDescription: 'Despacho do INPI',
    inpiProcessNumber: 'Processo no INPI',
};

const PRIORITY = [
    'originalName', 'file', 'type', 'dueDate', 'recipient', 'status', 'provider',
    'oldStatus', 'newStatus', 'oldProcessStatus', 'newProcessStatus',
    'oldDealStatus', 'newDealStatus', 'stage', 'gruStatus', 'proxySignStatus',
    'confirmationSource', 'inpiProcessNumber', 'filingDate', 'rpiNumber',
    'dispatchCode', 'dispatchDescription', 'browser', 'operatingSystem',
    'deviceType', 'durationSeconds', 'view', 'tab', 'step', 'elapsedSeconds',
    'billingMode', 'documentCount', 'hasLogo', 'formalizationPending',
    'extension', 'kind', 'channel', 'subject', 'campaign', 'source', 'medium',
    'referrerHost', 'reason', 'opportunityCode',
];

const normalizeToken = (value: unknown) => String(value ?? '').trim().replace(/[\s-]+/g, '_').toUpperCase();

const friendlyValue = (value: unknown): string => {
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const token = normalizeToken(raw);
    return STATUS_LABELS[token] || VALUE_LABELS[token] || raw;
};

const friendlyDate = (value: unknown): string => {
    const raw = String(value);
    const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? friendlyValue(value) : date.toLocaleDateString('pt-BR');
};

const friendlyDuration = (value: unknown): string => {
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds < 0) return friendlyValue(value);
    if (seconds < 60) return `${Math.round(seconds)} s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes < 60) return remainingSeconds ? `${minutes} min ${remainingSeconds} s` : `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
};

const friendlyFileName = (value: unknown): string => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const withoutQuery = raw.split('?')[0];
    const name = withoutQuery.split('/').pop() || withoutQuery;
    try { return decodeURIComponent(name); } catch { return name; }
};

const friendlyFile = (originalName: unknown, storedFile: unknown): string => {
    if (originalName) return friendlyFileName(originalName);
    const storedName = friendlyFileName(storedFile);
    const extension = storedName.includes('.') ? storedName.split('.').pop()?.toUpperCase() : '';
    return extension ? `Documento ${extension}` : 'Documento anexado';
};

const stageTransition = (from: unknown, to: unknown) => {
    const fromLabel = friendlyValue(from);
    const toLabel = friendlyValue(to);
    if (!fromLabel || !toLabel || fromLabel === toLabel) return '';
    return `${fromLabel} → ${toLabel}`;
};

const makeDetail = (key: string, label: string, value: string): ActivityDetail | null => (
    value ? { key, label, value } : null
);

export const formatActivityMetadata = (metadata: unknown, limit = 4): ActivityDetail[] => {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return [];
    const data = metadata as Record<string, unknown>;
    const details: ActivityDetail[] = [];
    const consumed = new Set<string>();

    const add = (detail: ActivityDetail | null, ...keys: string[]) => {
        keys.forEach(key => consumed.add(key));
        if (detail && details.length < limit) details.push(detail);
    };

    if (data.originalName || data.file) {
        add(makeDetail('file', 'Arquivo', friendlyFile(data.originalName, data.file)), 'originalName', 'file');
    }

    const dealTransition = stageTransition(data.oldDealStatus ?? data.oldStatus, data.newDealStatus ?? data.newStatus);
    if (dealTransition) add(makeDetail('dealTransition', 'Mudança de etapa', dealTransition), 'oldStatus', 'newStatus', 'oldDealStatus', 'newDealStatus');

    const processTransition = stageTransition(data.oldProcessStatus, data.newProcessStatus);
    if (processTransition) add(makeDetail('processTransition', 'Andamento do processo', processTransition), 'oldProcessStatus', 'newProcessStatus');

    for (const key of PRIORITY) {
        if (details.length >= limit) break;
        if (consumed.has(key) || data[key] === undefined || data[key] === null || data[key] === '') continue;

        if (key === 'dueDate') add(makeDetail(key, 'Vencimento', friendlyDate(data[key])), key);
        else if (key === 'filingDate') add(makeDetail(key, 'Data do protocolo', friendlyDate(data[key])), key);
        else if (key === 'durationSeconds') add(makeDetail(key, 'Tempo no portal', friendlyDuration(data[key])), key);
        else if (key === 'elapsedSeconds') add(makeDetail(key, 'Tempo nesta etapa', friendlyDuration(data[key])), key);
        else if (key === 'originalName' || key === 'file') add(makeDetail('file', 'Arquivo', friendlyFileName(data[key])), key);
        else if (SIMPLE_FIELDS[key]) add(makeDetail(key, SIMPLE_FIELDS[key], friendlyValue(data[key])), key);
    }

    return details;
};

export const formatActivitySource = (source: unknown): string => {
    const raw = String(source ?? '').trim();
    if (!raw) return '';
    return VALUE_LABELS[normalizeToken(raw)] || friendlyValue(raw);
};

export const formatActivityContent = (content: unknown): string => {
    let result = String(content ?? '').trim();
    const translations = { ...STATUS_LABELS, ...VALUE_LABELS };
    Object.entries(translations)
        .sort(([first], [second]) => second.length - first.length)
        .forEach(([technical, friendly]) => {
            result = result.replace(new RegExp(`\\b${technical}\\b`, 'gi'), friendly);
        });
    return result;
};
