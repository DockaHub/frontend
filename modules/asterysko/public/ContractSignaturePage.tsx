import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, Check, CheckCircle2, Download, FileCheck2, LockKeyhole, Menu, ShieldCheck, X } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import './ContractSignaturePage.css';

interface ContractSignaturePageProps {
    dealId: string;
}

type ContractDeal = {
    id: string;
    processId?: string;
    title: string;
    contactName?: string;
    status?: string;
    signedAt?: string;
    signedByIP?: string;
    signedByUserAgent?: string;
    signatureData?: string;
    legallyRectified?: boolean;
    pdfUrl?: string;
};

const CHAPTERS = [
    ['contract-summary', 'Resumo'],
    ['chapter-1', 'Partes e escopo'],
    ['chapter-2', 'Obrigações do cliente'],
    ['chapter-3', 'Responsabilidade'],
    ['chapter-4', 'Pagamento'],
    ['chapter-5', 'Comunicação'],
    ['chapter-6', 'Portal'],
    ['chapter-7', 'LGPD'],
    ['chapter-8', 'Confidencialidade'],
    ['chapter-9', 'Propriedade intelectual'],
    ['chapter-10', 'Rescisão'],
    ['chapter-11', 'Desistência'],
    ['chapter-12', 'Força maior'],
    ['chapter-13', 'Assinatura eletrônica'],
    ['chapter-14', 'Disposições gerais'],
    ['chapter-15', 'Foro'],
    ['annex-1', 'Anexos']
] as const;

const getSignerName = (deal: ContractDeal | null) => {
    const value = String(deal?.signatureData || '');
    return value.replace(/^Assinado digitalmente por\s+/i, '').split('|')[0].trim() || deal?.contactName || 'Cliente';
};

const ContractPaper = React.memo<{ html: string }>(({ html }) => (
    <div className="ast-sign-paper" dangerouslySetInnerHTML={{ __html: html }} />
));
ContractPaper.displayName = 'ContractPaper';

