import React, { useState, useEffect } from 'react';
import { FileSignature, FileText, CheckCircle2, Download, Menu, User, Bell, Shield, ShieldCheck, ExternalLink, LogOut, HelpCircle, ChevronDown, Share2, Building2, Lock, Mail, MessageSquare, AlertCircle, Loader2, Briefcase, CreditCard, Smartphone, Copy, Upload, UploadCloud, Sun, Moon, Clock, Award, X, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api, { getBackendUrl } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { forceDownloadFile } from './utils/fileDownload';

interface AsteryskoClientPortalProps {
    onExit: () => void;
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

const AsteryskoLogoSVG = () => (
    <svg width="140" height="24" viewBox="0 0 200 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_1209_2)">
            <path d="M29.208 0.974374C28.9702 1.21152 28.779 1.47445 28.6239 1.758L19.6547 13.8217C19.2721 14.2032 19.2721 14.8218 19.6547 15.1982C20.0372 15.5745 20.6576 15.5797 21.035 15.1982L33.1317 6.25352C33.416 6.10402 33.6797 5.90811 33.9175 5.67096C35.2202 4.3718 35.2202 2.26838 33.9175 0.969219C32.6148 -0.329947 30.5056 -0.329947 29.2029 0.969219L29.208 0.974374Z" fill="currentColor" />
            <path d="M35.2461 15.9457C34.9669 15.9457 34.6929 15.987 34.4396 16.0643L21.9758 17.8893C21.5261 17.8893 21.159 18.2553 21.159 18.7039C21.159 19.1524 21.5261 19.5184 21.9758 19.5184L34.4345 21.3847C34.6878 21.462 34.9618 21.5033 35.2409 21.5033C36.7814 21.5033 38.0325 20.2608 38.0325 18.7296C38.0325 17.1985 36.7866 15.9457 35.2513 15.9457H35.2461Z" fill="currentColor" />
            <path d="M29.1356 28.7054C28.9754 28.5456 28.7996 28.4167 28.6083 28.3136L20.518 22.3127C20.2647 22.0549 19.8459 22.0549 19.5926 22.3127C19.3393 22.5704 19.3341 22.9829 19.5926 23.2355L25.5841 31.3243C25.6824 31.5151 25.8116 31.6904 25.9719 31.8502C26.8403 32.7215 28.2568 32.7215 29.1253 31.8502C29.9938 30.9789 29.9989 29.5715 29.1253 28.7054H29.1356Z" fill="currentColor" />
            <path d="M17.9435 32.2936C17.9435 32.1234 17.9177 31.9533 17.8712 31.7986L16.7442 24.1428C16.7442 23.8644 16.5219 23.6428 16.2428 23.6376C15.9636 23.6325 15.7413 23.8593 15.7361 24.1377L14.5833 31.7883C14.5368 31.943 14.511 32.1131 14.511 32.2832C14.511 33.2267 15.2761 33.9948 16.2273 34C17.1733 34 17.9435 33.237 17.9487 32.2884L17.9435 32.2936Z" fill="currentColor" />
            <path d="M9.27418 27.2464C9.3569 27.1639 9.42927 27.066 9.48096 26.968L12.6964 22.6581C12.8308 22.524 12.836 22.3024 12.6964 22.1632C12.5569 22.024 12.3397 22.024 12.2002 22.1632L7.86806 25.3544C7.76467 25.4059 7.67162 25.4781 7.58891 25.5606C7.12364 26.0246 7.12364 26.7773 7.58891 27.2412C8.05417 27.7052 8.80892 27.7052 9.27418 27.2412V27.2464Z" fill="currentColor" />
            <path d="M2.62615 20.4361C2.79674 20.4361 2.96734 20.4103 3.12242 20.3639L10.7941 19.2297C11.0732 19.2297 11.2955 19.0029 11.2955 18.7296C11.2955 18.4564 11.068 18.2296 10.7941 18.2296L3.12242 17.0954C2.96734 17.049 2.79674 17.0232 2.62615 17.0232C1.68012 17.0232 0.909851 17.7914 0.909851 18.7348C0.909851 19.6782 1.68012 20.4464 2.62615 20.4464V20.4361Z" fill="currentColor" />
            <path d="M0.811577 7.2743C1.00802 7.47536 1.23031 7.63518 1.46811 7.75891L11.5746 15.26C11.8951 15.5797 12.4121 15.5797 12.7326 15.26C13.0531 14.9404 13.0531 14.4249 12.7326 14.1052L5.24706 4.00061C5.12299 3.76346 4.95757 3.54177 4.76112 3.34587C3.67551 2.25807 1.90752 2.25807 0.816747 3.34071C-0.274031 4.42335 -0.274031 6.1865 0.811577 7.2743Z" fill="currentColor" />
            <path d="M14.5109 5.16058C14.5109 5.33071 14.5368 5.50083 14.5833 5.6555L15.7206 13.3061C15.7206 13.5845 15.9481 13.8062 16.2221 13.8062C16.4961 13.8062 16.7235 13.5794 16.7235 13.3061L17.8608 5.6555C17.9074 5.50083 17.9332 5.33071 17.9332 5.16058C17.9332 4.21713 17.1629 3.44898 16.2169 3.44898C15.2709 3.44898 14.5006 4.21713 14.5006 5.16058H14.5109Z" fill="currentColor" />
            <path d="M65.8757 25.3389C65.8757 25.3389 65.0538 25.5554 64.1594 25.5554C62.4069 25.5554 61.1197 24.7357 61.1197 22.7766V22.7406H61.0473C60.5821 23.5964 59.1191 25.5915 55.1851 25.5915C51.4681 25.5915 49.4675 23.6685 49.4675 20.9207C49.4675 17.25 52.9725 15.7859 60.4063 15.7859H60.9078V14.7187C60.9078 12.4349 59.512 10.9759 56.7256 10.9759C54.3321 10.9759 52.8639 11.94 52.8639 13.6876C52.8639 14.0795 52.9363 14.296 53.0449 14.5434L50.0775 15.0435C50.0775 15.0435 49.8604 14.4042 49.8604 13.5794C49.8604 10.5119 52.5072 8.33632 56.798 8.33632C61.373 8.33632 64.056 10.7955 64.056 14.6826V21.4929C64.056 22.4209 64.3042 22.7766 65.0951 22.7766C65.3122 22.7766 65.5604 22.7406 65.7051 22.7045L65.8861 25.344L65.8757 25.3389ZM60.9078 19.5648V17.9615H60.4063C54.6526 17.9615 52.683 18.9977 52.683 20.8485C52.683 22.1683 53.6859 22.9519 55.8313 22.9519C59.1191 22.9519 60.9078 21.1321 60.9078 19.5648Z" fill="currentColor" />
            <path d="M79.1356 13.7495C79.1356 12.0018 77.6003 10.9707 75.3825 10.9707C73.1648 10.9707 72.0585 11.9348 72.0585 13.3216C72.0585 17.281 82.2115 14.4249 82.3201 20.8073C82.3563 23.8387 79.4613 25.5864 75.3463 25.5864C71.2314 25.5864 69.0188 23.8387 68.0521 23.055L69.9803 20.9155C70.6937 21.5909 72.8029 22.9468 75.3774 22.9468C77.9518 22.9468 79.0943 22.0549 79.0943 20.7712C79.0943 17.3119 68.8327 19.5236 68.8327 13.2855C68.8327 10.5067 71.4795 8.33116 75.4446 8.33116C79.4096 8.33116 82.0564 10.3985 82.0564 13.1773C82.0564 13.8526 81.9117 14.3527 81.9117 14.3527L79.0167 14.5692C79.0891 14.3218 79.1253 13.997 79.1253 13.7495H79.1356Z" fill="currentColor" />
            <path d="M97.7616 24.4831C97.7616 24.4831 96.0815 25.5864 93.3261 25.5864C88.963 25.5864 87.2105 23.2664 87.2105 18.9565V11.079H84.5275V8.54769H87.2105V3.55724L90.3898 3.3768V8.54769H96.9344V11.079H90.3898V18.8534C90.3898 21.5651 91.3565 22.9158 93.6414 22.9158C95.6059 22.9158 96.7535 21.9518 96.7535 21.9518L97.7564 24.4831H97.7616Z" fill="currentColor" />
            <path d="M102.554 17.8171C102.874 20.9207 104.983 22.9519 108.344 22.9519C110.918 22.9519 112.381 21.7404 113.136 20.7403L115.064 22.4879C113.493 24.5553 110.991 25.5915 108.096 25.5915C102.699 25.5915 99.3021 22.1322 99.3021 16.9974C99.3021 11.8626 102.554 8.33632 107.666 8.33632C112.779 8.33632 115.354 11.7956 115.354 16.2138C115.354 17.214 115.209 17.8171 115.209 17.8171H102.554ZM102.626 15.5694H112.133C112.097 12.7906 110.344 10.9707 107.666 10.9707C104.989 10.9707 103.091 12.8628 102.626 15.5694Z" fill="currentColor" />
            <path d="M128.825 8.61986L128.04 11.7904C127.683 11.5739 127.182 11.3986 126.468 11.3986C124.571 11.3986 122.431 13.0741 122.431 16.5695V25.375H119.288V8.54769L121.505 8.43942C121.79 9.72312 121.934 11.61 121.934 12.3627H122.079C122.725 10.151 124.152 8.33632 126.654 8.33632C127.404 8.33632 128.19 8.44458 128.836 8.61986H128.825Z" fill="currentColor" />
            <path d="M133.437 32.8246C131.829 32.8246 130.826 32.2884 130.826 32.2884L131.4 29.6849C131.4 29.6849 132.186 30.1128 133.225 30.1128C134.977 30.1128 135.727 28.9735 136.301 27.4732L136.947 25.7977L129.797 8.54253H133.339L137.986 20.3072C138.343 21.163 138.415 21.4466 138.56 22.1632H138.596C138.741 21.3795 138.88 21.0599 139.17 20.3072L143.89 8.54253H147.105L139.097 28.3651C138.131 30.8604 136.559 32.8194 133.447 32.8194L133.437 32.8246Z" fill="currentColor" />
            <path d="M159.248 13.7495C159.248 12.0018 157.713 10.9707 155.495 10.9707C153.278 10.9707 152.171 11.9348 152.171 13.3216C152.171 17.281 162.324 14.4249 162.433 20.8073C162.469 23.8387 159.574 25.5864 155.459 25.5864C151.344 25.5864 149.132 23.8387 148.165 23.055L150.093 20.9155C150.806 21.5909 152.916 22.9468 155.49 22.9468C158.065 22.9468 159.207 22.0549 159.207 20.7712C159.207 17.3119 148.945 19.5236 148.945 13.2855C148.945 10.5067 151.592 8.33116 155.557 8.33116C159.522 8.33116 162.169 10.3985 162.169 13.1773C162.169 13.8526 162.024 14.3527 162.024 14.3527L159.129 14.5692C159.202 14.3218 159.238 13.997 159.238 13.7495H159.248Z" fill="currentColor" />
            <path d="M171.438 17.6367H169.613V25.375H166.47V0.206217H169.613V15.1105H171.94L177.73 8.55284H181.338L174.188 16.4303L182.051 25.3801H178.081L171.433 17.6418L171.438 17.6367Z" fill="currentColor" />
            <path d="M200 17.0335C200 22.1322 196.531 25.5915 191.315 25.5915C186.099 25.5915 182.63 22.1322 182.63 17.0335C182.63 11.9348 186.099 8.33632 191.315 8.33632C196.531 8.33632 200 11.9348 200 17.0335ZM196.785 17.0335C196.785 13.5381 194.603 10.9707 191.315 10.9707C188.027 10.9707 185.846 13.5381 185.846 17.0335C185.846 20.5289 188.027 22.9519 191.315 22.9519C194.603 22.9519 196.785 20.5289 196.785 17.0335Z" fill="currentColor" />
        </g>
        <defs>
            <clipPath id="clip0_1209_2">
                <rect width="200" height="34" fill="white" />
            </clipPath>
        </defs>
    </svg>
);

// Timeline Data for a specific process (Helper)
const getTimelineEvents = (process: any, invoices: any[] = []) => {
    const events: any[] = [];

    // Helper para formatar data com segurança
    const safeDate = (val: any) => {
        if (!val) return '';
        try {
            const d = new Date(val);
            return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
        } catch { return ''; }
    };

    // Helper para safeTime (sort)
    const safeTime = (val: any) => {
        if (!val) return 0;
        try {
            const t = new Date(val).getTime();
            return isNaN(t) ? 0 : t;
        } catch { return 0; }
    };

    // 1. Contrato Assinado
    events.push({
        id: 'contract',
        type: 'contract',
        title: 'Contrato Assinado',
        date: safeDate(process.contractSignDate || process.createdAt),
        desc: process.contractSignStatus === 'SIGNED' ? 'Contrato eletrônico assinado com sucesso.' : 'Aguardando assinatura do contrato.',
        status: process.contractSignStatus,
        createdAt: process.contractSignDate || process.createdAt,
        isCompleted: process.contractSignStatus === 'SIGNED',
        isActiveAction: process.contractSignStatus !== 'SIGNED'
    });

    // 2. Honorários Profissionais
    const serviceInvoice = invoices.find(i => i.type === 'SERVICE' && (i.id === process.invoiceId || (process.brandName && i.description?.includes(process.brandName))));
    const isServicePaid = serviceInvoice?.status === 'paid' || process.paymentStatus === 'PAID';
    events.push({
        id: 'service-payment',
        type: 'invoice',
        title: 'Honorários Profissionais',
        date: safeDate(serviceInvoice?.dueDate),
        desc: isServicePaid ? 'Pagamento dos honorários confirmado.' : 'Aguardando pagamento dos honorários iniciais.',
        status: serviceInvoice?.status || process.paymentStatus,
        invoice: serviceInvoice,
        createdAt: serviceInvoice?.createdAt || process.createdAt,
        isCompleted: isServicePaid,
        isActiveAction: !isServicePaid && !!serviceInvoice
    });

    // 3. Pagamento Recebido
    if (isServicePaid) {
        const paidAt = serviceInvoice?.paidAt || process.updatedAt;
        events.push({
            id: 'payment-confirmation',
            type: 'payment-confirmation',
            title: 'Pagamento Recebido',
            date: safeDate(paidAt),
            desc: 'Identificamos o pagamento dos honorários iniciais com sucesso.',
            status: 'PAID',
            createdAt: paidAt,
            isCompleted: true,
            isActiveAction: false
        });
    }

    // 4. Procuração INPI
    const isProxyCompleted = process.proxySignStatus === 'VALIDATED' || process.proxySignStatus === 'SIGNED';
    events.push({
        id: 'proxy',
        type: 'proxy',
        title: 'Procuração INPI',
        date: safeDate(process.updatedAt),
        desc: process.proxySignStatus === 'VALIDATED' ? 'Procuração validada pela equipe' : (process.proxySignStatus === 'SIGNED' ? 'Procuração enviada e assinada' : 'Aguardando download e assinatura da Procuração'),
        status: process.proxySignStatus,
        createdAt: process.updatedAt || process.createdAt,
        isCompleted: isProxyCompleted,
        isActiveAction: !isProxyCompleted
    });

    // 5. Taxa Federal (GRU)
    if (process.planType === 'ESSENCIAL' || process.planType === 'PREMIUM') {
        const isGruPaid = process.gruStatus === 'PAID';
        events.push({
            id: 'gru-stage',
            type: 'gru',
            title: 'Taxa Federal (GRU)',
            desc: isGruPaid ? 'Taxa Federal paga e validada.' : (process.gruUrl ? 'Boleto GRU disponível para pagamento.' : 'Aguardando emissão da taxa federal pela Asterysko.'),
            status: process.gruStatus,
            barcode: process.gruBarcode,
            gruUrl: process.gruUrl,
            receiptUrl: process.gruReceiptUrl,
            createdAt: process.updatedAt || process.createdAt,
            isCompleted: isGruPaid,
            isActiveAction: !isGruPaid && !!process.gruUrl
        });
    }

    // 6. Depósito do Pedido
    if (process.inpiProcessNumber || (process.status !== 'NEW' && process.status !== 'WAITING_PAYMENT')) {
        events.push({
            id: 'deposito',
            type: 'dispatch',
            title: 'Depósito do Pedido',
            date: safeDate(process.filingDate || process.createdAt),
            desc: `Protocolo gerado no INPI: ${process.inpiProcessNumber || 'Processando'}`,
            createdAt: process.filingDate || process.createdAt,
            isCompleted: !!process.inpiProcessNumber,
            isActiveAction: false
        });
    }

    if (process.dispatches && process.dispatches.length > 0) {
        process.dispatches.forEach((d: any) => {
            events.push({
                id: d.id || `dispatch-${Math.random()}`,
                type: d.type || 'dispatch',
                title: d.isVirtual ? (d.description || 'Despacho') : `${d.code || ''} - ${d.description || 'Despacho'}`.trim().replace(/^- /, ''),
                date: safeDate(d.createdAt),
                desc: d.details || `Publicado na RPI ${d.rpiNumber || '-'}`,
                createdAt: d.createdAt || process.createdAt,
                isCompleted: true,
                isActiveAction: false,
                downloadUrl: d.downloadUrl
            });
        });
    }

    // Sort com segurança (sem crash em datas nulas)
    return events.sort((a, b) => {
        const timeA = safeTime(a.createdAt);
        const timeB = safeTime(b.createdAt);
        if (timeA !== timeB) return timeB - timeA;
        const priorities: Record<string, number> = {
            'dispatch': 6,
            'gru': 5,
            'proxy': 4,
            'payment-confirmation': 3,
            'invoice': 2,
            'contract': 1
        };
        return (priorities[b.type] || 0) - (priorities[a.type] || 0);
    });
};

const AsteryskoClientPortal: React.FC<AsteryskoClientPortalProps> = ({ onExit, theme, onToggleTheme }) => {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clientData, setClientData] = useState<any>(null);
    const [processes, setProcesses] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    // Financials State
    const [financials, setFinancials] = useState<{ invoices: any[], contracts: any[] }>({ invoices: [], contracts: [] });

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'timeline' | 'data' | 'docs'>('timeline');
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);
    const [installments, setInstallments] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

    // Navigation State: 'home' (Processes), 'profile', 'contracts', 'financial', 'support'
    const [currentView, setCurrentView] = useState<'home' | 'profile' | 'contracts' | 'financial' | 'support'>('home');

    // Profile Edit State
    const [editName, setEditName] = useState('');
    const [editRg, setEditRg] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);

    const handleDownloadProxyPdf = async (procId: string, brandName: string) => {
        try {
            setIsDownloadingPdf(procId);
            const token = localStorage.getItem('token');
            const url = `${getBackendUrl()}/api/asterysko/processes/${procId}/proxy/download-pdf?token=${token}`;
            await forceDownloadFile(url, `Procuracao_${(brandName || 'Marca').replace(/\s+/g, '_')}.pdf`);
        } finally {
            setIsDownloadingPdf(null);
        }
    };

    // ... (existing helper functions)

    const handleOpenPaymentModal = async (invoice: any) => {
        setSelectedInvoice(invoice);
        setCheckoutUrl(null);
        setPaymentMethod(null);
        setIsPaymentModalOpen(true);

        if (invoice.type !== 'TAX') {
            setIsGeneratingPayment(true);
            try {
                const targetId = invoice.invoiceId || invoice.dealId || invoice.id;
                const res = await api.post(`/asterysko/portal/payments/${targetId}/infinitepay`);
                if (res.data.paymentUrl) {
                    setCheckoutUrl(res.data.paymentUrl);
                } else {
                    alert('Erro ao gerar cobrança pela operadora.');
                    setIsPaymentModalOpen(false);
                }
            } catch (error: any) {
                console.error('Erro gerando pagamento', error);
                alert(error.response?.data?.error || 'Erro interno ao gerar o link de pagamento.');
                setIsPaymentModalOpen(false);
            } finally {
                setIsGeneratingPayment(false);
            }
        }
    };
    // Helper for Status Translation (case‑insensitive)
    const formatStatus = (status: string) => {
        const key = status?.toUpperCase();
        const map: Record<string, string> = {
            'NEW': 'Novo',
            'WAITING_PAYMENT': 'Aguardando Pagamento',
            'WAITING_DOCS': 'Aguardando Documentos',
            'FILED': 'Protocolado',
            'EXAMINATION': 'Em Exame',
            'OPPOSITION': 'Oposição',
            'GRANTED': 'Concedido',
            'DENIED': 'Indeferido',
            'RETIRED': 'Arquivado',
            'APPEAL': 'Em Recurso'
        };
        return map[key] || status;
    };

    const getStatusColor = (status: string) => {
        const s = (status || '').toUpperCase();
        if (s === 'GRANTED' || s === 'CONCEDIDO') return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800';
        if (s === 'FILED' || s === 'PUBLICADO') return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800';
        if (s === 'WAITING_PAYMENT' || s === 'WAITING_DOCS') return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800';
        if (s === 'NEW') return 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700';
        return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800';
    };

    // Fetch Real Data
    useEffect(() => {
        const urlToken = new URLSearchParams(window.location.search).get('token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // Parallel fetching
                const [dashboardRes, financialsRes] = await Promise.all([
                    api.get('/asterysko/portal/dashboard'),
                    api.get('/asterysko/portal/financials')
                ]);

                const { client, notifications } = dashboardRes.data || {};
                const { invoices, contracts } = financialsRes.data || {};

                if (client) {
                    setClientData(client);
                    setEditName(client.name || '');
                    setEditRg(client.rg || '');
                    setEditAddress(client.address ? `${client.address}${client.city ? `, ${client.city}` : ''}${client.state ? `-${client.state}` : ''}` : '');
                }
                setNotifications(Array.isArray(notifications) ? notifications : []);
                setFinancials({ 
                    invoices: Array.isArray(invoices) ? invoices : [], 
                    contracts: Array.isArray(contracts) ? contracts : [] 
                });

                // Flatten brands -> processes for the UI
                const allProcessesMap = new Map();
                client.brands?.forEach((brand: any) => {
                    brand.processes?.forEach((proc: any) => {
                        if (!allProcessesMap.has(proc.id)) {
                            allProcessesMap.set(proc.id, {
                                ...proc,
                                brandName: brand.name,
                                brandLogo: brand.logoUrl,
                                brandType: brand.type,
                                brandNature: brand.nature,
                                brandPresentation: brand.presentation,
                                holders: brand.holders,
                                nclSpecification: brand.nclSpecification,
                                classes: brand.nclClasses?.join(', ') || 'NCL -',
                                filingDate: proc.filingDate,
                                concessionDate: proc.concessionDate,
                                expirationDate: proc.expirationDate,
                                procurator: proc.procurator,
                                planType: proc.planType,
                                gruUrl: proc.gruUrl,
                                gruBarcode: proc.gruBarcode,
                                gruReceiptUrl: proc.gruReceiptUrl,
                                gruStatus: proc.gruStatus
                            });
                        }
                    });
                });

                const allProcesses = Array.from(allProcessesMap.values());
                setProcesses(allProcesses);
                if (allProcesses.length > 0) {
                    setExpandedId(allProcesses[0].id);
                }
                setLoading(false);
            } catch (err: any) {
                console.error('Error loading portal data:', err);
                if (err.response?.status === 401) {
                    // Sessão inválida — fazer logout e redirecionar para login
                    logout();
                    window.location.replace('/portal/login');
                    return;
                }
                if (err.response?.status === 404) {
                    setError('CLIENT_NOT_FOUND');
                } else if (false) { // bloco desativado
                  // MOCK DATA FOR ADMIN PREVIEW
                  const mockProc = {
                    id: 'preview-1',
                    brandName: 'MANYSPACE',
                    brandPresentation: 'Mista',
                    brandNature: 'Serviço',
                    brandType: 'Tecnologia',
                    holders: 'ManySpace Tecnologia Ltda.',
                    inpiProcessNumber: '928374655',
                    filingDate: new Date().toISOString(),
                    status: 'FILED',
                    classes: '35, 42',
                    nclSpecification: 'Software como serviço (SaaS); Plataforma de automação e gestão empresarial; Desenvolvimento de ferramentas de inteligência comercial.',
                    procurator: 'Asterysko Propriedade Intelectual',
                    contractUrl: '#',
                    proxyUrl: '#',
                    contractSignStatus: 'SIGNED',
                    proxySignStatus: 'VALIDATED'
                  };
                  
                  setClientData({ 
                    name: 'Cliente Preview', 
                    email: 'contato@preview.com', 
                    role: 'ADMIN_PREVIEW',
                    cpfCnpj: '00.000.000/0001-00',
                    address: 'Av. Paulista, 1000 - São Paulo, SP'
                  });
                  setProcesses([mockProc]);
                  setExpandedId(mockProc.id);
                  setFinancials({
                    invoices: [
                      { id: 'FAT-PREVIEW', description: 'Registro de Marca - Honorários Asterysko', value: 997.00, dueDate: new Date().toISOString(), status: 'paid' }
                    ],
                    contracts: [
                      { id: 'CTR-PREVIEW', brandName: 'DOCKA HUB', contractUrl: '#', contractSignStatus: 'SIGNED', inpiProcessNumber: '928374655' }
                    ]
                  });
                  setLoading(false);
                } else {
                    setError('Não foi possível carregar os dados do portal.');
                    setLoading(false);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCopyText = (text: string) => {
        navigator.clipboard.writeText(text);
        // Toast could be integrated here later if needed
    };

    const handleCopyPix = () => {
        handleCopyText("00020126330014BR.GOV.BCB.PIX0111123456789015204000053039865802BR5913ASTERYKO6009SAO PAULO62070503***6304E2B1");
    };

    const handleUploadReceipt = async (invoiceId: string, file: File) => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            await api.post(`/asterysko/portal/financials/receipt/${invoiceId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Refresh financials
            const financialsRes = await api.get('/asterysko/portal/financials');
            setFinancials(financialsRes.data);

            // Update selected invoice if open
            if (selectedInvoice && selectedInvoice.invoiceId === invoiceId) {
                const updated = financialsRes.data.invoices.find((i: any) => i.invoiceId === invoiceId);
                if (updated) setSelectedInvoice(updated);
            }

            alert('Comprovante enviado com sucesso!');
        } catch (error) {
            console.error('Error uploading receipt:', error);
            alert('Erro ao enviar comprovante. Tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleProxyFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, processId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post(`/asterysko/processes/${processId}/proxy/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Procuração enviada com sucesso!');

            // Update main processes list silently
            setProcesses((prev: any[]) => prev.map((p: any) => p.id === processId ? { ...p, proxyUrl: res.data.proxyUrl, proxySignStatus: 'SIGNED' } : p));
        } catch (error) {
            console.error('Proxy upload error', error);
            alert('Erro no envio da Procuração.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleGruReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>, processId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post(`/asterysko/processes/${processId}/gru/receipt`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Comprovante enviado com sucesso!');

            // Update main processes list silently
            setProcesses((prev: any[]) => prev.map((p: any) => p.id === processId ? { ...p, gruReceiptUrl: res.data.process?.gruReceiptUrl || res.data.gruReceiptUrl, gruStatus: 'PAID' } : p));
        } catch (error) {
            console.error('GRU receipt upload error', error);
            alert('Erro no envio do Comprovante.');
        } finally {
            setIsUploading(false);
        }
    };


    const handleMarkAsRead = async (notifId: string) => {
        try {
            await api.patch(`/asterysko/portal/notifications/${notifId}/read`);
            setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post('/asterysko/portal/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setIsSavingProfile(true);
            const response = await api.put('/asterysko/portal/profile', {
                name: editName,
                rg: editRg,
                address: editAddress
            });

            setClientData(response.data.profile);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar perfil. Tente novamente.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && typeof target.closest === 'function' && !target.closest('.dropdown-container')) {
                setIsNotificationsOpen(false);
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Reset tab when switching cards
    useEffect(() => {
        setActiveTab('timeline');
    }, [expandedId]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center z-[100]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-600 dark:text-zinc-400 font-medium">Carregando seu portal...</p>
            </div>
        );
    }

    if (error) {
        if (error === 'CLIENT_NOT_FOUND') {
            return (
                <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-[100]">
                    <div className="text-center max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                        <div className="bg-red-500/10 p-4 rounded-full w-fit mx-auto mb-6 border border-red-500/30 ring-4 ring-red-500/5">
                            <User size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Seu usuário atual não possui um perfil de cliente Asterysko vinculado. <br />
                            Acesse com uma conta de cliente válida.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    logout();
                                    window.location.replace('/portal/login');
                                }}
                                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold shadow-lg shadow-blue-900/20"
                            >
                                Sair e Voltar para Login
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center z-[100] p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Ops! Algo deu errado</h2>
                <p className="text-slate-600 dark:text-zinc-400 mb-6">{error}</p>
                <button
                    onClick={onExit}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#F3F3F3] dark:bg-slate-950 flex flex-col font-sans z-[100] overflow-hidden transition-colors">

            {/* MAIN SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">

                {/* FIGMA HEADER (Frame 41:222) */}
                <div className="bg-[#F3F3F3] dark:bg-slate-950 pt-6 px-6 pb-4 max-w-4xl mx-auto w-full">
                    {/* Top Navbar */}
                    <div className="flex justify-between items-center mb-6">
                        <div
                            className="text-[#1A1FD3] dark:text-blue-400 cursor-pointer flex items-center gap-3"
                            onClick={() => setCurrentView('home')}
                            title="Voltar ao Início"
                        >
                            <AsteryskoLogoSVG />
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Notification Bell */}
                            <div className="relative dropdown-container">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsNotificationsOpen(!isNotificationsOpen); setIsMenuOpen(false); }}
                                    className={`p-2.5 rounded-full transition-colors relative ${isNotificationsOpen ? 'bg-white text-[#1A1FD3]' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-white'}`}
                                >
                                    <Bell size={20} />
                                    {notifications && notifications.some(n => !n.read) && (
                                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {isNotificationsOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right z-50">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
                                            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Notificações</h3>
                                            {notifications.some(n => !n.read) && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
                                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    Marcar lidas
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto bg-white dark:bg-zinc-900">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                                                    Nenhuma notificação recente.
                                                </div>
                                            ) : notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => { if (!notif.read) handleMarkAsRead(notif.id); if (notif.link) { setCurrentView('home'); } }}
                                                    className={`p-4 border-b border-slate-50 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-700 dark:text-zinc-300'}`}>{notif.title}</h4>
                                                        {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2">
                                                        {new Date(notif.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Theme Toggle */}
                            {onToggleTheme && (
                                <button
                                    onClick={onToggleTheme}
                                    className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-colors"
                                    title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                                >
                                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                            )}

                            {/* Slide-out Menu Trigger Button (Figma jam:menu) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(true); setIsNotificationsOpen(false); }}
                                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors cursor-pointer"
                                title="Abrir Menu"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Greeting Header (Figma Group 3 / 53:659) */}
                    {currentView === 'home' && (
                        <div className="space-y-0.5 mb-2">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Olá, {clientData?.name ? clientData.name.split(' ')[0] : 'Levy'}
                            </h1>
                            <p className="text-xs text-[#797979] dark:text-zinc-400">
                                Acompanhe seus processos
                            </p>
                        </div>
                    )}
                </div>

                {/* MAIN CONTENT CONTAINER */}
                <div className="max-w-4xl mx-auto px-6 pb-12">

                        {/* Slide-out Menu Drawer (Figma Frame 59:1496) */}
                        {isMenuOpen && (
                            <div className="fixed inset-0 z-[150] flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                                <div 
                                    className="w-full max-w-sm bg-[#F3F3F3] dark:bg-zinc-900 h-full p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-zinc-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#1A1FD3] text-white flex items-center justify-center font-bold text-sm">
                                                    {clientData?.name ? clientData.name[0] : 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{clientData?.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400">{clientData?.email}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setIsMenuOpen(false)}
                                                className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <button
                                                onClick={() => { setCurrentView('profile'); setIsMenuOpen(false); }}
                                                className="w-full bg-white dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700/60 text-left flex items-center justify-between group hover:border-[#1A1FD3] transition-all cursor-pointer shadow-xs"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sua conta</h4>
                                                        <p className="text-xs text-slate-400 dark:text-zinc-400">Mantenha seus dados atualizados.</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                            </button>

                                            <button
                                                onClick={() => { setCurrentView('contracts'); setIsMenuOpen(false); }}
                                                className="w-full bg-white dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700/60 text-left flex items-center justify-between group hover:border-[#1A1FD3] transition-all cursor-pointer shadow-xs"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                                                        <Shield size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Meus Contratos</h4>
                                                        <p className="text-xs text-slate-400 dark:text-zinc-400">Termos e contratos de serviços.</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                            </button>

                                            <button
                                                onClick={() => { setCurrentView('financial'); setIsMenuOpen(false); }}
                                                className="w-full bg-white dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700/60 text-left flex items-center justify-between group hover:border-[#1A1FD3] transition-all cursor-pointer shadow-xs"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Minhas Faturas</h4>
                                                        <p className="text-xs text-slate-400 dark:text-zinc-400">Pagamentos e mensalidades.</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                            </button>

                                            <button
                                                onClick={() => { setCurrentView('support'); setIsMenuOpen(false); }}
                                                className="w-full bg-white dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700/60 text-left flex items-center justify-between group hover:border-[#1A1FD3] transition-all cursor-pointer shadow-xs"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                                                        <HelpCircle size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Central de atendimento</h4>
                                                        <p className="text-xs text-slate-400 dark:text-zinc-400">Suporte e dúvidas frequentes.</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-200 dark:border-zinc-800">
                                        <button
                                            onClick={() => {
                                                logout();
                                                window.location.replace('/portal/login');
                                            }}
                                            className="w-full py-3.5 px-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-red-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                        >
                                            <LogOut size={18} /> Sair
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Greeting & Context Header-Changes based on View */}
                        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {currentView === 'home' && (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-2">Olá, {clientData?.name?.split(' ')[0]}</h1>
                                    <p className="text-blue-100 text-base max-w-lg leading-relaxed">
                                        Aqui você acompanha o progresso dos seus registros de marca e acessa documentos importantes em tempo real.
                                    </p>
                                </>
                            )}
                            {currentView === 'profile' && (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-2">Meus Dados</h1>
                                    <p className="text-blue-100 text-base max-w-lg leading-relaxed">
                                        Gerencie as informações cadastrais e de segurança da sua conta.
                                    </p>
                                </>
                            )}
                            {currentView === 'contracts' && (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-2">Meus Contratos</h1>
                                    <p className="text-blue-100 text-base max-w-lg leading-relaxed">
                                        Acesse e baixe todos os contratos de prestação de serviços e termos legais.
                                    </p>
                                </>
                            )}
                            {currentView === 'financial' && (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-2">Minhas Faturas</h1>
                                    <p className="text-blue-100 text-base max-w-lg leading-relaxed">
                                        Consulte suas faturas, status de pagamento e histórico de honorários.
                                    </p>
                                </>
                            )}
                            {currentView === 'support' && (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-2">Central de Ajuda</h1>
                                    <p className="text-blue-100 text-base max-w-lg leading-relaxed">
                                        Precisa de auxílio? Abra um chamado ou entre em contato direto com nossa equipe.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 -mt-20 pb-12 relative z-20">
                    <div className="max-w-4xl mx-auto">

                        {/* ALERT BANNER: UNPAID INVOICES */}
                        {currentView === 'home' && financials.invoices?.some((i: any) => i.status === 'pending') && (
                            <div className="mb-6 bg-white dark:bg-zinc-900 border-l-4 border-amber-500 rounded-xl shadow-xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center shrink-0">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Faturas pendentes</h4>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">Você possui pagamentos em aberto. Regularize agora para garantir a agilidade do seu processo.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setCurrentView('financial')}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-amber-900/20 whitespace-nowrap"
                                >
                                    Ver Faturas
                                </button>
                            </div>
                        )}

                        {/* VIEW: HOME (Processes) */}
                        {currentView === 'home' && (
                            <div className="space-y-6">
                                {/* Registered Process Cards */}
                                {processes?.length === 0 ? (
                                    <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                                        <Briefcase size={48} className="mx-auto text-slate-300 dark:text-zinc-600 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Nenhum processo ativo</h3>
                                        <p className="text-slate-500 dark:text-zinc-400 max-w-xs mx-auto mt-2 text-xs">Você ainda não possui processos de marca registrados em nossa plataforma.</p>
                                    </div>
                                ) : (
                                    processes?.map((proc) => (
                                        <div key={proc.id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800 overflow-hidden transition-all duration-300">
                                            {/* Card Header (Always Visible) */}
                                            <div
                                                onClick={() => setExpandedId(expandedId === proc.id ? null : proc.id)}
                                                className="p-5 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div className="flex gap-4 items-center">
                                                        {proc.brandLogo ? (
                                                            <div className="w-14 h-14 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-slate-200/80 dark:border-zinc-700 shadow-xs shrink-0 overflow-hidden">
                                                                <img 
                                                                    src={proc.brandLogo.startsWith('http') ? proc.brandLogo : `${getBackendUrl()}${proc.brandLogo}`} 
                                                                    className="w-full h-full object-contain p-1.5" 
                                                                    alt="Logo da Marca" 
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-14 h-14 bg-[#1A1FD3] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0">
                                                                {proc.brandName ? proc.brandName[0] : 'M'}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{proc.brandName}</h2>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-zinc-700 font-mono">{proc.inpiProcessNumber || 'Em autuação'}</span>
                                                                <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-zinc-700">{proc.classes || 'Classe 35'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
                                                        {/* Figma Status Badge */}
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                            proc.status === 'EXAM_MERIT' || proc.status === 'REGISTERED' || proc.status === 'ACTIVE'
                                                                ? 'bg-[#1A1FD3] text-white'
                                                                : 'bg-[#797979] text-white'
                                                        }`}>
                                                            {formatStatus(proc.status)}
                                                        </span>
                                                        <ChevronDown size={20} className={`text-slate-400 dark:text-zinc-500 transition-transform duration-300 ${expandedId === proc.id ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Content */}
                                            {expandedId === proc.id && (
                                                <div className="border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 animate-in slide-in-from-top-2 duration-300">
                                                    {/* Tabs Navigation */}
                                                    <div className="px-6 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                                                        <div className="flex gap-6 overflow-x-auto">
                                                            <button
                                                                onClick={() => setActiveTab('timeline')}
                                                                className={`py-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'timeline' ? 'border-[#1A1FD3] text-[#1A1FD3] dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800'}`}
                                                            >
                                                                Detalhes & Timeline
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveTab('data')}
                                                                className={`py-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-[#1A1FD3] text-[#1A1FD3] dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800'}`}
                                                            >
                                                                Informações Gerais
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveTab('docs')}
                                                                className={`py-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'docs' ? 'border-[#1A1FD3] text-[#1A1FD3] dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800'}`}
                                                            >
                                                                Documentos do Processo
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="p-5 md:p-6 min-h-[250px]">
                                                        {/* TAB: TIMELINE */}
                                                        {activeTab === 'timeline' && (
                                                            <div className="relative pl-2 animate-in fade-in duration-300">
                                                                {proc.certificateUrl && (
                                                                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-500/5 border border-amber-400/40 dark:border-amber-600/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 text-lg shadow-inner">
                                                                                🏆
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                                                                                    Certificado de Registro Emitido! 🏆🛡️
                                                                                </h4>
                                                                                <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                                                                                    Sua marca está registrada e protegida pelo INPI em todo o Brasil.
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => {
                                                                                const token = localStorage.getItem('token');
                                                                                const baseUrl = proc.certificateUrl.startsWith('http') ? proc.certificateUrl : `${getBackendUrl()}${proc.certificateUrl.startsWith('/') ? '' : '/'}${proc.certificateUrl}`;
                                                                                const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}`;
                                                                                window.open(url, '_blank');
                                                                            }}
                                                                            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 tracking-wide uppercase shrink-0 cursor-pointer"
                                                                        >
                                                                            <Download size={14} /> Baixar Certificado 🏆
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {getTimelineEvents(proc, financials.invoices).map((step: any, idx: number, arr: any[]) => (
                                                                    <div key={step.id || idx} className="relative flex gap-5 pb-6 last:pb-0">
                                                                        {idx !== arr.length - 1 && (
                                                                            <div className={`absolute left-[11px] top-7 bottom-0 w-0.5 ${step.isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-800'}`} />
                                                                        )}
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 border-2 text-white shadow-xs ${step.isCompleted ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
                                                                            {step.isCompleted ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{step.title}</h4>
                                                                                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{step.date || 'Em andamento'}</span>
                                                                            </div>
                                                                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{step.description}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* TAB: DATA */}
                                                        {activeTab === 'data' && (
                                                            <div className="space-y-4 animate-in fade-in duration-300">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                                                                        <span className="block text-[11px] font-semibold text-slate-400 uppercase">Apresentação</span>
                                                                        <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{proc.presentation || 'Mista'}</span>
                                                                    </div>
                                                                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                                                                        <span className="block text-[11px] font-semibold text-slate-400 uppercase">Classificação NCL</span>
                                                                        <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{proc.classes || 'Classe 35'}</span>
                                                                    </div>
                                                                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                                                                        <span className="block text-[11px] font-semibold text-slate-400 uppercase">Número do Protocolo</span>
                                                                        <span className="text-sm font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{proc.inpiProcessNumber || 'Aguardando publicação'}</span>
                                                                    </div>
                                                                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                                                                        <span className="block text-[11px] font-semibold text-slate-400 uppercase">Data de Depósito</span>
                                                                        <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{proc.depositDate ? new Date(proc.depositDate).toLocaleDateString('pt-BR') : '13/01/2026'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}

                                {/* Figma Card: Registrar uma nova marca (Frame 41:262) */}
                                <a
                                    href="https://asterysko.com/nova-marca"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:border-[#1A1FD3] dark:hover:border-blue-500 transition-all flex items-center gap-4 group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1A1FD3] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <Plus size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Registrar uma nova marca</h4>
                                        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-0.5">Proteja mais um nome ou logomarca em minutos.</p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                                </a>

                                {/* Figma Banner: Proteção não termina no registro (Frame 53:660) */}
                                <div className="bg-[#1A1FD3] dark:bg-blue-950 p-6 rounded-2xl text-white relative overflow-hidden shadow-md">
                                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 text-white font-bold text-lg">
                                            ®
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white">Proteção não termina no registro</h3>
                                            <p className="text-xs text-[#588DFF] dark:text-blue-300 mt-1 leading-relaxed">
                                                Monitore, renove e expanda sua marca constantemente com os serviços de inteligência da Asterysko.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Figma Section: Mais benefícios (Frame 41:323) */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mais benefícios</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-[#0D1E1D] p-5 rounded-2xl text-white relative overflow-hidden flex flex-col justify-between h-36 border border-teal-900/50 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-lg font-bold text-white">Allyo</h4>
                                                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xs text-[10px] font-bold rounded-full text-white">
                                                    Teste grátis
                                                </span>
                                            </div>
                                            <p className="text-xs text-teal-200/80 leading-snug">
                                                Time criativo do seu time criativo
                                            </p>
                                        </div>

                                        <div className="bg-[#0D1E1D] p-5 rounded-2xl text-white relative overflow-hidden flex flex-col justify-between h-36 border border-teal-900/50 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-lg font-bold text-white">Scout AI</h4>
                                                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xs text-[10px] font-bold rounded-full text-white">
                                                    Exclusivo
                                                </span>
                                            </div>
                                            <p className="text-xs text-teal-200/80 leading-snug">
                                                Vigilância ativa contra imitações de marca
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: PROFILE (Meus Dados - Figma Frame 53:672) */}
                        {currentView === 'profile' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-3 mb-2">
                                    <button 
                                        onClick={() => setCurrentView('home')}
                                        className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 transition-colors"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Meus dados</h2>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">Gerencie as informações cadastrais e de segurança da sua conta.</p>
                                    </div>
                                </div>

                                {/* Section 1: Dados da empresa */}
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
                                    <div className="bg-[#F8F8F8] dark:bg-zinc-800/80 px-6 py-3 border-b border-slate-200/60 dark:border-zinc-800">
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">Dados da empresa</h3>
                                    </div>
                                    <div className="p-6 space-y-4 divide-y divide-slate-100 dark:divide-zinc-800">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100">Razão social</span>
                                                <span className="text-xs text-[#797979] dark:text-zinc-400 mt-0.5 block">{editName || clientData?.name || 'Fauves LTDA'}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleUpdateProfile()}
                                                className="text-xs font-bold text-slate-900 dark:text-zinc-200 hover:text-[#1A1FD3] cursor-pointer self-start sm:self-auto"
                                            >
                                                Editar
                                            </button>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100">CNPJ</span>
                                                <span className="text-xs text-[#797979] dark:text-zinc-400 mt-0.5 block">{clientData?.cpfCnpj || '00.000.000/0000-00'}</span>
                                            </div>
                                            <button className="text-xs font-bold text-slate-900 dark:text-zinc-200 hover:text-[#1A1FD3] cursor-pointer self-start sm:self-auto">
                                                Editar
                                            </button>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100">Endereço</span>
                                                <span className="text-xs text-[#797979] dark:text-zinc-400 mt-0.5 block">{editAddress || clientData?.address || 'Rua 1, bairro 2, cidade 3, UF'}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleUpdateProfile()}
                                                className="text-xs font-bold text-slate-900 dark:text-zinc-200 hover:text-[#1A1FD3] cursor-pointer self-start sm:self-auto"
                                            >
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Dados pessoais */}
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
                                    <div className="bg-[#F8F8F8] dark:bg-zinc-800/80 px-6 py-3 border-b border-slate-200/60 dark:border-zinc-800">
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">Dados pessoais</h3>
                                    </div>
                                    <div className="p-6 space-y-4 divide-y divide-slate-100 dark:divide-zinc-800">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100">Nome completo</span>
                                                <span className="text-xs text-[#797979] dark:text-zinc-400 mt-0.5 block">{clientData?.name || 'Levy Câmara Soares'}</span>
                                            </div>
                                            <button className="text-xs font-bold text-slate-900 dark:text-zinc-200 hover:text-[#1A1FD3] cursor-pointer self-start sm:self-auto">
                                                Editar
                                            </button>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100">CPF</span>
                                                <span className="text-xs text-[#797979] dark:text-zinc-400 mt-0.5 block">{clientData?.cpfCnpj || '000.000.000-00'}</span>
                                            </div>
                                            <button className="text-xs font-bold text-slate-900 dark:text-zinc-200 hover:text-[#1A1FD3] cursor-pointer self-start sm:self-auto">
                                                Editar
                                            </button>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100">Email</span>
                                                <span className="text-xs text-[#797979] dark:text-zinc-400 mt-0.5 block">{clientData?.email || 'email@email.com'}</span>
                                            </div>
                                            <button className="text-xs font-bold text-slate-900 dark:text-zinc-200 hover:text-[#1A1FD3] cursor-pointer self-start sm:self-auto">
                                                Editar
                                            </button>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100">Whatsapp</span>
                                                <span className="text-xs text-[#797979] dark:text-zinc-400 mt-0.5 block">{clientData?.phone || '(00) 00000-0000'}</span>
                                            </div>
                                            <button className="text-xs font-bold text-slate-900 dark:text-zinc-200 hover:text-[#1A1FD3] cursor-pointer self-start sm:self-auto">
                                                Editar
                                            </button>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100">Endereço residencial</span>
                                                <span className="text-xs text-[#797979] dark:text-zinc-400 mt-0.5 block">{clientData?.address || 'Mesmo endereço da empresa'}</span>
                                            </div>
                                            <button className="text-xs font-bold text-slate-900 dark:text-zinc-200 hover:text-[#1A1FD3] cursor-pointer self-start sm:self-auto">
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: CONTRACTS (Meus Contratos - Figma Frame 58:863) */}
                        {currentView === 'contracts' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-3 mb-2">
                                    <button 
                                        onClick={() => setCurrentView('home')}
                                        className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 transition-colors"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contratos</h2>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">Acesse e baixe todos os contratos de prestação de serviços e termos legais.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {financials.contracts?.length === 0 ? (
                                        <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                                            <Shield size={48} className="mx-auto text-slate-300 dark:text-zinc-600 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Nenhum contrato assinado</h3>
                                            <p className="text-slate-500 dark:text-zinc-400 max-w-xs mx-auto mt-2 text-xs">Seus contratos de prestação de serviços aparecerão aqui após a formalização.</p>
                                        </div>
                                    ) : (
                                        financials.contracts?.map((contract) => {
                                            const isSigned = contract.contractSignStatus === 'SIGNED' || contract.status === 'SIGNED';
                                            return (
                                                <div key={contract.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#1A1FD3] dark:hover:border-blue-700 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-[#1A1FD3] dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                                                            <FileText size={22} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Contrato - Registro de Marca</h4>
                                                            <p className="text-xs text-[#8F8F8F] dark:text-zinc-400 mt-0.5">{clientData?.name || 'Asterysko Client'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                        {/* Figma Status Pills */}
                                                        {isSigned ? (
                                                            <span className="px-3 py-1 bg-[#D5F7CB] text-[#1D8800] rounded-full text-xs font-bold flex items-center gap-1.5">
                                                                <CheckCircle2 size={13} /> Assinado
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-[#F7F1CB] text-amber-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                                                                <Clock size={13} /> Aguardando assinatura
                                                            </span>
                                                        )}

                                                        <button 
                                                            onClick={() => {
                                                                const token = localStorage.getItem('token');
                                                                const url = contract.contractUrl?.startsWith('http') ? contract.contractUrl : `${getBackendUrl()}${contract.contractUrl?.startsWith('/') ? '' : '/'}${contract.contractUrl}${contract.contractUrl?.includes('?') ? '&' : '?'}token=${token}`;
                                                                window.open(url, '_blank');
                                                            }} 
                                                            className="p-2 text-slate-600 dark:text-zinc-400 hover:text-[#1A1FD3] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-slate-200 dark:border-zinc-700"
                                                            title="Abrir Contrato"
                                                        >
                                                            <ExternalLink size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* VIEW: FINANCIAL */}
                        {
                            currentView === 'financial' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Summary Cards */}
                                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                                            <div className="text-sm text-slate-500 dark:text-zinc-400 mb-1">Total Pendente</div>
                                            <div className="text-2xl font-bold text-amber-600">
                                                {financials.invoices
                                                    ?.filter((i: any) => i.status === 'pending')
                                                    ?.reduce((acc: number, curr: any) => acc + curr.value, 0)
                                                    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                                            <div className="text-sm text-slate-500 dark:text-zinc-400 mb-1">Total Pago</div>
                                            <div className="text-2xl font-bold text-emerald-600">
                                                {financials.invoices
                                                    .filter((i: any) => i.status === 'paid')
                                                    .reduce((acc: number, curr: any) => acc + curr.value, 0)
                                                    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                                        {/* DESKTOP TABLE */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                                                        <th className="p-4 font-medium">Descrição</th>
                                                        <th className="p-4 font-medium">Vencimento</th>
                                                        <th className="p-4 font-medium">Valor</th>
                                                        <th className="p-4 font-medium">Status</th>
                                                        <th className="p-4 font-medium text-right">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm divide-y divide-slate-100 dark:divide-zinc-800">
                                                    {financials.invoices.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-zinc-400">
                                                                Nenhuma fatura encontrada.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        financials.invoices.map((invoice: any) => (
                                                            <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                                <td className="p-4 font-medium text-slate-900 dark:text-white">
                                                                    {invoice.description}
                                                                    <div className="text-xs text-slate-400 font-normal mt-0.5">ID: {invoice.id}</div>
                                                                </td>
                                                                <td className="p-4 text-slate-600 dark:text-zinc-300">
                                                                    {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                                                                </td>
                                                                <td className="p-4 font-medium text-slate-900 dark:text-white">
                                                                    {invoice.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className="flex flex-col">
                                                                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-medium border ${invoice.status === 'paid'
                                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                                                            : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                                            }`}>
                                                                            {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-right">
                                                                    <div className="flex flex-col items-end gap-2">
                                                                        {invoice.status === 'pending' && (
                                                                            <button
                                                                                onClick={() => handleOpenPaymentModal(invoice)}
                                                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium text-xs bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
                                                                            >
                                                                                Pagar Agora
                                                                            </button>
                                                                        )}
                                                                        {invoice.officialBoletoUrl && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    const token = localStorage.getItem('token');
                                                                                    const url = `${getBackendUrl()}/api/asterysko/portal/financials/${invoice.invoiceId}/download-file?token=${token}`;
                                                                                    window.open(url, '_blank');
                                                                                }}
                                                                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold text-[10px] bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-blue-200 dark:border-blue-900/50 hover:shadow-sm transition-all"
                                                                            >
                                                                                <Download size={12} /> {invoice.type === 'TAX' ? 'BAIXAR GRU' : 'RECIBO'}
                                                                            </button>
                                                                        )}
                                                                        {invoice.status === 'paid' && !invoice.officialBoletoUrl && (
                                                                            <span className="text-slate-400 text-xs flex items-center justify-end gap-1">
                                                                                <CheckCircle2 className="w-3 h-3" /> Pago
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* MOBILE CARDS */}
                                        <div className="md:hidden divide-y divide-slate-100 dark:divide-zinc-800">
                                            {financials.invoices.length === 0 ? (
                                                <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
                                                    Nenhuma fatura encontrada.
                                                </div>
                                            ) : (
                                                financials.invoices.map((invoice: any) => (
                                                    <div
                                                        key={invoice.id}
                                                        className="p-4 flex flex-col gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer active:bg-slate-100 dark:active:bg-zinc-800"
                                                        onClick={() => {
                                                            if (invoice.status === 'pending') {
                                                                handleOpenPaymentModal(invoice);
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div>
                                                                <div className="font-medium text-slate-900 dark:text-white text-sm">{invoice.description}</div>
                                                                <div className="text-xs text-slate-400 mt-0.5">ID: {invoice.id}</div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                                    {invoice.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                                                    Venc. {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-zinc-800/50 mt-1">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${invoice.status === 'paid'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                                                : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                                }`}>
                                                                {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                                                            </span>

                                                            <div className="flex items-center gap-2">
                                                                {invoice.status === 'pending' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpenPaymentModal(invoice);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold text-xs bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-800 shadow-sm"
                                                                    >
                                                                        Pagar Agora
                                                                    </button>
                                                                )}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const token = localStorage.getItem('token');
                                                                            const url = `${getBackendUrl()}/api/asterysko/portal/financials/${invoice.invoiceId}/download-file?token=${token}`;
                                                                            window.open(url, '_blank');
                                                                        }}
                                                                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold text-[10px] bg-white dark:bg-zinc-800 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-900/50 shadow-sm transition-all"
                                                                    >
                                                                        <Download size={14} /> {invoice.type === 'TAX' ? 'BAIXAR GRU' : 'RECIBO'}
                                                                    </button>
                                                                {invoice.status === 'paid' && !invoice.officialBoletoUrl && (
                                                                    <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                                                                        <CheckCircle2 className="w-4 h-4" /> Pago
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {
                            currentView === 'support' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all group text-left">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <MessageSquare size={20} />
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-zinc-100">Falar no WhatsApp</h3>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Atendimento em tempo real via chat.</p>
                                        </button>
                                        <button className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all group text-left">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Mail size={20} />
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-zinc-100">Abrir Ticket via E-mail</h3>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Para questões complexas e documentais.</p>
                                        </button>
                                        <button className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all group text-left">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <HelpCircle size={20} />
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-zinc-100">Perguntas Frequentes</h3>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Tire dúvidas sobre o processo de registro.</p>
                                        </button>
                                    </div>

                                    {/* Recent Tickets */}
                                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
                                            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Meus Chamados Recentes</h3>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                                            <div className="p-12 text-center text-slate-400 dark:text-zinc-500 text-sm">
                                                Você não possui chamados abertos.
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-zinc-950/50 border-t border-slate-100 dark:border-zinc-800 text-center">
                                            <button className="text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors">Ver histórico completo</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* Footer */}
                        <div className="mt-12 text-center pb-8">
                            <p className="text-slate-400 dark:text-zinc-600 text-sm">© 2026 Asterysko Propriedade Intelectual. Todos os direitos reservados.</p>
                            <div className="flex justify-center gap-4 mt-2 text-xs font-medium text-slate-500 dark:text-zinc-500">
                                <button onClick={() => {}} className="hover:text-blue-600 dark:hover:text-blue-400">Termos de Uso</button>
                                <button onClick={() => {}} className="hover:text-blue-600 dark:hover:text-blue-400">Privacidade</button>
                                <button onClick={() => {}} className="hover:text-blue-600 dark:hover:text-blue-400">Suporte</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAYMENT MODAL */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => { setIsPaymentModalOpen(false); setPaymentMethod(null); setCheckoutUrl(null); }}
                title="Pagar Fatura"
                size="md"
            >
                {selectedInvoice && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Descrição</span>
                                <span className="text-xs text-slate-500 font-mono">{selectedInvoice.id}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{selectedInvoice.description}</h3>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700 flex justify-between items-end">
                                <span className="text-sm text-slate-600 dark:text-zinc-400">Total a pagar:</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    {selectedInvoice.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>

                        {selectedInvoice.type === 'TAX' ? (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-xl">
                                    <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2 mb-2">
                                        <AlertCircle size={16} /> Pagamento de Taxa Federal (GRU)
                                    </h4>
                                    <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
                                        Esta é uma taxa oficial do INPI. O pagamento deve ser realizado através do boleto (GRU) emitido pelo próprio órgão.
                                    </p>
                                </div>

                                {selectedInvoice.officialBoletoCode && (
                                    <div className="bg-slate-900 dark:bg-zinc-800 p-6 rounded-2xl shadow-xl border border-slate-700 dark:border-zinc-700">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Linha Digitável</label>
                                            <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-wider">PIX ou Boleto</span>
                                        </div>
                                        <div className="bg-slate-800/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-700 dark:border-zinc-800 mb-4">
                                            <p className="text-lg font-mono text-center text-white break-all tracking-tight leading-relaxed">
                                                {selectedInvoice.officialBoletoCode}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleCopyText(selectedInvoice.officialBoletoCode)}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                                        >
                                            <Copy size={18} /> Copiar Código
                                        </button>
                                    </div>
                                )}

                                {selectedInvoice.officialBoletoUrl && (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                const token = localStorage.getItem('token');
                                                const url = `${getBackendUrl()}/api/asterysko/portal/financials/${selectedInvoice.invoiceId}/download-file?token=${token}`;
                                                window.open(url, '_blank');
                                            }}
                                            className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-3 rounded-xl font-bold text-sm border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 transition-all hover:bg-slate-200 dark:hover:bg-zinc-700"
                                        >
                                            <Download size={18} /> Baixar PDF da Guia
                                        </button>
                                    </div>
                                )}

                                {/* RECEIPT UPLOAD SECTION */}
                                <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <UploadCloud size={18} className="text-blue-500" /> Comprovante de Pagamento
                                    </h4>

                                    {selectedInvoice.receiptUrl ? (
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-400">Comprovante enviado</p>
                                                    <p className="text-[10px] text-emerald-700/70 dark:text-emerald-500/70">{selectedInvoice.receiptName}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const token = localStorage.getItem('token');
                                                    const url = `${getBackendUrl()}/api/asterysko/portal/financials/${selectedInvoice.invoiceId}/receipt-download?token=${token}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                            >
                                                Visualizar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs text-slate-500 dark:text-zinc-500">
                                                Para agilizar o protocolo do seu processo, anexe o comprovante de pagamento da GRU acima.
                                            </p>
                                            <input
                                                type="file"
                                                id="receipt-upload"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUploadReceipt(selectedInvoice.invoiceId, file);
                                                }}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                            <label
                                                htmlFor="receipt-upload"
                                                className={`w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all group ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                                            >
                                                {isUploading ? (
                                                    <Loader2 size={24} className="animate-spin text-blue-600" />
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-all">
                                                            <Upload size={20} />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-600 dark:text-zinc-400 group-hover:text-blue-600">Anexar Comprovante</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : isGeneratingPayment ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-in fade-in duration-300">
                                <Loader2 size={48} className="animate-spin text-blue-600" />
                                <p className="text-sm font-bold text-slate-600 dark:text-zinc-400">Ambiente Seguro...</p>
                            </div>
                        ) : checkoutUrl ? (
                            <div className="flex flex-col items-center text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ambiente Seguro</h4>
                                    <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                                        Sua fatura está pronta! Você será redirecionado para o ambiente criptografado da InfinitePay para concluir o pagamento via Pix ou Cartão.
                                    </p>
                                </div>
                                <a
                                    href={checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Ir para o Pagamento <ExternalLink size={18} />
                                </a>
                                <button
                                    onClick={() => { setIsPaymentModalOpen(false); setCheckoutUrl(null); }}
                                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                                >
                                    Pagar mais tarde
                                </button>
                            </div>
                        ) : !paymentMethod ? (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">Selecione o método de pagamento:</p>
                                <button
                                    onClick={() => setPaymentMethod('pix')}
                                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                                            <Smartphone size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">Pix</div>
                                            <div className="text-xs text-slate-500">Aprovação instantânea</div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-white"></div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">Cartão de Crédito</div>
                                            <div className="text-xs text-slate-500">Em até 12x com juros</div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-white"></div>
                                    </div>
                                </button>
                            </div>
                        ) : paymentMethod === 'pix' ? (
                            <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-300">
                                <div className="w-48 h-48 bg-white p-2 border border-slate-200 rounded-xl mx-auto flex items-center justify-center">
                                    {/* Mock QR Code */}
                                    <div className="w-full h-full bg-slate-100 rounded flex flex-col items-center justify-center text-slate-400 italic text-[10px] p-4 text-center">
                                        <Smartphone size={32} className="mb-2 opacity-50" />
                                        QRCode do Pix Gerado Automaticamente
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">Escaneie o código acima ou copie a chave abaixo:</p>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-slate-50 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-mono truncate text-slate-600 dark:text-zinc-400">
                                            00020126330014BR.GOV.BCB.PIX...
                                        </div>
                                        <button
                                            onClick={handleCopyPix}
                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPaymentMethod(null)}
                                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300 underline"
                                >
                                    Alterar método de pagamento
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número de Parcelas</label>
                                    <select
                                        value={installments}
                                        onChange={(e) => setInstallments(parseInt(e.target.value))}
                                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                            <option key={n} value={n}>
                                                {n}x de {((selectedInvoice.value * (1 + (n > 1 ? 0.02 * n : 0))) / n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-4 space-y-2">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm shadow-lg shadow-blue-900/20 transition-all">
                                        Pagar com Cartão
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod(null)}
                                        className="w-full text-xs text-slate-500 hover:text-slate-800 py-2"
                                    >
                                        Voltar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* RECEIPT MODAL */}
            <Modal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                title=""
                size="md"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50 dark:border-emerald-900/20">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Protocolo Realizado</h2>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Seu pedido foi depositado com sucesso no INPI.</p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-6 mb-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-zinc-700">
                            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase">Número do Protocolo</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono">87492019384</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-zinc-700">
                            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase">Data de Depósito</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">10/01/2026 às 14:32</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-zinc-700">
                            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase">Serviço</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">Registro de Marca Mista</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase">Taxa Federal (GRU)</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">R$ 142,00</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsReceiptModalOpen(false)}
                        className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Share2 size={16} /> Compartilhar
                    </button>
                    <button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Download size={16} /> Baixar PDF
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default AsteryskoClientPortal;
