import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Copy, CreditCard, Download, ExternalLink, FileText, QrCode, Upload, X } from 'lucide-react';
import api from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { forceDownloadFile, resolveFileUrl } from './utils/fileDownload';
import AsteryskoAnimatedMark from '../../../asterysko/public/AsteryskoAnimatedMark';
import { useSystemBarColor } from '../../../asterysko/public/useSystemBarColor';
import NewTrademarkWizard from './NewTrademarkWizard';
import '../../../asterysko/public/AsteryskoPortal.css';

interface AsteryskoClientPortalProps {
    onExit: () => void;
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

type PortalView = 'home' | 'details' | 'profile' | 'contracts' | 'new-registration';
type ProcessTab = 'details' | 'payments' | 'documents';
type ProfileFieldKey = 'identity' | 'document' | 'rg' | 'email' | 'phone' | 'address';

interface ProfileFieldConfig {
    key: ProfileFieldKey;
    label: string;
    value: string;
    description: string;
    inputs: Array<{
        key: string;
        label: string;
        type?: string;
        autoComplete?: string;
        inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
        required?: boolean;
        maxLength?: number;
    }>;
}

interface PreviewDocument {
    name: string;
    url: string;
}

interface PaymentReceiptData {
    id: string;
    displayId: string;
    status: string;
    providerStatus?: string | null;
    amount: number;
    dueDate?: string | null;
    paidAt?: string | null;
    createdAt?: string | null;
    paymentMethod?: string | null;
    description: string;
    brandName?: string | null;
    cardBrand?: string | null;
    cardLastFour?: string | null;
    payer: { name: string; cpfCnpj: string };
    recipient: { tradeName: string; legalName: string; cpfCnpj: string };
    fiscalInvoice?: {
        id: string;
        status: string;
        statusDescription?: string | null;
        type?: string | null;
        number?: string | null;
        validationCode?: string | null;
        effectiveDate?: string | null;
        value?: number | null;
        pdfUrl?: string | null;
        xmlUrl?: string | null;
    } | null;
}

type PaymentSheet = 'setup' | 'due-date' | 'payment-method' | null;
type SubscriptionPaymentMethod = 'CREDIT_CARD' | 'PIX_AUTOMATIC';

interface CardDraft {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
}

const EMPTY_CARD: CardDraft = { holderName: '', number: '', expiryMonth: '', expiryYear: '', ccv: '' };

const ASSET_ROOT = '/assets/asterysko';
const AsteryskoPdfViewer = React.lazy(() => import('./AsteryskoPdfViewer'));

const DEFAULT_DOCUMENTS = [
    { name: 'Proposta', key: 'proposal', fields: ['proposalUrl'], icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Contrato', key: 'contract', fields: ['contractUrl'], icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Procuração', key: 'powerOfAttorney', fields: ['proxySignedUrl', 'proxyUrl'], icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Protocolo INPI', key: 'inpiProtocol', fields: ['protocolReceiptUrl'], icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Guia GRU', key: 'gru', fields: ['gruUrl'], icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Comprovante GRU', key: 'gruReceipt', fields: ['gruReceiptUrl'], icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Certificado de registro', key: 'certificate', fields: ['certificateUrl'], icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Logomarca', key: 'logo', fields: ['brandLogo'], icon: 'processo_documentos-imgGroup3.svg' },
];

const PROCESS_STATUS_LABELS: Record<string, string> = {
    WAITING_CONTRACT: 'Aguardando assinatura do contrato',
    WAITING_PAYMENT: 'Aguardando pagamento',
    NEW: 'Processo iniciado',
    STARTED: 'Processo iniciado',
    FILED: 'Protocolo realizado',
    PROTOCOL: 'Protocolo realizado',
    EXAMINATION: 'Aguardando exame de mérito',
    EXAM_MERIT: 'Aguardando exame de mérito',
    OPPOSITION: 'Oposição ou exigência',
    GRANTED: 'Registro concedido',
    WON: 'Processo concluído',
    ARCHIVED: 'Processo arquivado',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
    PAID: 'Paga',
    RECEIVED: 'Recebida',
    CONFIRMED: 'Confirmada',
    PENDING: 'Pendente',
    AWAITING_PAYMENT_METHOD: 'Aguardando forma de pagamento',
    OVERDUE: 'Vencida',
    FAILED: 'Falhou',
    REFUSED: 'Recusada',
    CANCELLED: 'Cancelada',
    REFUNDED: 'Estornada'
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Ativa',
    CREATED: 'Aguardando autorização',
    PENDING_SETUP: 'Em configuração',
    SETTING_UP: 'Em configuração',
    REAUTHORIZATION_PENDING: 'Aguardando nova autorização',
    PAYMENT_METHOD_UPDATING: 'Atualizando forma de pagamento',
    PAYMENT_RECOVERY_PENDING: 'Regularização em processamento',
    PAYMENT_FAILED: 'Pagamento pendente',
    PAYMENT_REVERSED: 'Pagamento estornado',
    SETUP_FAILED: 'Configuração incompleta',
    SETUP_REQUIRES_REVIEW: 'Conciliação necessária',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Encerrada após deferimento',
    INITIAL_PAYMENT_PENDING: 'Primeira cobrança em processamento'
};

const TIMELINE_ICONS: Record<string, string> = {
    contract_signed: 'processo_detalhes-imgMdiSign1.svg',
    payment_confirmed: 'processo_detalhes-imgFluentPayment16Regular1.svg',
    filed: 'processo_detalhes-imgGroup2.svg',
    certificate: 'processo_detalhes-imgPhHandDeposit.svg',
    status: 'processo_detalhes-imgPhHandDeposit.svg',
    created: 'processo_detalhes-imgGroup2.svg',
};

const getValue = (...values: any[]) => values.find(value => value !== undefined && value !== null && value !== '') ?? '';

const getProfileValue = (value: unknown) => {
    const normalized = String(value ?? '').trim();
    if (!normalized || /^(pending|pendente|não informado|n\/a)$/i.test(normalized)) return '';
    if (/^0+$/.test(normalized.replace(/\D/g, '')) && normalized.replace(/\D/g, '').length >= 11) return '';
    if (/^endereço pendente$/i.test(normalized)) return '';
    return normalized;
};

const addAuthToken = (url: string) => {
    const token = localStorage.getItem('token');
    if (!token || url.includes('token=')) return url;
    try {
        const targetOrigin = new URL(url, window.location.origin).origin;
        const backendOrigin = new URL(resolveFileUrl('/'), window.location.origin).origin;
        if (targetOrigin !== window.location.origin && targetOrigin !== backendOrigin) return url;
    } catch {
        return url;
    }
    return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
};

const getInitials = (value: string) => value.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();

const formatCurrency = (value: unknown) => {
    if (value === null || value === undefined || value === '') return 'Valor não informado';
    const number = Number(value);
    if (!Number.isFinite(number)) return 'Valor não informado';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};

const formatDate = (value: unknown, fallback = 'Data não informada') => {
    if (!value) return fallback;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
};

const formatTimelineDate = (value: unknown) => {
    if (!value) return 'Data não informada';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    const parts = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value || '';
    return `${part('day')} ${part('month').replace('.', '')}. ${part('year')}`;
};

const formatDateTime = (value: unknown, fallback = 'Data não informada') => {
    if (!value) return fallback;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'America/Fortaleza'
    }).format(date);
};

const getPaymentMethodLabel = (receipt: PaymentReceiptData) => {
    const method = String(receipt.paymentMethod || '').toUpperCase();
    if (method.includes('PIX')) return 'Pix';
    if (method.includes('CARD')) {
        const card = [receipt.cardBrand, receipt.cardLastFour ? `final ${receipt.cardLastFour}` : ''].filter(Boolean).join(' · ');
        return card ? `Cartão de crédito · ${card}` : 'Cartão de crédito';
    }
    if (method.includes('BOLETO')) return 'Boleto bancário';
    return 'Forma de pagamento não informada';
};

const getProcessStatusLabel = (status: unknown) => PROCESS_STATUS_LABELS[String(status || '').toUpperCase()] || 'Em andamento';

const hasConfirmedPayment = (process: any) => ['PAID', 'RECEIVED', 'CONFIRMED'].includes(String(process?.paymentStatus || '').toUpperCase());

const hasSubmittedProxy = (process: any) => {
    const status = String(process?.proxySignStatus || 'PENDING').toUpperCase();
    return Boolean(process?.proxySignedUrl) || ['UPLOADED', 'SIGNED', 'VALIDATED', 'APPROVED'].includes(status);
};

const getTimelineIcon = (item: any) => {
    const searchable = `${item?.type || ''} ${item?.code || ''} ${item?.title || ''}`.toLowerCase();
    if (/contract|contrato/.test(searchable)) return TIMELINE_ICONS.contract_signed;
    if (/payment|pagamento|invoice|fatura/.test(searchable)) return TIMELINE_ICONS.payment_confirmed;
    if (/proxy|procura/.test(searchable)) return 'processo_detalhes-imgMdiSign.svg';
    if (/filed|protocol/.test(searchable)) return TIMELINE_ICONS.filed;
    if (/certificate|certificado|granted|concedido/.test(searchable)) return TIMELINE_ICONS.certificate;
    return TIMELINE_ICONS[item?.type] || TIMELINE_ICONS.status;
};

const getInitialView = (): PortalView => {
    const requestedView = new URLSearchParams(window.location.search).get('view');
    return requestedView === 'details' || requestedView === 'profile' || requestedView === 'contracts' || requestedView === 'new-registration' ? requestedView : 'home';
};