export const ContractSignaturePage: React.FC<ContractSignaturePageProps> = ({ dealId }) => {
    const [deal, setDeal] = useState<ContractDeal | null>(null);
    const [contractHtml, setContractHtml] = useState('');
    const [version, setVersion] = useState('');
    const [rectificationVersion, setRectificationVersion] = useState('');
    const [acknowledgementLabels, setAcknowledgementLabels] = useState<string[]>([]);
    const [acknowledgements, setAcknowledgements] = useState<boolean[]>([]);
    const [signatureName, setSignatureName] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [signing, setSigning] = useState(false);
    const [signed, setSigned] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [activeSection, setActiveSection] = useState('contract-summary');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [signaturePanelVisible, setSignaturePanelVisible] = useState(false);
    const pageRef = useRef<HTMLDivElement | null>(null);
    const progressBarRef = useRef<HTMLSpanElement | null>(null);
    const progressLabelRef = useRef<HTMLElement | null>(null);
    const signaturePanelRef = useRef<HTMLElement | null>(null);
    const readProgressRef = useRef(0);
    const activeSectionRef = useRef('contract-summary');
    const { addToast } = useToast();

    const fetchDeal = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setLoadError('');
        try {
            const response = await api.get(`/asterysko/public/deals/${dealId}/contract`);
            const nextDeal = response.data.deal as ContractDeal;
            const labels = Array.isArray(response.data.acknowledgements) ? response.data.acknowledgements : [];
            setDeal(nextDeal);
            setContractHtml(response.data.html || '');
            setVersion(response.data.version || '');
            setRectificationVersion(response.data.rectificationVersion || '');
            setAcknowledgementLabels(labels);
            setAcknowledgements(current => current.length === labels.length ? current : labels.map(() => false));
            setPdfUrl(response.data.pdfUrl || nextDeal?.pdfUrl || '');
            setSigned(Boolean(nextDeal?.signedAt || nextDeal?.status === 'contract_signed'));
            if (nextDeal?.contactName) setSignatureName(current => current || nextDeal.contactName || '');
        } catch (error: any) {
            console.error('Error fetching contract', error);
            setLoadError(error?.response?.data?.error || 'Não foi possível carregar este contrato.');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [dealId]);

    useEffect(() => {
        void fetchDeal();
    }, [fetchDeal]);

    useEffect(() => {
        const page = pageRef.current;
        if (!page || loading) return;
        let animationFrame: number | null = null;
        let sectionOffsets: Array<{ id: string; top: number }> = [];

        const measureSections = () => {
            sectionOffsets = CHAPTERS.flatMap(([id]) => {
                const element = page.querySelector<HTMLElement>(`#${id}`);
                return element ? [{ id, top: element.offsetTop }] : [];
            });
        };

        const updateScrollState = () => {
            animationFrame = null;
            const max = page.scrollHeight - page.clientHeight;
            const nextProgress = max > 0 ? Math.min(100, Math.round((page.scrollTop / max) * 100)) : 100;
            if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${nextProgress / 100})`;
            if (readProgressRef.current !== nextProgress) {
                readProgressRef.current = nextProgress;
                if (progressLabelRef.current) progressLabelRef.current.textContent = `${nextProgress}% revisado`;
            }

            const marker = page.scrollTop + 150;
            let current = 'contract-summary';
            for (const section of sectionOffsets) {
                if (section.top > marker) break;
                current = section.id;
            }
            if (activeSectionRef.current !== current) {
                activeSectionRef.current = current;
                setActiveSection(current);
            }
        };

        const onScroll = () => {
            if (animationFrame === null) animationFrame = window.requestAnimationFrame(updateScrollState);
        };
        const onResize = () => {
            measureSections();
            onScroll();
        };
        measureSections();
        updateScrollState();
        page.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        return () => {
            page.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        };
    }, [loading, contractHtml]);

    useEffect(() => {
        const page = pageRef.current;
        const panel = signaturePanelRef.current;
        if (!page || !panel || loading || signed) return;
        const observer = new IntersectionObserver(
            ([entry]) => setSignaturePanelVisible(entry.isIntersecting),
            { root: page, threshold: 0.15 }
        );
        observer.observe(panel);
        return () => observer.disconnect();
    }, [loading, signed, contractHtml]);

    const allAcknowledged = acknowledgementLabels.length > 0 && acknowledgements.every(Boolean);
    const canSign = allAcknowledged && signatureName.trim().length >= 3 && !signing;
    const signedDate = useMemo(() => deal?.signedAt ? new Date(deal.signedAt).toLocaleString('pt-BR') : '', [deal?.signedAt]);

    const goToSection = (id: string) => {
        pageRef.current?.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileMenuOpen(false);
    };

    const goToSignature = () => {
        signaturePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => signaturePanelRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true }), 550);
    };

    const toggleAcknowledgement = (index: number) => {
        setAcknowledgements(current => current.map((value, itemIndex) => itemIndex === index ? !value : value));
    };

    const handleSign = async () => {
        if (!canSign) {
            addToast({ type: 'warning', title: 'Revise o aceite', message: 'Confirme os quatro pontos e informe seu nome completo.' });
            return;
        }
        setSigning(true);
        try {
            const response = await api.post(`/asterysko/public/deals/${dealId}/sign`, {
                signatureName: signatureName.trim(),
                agreed: true,
                acknowledgements
            });
            setSigned(true);
            setDeal(response.data?.deal || deal);
            setPdfUrl(response.data?.deal?.pdfUrl || `/api/asterysko/public/deals/${dealId}/contract-pdf`);
            await fetchDeal(false);
            pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            addToast({ type: 'success', title: 'Contrato assinado', message: 'O PDF foi gerado e anexado ao seu processo.' });
        } catch (error: any) {
            console.error('Error signing contract', error);
            addToast({ type: 'error', title: 'Não foi possível assinar', message: error?.response?.data?.error || 'Tente novamente em alguns instantes.' });
        } finally {
            setSigning(false);
        }
    };

    if (loading) {
        return (
            <div className="ast-sign-state" role="status">
                <img src="/assets/asterysko/contract-wordmark.svg" alt="Asterysko" />
                <span className="ast-sign-spinner" />
                <p>Preparando seu contrato...</p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="ast-sign-state ast-sign-state--error">
                <FileCheck2 size={34} />
                <h1>Não conseguimos abrir o contrato</h1>
                <p>{loadError}</p>
                <button type="button" onClick={() => void fetchDeal()}>Tentar novamente</button>
            </div>
        );
    }

    return (
        <div className={`ast-sign ${signed ? 'ast-sign--signed' : ''}`} ref={pageRef}>
            <div className="ast-sign-progress" aria-hidden="true"><span ref={progressBarRef} /></div>
            <header className="ast-sign-header">
                <div className="ast-sign-header__inner">
                    <button className="ast-sign-icon-button" type="button" onClick={() => window.location.assign('/portal?view=contracts')} aria-label="Voltar aos contratos"><ArrowLeft size={19} /></button>
                    <img className="ast-sign-header__logo" src="/assets/asterysko/contract-wordmark.svg" alt="Asterysko" />
                    <div className="ast-sign-header__status"><LockKeyhole size={15} /><span>{signed ? 'Assinado e arquivado' : 'Ambiente seguro'}</span></div>
                    <button className="ast-sign-icon-button ast-sign-mobile-menu" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir índice"><Menu size={20} /></button>
                </div>
            </header>

            {mobileMenuOpen && (
                <div className="ast-sign-menu-backdrop" role="presentation" onClick={() => setMobileMenuOpen(false)}>
                    <nav className="ast-sign-mobile-nav" aria-label="Índice do contrato" onClick={event => event.stopPropagation()}>
                        <div><strong>Índice do contrato</strong><button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar índice"><X size={20} /></button></div>
                        {CHAPTERS.map(([id, label]) => <button key={id} type="button" className={activeSection === id ? 'is-active' : ''} onClick={() => goToSection(id)}>{label}</button>)}
                    </nav>
                </div>
            )}

            <main className="ast-sign-layout">
                <aside className="ast-sign-toc" aria-label="Índice do contrato">
                    <span>Leitura</span>
                    <strong ref={progressLabelRef}>0% revisado</strong>
                    <nav>{CHAPTERS.map(([id, label]) => <button key={id} type="button" className={activeSection === id ? 'is-active' : ''} onClick={() => goToSection(id)}><span />{label}</button>)}</nav>
                </aside>

                <div className="ast-sign-document-column">
                    {signed && (
                        <section className="ast-sign-success" aria-live="polite">
                            <CheckCircle2 size={26} />
                            <div><strong>{deal?.legallyRectified ? 'Contrato assinado com dados cadastrais retificados' : 'Contrato assinado e anexado ao processo'}</strong><p>{deal?.legallyRectified ? 'A via original e seu hash permanecem preservados junto da cópia retificada.' : 'O documento foi congelado em PDF com os dados e as evidências deste aceite.'}</p></div>
                            <a href={pdfUrl || `/api/asterysko/public/deals/${dealId}/contract-pdf`} download><Download size={17} />Baixar PDF</a>
                        </section>
                    )}
                    <ContractPaper html={contractHtml} />
                    <p className="ast-sign-legal-note">Versão aceita: {version}{rectificationVersion ? ` · Retificação cadastral: ${rectificationVersion}` : ''}. Recomendamos guardar uma cópia do PDF assinado.</p>
                </div>

                <aside className="ast-sign-action-column" ref={signaturePanelRef}>
                    {signed ? (
                        <section className="ast-sign-certificate">
                            <div className="ast-sign-certificate__icon"><ShieldCheck size={26} /></div>
                            <small>Concluído</small>
                            <h2>Assinatura confirmada</h2>
                            <dl><div><dt>Assinante</dt><dd>{getSignerName(deal)}</dd></div><div><dt>Data e hora</dt><dd>{signedDate}</dd></div><div><dt>Versão</dt><dd>{version}{rectificationVersion ? ` · ${rectificationVersion}` : ''}</dd></div></dl>
                            <a className="ast-sign-primary" href={pdfUrl || `/api/asterysko/public/deals/${dealId}/contract-pdf`} download><Download size={18} />Baixar contrato em PDF</a>
                            <button className="ast-sign-secondary" type="button" onClick={() => window.location.assign(`/portal?view=details&tab=formalization${deal?.processId ? `&processId=${encodeURIComponent(deal.processId)}` : ''}`)}>Continuar formalização</button>
                        </section>
                    ) : (
                        <section className="ast-sign-form" aria-labelledby="ast-sign-form-title">
                            <small>Etapa final</small>
                            <h2 id="ast-sign-form-title">Revise e confirme</h2>
                            <p>Marque cada item para registrar seu aceite consciente.</p>
                            <div className="ast-sign-acknowledgements">
                                {acknowledgementLabels.map((label, index) => (
                                    <label key={label} className={acknowledgements[index] ? 'is-checked' : ''}>
                                        <input type="checkbox" checked={Boolean(acknowledgements[index])} onChange={() => toggleAcknowledgement(index)} />
                                        <span aria-hidden="true"><Check size={13} /></span>
                                        <em>{label}</em>
                                    </label>
                                ))}
                            </div>
                            <label className="ast-sign-name-field"><span>Nome completo do assinante</span><input type="text" autoComplete="name" value={signatureName} onChange={event => setSignatureName(event.target.value)} placeholder="Como consta no documento" /></label>
                            <button className="ast-sign-primary" type="button" onClick={handleSign} disabled={!canSign}>
                                {signing ? <><span className="ast-sign-button-spinner" />Gerando documento...</> : <><FileCheck2 size={18} />Assinar e gerar PDF</>}
                            </button>
                            <p className="ast-sign-evidence"><LockKeyhole size={13} />Data, hora, IP e dispositivo serão registrados como evidências.</p>
                        </section>
                    )}
                </aside>
            </main>

            {!signed && !signaturePanelVisible && (
                <button className="ast-sign-jump" type="button" onClick={goToSignature}>
                    <ArrowDown size={18} aria-hidden="true" />
                    <span>Ir para a assinatura</span>
                </button>
            )}
        </div>
    );
};
