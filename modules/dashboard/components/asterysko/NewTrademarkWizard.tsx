import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, FileText, ImagePlus, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import api from '../../../../services/api';

interface PortalPlan {
    id: string;
    name: string;
    description?: string | null;
    value: number;
    officialTax?: number | null;
    billingMode: 'ONE_TIME' | 'SUBSCRIPTION' | string;
    portalRole?: 'MONTHLY_PROMO' | 'ONE_TIME';
    compareAtPrice?: number | null;
    installmentsAllowed?: boolean;
    offerDurationMinutes?: number | null;
}

interface Props {
    profileComplete: boolean;
    clientName: string;
    clientDocument: string;
    clientAddress: string;
    onCancel: () => void;
    onEditProfile: () => void;
}

type StepKey = 'name' | 'presentation' | 'segment' | 'logo' | 'activity' | 'classes' | 'documents' | 'plan' | 'review';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const newRequestId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `portal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const OFFER_STORAGE_KEY = 'asterysko-trademark-offer-deadline';
const OFFER_DURATION_MS = 30 * 60 * 1000;

const getOfferDeadline = () => {
    const deadline = Date.now() + OFFER_DURATION_MS;
    try {
        const stored = Number(sessionStorage.getItem(OFFER_STORAGE_KEY));
        if (Number.isFinite(stored) && stored > 0) return stored;
        sessionStorage.setItem(OFFER_STORAGE_KEY, String(deadline));
    } catch {
        // Some embedded/private browsing contexts can deny session storage.
    }
    return deadline;
};

const formatRemaining = (milliseconds: number) => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

export const NewTrademarkWizard: React.FC<Props> = ({ profileComplete, clientName, clientDocument, clientAddress, onCancel, onEditProfile }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [plans, setPlans] = useState<PortalPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [requestId] = useState(newRequestId);
    const [offerDeadline, setOfferDeadline] = useState(getOfferDeadline);
    const [remaining, setRemaining] = useState(() => Math.max(0, offerDeadline - Date.now()));
    const [draft, setDraft] = useState({
        brandName: '',
        presentation: '',
        brandType: '',
        holders: '',
        nature: 'Marca de Produto/Serviço',
        goodsServices: '',
        nclClasses: '',
        nclSpecification: '',
        planId: ''
    });
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);
    const questionRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const needsLogo = draft.presentation === 'MISTA';
    const steps = useMemo<Array<{ key: StepKey; eyebrow: string; title: string; help: string }>>(() => [
        { key: 'name', eyebrow: 'Vamos começar', title: 'Nos conte o nome da sua marca', help: 'Digite exatamente como o nome é usado ou será apresentado ao público.' },
        { key: 'presentation', eyebrow: 'Forma de proteção', title: 'Você quer proteger apenas o nome ou também o logotipo?', help: 'Se escolher nome + logotipo, protegeremos o conjunto visual apresentado.' },
        { key: 'segment', eyebrow: 'Sobre o negócio', title: 'Qual é o segmento da sua marca?', help: 'Isso nos ajuda a entender o mercado e direcionar a classificação no INPI.' },
        ...(needsLogo ? [{ key: 'logo' as StepKey, eyebrow: 'Identidade visual', title: 'Envie agora o logotipo que será protegido', help: 'Use a versão principal, com boa resolução e sem cortes.' }] : []),
        { key: 'activity', eyebrow: 'Atuação', title: 'O que sua marca vende ou quais serviços presta?', help: 'Conte de forma simples. Nosso time transformará sua resposta na especificação técnica adequada.' },
        { key: 'classes', eyebrow: 'Classificação', title: 'Você já conhece alguma classe NCL da sua marca?', help: 'Se não souber, pode avançar sem preencher. A Asterysko fará a análise e confirmação.' },
        { key: 'documents', eyebrow: 'Documentação', title: 'Quer adiantar algum documento de apoio?', help: 'Contrato social, cartão CNPJ, RG ou outro documento útil. Esta etapa é opcional.' },
        { key: 'plan', eyebrow: 'Condição comercial', title: 'Como prefere contratar?', help: 'Escolha entre mensalidade sem comprometer o limite do cartão ou pagamento único à vista.' },
        { key: 'review', eyebrow: 'Tudo pronto', title: 'Revise sua solicitação', help: 'Ao continuar, criaremos o processo no CRM e abriremos o contrato para assinatura.' }
    ], [needsLogo]);
    const step = steps[stepIndex] || steps[0];
    const selectedPlan = plans.find(plan => plan.id === draft.planId);
    const progress = ((stepIndex + 1) / steps.length) * 100;
    const offerExpired = remaining <= 0;
    const promotionalPlanSelected = selectedPlan?.billingMode === 'SUBSCRIPTION';

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !submitting) onCancel();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel, submitting]);

    useEffect(() => {
        let active = true;
        api.get('/asterysko/portal/new-trademark/options')
            .then(response => {
                if (!active) return;
                const available = Array.isArray(response.data?.plans) ? response.data.plans : [];
                setPlans(available);
                if (available.length === 1) setDraft(current => ({ ...current, planId: available[0].id }));
            })
            .catch(error => active && setFeedback(error.response?.data?.error || 'Não foi possível carregar as condições disponíveis.'))
            .finally(() => active && setLoadingPlans(false));
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => setRemaining(Math.max(0, offerDeadline - Date.now())), 1000);
        return () => window.clearInterval(interval);
    }, [offerDeadline]);

    useEffect(() => {
        if (!logo) {
            setLogoPreview('');
            return;
        }
        const url = URL.createObjectURL(logo);
        setLogoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [logo]);

    useEffect(() => {
        const timer = window.setTimeout(() => questionRef.current?.focus(), 360);
        return () => window.clearTimeout(timer);
    }, [step.key]);

    const canContinue = useMemo(() => {
        if (step.key === 'name') return draft.brandName.trim().length >= 2;
        if (step.key === 'presentation') return Boolean(draft.presentation);
        if (step.key === 'segment') return draft.brandType.trim().length >= 2;
        if (step.key === 'logo') return Boolean(logo);
        if (step.key === 'activity') return draft.goodsServices.trim().length >= 10;
        if (step.key === 'plan') return Boolean(draft.planId) && !loadingPlans && (!promotionalPlanSelected || !offerExpired);
        if (step.key === 'review') return profileComplete && Boolean(selectedPlan) && (!promotionalPlanSelected || !offerExpired);
        return true;
    }, [draft, loadingPlans, logo, offerExpired, profileComplete, promotionalPlanSelected, selectedPlan, step.key]);

    const goNext = () => {
        setFeedback('');
        if (canContinue) setStepIndex(current => Math.min(current + 1, steps.length - 1));
    };

    const goBack = () => {
        setFeedback('');
        if (stepIndex === 0) onCancel();
        else setStepIndex(current => Math.max(0, current - 1));
    };

    const renewOffer = () => {
        const deadline = Date.now() + OFFER_DURATION_MS;
        try { sessionStorage.setItem(OFFER_STORAGE_KEY, String(deadline)); } catch { /* optional browser storage */ }
        setOfferDeadline(deadline);
        setRemaining(OFFER_DURATION_MS);
    };

    const submit = async () => {
        if (!canContinue || submitting) return;
        try {
            setSubmitting(true);
            setFeedback('');
            const payload = new FormData();
            Object.entries({ ...draft, holders: draft.holders || clientName, requestId }).forEach(([key, value]) => payload.append(key, value));
            const normalizedClasses = draft.nclClasses.split(',').map(item => item.replace(/\D/g, '')).filter(Boolean);
            payload.set('nclClasses', JSON.stringify(normalizedClasses));
            if (logo) payload.append('logo', logo);
            documents.forEach(file => payload.append('documents', file));
            const response = await api.post('/asterysko/portal/new-trademark', payload);
            const contractUrl = response.data?.contractUrl;
            if (!contractUrl) throw new Error('CONTRACT_NOT_CREATED');
            try { sessionStorage.removeItem(OFFER_STORAGE_KEY); } catch { /* optional browser storage */ }
            window.location.assign(contractUrl);
        } catch (error: any) {
            setFeedback(error.response?.data?.message || 'Não foi possível concluir a solicitação. Revise os dados e tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (step.key === 'review') void submit();
        else goNext();
    };

    const renderQuestion = () => {
        if (step.key === 'name') return <label className="ast-typeform__single-field"><span>Nome da marca</span><input ref={questionRef as React.RefObject<HTMLInputElement>} value={draft.brandName} maxLength={160} onChange={event => setDraft(current => ({ ...current, brandName: event.target.value }))} placeholder="Digite o nome aqui..." /><small>Pressione Enter ou toque em Continuar</small></label>;
        if (step.key === 'presentation') return <div className="ast-typeform__answer-grid"><button className={draft.presentation === 'NOMINATIVA' ? 'is-selected' : ''} type="button" onClick={() => { setDraft(current => ({ ...current, presentation: 'NOMINATIVA' })); setLogo(null); }}><span className="ast-typeform__answer-letter">A</span><strong>Proteger apenas o nome</strong><small>Marca nominativa</small>{draft.presentation === 'NOMINATIVA' && <Check size={18} />}</button><button className={draft.presentation === 'MISTA' ? 'is-selected' : ''} type="button" onClick={() => setDraft(current => ({ ...current, presentation: 'MISTA' }))}><span className="ast-typeform__answer-letter">B</span><strong>Proteger nome + logotipo</strong><small>Marca mista</small>{draft.presentation === 'MISTA' && <Check size={18} />}</button></div>;
        if (step.key === 'segment') return <label className="ast-typeform__single-field"><span>Segmento da marca</span><input ref={questionRef as React.RefObject<HTMLInputElement>} value={draft.brandType} maxLength={80} onChange={event => setDraft(current => ({ ...current, brandType: event.target.value }))} placeholder="Ex.: moda, tecnologia, alimentação..." /><small>Uma descrição curta já é suficiente</small></label>;
        if (step.key === 'logo') return <label className={`ast-typeform__dropzone ${logo ? 'has-file' : ''}`}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setLogo(event.target.files?.[0] || null)} />{logoPreview ? <img src={logoPreview} alt="Prévia do logotipo" /> : <ImagePlus size={40} />}<span><strong>{logo ? logo.name : 'Selecione ou arraste seu logotipo'}</strong><small>PNG, JPG ou WebP · máximo de 10 MB</small></span>{logo && <em><Check size={15} /> Arquivo pronto</em>}</label>;
        if (step.key === 'activity') return <label className="ast-typeform__single-field"><span>Produtos e serviços</span><textarea ref={questionRef as React.RefObject<HTMLTextAreaElement>} value={draft.goodsServices} maxLength={4000} rows={4} onChange={event => setDraft(current => ({ ...current, goodsServices: event.target.value }))} placeholder="Ex.: vendemos roupas esportivas pela internet e em lojas físicas..." /><small>{draft.goodsServices.length}/4000 caracteres</small></label>;
        if (step.key === 'classes') return <label className="ast-typeform__single-field"><span>Classes NCL, se souber</span><input ref={questionRef as React.RefObject<HTMLInputElement>} value={draft.nclClasses} onChange={event => setDraft(current => ({ ...current, nclClasses: event.target.value }))} placeholder="Ex.: 35, 41" /><small>Não sabe? Deixe em branco e continue.</small></label>;
        if (step.key === 'documents') return <label className={`ast-typeform__dropzone ${documents.length ? 'has-file' : ''}`}><input type="file" multiple accept="application/pdf,image/png,image/jpeg" onChange={event => setDocuments(Array.from(event.target.files || []).slice(0, 6))} /><FileText size={40} /><span><strong>{documents.length ? `${documents.length} documento(s) selecionado(s)` : 'Anexar documentos de apoio'}</strong><small>PDF, PNG ou JPG · até 6 arquivos · opcional</small></span>{documents.length > 0 && <em><Check size={15} /> Arquivos prontos</em>}</label>;
        if (step.key === 'plan') return <div className="ast-typeform__plans">{loadingPlans && <p className="ast-typeform__loading">Carregando condições...</p>}{!loadingPlans && plans.map(plan => { const monthly = plan.billingMode === 'SUBSCRIPTION'; return <button className={draft.planId === plan.id ? 'is-selected' : ''} type="button" key={plan.id} onClick={() => setDraft(current => ({ ...current, planId: plan.id }))}><span className="ast-typeform__plan-top"><small>{monthly ? 'Mais escolhido' : 'Pagamento único'}</small>{draft.planId === plan.id && <Check size={17} />}</span><strong>{monthly ? 'Plano mensal' : 'À vista'}</strong><p>{plan.description || (monthly ? 'Acompanhamento contínuo sem comprometer o limite do cartão.' : 'Pagamento integral em uma única cobrança, sem parcelamento.')}</p><span className="ast-typeform__price">{plan.compareAtPrice ? <del>{formatCurrency(plan.compareAtPrice)}</del> : null}<b>{formatCurrency(plan.value)}</b>{monthly && <small>/mês</small>}</span><em>{monthly ? 'Sem comprometer o limite do cartão' : 'Sem opção de parcelamento'}</em></button>; })}{!loadingPlans && !plans.length && <p className="ast-typeform__error">Nenhuma condição comercial está disponível agora.</p>}{offerExpired && promotionalPlanSelected && <div className="ast-typeform__expired"><Clock3 size={18} /><span>A condição mensal promocional expirou.</span><button type="button" onClick={renewOffer}>Reservar novamente</button></div>}</div>;
        return <div className="ast-typeform__review">{!profileComplete && <div className="ast-typeform__profile-warning"><strong>Falta completar seus dados cadastrais</strong><p>Precisamos de nome, CPF/CNPJ e endereço para preencher contrato e procuração.</p><button type="button" onClick={onEditProfile}>Completar em Meus dados</button></div>}<dl><div><dt>Marca</dt><dd>{draft.brandName}</dd></div><div><dt>Proteção</dt><dd>{needsLogo ? 'Nome + logotipo' : 'Somente o nome'}</dd></div><div><dt>Segmento</dt><dd>{draft.brandType}</dd></div><div><dt>Atuação</dt><dd>{draft.goodsServices}</dd></div><div><dt>Plano</dt><dd>{selectedPlan ? `${selectedPlan.billingMode === 'SUBSCRIPTION' ? 'Mensal' : 'À vista'} · ${formatCurrency(selectedPlan.value)}${selectedPlan.billingMode === 'SUBSCRIPTION' ? '/mês' : ''}` : 'Não selecionado'}</dd></div></dl><div className="ast-typeform__automation"><ShieldCheck size={23} /><span><strong>Tudo conectado automaticamente</strong><small>CRM, contrato, procuração e cobrança após a assinatura.</small></span></div></div>;
    };

    return (
        <div className="ast-typeform" role="dialog" aria-modal="true" aria-labelledby="ast-typeform-title">
            <header className="ast-typeform__topbar">
                <button className="ast-typeform__brand" type="button" onClick={onCancel}><img src="/assets/asterysko/brand-mark.svg" alt="" /><span><strong>Asterysko</strong><small>Novo registro de marca</small></span></button>
                <div className="ast-typeform__offer"><Clock3 size={15} /><span>Oferta mensal válida por</span><strong className={offerExpired ? 'is-expired' : ''}>{formatRemaining(remaining)}</strong></div>
                <button className="ast-typeform__close" type="button" onClick={onCancel} aria-label="Fechar formulário"><X size={21} /></button>
                <span className="ast-typeform__progress" style={{ '--ast-progress': `${progress}%` } as React.CSSProperties} />
            </header>

            <div className="ast-typeform__body">
                <main className="ast-typeform__question-pane">
                    <form key={step.key} className="ast-typeform__question" onSubmit={handleSubmit}>
                        <div className="ast-typeform__question-count"><span>{stepIndex + 1}</span><i>→</i><small>{step.eyebrow}</small></div>
                        <h1 id="ast-typeform-title">{step.title}</h1>
                        <p>{step.help}</p>
                        <div className="ast-typeform__control">{renderQuestion()}</div>
                        {feedback && <p className="ast-typeform__error" role="alert">{feedback}</p>}
                        <footer className="ast-typeform__actions">
                            <button type="button" onClick={goBack}><ArrowLeft size={17} /> Voltar</button>
                            <button className="ast-typeform__continue" type="submit" disabled={!canContinue || submitting}>{submitting ? 'Criando seu processo...' : step.key === 'review' ? <><LockKeyhole size={16} /> Gerar contrato e continuar</> : <>Continuar <ArrowRight size={17} /></>}</button>
                        </footer>
                    </form>
                </main>

                <aside className="ast-certificate-preview" aria-label="Prévia ilustrativa do futuro certificado">
                    <div className="ast-certificate-preview__label"><span>Prévia ao vivo</span><small>Representação ilustrativa</small></div>
                    <div className="ast-certificate">
                        <span className="ast-certificate__green" /><span className="ast-certificate__yellow" />
                        <header><span className="ast-certificate__seal">BR</span><div><strong>REPÚBLICA FEDERATIVA DO BRASIL</strong><small>Instituto Nacional da Propriedade Industrial</small></div></header>
                        <h2>Certificado de registro de marca</h2>
                        <p className="ast-certificate__process">Processo nº: •••••••••</p>
                        <p className="ast-certificate__copy">Certifica-se que a marca abaixo representada encontra-se registrada, observadas as características e condições indicadas neste documento.</p>
                        <div className="ast-certificate__brand-box">{logoPreview && needsLogo ? <img src={logoPreview} alt="" /> : <strong>{draft.brandName || 'SUA MARCA'}</strong>}</div>
                        <dl><div><dt>Titular:</dt><dd>{draft.holders || clientName || 'Nome do titular'}</dd></div><div><dt>CPF/CNPJ:</dt><dd>{clientDocument || '•••.•••.•••-••'}</dd></div><div><dt>Endereço:</dt><dd>{clientAddress || 'Endereço do titular'}</dd></div><div><dt>Apresentação:</dt><dd>{needsLogo ? 'Mista' : draft.presentation === 'NOMINATIVA' ? 'Nominativa' : 'A definir'}</dd></div><div><dt>Natureza:</dt><dd>{draft.nature}</dd></div><div><dt>NCL:</dt><dd>{draft.nclClasses || 'A validar'}</dd></div><div><dt>Especificação:</dt><dd>{draft.goodsServices || draft.brandType || 'Atividade da marca'}</dd></div></dl>
                        <span className="ast-certificate__watermark">PRÉVIA</span>
                    </div>
                    <p>O certificado oficial é emitido pelo INPI somente após a concessão do registro. Esta prévia ajuda você a visualizar o resultado final.</p>
                </aside>
            </div>
        </div>
    );
};

export default NewTrademarkWizard;