const getInitialProcessTab = (): ProcessTab => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    return requestedTab === 'payments' || requestedTab === 'documents' ? requestedTab : 'details';
};

const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button className="ast-round-button" type="button" onClick={onClick} aria-label="Voltar">
        <ArrowLeft size={20} strokeWidth={1.8} />
    </button>
);

const ProcessTabs = ({ active, onChange }: { active: ProcessTab; onChange: (tab: ProcessTab) => void }) => {
    const tabs: Array<{ id: ProcessTab; label: string; icon: string }> = [
        { id: 'details', label: 'Detalhes', icon: 'processo_detalhes-imgGgDetailsMore.svg' },
        { id: 'payments', label: 'Pagamentos', icon: 'processo_detalhes-imgFluentPayment16Regular.svg' },
        { id: 'documents', label: 'Documentos', icon: 'processo_detalhes-imgGroup1.svg' },
    ];

    return (
        <nav className="ast-process-tabs" aria-label="Seções do processo">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`ast-process-tab ${active === tab.id ? 'ast-process-tab--active' : ''}`}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    aria-current={active === tab.id ? 'page' : undefined}
                >
                    <img src={`${ASSET_ROOT}/${tab.icon}`} alt="" />
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};

export const AsteryskoClientPortal: React.FC<AsteryskoClientPortalProps> = ({ onExit }) => {
    const { user, logout, refreshUser } = useAuth();
    const [view, setView] = useState<PortalView>(getInitialView);
    const [processTab, setProcessTab] = useState<ProcessTab>(getInitialProcessTab);
    const [clientData, setClientData] = useState<any>(null);
    const [processes, setProcesses] = useState<any[]>([]);
    const [financials, setFinancials] = useState<any>({ invoices: [], contracts: [] });
    const [selectedProcess, setSelectedProcess] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuClosing, setMenuClosing] = useState(false);
    const [viewLeaving, setViewLeaving] = useState(false);
    const [editingProfileField, setEditingProfileField] = useState<ProfileFieldKey | null>(null);
    const [profileDraft, setProfileDraft] = useState<Record<string, string>>({});
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [previewDocument, setPreviewDocument] = useState<PreviewDocument | null>(null);
    const [previewClosing, setPreviewClosing] = useState(false);
    const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceiptData | null>(null);
    const [paymentReceiptLoading, setPaymentReceiptLoading] = useState<string | null>(null);
    const [paymentReceiptError, setPaymentReceiptError] = useState('');
    const [subscriptionContext, setSubscriptionContext] = useState<any>(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    const [paymentSheet, setPaymentSheet] = useState<PaymentSheet>(null);
    const [subscriptionMethod, setSubscriptionMethod] = useState<SubscriptionPaymentMethod>('CREDIT_CARD');
    const [subscriptionDueDay, setSubscriptionDueDay] = useState(Math.min(new Date().getDate(), 28));
    const [cardDraft, setCardDraft] = useState<CardDraft>(EMPTY_CARD);
    const [subscriptionSubmitting, setSubscriptionSubmitting] = useState(false);
    const [subscriptionFeedback, setSubscriptionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [pixCopied, setPixCopied] = useState(false);
    const [proxyUploading, setProxyUploading] = useState(false);
    const [proxyDownloading, setProxyDownloading] = useState(false);
    const [proxyFeedback, setProxyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const pageRef = useRef<HTMLDivElement | null>(null);
    const proxyUploadInputRef = useRef<HTMLInputElement | null>(null);
    const viewTimer = useRef<number | null>(null);
    const menuTimer = useRef<number | null>(null);
    const subscriptionRequestRef = useRef(0);

    useSystemBarColor(view === 'details' ? '#ffffff' : '#f3f3f3');

    const fetchSubscriptionContext = async (processId: string, showLoading = true) => {
        const requestId = ++subscriptionRequestRef.current;
        if (showLoading) setSubscriptionLoading(true);
        try {
            const response = await api.get(`/asterysko/portal/subscriptions/${processId}`);
            if (requestId !== subscriptionRequestRef.current) return;
            const context = { ...response.data, processId: response.data?.processId || processId };
            setSubscriptionContext(context);
            const paymentConfirmed = [context?.subscription?.lastPaymentStatus, ...(Array.isArray(context?.invoices) ? context.invoices.map((invoice: any) => invoice.status) : [])]
                .some(status => ['PAID', 'RECEIVED', 'CONFIRMED'].includes(String(status || '').toUpperCase()));
            if (paymentConfirmed) {
                setProcesses(current => current.map(process => String(process.id) === processId ? { ...process, paymentStatus: 'PAID' } : process));
                setSelectedProcess((current: any) => current && String(current.id) === processId ? { ...current, paymentStatus: 'PAID' } : current);
            }
        } catch (fetchError: any) {
            if (requestId !== subscriptionRequestRef.current) return;
            setSubscriptionFeedback({
                type: 'error',
                message: fetchError.response?.data?.message || 'Não foi possível carregar a assinatura.'
            });
        } finally {
            if (showLoading && requestId === subscriptionRequestRef.current) setSubscriptionLoading(false);
        }
    };

    useEffect(() => {
        const urlToken = new URLSearchParams(window.location.search).get('token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [dashboardResponse, financialResponse] = await Promise.all([
                    api.get('/asterysko/portal/dashboard'),
                    api.get('/asterysko/portal/financials'),
                ]);
                const client = dashboardResponse.data?.client;
                const invoices = financialResponse.data?.invoices;
                const contracts = financialResponse.data?.contracts;
                setClientData(client || null);
                setFinancials({
                    invoices: Array.isArray(invoices) ? invoices : [],
                    contracts: Array.isArray(contracts) ? contracts : [],
                });

                const processMap = new Map<string, any>();
                client?.brands?.forEach((brand: any) => {
                    brand.processes?.forEach((process: any) => {
                        const id = String(process.id || `${brand.id}-${processMap.size}`);
                        if (!processMap.has(id)) processMap.set(id, {
                            ...process,
                            brandName: brand.name,
                            brandLogo: brand.logoUrl,
                            presentation: process.presentation || brand.presentation,
                            nclClasses: process.nclClasses?.length ? process.nclClasses : brand.nclClasses,
                        });
                    });
                });
                const loadedProcesses = Array.from(processMap.values());
                const requestedProcessId = new URLSearchParams(window.location.search).get('processId');
                setProcesses(loadedProcesses);
                setSelectedProcess(loadedProcesses.find(process => String(process.id) === requestedProcessId) || loadedProcesses[0] || null);
                setError('');
            } catch (fetchError: any) {
                console.error('Error loading portal data:', fetchError);
                if (fetchError.response?.status === 401) {
                    logout();
                    window.location.replace('/portal/login');
                    return;
                }
                setError('Não foi possível carregar os dados do portal. Tente novamente em alguns instantes.');
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [logout]);

    useEffect(() => {
        const processId = selectedProcess?.id;
        if (!processId) {
            subscriptionRequestRef.current += 1;
            setSubscriptionContext(null);
            return;
        }
        setSubscriptionContext(null);
        setSubscriptionFeedback(null);
        void fetchSubscriptionContext(String(processId));
    }, [selectedProcess?.id]);

    useEffect(() => () => {
        if (viewTimer.current) window.clearTimeout(viewTimer.current);
        if (menuTimer.current) window.clearTimeout(menuTimer.current);
    }, []);

    useEffect(() => {
        if (!previewDocument) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeDocumentPreview();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [previewDocument]);

    useEffect(() => {
        if (!paymentReceipt) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setPaymentReceipt(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [paymentReceipt]);

    useEffect(() => {
        if (!paymentSheet) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !subscriptionSubmitting) setPaymentSheet(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [paymentSheet, subscriptionSubmitting]);

    useEffect(() => {
        if (!menuOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeMenu();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [menuOpen]);

    const displayedProcesses = processes;

    const clientName = String(getValue(clientData?.name, user?.name, 'Levy'));
    const firstName = clientName.split(/\s+/)[0];
    const brandName = String(getValue(selectedProcess?.brandName, displayedProcesses[0]?.brandName, 'Sua marca'));
    const invoices = financials.invoices as any[];
    const contracts = financials.contracts as any[];
    const pendingContracts = contracts.filter(contract => {
        const status = String(contract.status || contract.signatureStatus || contract.contractSignStatus).toUpperCase();
        return status === 'PENDING' || status === 'PENDENTE' || status.includes('AGUARD');
    });
    const pendingProxyProcesses = displayedProcesses.filter(process => hasConfirmedPayment(process) && !hasSubmittedProxy(process));
    const selectedProcessPaymentConfirmed = hasConfirmedPayment(selectedProcess);
    const selectedProcessProxySubmitted = hasSubmittedProxy(selectedProcess);
    const selectedProcessProxyStatus = String(selectedProcess?.proxySignStatus || 'PENDING').toUpperCase();
    const subscription = subscriptionContext?.subscription;
    const subscriptionInvoices = Array.isArray(subscriptionContext?.invoices) ? subscriptionContext.invoices : [];
    const selectedProcessId = String(selectedProcess?.id || '');
    const subscriptionMatchesSelectedProcess = String(subscriptionContext?.processId || subscription?.processId || '') === selectedProcessId;
    const processInvoices = invoices.filter(invoice => String(invoice.processId || '') === selectedProcessId);
    const displayedPaymentHistory = subscriptionMatchesSelectedProcess && subscription ? subscriptionInvoices : processInvoices;
    const subscriptionStatus = String(subscription?.status || '').toUpperCase();
    const subscriptionMethodLabel = subscription?.paymentMethod === 'PIX_AUTOMATIC' ? 'Pix Automático' : 'Cartão de crédito';
    const pixAutomaticAvailable = Boolean(subscriptionContext?.availablePaymentMethods?.includes('PIX_AUTOMATIC'));

    const profileValues: Record<string, string> = {
        name: getProfileValue(getValue(clientData?.name, user?.name)),
        cpfCnpj: getProfileValue(clientData?.cpfCnpj),
        rg: getProfileValue(clientData?.rg),
        email: getProfileValue(getValue(clientData?.email, user?.email)),
        phone: getProfileValue(getValue(clientData?.phone, user?.phone)),
        address: getProfileValue(clientData?.address),
        city: getProfileValue(clientData?.city),
        state: getProfileValue(clientData?.state),
        postalCode: getProfileValue(clientData?.postalCode),
    };
    const addressDisplay = [profileValues.address, [profileValues.city, profileValues.state].filter(Boolean).join(' - '), profileValues.postalCode && `CEP ${profileValues.postalCode}`].filter(Boolean).join(', ');
    const isCompanyProfile = String(clientData?.type || '').toUpperCase() === 'PJ';
    const profileComplete = ['name', 'email', 'cpfCnpj', 'address', 'city', 'state', 'postalCode'].every(key => Boolean(profileValues[key]));
    const profileGroups: Array<{ title: string; fields: ProfileFieldConfig[] }> = [
        {
            title: 'Identificação',
            fields: [
                {
                    key: 'identity',
                    label: isCompanyProfile ? 'Razão social' : 'Nome completo',
                    value: profileValues.name,
                    description: isCompanyProfile ? 'Informe a razão social exatamente como consta no documento da empresa.' : 'Informe seu nome completo como consta no documento de identificação.',
                    inputs: [{ key: 'name', label: isCompanyProfile ? 'Razão social' : 'Nome completo', autoComplete: 'name', required: true }]
                },
                {
                    key: 'document',
                    label: isCompanyProfile ? 'CNPJ' : 'CPF',
                    value: profileValues.cpfCnpj,
                    description: `Informe o ${isCompanyProfile ? 'CNPJ' : 'CPF'} vinculado ao seu cadastro.`,
                    inputs: [{ key: 'cpfCnpj', label: isCompanyProfile ? 'CNPJ' : 'CPF', inputMode: 'numeric' }]
                },
                {
                    key: 'rg',
                    label: 'RG',
                    value: profileValues.rg,
                    description: 'Informe o número do seu documento de identidade.',
                    inputs: [{ key: 'rg', label: 'RG' }]
                }
            ]
        },
        {
            title: 'Contato',
            fields: [
                {
                    key: 'email',
                    label: 'E-mail',
                    value: profileValues.email,
                    description: 'Este e-mail também poderá ser usado para receber códigos e atualizações do portal.',
                    inputs: [{ key: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', required: true }]
                },
                {
                    key: 'phone',
                    label: 'WhatsApp',
                    value: profileValues.phone,
                    description: 'Use um número com DDD para receber códigos e atualizações pelo WhatsApp.',
                    inputs: [{ key: 'phone', label: 'Número com DDD', type: 'tel', autoComplete: 'tel', maxLength: 20 }]
                },
                {
                    key: 'address',
                    label: 'Endereço',
                    value: addressDisplay,
                    description: 'Mantenha seu endereço completo atualizado.',
                    inputs: [
                        { key: 'address', label: 'Logradouro e número', autoComplete: 'street-address' },
                        { key: 'city', label: 'Cidade', autoComplete: 'address-level2' },
                        { key: 'state', label: 'UF', autoComplete: 'address-level1', maxLength: 2 },
                        { key: 'postalCode', label: 'CEP', autoComplete: 'postal-code', maxLength: 10 }
                    ]
                }
            ]
        }
    ];

    const navigateView = (nextView: PortalView) => {
        if (view === nextView || viewLeaving) return;
        setViewLeaving(true);
        if (viewTimer.current) window.clearTimeout(viewTimer.current);
        viewTimer.current = window.setTimeout(() => {
            setView(nextView);
            setViewLeaving(false);
            pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }, 210);
    };

    const openMenu = () => {
        if (menuTimer.current) window.clearTimeout(menuTimer.current);
        setMenuClosing(false);
        setMenuOpen(true);
    };

    const closeMenu = (afterClose?: () => void) => {
        if (!menuOpen || menuClosing) return;
        setMenuClosing(true);
        if (menuTimer.current) window.clearTimeout(menuTimer.current);
        menuTimer.current = window.setTimeout(() => {
            setMenuOpen(false);
            setMenuClosing(false);
            afterClose?.();
        }, 300);
    };

    const openProcess = (process: any) => {
        setSelectedProcess(process);
        setProcessTab('details');
        navigateView('details');
    };

    const openProcessDocuments = (process: any) => {
        setSelectedProcess(process);
        setProcessTab('documents');
        setProxyFeedback(null);
        navigateView('details');
    };

    const goHome = () => {
        navigateView('home');
    };

    const download = (url: unknown, fileName: string) => {
        if (typeof url === 'string' && url) void forceDownloadFile(url, fileName);
    };

    const openContractForSignature = (contract: any) => {
        const url = String(getValue(contract.url, contract.contractUrl, contract.fileUrl));
        if (url) window.location.assign(url);
    };

    const beginProfileEdit = (field: ProfileFieldConfig) => {
        if (editingProfileField || profileSaving) return;
        setProfileDraft({ ...profileValues });
        setProfileFeedback(null);
        setEditingProfileField(field.key);
    };

    const cancelProfileEdit = () => {
        if (profileSaving) return;
        setEditingProfileField(null);
        setProfileDraft({});
        setProfileFeedback(null);
    };

    const saveProfileField = async (field: ProfileFieldConfig) => {
        if (profileSaving) return;
        try {
            setProfileSaving(true);
            setProfileFeedback(null);
            const payload = Object.fromEntries(field.inputs.map(input => [input.key, profileDraft[input.key] ?? '']));
            const response = await api.put('/asterysko/portal/profile', payload);
            const updatedProfile = response.data?.profile;
            if (updatedProfile) {
                setClientData((current: any) => ({ ...current, ...updatedProfile }));
            }
            await refreshUser();
            setEditingProfileField(null);
            setProfileDraft({});
            setProfileFeedback({ type: 'success', message: 'Dados atualizados com sucesso.' });
        } catch (saveError: any) {
            setProfileFeedback({
                type: 'error',
                message: saveError.response?.data?.message || 'Não foi possível salvar. Revise os dados e tente novamente.'
            });
        } finally {
            setProfileSaving(false);
        }
    };

    const getDocumentUrl = (document: typeof DEFAULT_DOCUMENTS[number]) => getValue(
        selectedProcess?.documents?.[document.key],
        ...document.fields.map(field => selectedProcess?.[field])
    );

    const downloadProxyTemplate = async () => {
        const processId = String(selectedProcess?.id || '');
        if (!processId || !selectedProcessPaymentConfirmed || proxyDownloading) return;
        try {
            setProxyDownloading(true);
            setProxyFeedback(null);
            const response = await api.get(`/asterysko/processes/${processId}/proxy/download-pdf`, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `Procuracao_${brandName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 300);
        } catch (downloadError: any) {
            let message = 'Não foi possível gerar a procuração. Confira seus dados e tente novamente.';
            const errorBody = downloadError.response?.data;
            if (errorBody instanceof Blob && errorBody.type.includes('json')) {
                try {
                    const parsed = JSON.parse(await errorBody.text());
                    message = parsed.message || parsed.error || message;
                } catch {
                    // Mantém a mensagem segura de fallback.
                }
            }
            setProxyFeedback({ type: 'error', message });
        } finally {
            setProxyDownloading(false);
        }
    };

    const uploadSignedProxy = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const processId = String(selectedProcess?.id || '');
        event.target.value = '';
        if (!file || !processId || proxyUploading) return;

        const acceptedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
        if (!acceptedTypes.includes(file.type)) {
            setProxyFeedback({ type: 'error', message: 'Envie o documento assinado em PDF, PNG ou JPG.' });
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setProxyFeedback({ type: 'error', message: 'O arquivo deve ter no máximo 10 MB.' });
            return;
        }

        try {
            setProxyUploading(true);
            setProxyFeedback(null);
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post(`/asterysko/processes/${processId}/proxy/upload`, formData);
            const patch = {
                proxySignedUrl: response.data?.proxySignedUrl,
                proxySignStatus: response.data?.proxySignStatus || 'UPLOADED'
            };
            setProcesses(current => current.map(process => String(process.id) === processId ? { ...process, ...patch } : process));
            setSelectedProcess((current: any) => current && String(current.id) === processId ? { ...current, ...patch } : current);
            setProxyFeedback({
                type: 'success',
                message: response.data?.message || 'Procuração enviada com sucesso e encaminhada para validação.'
            });
        } catch (uploadError: any) {
            setProxyFeedback({
                type: 'error',
                message: uploadError.response?.data?.error || uploadError.response?.data?.message || 'Não foi possível enviar a procuração.'
            });
        } finally {
            setProxyUploading(false);
        }
    };

    const getDocumentFileName = (name: string, url: string, isLogo = false) => {
        const cleanUrl = url.split('?')[0];
        const extension = cleanUrl.match(/\.([a-z0-9]{2,5})$/i)?.[1] || (isLogo ? 'png' : 'pdf');
        return `${name}.${extension}`;
    };

    const openDocumentPreview = (name: string, url: string) => {
        if (!url) return;
        setPreviewClosing(false);
        setPreviewDocument({ name, url });
    };

    const openPaymentReceipt = async (invoice: any) => {
        const receiptId = String(getValue(invoice.invoiceId, invoice.dealId, invoice.id));
        if (!receiptId || paymentReceiptLoading) return;
        try {
            setPaymentReceiptLoading(receiptId);
            setPaymentReceiptError('');
            const response = await api.get(`/asterysko/portal/financials/${receiptId}/payment-receipt`);
            setPaymentReceipt(response.data);
        } catch (receiptError: any) {
            setPaymentReceiptError(receiptError.response?.data?.error || 'Não foi possível abrir os detalhes deste pagamento.');
        } finally {
            setPaymentReceiptLoading(null);
        }
    };

    const downloadOwnPaymentReceipt = (receipt: PaymentReceiptData) => {
        void forceDownloadFile(
            `/api/asterysko/portal/financials/${receipt.id}/payment-receipt.pdf`,
            `Comprovante_Asterysko_${receipt.id.slice(0, 8)}.pdf`
        );
    };

    const openFiscalInvoicePdf = (receipt: PaymentReceiptData) => {
        setPaymentReceipt(null);
        openDocumentPreview(
            `NFS-e_Asterysko_${receipt.fiscalInvoice?.number || receipt.id.slice(0, 8)}.pdf`,
            `/api/asterysko/portal/financials/${receipt.id}/fiscal-invoice/pdf`
        );
    };

    const downloadFiscalInvoiceXml = (receipt: PaymentReceiptData) => {
        void forceDownloadFile(
            `/api/asterysko/portal/financials/${receipt.id}/fiscal-invoice/xml`,
            `NFS-e_Asterysko_${receipt.fiscalInvoice?.number || receipt.id.slice(0, 8)}.xml`
        );
    };

    const closeDocumentPreview = () => {
        if (!previewDocument || previewClosing) return;
        setPreviewClosing(true);
        window.setTimeout(() => {
            setPreviewDocument(null);
            setPreviewClosing(false);
        }, 220);
    };

    const resolvedPreviewUrl = previewDocument
        ? addAuthToken(previewDocument.url.startsWith('/sign/')
            ? `${window.location.origin}${previewDocument.url}`
            : resolveFileUrl(previewDocument.url))
        : '';
    const previewUrlWithoutQuery = resolvedPreviewUrl.split('?')[0].toLowerCase();
    const previewIsImage = /^data:image\//.test(resolvedPreviewUrl) || /\.(png|jpe?g|webp|gif|svg)$/.test(previewUrlWithoutQuery);
    const previewIsPdf = previewDocument?.name.toLowerCase().endsWith('.pdf') || /\.pdf$/.test(previewUrlWithoutQuery) || /\/fiscal-invoice\/pdf$/.test(previewUrlWithoutQuery);

    const openPaymentSheet = (sheet: Exclude<PaymentSheet, null>) => {
        setSubscriptionFeedback(null);
        setPixCopied(false);
        setCardDraft(EMPTY_CARD);
        setSubscriptionDueDay(Number(subscription?.dueDay || Math.min(new Date().getDate(), 28)));
        const alternativeMethod = subscription?.paymentMethod === 'CREDIT_CARD' && pixAutomaticAvailable
            ? 'PIX_AUTOMATIC'
            : 'CREDIT_CARD';
        setSubscriptionMethod(sheet === 'payment-method' ? alternativeMethod : 'CREDIT_CARD');
        setPaymentSheet(sheet);
    };

    const submitSubscriptionAction = async (event: React.FormEvent) => {
        event.preventDefault();
        const processId = String(selectedProcess?.id || '');
        if (!processId || subscriptionSubmitting) return;
        if (subscriptionMethod === 'PIX_AUTOMATIC' && !pixAutomaticAvailable) {
            setSubscriptionMethod('CREDIT_CARD');
            return;
        }
        try {
            setSubscriptionSubmitting(true);
            setSubscriptionFeedback(null);
            if (paymentSheet === 'due-date') {
                await api.patch(`/asterysko/portal/subscriptions/${processId}/due-date`, { dueDay: subscriptionDueDay });
            } else {
                const payload = {
                    paymentMethod: subscriptionMethod,
                    dueDay: subscriptionDueDay,
                    ...(subscriptionMethod === 'CREDIT_CARD' ? { creditCard: cardDraft } : {})
                };
                if (paymentSheet === 'payment-method') {
                    await api.put(`/asterysko/portal/subscriptions/${processId}/payment-method`, payload);
                } else {
                    await api.post('/asterysko/portal/subscriptions', { processId, ...payload });
                }
            }
            await fetchSubscriptionContext(processId, false);
            setCardDraft(EMPTY_CARD);
            setPaymentSheet(null);
            setSubscriptionFeedback({
                type: 'success',
                message: subscriptionMethod === 'PIX_AUTOMATIC' && paymentSheet !== 'due-date'
                    ? 'Escaneie o QR Code abaixo para confirmar o Pix Automático.'
                    : paymentSheet === 'due-date'
                        ? 'Solicitação de novo vencimento registrada.'
                        : paymentSheet === 'payment-method'
                            ? 'Novo cartão registrado. A cobrança pendente está sendo processada.'
                        : 'Assinatura configurada com sucesso.'
            });
        } catch (actionError: any) {
            setSubscriptionFeedback({
                type: 'error',
                message: actionError.response?.data?.message || 'Não foi possível concluir esta alteração.'
            });
        } finally {
            setSubscriptionSubmitting(false);
        }
    };

    const copyPixCode = async () => {
        const payload = subscription?.pixQrCodePayload;
        if (!payload) return;
        await navigator.clipboard?.writeText(payload);
        setPixCopied(true);
        window.setTimeout(() => setPixCopied(false), 1800);
    };

    const signOut = () => {
        logout();
        onExit();
        window.location.replace('/portal/login');
    };

    if (loading) {
        return (
            <div className="ast-page">
                <div className="ast-loading">
                    <AsteryskoAnimatedMark className="ast-loading__mark" />
                    <p>Carregando seu portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ast-page" ref={pageRef}>
            <main className="ast-portal__stage">
                <header className="ast-desktop-nav" aria-label="Navegação principal do portal">
                    <button className="ast-desktop-nav__brand" type="button" onClick={goHome} aria-label="Ir para o início">
                        <img src={`${ASSET_ROOT}/brand-mark.svg`} alt="" />
                        <span><strong>Asterysko</strong><small>Portal do cliente</small></span>
                    </button>

                    <nav className="ast-desktop-nav__links" aria-label="Áreas do portal">
                        <button className={view === 'home' ? 'ast-desktop-nav__link--active' : ''} type="button" onClick={goHome} aria-current={view === 'home' ? 'page' : undefined}>Início</button>
                        <button className={view === 'profile' ? 'ast-desktop-nav__link--active' : ''} type="button" onClick={() => navigateView('profile')} aria-current={view === 'profile' ? 'page' : undefined}>Meus dados</button>
                        <button className={view === 'contracts' ? 'ast-desktop-nav__link--active' : ''} type="button" onClick={() => navigateView('contracts')} aria-current={view === 'contracts' ? 'page' : undefined}>Contratos</button>
                    </nav>

                    <button className="ast-desktop-nav__account" type="button" onClick={openMenu} aria-label="Abrir menu e opções da conta">
                        <span className="ast-desktop-nav__avatar">{getInitials(clientName)}</span>
                        <span><strong>{firstName}</strong><small>Menu e suporte</small></span>
                        <img src={`${ASSET_ROOT}/home-imgJamMenu.svg`} alt="" />
                    </button>
                </header>

                <div key={view} className={`ast-view-shell ${viewLeaving ? 'ast-view-shell--leaving' : 'ast-view-shell--entering'}`}>
                {view === 'home' && (
                    <section className="ast-home-page" aria-labelledby="ast-home-title">
                        <div className="ast-portal__topbar">
                            <div className="ast-portal__intro">
                                <h1 id="ast-home-title">Olá, {firstName}</h1>
                                <p>Acompanhe seus processos e mantenha suas marcas protegidas.</p>
                            </div>
                            <button className="ast-round-button ast-menu-button" type="button" onClick={openMenu} aria-label="Abrir menu">
                                <img src={`${ASSET_ROOT}/home-imgJamMenu.svg`} alt="" />
                            </button>
                        </div>

                        {error && <p className="ast-empty-note" role="status">{error}</p>}

                        {pendingContracts.length > 0 && (
                            <button className="ast-contract-alert" type="button" onClick={() => openContractForSignature(pendingContracts[0])}>
                                <span className="ast-contract-alert__icon"><FileText size={22} /></span>
                                <span><small>Ação necessária</small><strong>Seu contrato está pronto para assinatura</strong><em>Revise os dados e assine para liberar a próxima etapa do processo.</em></span>
                                <span className="ast-contract-alert__action">Assinar agora <ChevronRight size={18} /></span>
                            </button>
                        )}

                        {pendingProxyProcesses.length > 0 && (
                            <button className="ast-contract-alert ast-proxy-alert" type="button" onClick={() => openProcessDocuments(pendingProxyProcesses[0])}>
                                <span className="ast-contract-alert__icon"><FileText size={22} /></span>
                                <span><small>Ação necessária</small><strong>Assine sua procuração no Gov.br</strong><em>Baixe o documento preenchido e envie a versão assinada para continuarmos seu processo no INPI.</em></span>
                                <span className="ast-contract-alert__action">Ver documento <ChevronRight size={18} /></span>
                            </button>
                        )}

                        <div className="ast-home-dashboard">
                            <div className="ast-home-primary">
                                <div className="ast-home-section-title">
                                    <div><span>Visão geral</span><h2>Seus processos</h2></div>
                                    <small>{displayedProcesses.length} {displayedProcesses.length === 1 ? 'processo' : 'processos'}</small>
                                </div>

                                <div className="ast-home-processes">
                                    {displayedProcesses.map((process, index) => {
                                        const processName = String(getValue(process.brandName, 'Sua marca'));
                                        return (
                                            <button className="ast-process-card" key={process.id || index} type="button" onClick={() => openProcess(process)}>
                                                <span className="ast-process-card__status">
                                                    {getProcessStatusLabel(process.status)}
                                                </span>
                                                <span className="ast-process-card__spacer" />
                                                <span className="ast-process-card__body">
                                                    <span className="ast-process-card__logo">
                                                        {process.brandLogo ? <img src={process.brandLogo} alt="" /> : getInitials(processName)}
                                                    </span>
                                                    <strong className="ast-process-card__name">{processName}</strong>
                                                </span>
                                            </button>
                                        );
                                    })}
                                    {!loading && !displayedProcesses.length && (
                                        <p className="ast-empty-note">Nenhum processo foi vinculado ao seu cadastro ainda.</p>
                                    )}
                                    <button className="ast-new-process-card" type="button" onClick={() => navigateView('new-registration')}>
                                        <img src={`${ASSET_ROOT}/home-imgFormkitAdd.svg`} alt="" />
                                        <span>Registrar uma nova marca</span>
                                    </button>
                                </div>
                            </div>

                            <aside className="ast-home-aside" aria-label="Proteção e atalhos">
                                <div className="ast-protection-banner">
                                    <img src={`${ASSET_ROOT}/home-imgBoxiconsRegistered.svg`} alt="" />
                                    <div>
                                        <strong>Proteção não termina no registro</strong>
                                        <span>Monitore, renove e expanda sua marca.</span>
                                    </div>
                                </div>

                                <div className="ast-quick-actions">
                                    <div><span>Atalhos</span><strong>Acesso rápido</strong></div>
                                    <button type="button" onClick={() => navigateView('profile')}>
                                        <span><img src={`${ASSET_ROOT}/menu-imgTablerUser.svg`} alt="" />Meus dados</span><ChevronRight size={18} />
                                    </button>
                                    <button type="button" onClick={() => navigateView('contracts')}>
                                        <span><FileText size={20} />Contratos</span><ChevronRight size={18} />
                                    </button>
                                </div>
                            </aside>
                        </div>

                        <section className="ast-benefits" aria-labelledby="ast-benefits-title">
                            <div className="ast-home-section-title">
                                <div><span>Ecossistema Asterysko</span><h2 id="ast-benefits-title">Mais benefícios</h2></div>
                            </div>
                            <div className="ast-benefit-row">
                                {[0, 1, 2].map(index => (
                                    <article className="ast-benefit-card" key={index}>
                                        <img className="ast-benefit-card__image" src={`${ASSET_ROOT}/home-imgImage1.png`} alt="Notebook exibindo o Allyo" />
                                        <div className="ast-benefit-card__shade">
                                            <span className="ast-benefit-card__tag">Teste grátis</span>
                                            <h3>Allyo</h3>
                                            <p>Time criativo do seu time criativo</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <img className="ast-home-burst" src={`${ASSET_ROOT}/home-imgGroup26.svg`} alt="" aria-hidden="true" />
                    </section>
                )}

                {view === 'new-registration' && (
                    <NewTrademarkWizard
                        profileComplete={profileComplete}
                        onCancel={goHome}
                        onEditProfile={() => navigateView('profile')}
                    />
                )}

                {view === 'profile' && (
                    <section className="ast-section-page" aria-labelledby="ast-profile-title">
                        <div className="ast-back-row"><BackButton onClick={goHome} /></div>
                        <header className="ast-section-heading">
                            <h1 id="ast-profile-title">Meus dados</h1>
                            <p>Gerencie as informações cadastrais e de segurança da sua conta.</p>
                        </header>

                        {profileFeedback && (
                            <p className={`ast-profile-feedback ast-profile-feedback--${profileFeedback.type}`} role="status">
                                {profileFeedback.message}
                            </p>
                        )}

                        <div className="ast-profile-grid">
                            {profileGroups.map(group => (
                                <div className="ast-data-card" key={group.title}>
                                    <h2 className="ast-card-title">{group.title}</h2>
                                    <div className="ast-data-card__body">
                                    {group.fields.map(field => {
                                        const isEditing = editingProfileField === field.key;
                                        const anotherFieldIsEditing = editingProfileField !== null && !isEditing;
                                        return (
                                            <div className={`ast-data-row ${isEditing ? 'ast-data-row--editing' : ''}`} key={field.key}>
                                                <div className="ast-data-row__summary">
                                                    <div className="ast-data-row__copy">
                                                        <strong>{field.label}</strong>
                                                        <small className={!field.value ? 'ast-data-row__empty' : undefined}>{field.value || 'Não fornecido'}</small>
                                                    </div>
                                                    <button
                                                        className="ast-data-row__action"
                                                        type="button"
                                                        disabled={anotherFieldIsEditing || profileSaving}
                                                        onClick={() => isEditing ? cancelProfileEdit() : beginProfileEdit(field)}
                                                    >
                                                        {isEditing ? 'Cancelar' : field.value ? 'Editar' : 'Adicionar'}
                                                    </button>
                                                </div>

                                                {isEditing && (
                                                    <form className="ast-data-editor" onSubmit={event => { event.preventDefault(); void saveProfileField(field); }}>
                                                        <p>{field.description}</p>
                                                        <div className={`ast-data-editor__fields ${field.inputs.length > 1 ? 'ast-data-editor__fields--address' : ''}`}>
                                                            {field.inputs.map(input => (
                                                                <label className="ast-data-input" key={input.key}>
                                                                    <span>{input.label}</span>
                                                                    <input
                                                                        autoFocus={input === field.inputs[0]}
                                                                        type={input.type || 'text'}
                                                                        autoComplete={input.autoComplete}
                                                                        required={input.required}
                                                                        maxLength={input.maxLength}
                                                                        inputMode={input.inputMode}
                                                                        value={profileDraft[input.key] ?? ''}
                                                                        onChange={event => setProfileDraft(current => ({ ...current, [input.key]: event.target.value }))}
                                                                    />
                                                                </label>
                                                            ))}
                                                        </div>
                                                        <button className="ast-data-editor__save" type="submit" disabled={profileSaving}>
                                                            {profileSaving ? 'Salvando...' : 'Salvar alterações'}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        );
                                    })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {view === 'contracts' && (
                    <section className="ast-section-page" aria-labelledby="ast-contracts-title">
                        <div className="ast-back-row"><BackButton onClick={goHome} /></div>
                        <header className="ast-section-heading">
                            <h1 id="ast-contracts-title">Contratos</h1>
                            <p>Acesse e baixe todos os contratos de prestação de serviços e termos legais.</p>
                        </header>

                        <div className="ast-contract-list">
                            {contracts.map((contract: any, index: number) => {
                                const contractStatus = String(contract.status || contract.signatureStatus).toUpperCase();
                                const signed = contractStatus === 'SIGNED' || contractStatus.includes('COMPLETED');
                                return (
                                    <article className={`ast-contract-card ${signed ? '' : 'ast-contract-card--pending'}`} key={contract.id || index}>
                                        <div className="ast-contract-card__status">
                                            <img src={`${ASSET_ROOT}/${signed ? 'contratos-imgMaterialSymbolsCheckRounded.svg' : 'contratos-imgHumbleiconsClock.svg'}`} alt="" />
                                            <span>{signed ? 'Assinado' : 'Aguardando assinatura'}</span>
                                        </div>
                                        <div className="ast-contract-card__body">
                                            <div>
                                                <strong>{getValue(contract.title, contract.name, 'Contrato - Registro de Marca')}</strong>
                                                <small>{getValue(contract.organizationName, contract.companyName, 'Asterysko')}</small>
                                            </div>
                                            <button className={signed ? '' : 'ast-contract-card__sign'} type="button" onClick={() => openContractForSignature(contract)} aria-label={signed ? 'Visualizar contrato' : 'Revisar e assinar contrato'}>
                                                {signed ? <ExternalLink size={20} strokeWidth={2} /> : <><span>Assinar agora</span><ChevronRight size={18} /></>}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                            {!contracts.length && <p className="ast-empty-note">Nenhum contrato foi disponibilizado até o momento.</p>}
                        </div>
                    </section>
                )}

                {view === 'details' && (
                    <section className="ast-process-page" aria-labelledby="ast-process-title">
                        <header className="ast-process-hero">
                            <div className="ast-process-hero__back"><BackButton onClick={goHome} /></div>
                            <div className="ast-process-hero__meta">
                                <span className="ast-status-pill">{getProcessStatusLabel(selectedProcess?.status)}</span>
                                {selectedProcess?.inpiProcessNumber && <span className="ast-process-number">Processo INPI {selectedProcess.inpiProcessNumber}</span>}
                            </div>
                            <h1 id="ast-process-title">{brandName}</h1>
                        </header>

                        <ProcessTabs active={processTab} onChange={setProcessTab} />

                        {processTab === 'details' && (
                            <div key="details" className="ast-process-content ast-process-content--details ast-tab-transition">
                                <article className="ast-info-card">
                                    <h2 className="ast-card-title">Informações gerais</h2>
                                    <div className="ast-info-card__body">
                                        {[
                                            ['Apresentação', getValue(selectedProcess?.presentation, 'Não informada')],
                                            ['Classificação NCL', Array.isArray(selectedProcess?.nclClasses) && selectedProcess.nclClasses.length
                                                ? selectedProcess.nclClasses.map((item: string) => /^classe/i.test(item) ? item : `Classe ${item}`).join(', ')
                                                : getValue(selectedProcess?.nclClass, 'Não informada')],
                                            ['Data do protocolo', formatDate(selectedProcess?.filingDate, 'Não informada')],
                                        ].map(([label, value]) => (
                                            <div className="ast-info-row" key={String(label)}><strong>{label}</strong><small>{String(value)}</small></div>
                                        ))}
                                    </div>
                                </article>

                                <article className="ast-timeline-card">
                                    <h2 className="ast-card-title">Andamento</h2>
                                    <div className="ast-timeline-card__body">
                                        {(Array.isArray(selectedProcess?.timeline) ? selectedProcess.timeline : []).map((item: any, index: number) => (
                                            <div className="ast-timeline-row" key={item.id || `${item.title}-${index}`}>
                                                <span className="ast-timeline-row__icon"><img src={`${ASSET_ROOT}/${getTimelineIcon(item)}`} alt="" /></span>
                                                <div className="ast-timeline-row__details">
                                                    <span className="ast-timeline-row__copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                                                    <time dateTime={item.date ? new Date(item.date).toISOString() : undefined}>{formatTimelineDate(item.date)}</time>
                                                    {item.actionType === 'proxy_signature' && (
                                                        <button className="ast-timeline-row__action" type="button" onClick={() => setProcessTab('documents')}>
                                                            Assinar e enviar <ChevronRight size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {(!Array.isArray(selectedProcess?.timeline) || !selectedProcess.timeline.length) && (
                                            <p className="ast-timeline-empty">Nenhum andamento registrado até o momento.</p>
                                        )}
                                    </div>
                                </article>
                            </div>
                        )}

                        {processTab === 'payments' && (
                            <div key="payments" className="ast-process-content ast-process-content--payments ast-tab-transition">
                                {subscriptionFeedback && (
                                    <p className={`ast-profile-feedback ast-profile-feedback--${subscriptionFeedback.type}`} role="status">
                                        {subscriptionFeedback.message}
                                    </p>
                                )}

                                {subscriptionLoading && <p className="ast-empty-note">Carregando sua assinatura...</p>}

                                {!subscriptionLoading && !subscription && subscriptionContext?.eligible && (
                                    <article className="ast-payment-card ast-subscription-start">
                                        <div className="ast-subscription-start__icon"><CreditCard size={25} aria-hidden="true" /></div>
                                        <span className="ast-subscription-start__eyebrow">Proteção recorrente</span>
                                        <h2>Ative sua assinatura Asterysko</h2>
                                        <p>Configure a forma de pagamento e acompanhe todas as cobranças sem sair do portal.</p>
                                        {subscriptionContext?.firstPaymentAmount && (
                                            <div className="ast-payment-card__copy">
                                                <p>Primeira cobrança: <strong>{formatCurrency(subscriptionContext.firstPaymentAmount)}</strong></p>
                                                {subscriptionContext.initialFeeAmount > 0 && <p>Inclui <strong>{formatCurrency(subscriptionContext.initialFeeAmount)}</strong> da taxa GRU.</p>}
                                            </div>
                                        )}
                                        {subscriptionContext?.planAmount && (
                                            <strong>{formatCurrency(subscriptionContext.planAmount)} <small>/ mês</small></strong>
                                        )}
                                        <button type="button" disabled={!subscriptionContext?.configured} onClick={() => openPaymentSheet('setup')}>
                                            {subscriptionContext?.configured ? 'Configurar assinatura' : subscriptionContext?.contractSigned ? 'Pagamento em configuração' : 'Disponível após assinar o contrato'}
                                            <ChevronRight size={18} aria-hidden="true" />
                                        </button>
                                    </article>
                                )}

                                {!subscriptionLoading && !subscription && subscriptionContext && !subscriptionContext.eligible && (
                                    <article className="ast-payment-card">
                                        <div className="ast-payment-card__heading">
                                            <h2 className="ast-card-title">Pagamento do processo</h2>
                                            <span>Pagamento único</span>
                                        </div>
                                        <p className="ast-history-empty">Este processo não possui mensalidade. Aqui você acompanha apenas as cobranças previstas no contrato original.</p>
                                    </article>
                                )}

                                {!subscriptionLoading && subscription && (
                                    <>
                                        <article className={`ast-payment-card ${['PAYMENT_FAILED', 'PAYMENT_REVERSED', 'SETUP_REQUIRES_REVIEW'].includes(subscriptionStatus) ? 'ast-payment-card--failed' : ''}`}>
                                            <div className="ast-payment-card__heading">
                                                <h2 className="ast-card-title">Assinatura mensal</h2>
                                                <span>{SUBSCRIPTION_STATUS_LABELS[subscriptionStatus] || subscription.status}</span>
                                            </div>
                                            <div className="ast-payment-card__account">
                                                <span className="ast-payment-icon">
                                                    {subscription.paymentMethod === 'PIX_AUTOMATIC' ? <QrCode size={18} aria-hidden="true" /> : <CreditCard size={18} aria-hidden="true" />}
                                                </span>
                                                <div>
                                                    <strong>
                                                        {subscription.paymentMethod === 'CREDIT_CARD' && subscription.cardLastFour
                                                            ? `•••• •••• •••• ${subscription.cardLastFour}`
                                                            : subscriptionMethodLabel}
                                                    </strong>
                                                    <small>{subscription.cardBrand || subscriptionMethodLabel}</small>
                                                </div>
                                            </div>
                                            <div className="ast-payment-card__copy">
                                                <p>Próxima cobrança: <strong>{formatCurrency(subscription.amount)}</strong></p>
                                                <p>Vencimento no dia <strong>{subscription.dueDay}</strong> de cada mês</p>
                                                {subscription.lastFailureReason && <p className="ast-payment-card__failure">{subscription.lastFailureReason}</p>}
                                            </div>
                                            <div className="ast-payment-card__actions">
                                                {subscription.paymentMethod === 'CREDIT_CARD' && (
                                                    <button type="button" disabled={!subscription.dueDateChangeAllowed} onClick={() => openPaymentSheet('due-date')}>
                                                        Alterar vencimento <ChevronRight size={18} />
                                                    </button>
                                                )}
                                                {subscription.paymentMethodChangeAllowed && (
                                                    <button type="button" onClick={() => openPaymentSheet('payment-method')}>
                                                        Alterar forma de pagamento <ChevronRight size={18} />
                                                    </button>
                                                )}
                                            </div>
                                            {!subscription.dueDateChangeAllowed && subscription.nextDueDateChangeAt && (
                                                <small className="ast-payment-card__rule">Nova alteração disponível em {formatDate(subscription.nextDueDateChangeAt)}.</small>
                                            )}
                                            {subscription.paymentMethod === 'PIX_AUTOMATIC' && (
                                                <small className="ast-payment-card__rule">O dia de vencimento faz parte da autorização do Pix Automático.</small>
                                            )}
                                        </article>

                                        {subscription.pixQrCodePayload && (
                                            <article className="ast-pix-authorization">
                                                <span className="ast-pix-authorization__eyebrow">Autorização necessária</span>
                                                <h2>Confirme o Pix Automático</h2>
                                                <p>Abra o app do seu banco, pague o primeiro Pix e autorize as próximas cobranças recorrentes.</p>
                                                {subscription.pixQrCodeEncodedImage && (
                                                    <img
                                                        src={subscription.pixQrCodeEncodedImage.startsWith('data:')
                                                            ? subscription.pixQrCodeEncodedImage
                                                            : `data:image/png;base64,${subscription.pixQrCodeEncodedImage}`}
                                                        alt="QR Code para autorizar o Pix Automático"
                                                    />
                                                )}
                                                <button type="button" onClick={() => void copyPixCode()}>
                                                    {pixCopied ? <Check size={18} /> : <Copy size={18} />}
                                                    {pixCopied ? 'Código copiado' : 'Copiar código Pix'}
                                                </button>
                                            </article>
                                        )}
                                    </>
                                )}

                                <article className="ast-history-card">
                                    <h2 className="ast-card-title">Histórico de pagamento</h2>
                                    {paymentReceiptError && <p className="ast-history-card__error" role="alert">{paymentReceiptError}</p>}
                                    {displayedPaymentHistory.slice(0, 12).map((invoice: any, index: number) => {
                                        const paymentStatus = String(invoice.status || invoice.providerStatus || 'PENDING').toUpperCase();
                                        const receiptId = String(getValue(invoice.invoiceId, invoice.dealId, invoice.id));
                                        return (
                                        <button className="ast-history-row" type="button" key={invoice.id || index} onClick={() => void openPaymentReceipt(invoice)} aria-label={`Ver detalhes do pagamento de ${formatCurrency(getValue(invoice.amount, invoice.value, invoice.total, 0))}`}>
                                            <span>
                                                <span className={`ast-history-row__status ast-history-row__status--${paymentStatus.toLowerCase()}`}>
                                                    {PAYMENT_STATUS_LABELS[paymentStatus] || invoice.status}
                                                </span>
                                                <strong>{formatCurrency(getValue(invoice.amount, invoice.value, invoice.total, 0))}</strong>
                                                <small>{invoice.paymentMethod === 'PIX' || invoice.paymentMethod === 'PIX_AUTOMATIC' ? 'Pix' : 'Cartão'} • {formatDate(getValue(invoice.paidAt, invoice.dueDate))}</small>
                                            </span>
                                            <span className="ast-history-row__open" aria-hidden="true">
                                                {paymentReceiptLoading === receiptId ? <span className="ast-spinner" /> : <ChevronRight size={19} />}
                                            </span>
                                        </button>
                                    );})}
                                    {!displayedPaymentHistory.length && <p className="ast-history-empty">Nenhuma cobrança registrada até o momento.</p>}
                                </article>
                            </div>
                        )}

                        {processTab === 'documents' && (
                            <div key="documents" className="ast-document-list ast-process-content--documents ast-tab-transition">
                                {selectedProcessPaymentConfirmed && !selectedProcessProxySubmitted && (
                                    <article className="ast-proxy-task">
                                        <div className="ast-proxy-task__heading">
                                            <span className="ast-proxy-task__icon"><FileText size={24} /></span>
                                            <span><small>Documento pendente</small><h2>Procuração para o INPI</h2></span>
                                        </div>
                                        <p>A procuração já será gerada com seus dados. Conclua os três passos abaixo para enviarmos o pedido ao INPI.</p>
                                        <ol className="ast-proxy-task__steps">
                                            <li><span>1</span><strong>Baixe a procuração preenchida</strong></li>
                                            <li><span>2</span><strong>Assine eletronicamente pelo Gov.br</strong></li>
                                            <li><span>3</span><strong>Envie aqui o arquivo assinado</strong></li>
                                        </ol>
                                        <div className="ast-proxy-task__actions">
                                            <button type="button" disabled={proxyDownloading} onClick={() => void downloadProxyTemplate()}><Download size={18} /> {proxyDownloading ? 'Gerando...' : 'Baixar procuração'}</button>
                                            <button className="ast-proxy-task__upload" type="button" disabled={proxyUploading} onClick={() => proxyUploadInputRef.current?.click()}>
                                                <Upload size={18} /> {proxyUploading ? 'Enviando...' : 'Enviar documento assinado'}
                                            </button>
                                        </div>
                                        <input
                                            ref={proxyUploadInputRef}
                                            className="ast-visually-hidden"
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                                            onChange={uploadSignedProxy}
                                        />
                                    </article>
                                )}

                                {selectedProcessPaymentConfirmed && selectedProcessProxySubmitted && (
                                    <article className="ast-proxy-received">
                                        <span><Check size={19} /></span>
                                        <div>
                                            <small>{selectedProcessProxyStatus === 'UPLOADED' ? 'Aguardando validação' : 'Documento validado'}</small>
                                            <strong>Procuração assinada recebida</strong>
                                            <p>{selectedProcessProxyStatus === 'UPLOADED' ? 'Nossa equipe verificará o arquivo antes de anexá-lo ao processo do INPI.' : 'A procuração está pronta para uso no processo.'}</p>
                                        </div>
                                    </article>
                                )}

                                {proxyFeedback && (
                                    <p className={`ast-profile-feedback ast-profile-feedback--${proxyFeedback.type}`} role="status">{proxyFeedback.message}</p>
                                )}

                                {DEFAULT_DOCUMENTS.map(document => {
                                    if (document.key === 'powerOfAttorney' && !selectedProcessProxySubmitted) return null;
                                    const url = String(getDocumentUrl(document) || '');
                                    if (!url) return null;
                                    const fileName = getDocumentFileName(document.name, url, document.key === 'logo');
                                    return (
                                        <button
                                            className="ast-document-card"
                                            key={document.key}
                                            type="button"
                                            onClick={() => openDocumentPreview(fileName, url)}
                                        >
                                            <span className="ast-document-icon"><img src={`${ASSET_ROOT}/${document.icon}`} alt="" /></span>
                                            <span className="ast-document-card__copy">
                                                <strong>{document.name}</strong>
                                                <small>Toque para visualizar</small>
                                            </span>
                                            <ChevronRight className="ast-document-card__chevron" size={19} aria-hidden="true" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
                </div>
            </main>

            {paymentSheet && (
                <div className="ast-payment-sheet" role="dialog" aria-modal="true" aria-labelledby="ast-payment-sheet-title" onClick={() => !subscriptionSubmitting && setPaymentSheet(null)}>
                    <section className="ast-payment-sheet__panel" onClick={event => event.stopPropagation()}>
                        <header className="ast-payment-sheet__header">
                            <div>
                                <small>Assinatura Asterysko</small>
                                <h2 id="ast-payment-sheet-title">
                                    {paymentSheet === 'due-date' ? 'Alterar vencimento' : paymentSheet === 'payment-method' ? 'Regularizar pagamento' : 'Forma de pagamento'}
                                </h2>
                            </div>
                            <button type="button" disabled={subscriptionSubmitting} onClick={() => setPaymentSheet(null)} aria-label="Fechar"><X size={21} /></button>
                        </header>

                        <form className="ast-payment-form" onSubmit={submitSubscriptionAction}>
                            {paymentSheet === 'due-date' ? (
                                <>
                                    <div className="ast-payment-form__intro">
                                        <strong>Escolha o novo dia</strong>
                                        <p>A cobrança atual não será adiada. A mudança vale para os próximos ciclos e só poderá ser feita novamente após 90 dias.</p>
                                    </div>
                                    <label className="ast-payment-field">
                                        <span>Dia do vencimento</span>
                                        <select value={subscriptionDueDay} onChange={event => setSubscriptionDueDay(Number(event.target.value))}>
                                            {Array.from({ length: 28 }, (_, index) => index + 1).map(day => <option value={day} key={day}>Dia {day}</option>)}
                                        </select>
                                    </label>
                                </>
                            ) : (
                                <>
                                    <div className="ast-payment-methods" role="radiogroup" aria-label="Forma de pagamento">
                                        <button className={subscriptionMethod === 'CREDIT_CARD' ? 'ast-payment-method--active' : ''} type="button" onClick={() => setSubscriptionMethod('CREDIT_CARD')}>
                                            <CreditCard size={21} />
                                            <span><strong>Cartão</strong><small>Cobrança automática mensal</small></span>
                                            <i>{subscriptionMethod === 'CREDIT_CARD' && <Check size={14} />}</i>
                                        </button>
                                        <button className={subscriptionMethod === 'PIX_AUTOMATIC' ? 'ast-payment-method--active' : ''} type="button" disabled={!pixAutomaticAvailable} onClick={() => setSubscriptionMethod('PIX_AUTOMATIC')}>
                                            <QrCode size={21} />
                                            <span><strong>Pix Automático</strong><small>{pixAutomaticAvailable ? 'Autorize uma única vez' : 'Disponível após a 1ª parcela'}</small></span>
                                            <i>{subscriptionMethod === 'PIX_AUTOMATIC' && <Check size={14} />}</i>
                                        </button>
                                    </div>

                                    {paymentSheet === 'setup' && (
                                        <label className="ast-payment-field">
                                            <span>Dia do vencimento</span>
                                            <select value={subscriptionDueDay} onChange={event => setSubscriptionDueDay(Number(event.target.value))}>
                                                {Array.from({ length: 28 }, (_, index) => index + 1).map(day => <option value={day} key={day}>Dia {day}</option>)}
                                            </select>
                                        </label>
                                    )}

                                    {subscriptionMethod === 'CREDIT_CARD' ? (
                                        <div className="ast-card-fields">
                                            <label className="ast-payment-field ast-card-fields__wide">
                                                <span>Nome impresso no cartão</span>
                                                <input required autoComplete="cc-name" value={cardDraft.holderName} onChange={event => setCardDraft(current => ({ ...current, holderName: event.target.value }))} />
                                            </label>
                                            <label className="ast-payment-field ast-card-fields__wide">
                                                <span>Número do cartão</span>
                                                <input required inputMode="numeric" autoComplete="cc-number" maxLength={23} value={cardDraft.number} onChange={event => setCardDraft(current => ({ ...current, number: event.target.value }))} />
                                            </label>
                                            <label className="ast-payment-field">
                                                <span>Mês</span>
                                                <input required inputMode="numeric" autoComplete="cc-exp-month" placeholder="MM" maxLength={2} value={cardDraft.expiryMonth} onChange={event => setCardDraft(current => ({ ...current, expiryMonth: event.target.value }))} />
                                            </label>
                                            <label className="ast-payment-field">
                                                <span>Ano</span>
                                                <input required inputMode="numeric" autoComplete="cc-exp-year" placeholder="AAAA" maxLength={4} value={cardDraft.expiryYear} onChange={event => setCardDraft(current => ({ ...current, expiryYear: event.target.value }))} />
                                            </label>
                                            <label className="ast-payment-field">
                                                <span>CVV</span>
                                                <input required inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={cardDraft.ccv} onChange={event => setCardDraft(current => ({ ...current, ccv: event.target.value }))} />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="ast-payment-form__pix">
                                            <QrCode size={30} />
                                            <div><strong>Você continuará dentro do portal</strong><p>Geraremos o QR Code e o código copia e cola aqui. O primeiro pagamento também concede a autorização para os próximos meses.</p></div>
                                        </div>
                                    )}
                                </>
                            )}

                            {subscriptionFeedback?.type === 'error' && <p className="ast-payment-form__error">{subscriptionFeedback.message}</p>}
                            <button className="ast-payment-form__submit" type="submit" disabled={subscriptionSubmitting}>
                                {subscriptionSubmitting ? 'Processando com segurança...' : paymentSheet === 'due-date' ? 'Confirmar novo vencimento' : subscriptionMethod === 'PIX_AUTOMATIC' ? 'Gerar autorização Pix' : 'Confirmar cartão'}
                            </button>
                            <p className="ast-payment-form__security">Seus dados de cartão não são armazenados pela Asterysko.</p>
                        </form>
                    </section>
                </div>
            )}

            {previewDocument && (
                <div
                    className={`ast-document-preview ${previewClosing ? 'ast-document-preview--closing' : 'ast-document-preview--open'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ast-document-preview-title"
                    onClick={closeDocumentPreview}
                >
                    <section className="ast-document-preview__panel" onClick={event => event.stopPropagation()}>
                        <header className="ast-document-preview__header">
                            <div className="ast-document-preview__title">
                                <span className="ast-document-preview__icon"><FileText size={21} aria-hidden="true" /></span>
                                <span>
                                    <small>Visualização do documento</small>
                                    <strong id="ast-document-preview-title">{previewDocument.name}</strong>
                                </span>
                            </div>
                            <div className="ast-document-preview__actions">
                                <button type="button" onClick={() => download(previewDocument.url, previewDocument.name)} aria-label="Baixar documento">
                                    <Download size={19} aria-hidden="true" />
                                    <span>Baixar</span>
                                </button>
                                <a href={resolvedPreviewUrl} target="_blank" rel="noreferrer" aria-label="Abrir documento em outra aba">
                                    <ExternalLink size={19} aria-hidden="true" />
                                    <span>Abrir</span>
                                </a>
                                <button className="ast-document-preview__close" type="button" onClick={closeDocumentPreview} aria-label="Fechar visualização">
                                    <X size={22} aria-hidden="true" />
                                </button>
                            </div>
                        </header>
                        <div className="ast-document-preview__body">
                            {previewIsImage ? (
                                <img src={resolvedPreviewUrl} alt={previewDocument.name} />
                            ) : previewIsPdf ? (
                                <React.Suspense fallback={<div className="ast-pdf-viewer__loading"><span className="ast-spinner" /> Carregando visualizador...</div>}>
                                    <AsteryskoPdfViewer url={resolvedPreviewUrl} title={previewDocument.name} />
                                </React.Suspense>
                            ) : (
                                <iframe src={resolvedPreviewUrl} title={previewDocument.name} />
                            )}
                        </div>
                    </section>
                </div>
            )}

            {paymentReceipt && (
                <div className="ast-receipt-modal" role="dialog" aria-modal="true" aria-labelledby="ast-payment-receipt-title" onClick={() => setPaymentReceipt(null)}>
                    <section className="ast-receipt-modal__panel" onClick={event => event.stopPropagation()}>
                        <header className="ast-receipt-modal__header">
                            <div className="ast-receipt-modal__brand">
                                <img src={`${ASSET_ROOT}/brand-mark.svg`} alt="" />
                                <span><strong>Asterysko</strong><small>Comprovante do portal</small></span>
                            </div>
                            <button type="button" onClick={() => setPaymentReceipt(null)} aria-label="Fechar comprovante"><X size={21} /></button>
                        </header>

                        <div className="ast-receipt-modal__content">
                            <div className="ast-receipt-modal__summary">
                                <span className={`ast-receipt-modal__status ast-receipt-modal__status--${String(paymentReceipt.status).toLowerCase()}`}>
                                    {PAYMENT_STATUS_LABELS[String(paymentReceipt.status).toUpperCase()] || paymentReceipt.status}
                                </span>
                                <small id="ast-payment-receipt-title">{['PAID', 'RECEIVED', 'CONFIRMED'].includes(String(paymentReceipt.status).toUpperCase()) ? 'Pagamento confirmado' : 'Detalhes da cobrança'}</small>
                                <strong>{formatCurrency(paymentReceipt.amount)}</strong>
                                <p>{formatDateTime(getValue(paymentReceipt.paidAt, paymentReceipt.dueDate))}</p>
                            </div>

                            <dl className="ast-receipt-modal__details">
                                <div><dt>Pagador</dt><dd>{paymentReceipt.payer.name}<small>{paymentReceipt.payer.cpfCnpj}</small></dd></div>
                                <div><dt>Recebedor</dt><dd>{paymentReceipt.recipient.tradeName}<small>{paymentReceipt.recipient.legalName} · CNPJ {paymentReceipt.recipient.cpfCnpj}</small></dd></div>
                                <div><dt>Forma de pagamento</dt><dd>{getPaymentMethodLabel(paymentReceipt)}</dd></div>
                                <div><dt>Serviço</dt><dd>{paymentReceipt.description}{paymentReceipt.brandName && <small>Marca: {paymentReceipt.brandName}</small>}</dd></div>
                                <div><dt>Identificador</dt><dd className="ast-receipt-modal__identifier">{paymentReceipt.displayId}</dd></div>
                            </dl>

                            {paymentReceipt.fiscalInvoice && (
                                <section className="ast-receipt-modal__fiscal">
                                    <div>
                                        <small>Nota fiscal de serviço</small>
                                        <strong>{paymentReceipt.fiscalInvoice.number ? `NFS-e nº ${paymentReceipt.fiscalInvoice.number}` : 'NFS-e em processamento'}</strong>
                                        <p>{paymentReceipt.fiscalInvoice.status === 'AUTHORIZED' ? 'Emitida e autorizada pela prefeitura.' : paymentReceipt.fiscalInvoice.statusDescription || 'Aguardando autorização da prefeitura.'}</p>
                                    </div>
                                    <span>{paymentReceipt.fiscalInvoice.status === 'AUTHORIZED' ? 'Emitida' : paymentReceipt.fiscalInvoice.status}</span>
                                </section>
                            )}
                        </div>

                        <footer className="ast-receipt-modal__actions">
                            {['PAID', 'RECEIVED', 'CONFIRMED'].includes(String(paymentReceipt.status).toUpperCase()) && (
                                <button type="button" onClick={() => downloadOwnPaymentReceipt(paymentReceipt)}><Download size={18} /> Baixar comprovante</button>
                            )}
                            {paymentReceipt.fiscalInvoice?.pdfUrl && (
                                <button type="button" onClick={() => openFiscalInvoicePdf(paymentReceipt)}><FileText size={18} /> Visualizar NFS-e</button>
                            )}
                            {paymentReceipt.fiscalInvoice?.xmlUrl && (
                                <button type="button" onClick={() => downloadFiscalInvoiceXml(paymentReceipt)}><Download size={18} /> Baixar XML</button>
                            )}
                        </footer>
                    </section>
                </div>
            )}

            {menuOpen && (
                <div className={`ast-menu-overlay ${menuClosing ? 'ast-menu-overlay--closing' : 'ast-menu-overlay--open'}`} role="dialog" aria-modal="true" aria-label="Menu do portal" onClick={() => closeMenu()}>
                    <aside className="ast-menu-panel" onClick={event => event.stopPropagation()}>
                        <div className="ast-menu-panel__frame">
                            <button className="ast-round-button ast-menu-panel__close" type="button" onClick={() => closeMenu()} aria-label="Fechar menu">
                                <img src={`${ASSET_ROOT}/menu-imgMaterialSymbolsCloseRounded.svg`} alt="" />
                            </button>

                            <div className="ast-menu-panel__content">
                                <button className="ast-menu-account" type="button" onClick={() => closeMenu(() => navigateView('profile'))}>
                                    <img src={`${ASSET_ROOT}/menu-imgTablerUser.svg`} alt="" />
                                    <span><strong>Sua conta</strong><small>Mantenha seus dados atualizados.</small></span>
                                </button>

                                <button className="ast-menu-referral" type="button" onClick={() => void navigator.clipboard?.writeText('https://asterysko.com')}>
                                    <img src={`${ASSET_ROOT}/menu-imgVector.svg`} alt="" />
                                    <span>Indique a Asterysko</span>
                                </button>

                                <div className="ast-menu-links">
                                    <button className="ast-menu-link" type="button">
                                        <img src={`${ASSET_ROOT}/menu-imgSimpleLineIconsEarphonesAlt.svg`} alt="" />
                                        <span>Central de atendimento</span>
                                    </button>
                                    <button className="ast-menu-link" type="button">
                                        <img src={`${ASSET_ROOT}/menu-imgCiHelp.svg`} alt="" />
                                        <span>Central de dúvidas</span>
                                    </button>
                                    <button className="ast-menu-link" type="button">
                                        <img src={`${ASSET_ROOT}/menu-imgGroup.svg`} alt="" />
                                        <span>Portal da transparência</span>
                                    </button>
                                </div>

                                <button className="ast-menu-logout" type="button" onClick={signOut}>
                                    <img src={`${ASSET_ROOT}/menu-imgGroup1.svg`} alt="" />
                                    <span>Sair</span>
                                </button>
                            </div>
                        </div>

                        <img className="ast-menu-burst" src={`${ASSET_ROOT}/menu-imgGroup2.svg`} alt="" aria-hidden="true" />
                    </aside>
                </div>
            )}
        </div>
    );
};

export default AsteryskoClientPortal;
