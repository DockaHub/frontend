import React, { useState, useEffect } from 'react';
import { FileSignature, FileText, CheckCircle2, Download, Menu, User, Bell, Shield, ShieldCheck, ExternalLink, LogOut, HelpCircle, ChevronDown, Share2, Building2, Lock, Mail, MessageSquare, AlertCircle, Loader2, Briefcase, CreditCard, Smartphone, Copy, Upload, UploadCloud, Sun, Moon } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api, { getBackendUrl } from '../../../../services/api';

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
    const events = [];

    // 1. Add Dispatches from DB
    if (process.dispatches && process.dispatches.length > 0) {
        const sorted = [...process.dispatches].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        sorted.forEach((d: any) => {
            events.push({
                id: d.id,
                type: 'dispatch',
                title: d.isVirtual ? d.description : `${d.code} - ${d.description} `,
                date: new Date(d.createdAt).toLocaleDateString('pt-BR'),
                desc: d.details || `Publicado na RPI ${d.rpiNumber}`
            });
        });
    }

    // 2. Depósito do Pedido
    if (process.inpiProcessNumber || process.status !== 'NEW' && process.status !== 'WAITING_PAYMENT') {
        events.push({
            id: 'deposito',
            type: 'dispatch',
            title: 'Depósito do Pedido',
            date: new Date(process.createdAt).toLocaleDateString('pt-BR'),
            desc: `Protocolo gerado: ${process.inpiProcessNumber || 'Aguardando'}`
        });
    }

    // 3. Taxa INPI (Federal Tax)
    const taxInvoice = invoices.find(i => i.type === 'TAX' && (i.processId === process.id || i.description?.includes(process.brandName)));
    if (taxInvoice) {
        events.push({
            id: 'tax-payment',
            type: 'invoice',
            title: 'Taxa Federal (INPI)',
            date: taxInvoice.dueDate ? new Date(taxInvoice.dueDate).toLocaleDateString('pt-BR') : '',
            desc: taxInvoice.status === 'paid' ? 'Taxa do INPI paga com sucesso.' : 'Aguardando pagamento da taxa federal do INPI.',
            status: taxInvoice.status,
            invoice: taxInvoice
        });
    }

    // 4. Honorários (Service Payment)
    const serviceInvoice = invoices.find(i => i.type === 'SERVICE' && (i.id === process.invoiceId || i.description?.includes(process.brandName)));
    if (serviceInvoice || process.paymentStatus) {
        events.push({
            id: 'service-payment',
            type: 'invoice',
            title: 'Honorários Profissionais',
            date: serviceInvoice?.dueDate ? new Date(serviceInvoice.dueDate).toLocaleDateString('pt-BR') : '',
            desc: (serviceInvoice?.status === 'paid' || process.paymentStatus === 'PAID') ? 'Pagamento dos honorários confirmado.' : 'Aguardando pagamento dos honorários iniciais.',
            status: serviceInvoice?.status || process.paymentStatus,
            invoice: serviceInvoice
        });
    }

    // 5. Procuração Event
    events.push({
        id: 'proxy',
        type: 'proxy',
        title: 'Procuração INPI',
        date: process.createdAt ? new Date(process.createdAt).toLocaleDateString('pt-BR') : '',
        desc: process.proxySignStatus === 'VALIDATED' ? 'Procuração validada pela equipe' : (process.proxySignStatus === 'SIGNED' ? 'Procuração enviada e assinada' : 'Aguardando download e assinatura da Procuração'),
        status: process.proxySignStatus
    });

    // 6. Contrato Event
    events.push({
        id: 'contract',
        type: 'contract',
        title: 'Contrato Assinado',
        date: process.contractSignDate ? new Date(process.contractSignDate).toLocaleDateString('pt-BR') : (process.createdAt ? new Date(process.createdAt).toLocaleDateString('pt-BR') : ''),
        desc: process.contractSignStatus === 'SIGNED' ? 'Contrato eletrônico assinado com sucesso.' : 'Aguardando assinatura do contrato.',
        status: process.contractSignStatus
    });

    return events;
};

