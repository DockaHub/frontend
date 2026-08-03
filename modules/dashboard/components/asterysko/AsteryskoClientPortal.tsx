import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, Download } from 'lucide-react';
import api from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { forceDownloadFile } from './utils/fileDownload';
import AsteryskoAnimatedMark from '../../../asterysko/public/AsteryskoAnimatedMark';
import '../../../asterysko/public/AsteryskoPortal.css';

interface AsteryskoClientPortalProps {
    onExit: () => void;
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

type PortalView = 'home' | 'details' | 'profile' | 'contracts';
type ProcessTab = 'details' | 'payments' | 'documents';

const ASSET_ROOT = '/assets/asterysko';

const DEFAULT_DOCUMENTS = [
    { name: 'Proposta', key: 'proposal', icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Contrato', key: 'contract', icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Procuração', key: 'powerOfAttorney', icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Protocolo INPI', key: 'inpiProtocol', icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Guia e comprovante GRU', key: 'gru', icon: 'processo_documentos-imgGroup2.svg' },
    { name: 'Logomarca', key: 'logo', icon: 'processo_documentos-imgGroup3.svg' },
];

const TIMELINE = [
    { title: 'Aguardando exame de mérito', description: 'Contrato eletrônico assinado com sucesso.', date: '14 jan. 2026', icon: 'processo_detalhes-imgPhHandDeposit.svg' },
    { title: 'Protocolo realizado', description: 'Contrato eletrônico assinado com sucesso.', date: '13 jan. 2026', icon: 'processo_detalhes-imgGroup2.svg' },
    { title: 'Procuração assinada', description: 'Recebemos o documento assinado.', date: '12 jan. 2026', icon: 'processo_detalhes-imgMdiSign.svg' },
    { title: 'Pagamento confirmado', description: 'Identificamos o pagamento com sucesso.', date: '12 jan. 2026', icon: 'processo_detalhes-imgFluentPayment16Regular1.svg' },
    { title: 'Contrato assinado', description: 'Contrato eletrônico assinado com sucesso.', date: '12 jan. 2026', icon: 'processo_detalhes-imgMdiSign1.svg' },
];

const getValue = (...values: any[]) => values.find(value => value !== undefined && value !== null && value !== '') ?? '';

const getInitials = (value: string) => value.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();

const formatCurrency = (value: unknown) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return 'R$ 179,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};

const formatDate = (value: unknown, fallback = '09/07/2026') => {
    if (!value) return fallback;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('pt-BR').format(date);
};

const getInitialView = (): PortalView => {
    const requestedView = new URLSearchParams(window.location.search).get('view');
    return requestedView === 'details' || requestedView === 'profile' || requestedView === 'contracts' ? requestedView : 'home';
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
    const { user, logout } = useAuth();
    const [view, setView] = useState<PortalView>(getInitialView);
    const [processTab, setProcessTab] = useState<ProcessTab>('details');
    const [clientData, setClientData] = useState<any>(null);
    const [processes, setProcesses] = useState<any[]>([]);
    const [financials, setFinancials] = useState<any>({ invoices: [], contracts: [] });
    const [selectedProcess, setSelectedProcess] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuClosing, setMenuClosing] = useState(false);
    const [viewLeaving, setViewLeaving] = useState(false);
    const viewTimer = useRef<number | null>(null);
    const menuTimer = useRef<number | null>(null);

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
                        if (!processMap.has(id)) processMap.set(id, { ...process, brandName: brand.name, brandLogo: brand.logoUrl });
                    });
                });
                const loadedProcesses = Array.from(processMap.values());
                setProcesses(loadedProcesses);
                setSelectedProcess(loadedProcesses[0] || null);
                setError('');
            } catch (fetchError: any) {
                console.error('Error loading portal data:', fetchError);
                if (fetchError.response?.status === 401) {
                    logout();
                    window.location.replace('/portal/login');
                    return;
                }
                setError('Não foi possível carregar os dados do portal. Exibimos uma prévia enquanto você tenta novamente.');
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [logout]);

    useEffect(() => () => {
        if (viewTimer.current) window.clearTimeout(viewTimer.current);
        if (menuTimer.current) window.clearTimeout(menuTimer.current);
    }, []);

    useEffect(() => {
        if (!menuOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeMenu();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [menuOpen]);

    const displayedProcesses = useMemo(() => processes.length ? processes : [
        { id: 'preview-one', brandName: 'Litorânea Tendas', status: 'EXAM_MERIT' },
        { id: 'preview-two', brandName: 'Litorânea Tendas', status: 'STARTED' },
    ], [processes]);

    const clientName = String(getValue(clientData?.name, user?.name, 'Levy'));
    const firstName = clientName.split(/\s+/)[0];
    const brandName = String(getValue(selectedProcess?.brandName, displayedProcesses[0]?.brandName, 'Litorânea Tendas'));
    const companyName = String(getValue(clientData?.companyName, clientData?.legalName, clientData?.company?.legalName, 'Fauves LTDA'));
    const invoices = financials.invoices as any[];
    const contracts = financials.contracts as any[];

    const navigateView = (nextView: PortalView) => {
        if (view === nextView || viewLeaving) return;
        setViewLeaving(true);
        if (viewTimer.current) window.clearTimeout(viewTimer.current);
        viewTimer.current = window.setTimeout(() => {
            setView(nextView);
            setViewLeaving(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const goHome = () => {
        navigateView('home');
    };

    const download = (url: unknown, fileName: string) => {
        if (typeof url === 'string' && url) void forceDownloadFile(url, fileName);
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
        <div className="ast-page">
            <main className="ast-portal__stage">
                <div key={view} className={`ast-view-shell ${viewLeaving ? 'ast-view-shell--leaving' : 'ast-view-shell--entering'}`}>
                {view === 'home' && (
                    <section aria-labelledby="ast-home-title">
                        <div className="ast-portal__topbar">
                            <div className="ast-portal__intro">
                                <h1 id="ast-home-title">Olá, {firstName}</h1>
                                <p>Acompanhe seus processos</p>
                            </div>
                            <button className="ast-round-button ast-menu-button" type="button" onClick={openMenu} aria-label="Abrir menu">
                                <img src={`${ASSET_ROOT}/home-imgJamMenu.svg`} alt="" />
                            </button>
                        </div>

                        {error && <p className="ast-empty-note" role="status">{error}</p>}

                        <div className="ast-home-processes">
                            {displayedProcesses.map((process, index) => {
                                const processName = String(getValue(process.brandName, 'Litorânea Tendas'));
                                const status = String(process.status || '').toUpperCase();
                                return (
                                    <button className="ast-process-card" key={process.id || index} type="button" onClick={() => openProcess(process)}>
                                        <span className="ast-process-card__status">
                                            {status.includes('MERIT') || index === 0 ? 'Aguardando exame de mérito' : 'Processo iniciado'}
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
                            <a className="ast-new-process-card" href="https://asterysko.com/nova-marca" target="_blank" rel="noreferrer">
                                <img src={`${ASSET_ROOT}/home-imgFormkitAdd.svg`} alt="" />
                                <span>Registrar uma nova marca</span>
                            </a>
                        </div>

                        <div className="ast-protection-banner">
                            <img src={`${ASSET_ROOT}/home-imgBoxiconsRegistered.svg`} alt="" />
                            <div>
                                <strong>Proteção não termina no registro</strong>
                                <span>Monitore, renove e expanda sua marca.</span>
                            </div>
                        </div>

                        <section className="ast-benefits" aria-labelledby="ast-benefits-title">
                            <h2 id="ast-benefits-title">Mais benefícios</h2>
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

                {view === 'profile' && (
                    <section className="ast-section-page" aria-labelledby="ast-profile-title">
                        <div className="ast-back-row"><BackButton onClick={goHome} /></div>
                        <header className="ast-section-heading">
                            <h1 id="ast-profile-title">Meus dados</h1>
                            <p>Gerencie as informações cadastrais e de segurança da sua conta.</p>
                        </header>

                        <div className="ast-data-card">
                            <h2 className="ast-card-title">Dados da empresa</h2>
                            <div className="ast-data-card__body">
                                {[
                                    ['Razão social', companyName],
                                    ['CNPJ', getValue(clientData?.cnpj, clientData?.company?.cnpj, '00.000.000/0000-00')],
                                    ['Endereço', getValue(clientData?.companyAddress, clientData?.company?.address, 'Rua 1, bairro 2, cidade 3, uf')],
                                ].map(([label, value]) => (
                                    <div className="ast-data-row" key={String(label)}>
                                        <div><strong>{label}</strong><small>{String(value)}</small></div>
                                        <button type="button">Editar</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="ast-data-card">
                            <h2 className="ast-card-title">Dados pessoais</h2>
                            <div className="ast-data-card__body">
                                {[
                                    ['Nome completo', clientName],
                                    ['CPF', getValue(clientData?.cpf, (user as any)?.cpf, '000.000.000-00')],
                                    ['Email', getValue(clientData?.email, user?.email, 'email@email.com')],
                                    ['Whatsapp', getValue(clientData?.phone, user?.phone, '(00) 00000-0000')],
                                    ['Endereço residencial', getValue(clientData?.address, 'email@email.com')],
                                ].map(([label, value]) => (
                                    <div className="ast-data-row" key={String(label)}>
                                        <div><strong>{label}</strong><small>{String(value)}</small></div>
                                        <button type="button">Editar</button>
                                    </div>
                                ))}
                            </div>
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
                            {(contracts.length ? contracts : [
                                { id: 'signed-preview', title: 'Contrato - Registro de Marca', organizationName: 'Fauves', status: 'SIGNED' },
                                { id: 'pending-preview', title: 'Contrato - Registro de Marca', organizationName: 'Fauves', status: 'PENDING' },
                            ]).map((contract: any, index: number) => {
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
                                                <small>{getValue(contract.organizationName, contract.companyName, 'Fauves')}</small>
                                            </div>
                                            <button type="button" onClick={() => download(getValue(contract.fileUrl, contract.url, contract.documentUrl), `contrato-${index + 1}.pdf`)} aria-label="Baixar contrato">
                                                <Download size={21} strokeWidth={2} />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}

                {view === 'details' && (
                    <section className="ast-process-page" aria-labelledby="ast-process-title">
                        <header className="ast-process-hero">
                            <div className="ast-process-hero__back"><BackButton onClick={goHome} /></div>
                            <span className="ast-status-pill">Ativo</span>
                            <h1 id="ast-process-title">{brandName}</h1>
                        </header>

                        <ProcessTabs active={processTab} onChange={setProcessTab} />

                        {processTab === 'details' && (
                            <div key="details" className="ast-process-content ast-process-content--details ast-tab-transition">
                                <article className="ast-info-card">
                                    <h2 className="ast-card-title">Informações gerais</h2>
                                    <div className="ast-info-card__body">
                                        {[
                                            ['Apresentação', getValue(selectedProcess?.presentation, selectedProcess?.type, 'Mista')],
                                            ['Classificação NCL', getValue(selectedProcess?.nclClass, selectedProcess?.class, 'Classe 35')],
                                            ['Data do protocolo', getValue(selectedProcess?.protocolDate, 'Classe 35')],
                                        ].map(([label, value]) => (
                                            <div className="ast-info-row" key={String(label)}><strong>{label}</strong><small>{String(value)}</small></div>
                                        ))}
                                    </div>
                                </article>

                                <article className="ast-timeline-card">
                                    <h2 className="ast-card-title">Andamento</h2>
                                    <div className="ast-timeline-card__body">
                                        {TIMELINE.map(item => (
                                            <div className="ast-timeline-row" key={item.title}>
                                                <span className="ast-timeline-row__icon"><img src={`${ASSET_ROOT}/${item.icon}`} alt="" /></span>
                                                <span><strong>{item.title}</strong><small>{item.description}</small></span>
                                                <time>{item.date}</time>
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            </div>
                        )}

                        {processTab === 'payments' && (
                            <div key="payments" className="ast-process-content ast-tab-transition">
                                <article className="ast-payment-card">
                                    <h2 className="ast-card-title">Cartão de crédito</h2>
                                    <div className="ast-payment-card__account">
                                        <span className="ast-payment-icon"><img src={`${ASSET_ROOT}/processo_pagamentos-imgFluentPayment16Regular1.svg`} alt="" /></span>
                                        <div><strong>•••• •••• •••• {getValue(financials.cardLastFour, '1234')}</strong><small>Mastercard</small></div>
                                    </div>
                                    <div className="ast-payment-card__copy">
                                        <p>Sua próxima cobrança será no valor de {formatCurrency(getValue(financials.nextAmount, 179))}</p>
                                        <p>Sua fatura vence no dia {getValue(financials.dueDay, 9)} de todo mês</p>
                                    </div>
                                    <a className="ast-payment-card__action" href="#alterar-vencimento" onClick={event => event.preventDefault()}>
                                        Alterar data de vencimento <ChevronRight size={18} />
                                    </a>
                                </article>

                                <article className="ast-history-card">
                                    <h2 className="ast-card-title">Histórico de pagamento</h2>
                                    {(invoices.length ? invoices : [
                                        { id: 'invoice-one', amount: 179, paidAt: '2026-07-09' },
                                        { id: 'invoice-two', amount: 179, paidAt: '2026-06-09' },
                                    ]).slice(0, 5).map((invoice: any, index: number) => (
                                        <div className="ast-history-row" key={invoice.id || index}>
                                            <div>
                                                <span className="ast-history-row__status">Paga</span>
                                                <strong>{formatCurrency(getValue(invoice.amount, invoice.total, 179))}</strong>
                                                <small>Cartão • {formatDate(getValue(invoice.paidAt, invoice.dueDate), index ? '09/06/2026' : '09/07/2026')}</small>
                                            </div>
                                            <button type="button" aria-label="Ver pagamento"><ChevronRight size={18} /></button>
                                        </div>
                                    ))}
                                </article>
                            </div>
                        )}

                        {processTab === 'documents' && (
                            <div key="documents" className="ast-document-list ast-tab-transition">
                                {DEFAULT_DOCUMENTS.map(document => {
                                    const url = getValue(selectedProcess?.documents?.[document.key], selectedProcess?.[`${document.key}Url`]);
                                    return (
                                        <button className="ast-document-card" key={document.key} type="button" onClick={() => download(url, `${document.name}.pdf`)}>
                                            <span className="ast-document-icon"><img src={`${ASSET_ROOT}/${document.icon}`} alt="" /></span>
                                            <span><strong>{document.name}</strong><small>Clique para baixar</small></span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
                </div>
            </main>

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