const AsteryskoClientPortal: React.FC<AsteryskoClientPortalProps> = ({ onExit, theme, onToggleTheme }) => {
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
    // Helper for Status Translation
    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            'NEW': 'Novo',
            'WAITING_PAYMENT': 'Aguardando Pagamento',
            // ... (rest of status map)
            'APPEAL': 'Em Recurso'
        };
        return map[status] || status;
    };

    const getStatusColor = (status: string) => {
        const s = status || '';
        if (s === 'GRANTED' || s === 'Concedido') return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800';
        if (s === 'FILED' || s === 'Publicado') return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800';
        if (s === 'WAITING_PAYMENT' || s === 'WAITING_DOCS') return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800';
        if (s === 'NEW') return 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700';
        return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800';
    };

    // Fetch Real Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Parallel fetching
                const [dashboardRes, financialsRes] = await Promise.all([
                    api.get('/asterysko/portal/dashboard'),
                    api.get('/asterysko/portal/financials')
                ]);

                const { client, notifications } = dashboardRes.data;
                const { invoices, contracts } = financialsRes.data;

                setClientData(client);
                setEditName(client.name || '');
                setEditRg(client.rg || '');
                setEditAddress(client.address ? `${client.address}${client.city ? `, ${client.city}` : ''}${client.state ? `-${client.state}` : ''}` : '');
                setNotifications(notifications);
                setFinancials({ invoices, contracts });

                // Flatten brands -> processes for the UI
                const allProcessesMap = new Map();
                client.brands?.forEach((brand: any) => {
                    brand.processes?.forEach((proc: any) => {
                        if (!allProcessesMap.has(proc.id)) {
                            allProcessesMap.set(proc.id, {
                                ...proc,
                                brandName: brand.name,
                                brandType: brand.type,
                                classes: brand.nclClasses?.join(', ') || 'NCL -',
                            });
                        }
                    });
                });

                const allProcesses = Array.from(allProcessesMap.values());
                setProcesses(allProcesses);
                if (allProcesses.length > 0) {
                    setExpandedId(allProcesses[0].id);
                }
            } catch (err: any) {
                console.error('Error loading portal data:', err);
                if (err.response?.status === 404) {
                    setError('CLIENT_NOT_FOUND');
                } else {
                    setError('Não foi possível carregar os dados do portal.');
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
            const res = await api.post(`/asterysko/processes/${processId}/proxy/upload`, formData);
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
            if (!target.closest('.dropdown-container')) {
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
                                onClick={() => onExit()}
                                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold shadow-lg shadow-blue-900/20"
                            >
                                Voltar para Login
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
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col font-sans z-[100] overflow-hidden transition-colors">


            {/* MAIN SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">

                {/* HEADER BACKGROUND & CONTENT */}
                {/* Removing Z-Index from parent container to allow children to stack properly against the next sibling (Cards) */}
                <div className="bg-blue-700 dark:bg-blue-900 pb-32 pt-8 px-6 relative transition-colors">
                    {/* Background Decor */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {/* Navbar-Increased Z-Index to stay above cards */}
                        <div className="flex justify-between items-center mb-10 relative z-50">
                            <div
                                className="text-white opacity-95 cursor-pointer hover:opacity-100 transition-opacity"
                                onClick={() => setCurrentView('home')}
                                title="Voltar ao Início"
                            >
                                <AsteryskoLogoSVG />
                            </div>
                            <div className="flex gap-3">
                                {/* Notification Bell */}
                                <div className="relative dropdown-container">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsNotificationsOpen(!isNotificationsOpen); setIsMenuOpen(false); }}
                                        className={`p-2.5 rounded-full transition-colors relative ${isNotificationsOpen ? 'bg-white text-blue-700' : 'hover:bg-white/10 text-white'} `}
                                    >
                                        <Bell size={20} />
                                        {notifications.some(n => !n.read) && (
                                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-400 rounded-full border border-blue-700"></span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {isNotificationsOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
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
                                                        onClick={() => { if (!notif.read) handleMarkAsRead(notif.id); if (notif.link) { setCurrentView('home'); /* Simplified: handle links later */ } }}
                                                        className={`p-4 border-b border-slate-50 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''} `}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-700 dark:text-zinc-300'} `}>{notif.title}</h4>
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
                                            <div className="p-2 bg-slate-50 dark:bg-zinc-900 text-center border-t border-slate-100 dark:border-zinc-800">
                                                <button className="text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200">Ver todas</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Theme Toggle shortcut */}
                                {onToggleTheme && (
                                    <button
                                        onClick={onToggleTheme}
                                        className="p-2.5 rounded-full hover:bg-white/10 text-white transition-colors"
                                        title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                                    >
                                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                    </button>
                                )}

                                {/* User Menu */}
                                <div className="relative dropdown-container">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); setIsNotificationsOpen(false); }}
                                        className={`p-2.5 rounded-full transition-colors ${isMenuOpen ? 'bg-white text-blue-700' : 'hover:bg-white/10 text-white'} `}
                                    >
                                        <Menu size={20} />
                                    </button>

                                    {/* Menu Dropdown */}
                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50">
                                                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{clientData?.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400">{clientData?.email}</p>
                                            </div>
                                            <div className="py-1 bg-white dark:bg-zinc-900">
                                                <button
                                                    onClick={() => { setCurrentView('profile'); setIsMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                                                >
                                                    <User size={16} className="text-slate-400 dark:text-zinc-500" /> Meus Dados
                                                </button>
                                                <button
                                                    onClick={() => { setCurrentView('contracts'); setIsMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                                                >
                                                    <Shield size={16} className="text-slate-400 dark:text-zinc-500" /> Contratos
                                                </button>
                                                <button
                                                    onClick={() => { setCurrentView('financial'); setIsMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                                                >
                                                    <FileText size={16} className="text-slate-400 dark:text-zinc-500" /> Minhas Faturas
                                                </button>
                                                <button
                                                    onClick={() => { setCurrentView('support'); setIsMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                                                >
                                                    <HelpCircle size={16} className="text-slate-400 dark:text-zinc-500" /> Suporte
                                                </button>
                                            </div>
                                            <div className="border-t border-slate-100 dark:border-zinc-800 py-1 bg-white dark:bg-zinc-900">
                                                <button
                                                    onClick={onExit}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 font-medium transition-colors"
                                                >
                                                    <LogOut size={16} /> Sair
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

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
                                {processes?.length === 0 ? (
                                    <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-xl border border-slate-200 dark:border-zinc-800">
                                        <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Nenhum processo ativo</h3>
                                        <p className="text-slate-500 dark:text-zinc-400 max-w-xs mx-auto mt-2">Você ainda não possui processos de marca registrados em nossa plataforma.</p>
                                    </div>
                                ) : processes?.map((proc) => (
                                    <div key={proc.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg shadow-slate-900/5 border border-slate-100 dark:border-zinc-800 overflow-hidden transition-all duration-300">

                                        {/* Card Header (Always Visible) */}
                                        <div
                                            onClick={() => setExpandedId(expandedId === proc.id ? null : proc.id)}
                                            className="p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex gap-4 items-center">
                                                    <div className={`w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0`}>
                                                        {proc.brandName ? proc.brandName[0] : 'M'}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">{proc.brandName}</h2>
                                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                                            <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 font-mono">{proc.inpiProcessNumber || 'N/A'}</span>
                                                            <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">{proc.classes}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full sm:w-auto text-right flex items-center justify-between sm:justify-end gap-3">
                                                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(proc.status)} `}>
                                                        {formatStatus(proc.status)}
                                                    </div>
                                                    <ChevronDown size={20} className={`text-slate-400 dark:text-zinc-500 transition-transform duration-300 ${expandedId === proc.id ? 'rotate-180' : ''} `} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {expandedId === proc.id && (
                                            <div className="border-t border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/30 animate-in slide-in-from-top-2 duration-300">

                                                {/* Tabs Navigation */}
                                                <div className="px-6 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                                                    <div className="flex gap-8 overflow-x-auto">
                                                        <button
                                                            onClick={() => setActiveTab('timeline')}
                                                            className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'timeline' ? 'border-blue-600 text-blue-700 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'} `}
                                                        >
                                                            Andamento
                                                        </button>
                                                        <button
                                                            onClick={() => setActiveTab('data')}
                                                            className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-blue-600 text-blue-700 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'} `}
                                                        >
                                                            Dados do Processo
                                                        </button>
                                                        <button
                                                            onClick={() => setActiveTab('docs')}
                                                            className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'docs' ? 'border-blue-600 text-blue-700 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'} `}
                                                        >
                                                            Documentos
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-6 md:p-8 min-h-[300px]">
                                                    {/* TAB: TIMELINE */}
                                                    {activeTab === 'timeline' && (
                                                        <div className="relative pl-2 animate-in fade-in duration-300">
                                                            {getTimelineEvents(proc, financials.invoices).map((step: any, idx: number, arr: any[]) => (
                                                                <div key={step.id || idx} className="relative flex gap-6 pb-8 last:pb-0">
                                                                    {/* Connector Line */}
                                                                    {idx !== arr.length - 1 && (
                                                                        <div className={`absolute left-[11px] top-8 bottom-0 w-0.5 ${step.type === 'contract' || step.type === 'proxy' || step.status === 'SIGNED' ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'}`} />
                                                                    )}

                                                                    {/* Status Icon */}
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 border-2 text-white ${step.type === 'contract' || step.type === 'proxy' || step.status === 'SIGNED' ? 'bg-emerald-500 border-emerald-500' : 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'}`}>
                                                                        {step.type === 'contract' ? <FileSignature size={12} /> : step.type === 'proxy' ? <Shield size={12} /> : <CheckCircle2 size={14} />}
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className="flex-1 -mt-1">
                                                                        <div className="flex flex-wrap justify-between items-start gap-4">
                                                                            <div className="flex-1">
                                                                                <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                                                                                    {step.title}
                                                                                </h4>
                                                                                {step.desc && (
                                                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                                                                        {step.desc}
                                                                                    </p>
                                                                                )}

                                                                                {/* CUSTOM RENDER FOR INVOICES */}
                                                                                {step.type === 'invoice' && (step.status === 'pending' || step.status === 'PENDING') && (
                                                                                    <div className="mt-3">
                                                                                        <button
                                                                                            onClick={() => handleOpenPaymentModal(step.invoice)}
                                                                                            className="text-xs flex items-center justify-center gap-1 font-bold text-white border border-blue-600 bg-blue-600 px-3 py-1.5 w-full sm:w-fit rounded hover:bg-blue-700 transition-colors shadow-sm"
                                                                                        >
                                                                                            <CreditCard size={14} /> Pagar Fatura
                                                                                        </button>
                                                                                    </div>
                                                                                )}

                                                                                {/* CUSTOM RENDER FOR PROXY */}
                                                                                {step.type === 'proxy' && step.status !== 'VALIDATED' && step.status !== 'SIGNED' && (
                                                                                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                                                                        <a href={proc.proxyUrl ? `${getBackendUrl()}${proc.proxyUrl}` : '#'} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center justify-center gap-1 font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 w-full sm:w-fit rounded hover:bg-blue-100 transition-colors shadow-sm">
                                                                                            <Download size={14} /> 1. Baixar Procuração
                                                                                        </a>
                                                                                        {isUploading ? (
                                                                                            <div className="text-xs text-slate-500 flex justify-center items-center gap-2 mt-1 px-3 py-1.5 border border-transparent">
                                                                                                <Loader2 className="animate-spin" size={14} /> Enviando...
                                                                                            </div>
                                                                                        ) : (
                                                                                            <label className="text-xs flex items-center justify-center gap-1 font-bold text-white border border-blue-600 bg-blue-600 px-3 py-1.5 w-full sm:w-fit rounded hover:bg-blue-700 cursor-pointer transition-colors shadow-sm">
                                                                                                <Upload size={14} /> 2. Enviar Procuração Assinada
                                                                                                <input type="file" className="hidden" accept=".pdf,.jpeg,.jpg,.png" onChange={(e) => handleProxyFileUpload(e, proc.id)} />
                                                                                            </label>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {/* CUSTOM RENDER FOR CONTRACT PENDING */}
                                                                                {step.type === 'contract' && step.status === 'PENDING' && (
                                                                                    <div className="mt-3">
                                                                                        <a href={proc.contractUrl || '#'} target="_blank" className="text-xs flex items-center justify-center gap-1 font-bold text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1.5 w-full sm:w-fit rounded hover:bg-amber-100 transition-colors shadow-sm">
                                                                                            <FileSignature size={14} /> Assinar Contrato
                                                                                        </a>
                                                                                    </div>
                                                                                )}

                                                                                {/* CUSTOM RENDER FOR COMPLETE DOCUMENTS */}
                                                                                {step.type === 'contract' && step.status === 'SIGNED' && (
                                                                                    <div className="mt-3">
                                                                                        <a href={proc.contractUrl || '#'} target="_blank" className="text-xs flex items-center gap-1 font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                                                                                            <Download size={14} /> Baixar Cópia
                                                                                        </a>
                                                                                    </div>
                                                                                )}
                                                                                {step.type === 'proxy' && (step.status === 'VALIDATED' || step.status === 'SIGNED') && (
                                                                                    <div className="mt-3">
                                                                                        <a href={proc.proxySignedUrl ? `${getBackendUrl()}${proc.proxySignedUrl}` : proc.proxyUrl ? `${getBackendUrl()}${proc.proxyUrl}` : '#'} target="_blank" className="text-xs flex items-center gap-1 font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                                                                                            <Download size={14} /> Baixar Cópia
                                                                                        </a>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {step.date && (
                                                                                <span className="text-xs font-mono px-2 py-0.5 rounded whitespace-nowrap bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400">
                                                                                    {step.date}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* TAB: DATA */}
                                                    {activeTab === 'data' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in duration-300">
                                                            <div className="col-span-1 md:col-span-2 pb-2 border-b border-slate-200 dark:border-zinc-800 mb-2">
                                                                <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Informações Básicas</h4>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1 font-medium">Titular da Marca</label>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{clientData?.name}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1 font-medium">CPF/CNPJ</label>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{clientData?.cpfCnpj}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1 font-medium">Apresentação</label>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{proc.brandType || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1 font-medium">Classes</label>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{proc.classes}</p>
                                                            </div>

                                                            <div className="col-span-1 md:col-span-2 pb-2 border-b border-slate-200 dark:border-zinc-800 mb-2 mt-2">
                                                                <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Dados INPI</h4>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1 font-medium">Número do Processo</label>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 font-mono bg-slate-100 dark:bg-zinc-800 w-fit px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">{proc.inpiProcessNumber || 'Aguardando'}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1 font-medium">Data de Depósito</label>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{proc.filingDate ? new Date(proc.filingDate).toLocaleDateString() : 'Não informada'}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1 font-medium">Procurador</label>
                                                                <div className="flex items-center gap-2">
                                                                    <Shield size={14} className="text-blue-600 dark:text-blue-400" />
                                                                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Asterysko Propriedade Intelectual</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1 font-medium">Link Externo</label>
                                                                <a href={`https://busca.inpi.gov.br/pePI/servlet/MarcasServletController?Action=searchMarca&CodPesquisa=${proc.inpiProcessNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                                                    Ver na Busca INPI < ExternalLink size={12} />
                                                                </a >
                                                            </div >
                                                        </div >
                                                    )}

                                                    {/* TAB: DOCUMENTS */}
                                                    {
                                                        activeTab === 'docs' && (
                                                            <div className="animate-in fade-in duration-300">
                                                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 mb-6 flex gap-3">
                                                                    <Shield size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">Arquivos do Processo</h4>
                                                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Todos os documentos vinculados a este registro de marca.</p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    {proc.contractUrl && (
                                                                        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all group">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                                                                                    <FileText size={20} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Contrato de Prestação de Serviços</p>
                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">CONTRATO</span>
                                                                                        <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-600 rounded-full" />
                                                                                        <span className="text-xs text-slate-400 dark:text-zinc-500">{proc.contractSignStatus === 'SIGNED' ? 'ASSINADO' : 'PENDENTE'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <a href={proc.contractUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border">
                                                                                <ExternalLink size={20} />
                                                                            </a>
                                                                        </div>
                                                                    )}

                                                                    {(proc.proxyUrl || proc.proxySignedUrl) && (
                                                                        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all group">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center border border-amber-100 dark:border-amber-900/30">
                                                                                    <Shield size={20} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Procuração Asterysko</p>
                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">DOCUMENTO</span>
                                                                                        <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-600 rounded-full" />
                                                                                        <span className="text-xs text-slate-400 dark:text-zinc-500">{proc.proxySignStatus === 'VALIDATED' ? 'VALIDADA' : 'PENDENTE'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <a href={proc.proxySignedUrl ? `${getBackendUrl()}${proc.proxySignedUrl}` : `${getBackendUrl()}${proc.proxyUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border">
                                                                                <ExternalLink size={20} />
                                                                            </a>
                                                                        </div>
                                                                    )}

                                                                    {!proc.contractUrl && !proc.proxyUrl && !proc.proxySignedUrl && (
                                                                        <div className="p-8 text-center bg-slate-50/50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-700">
                                                                            <p className="text-xs text-slate-500 dark:text-zinc-400 italic">Documentos de protocolo e certificados do INPI estarão disponíveis em breve.</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div >
                                            </div >
                                        )}
                                    </div >
                                ))}
                            </div >
                        )}

                        {/* VIEW: PROFILE (Meus Dados) */}
                        {
                            currentView === 'profile' && (
                                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg shadow-slate-900/5 border border-slate-100 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="p-6">
                                        <div className="space-y-8">
                                            {/* Company Data Section */}
                                            <div className="space-y-5">
                                                <div className="pb-2 border-b border-slate-100 dark:border-zinc-800">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                                        <Building2 size={16} className="text-slate-400 dark:text-zinc-500" />
                                                        Dados da Empresa
                                                    </h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Razão Social/Nome</label>
                                                        <input className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-700 dark:text-zinc-300 outline-none focus:border-blue-400 transition-colors" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">CPF/CNPJ</label>
                                                        <input className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-500 dark:text-zinc-500 cursor-not-allowed" defaultValue={clientData?.cpfCnpj} disabled />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">RG/IE</label>
                                                        <input className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-700 dark:text-zinc-300 outline-none focus:border-blue-400 transition-colors" value={editRg} onChange={(e) => setEditRg(e.target.value)} />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Endereço</label>
                                                        <input className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-700 dark:text-zinc-300 outline-none focus:border-blue-400 transition-colors" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Data Section */}
                                            <div className="space-y-5">
                                                <div className="pb-2 border-b border-slate-100 dark:border-zinc-800">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                                        <User size={16} className="text-slate-400 dark:text-zinc-500" />
                                                        Dados do Usuário
                                                    </h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">E-mail de Acesso</label>
                                                        <div className="relative">
                                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                                                            <input className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-500 dark:text-zinc-500 cursor-not-allowed" defaultValue={clientData?.email} disabled />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                            <button className="text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 text-sm font-medium flex items-center gap-2">
                                                <Lock size={16} /> Alterar Senha
                                            </button>
                                            <button
                                                onClick={handleUpdateProfile}
                                                disabled={isSavingProfile}
                                                className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-blue-900/10 transition-colors flex items-center gap-2 ${isSavingProfile ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : null}
                                                {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* VIEW: CONTRACTS */}
                        {
                            currentView === 'contracts' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                                    <div className="grid grid-cols-1 gap-4">
                                        {financials.contracts?.length === 0 ? (
                                            <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-xl border border-slate-200 dark:border-zinc-800">
                                                <Shield size={48} className="mx-auto text-slate-200 mb-4" />
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Nenhum contrato assinado</h3>
                                                <p className="text-slate-500 dark:text-zinc-400 max-w-xs mx-auto mt-2">Seus contratos de prestação de serviços aparecerão aqui após a formalização.</p>
                                            </div>
                                        ) : financials.contracts?.map((contract) => (
                                            <div key={contract.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:indigo-900/30 shrink-0">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Contrato de Prestação de Serviços-{contract.brandName}</h4>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-zinc-400">
                                                            <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">MARCAS</span>
                                                            <span>{contract.inpiProcessNumber}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide">
                                                        {contract.contractSignStatus}
                                                    </span>
                                                    <a href={contract.contractUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border">
                                                        <ExternalLink size={20} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }

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
                                                                            <a
                                                                                href={invoice.officialBoletoUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold text-[10px] bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-blue-200 dark:border-blue-900/50 hover:shadow-sm transition-all"
                                                                            >
                                                                                <Download size={12} /> {invoice.type === 'TAX' ? 'BAIXAR GRU' : 'RECIBO'}
                                                                            </a>
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
                                                                {invoice.officialBoletoUrl && (
                                                                    <a
                                                                        href={invoice.officialBoletoUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold text-[10px] bg-white dark:bg-zinc-800 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-900/50 shadow-sm transition-all"
                                                                    >
                                                                        <Download size={14} /> {invoice.type === 'TAX' ? 'BAIXAR GRU' : 'RECIBO'}
                                                                    </a>
                                                                )}
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
                                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Termos de Uso</a>
                                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Privacidade</a>
                                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Suporte</a>
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
                                        <a
                                            href={selectedInvoice.officialBoletoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-3 rounded-xl font-bold text-sm border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 transition-all hover:bg-slate-200 dark:hover:bg-zinc-700"
                                        >
                                            <Download size={18} /> Baixar PDF da Guia
                                        </a>
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
                                            <a
                                                href={`/uploads/${selectedInvoice.receiptUrl.split('\\').pop()?.split('/').pop()}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                            >
                                                Visualizar
                                            </a>
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
