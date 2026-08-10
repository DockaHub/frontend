import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, FileText, ShieldCheck, Upload } from 'lucide-react';
import api from '../../../../services/api';

interface PortalPlan {
    id: string;
    name: string;
    description?: string | null;
    value: number;
    officialTax?: number | null;
    billingMode: 'ONE_TIME' | 'SUBSCRIPTION' | string;
    taxChargeTiming?: string;
}

interface Props {
    profileComplete: boolean;
    onCancel: () => void;
    onEditProfile: () => void;
}

const PRESENTATIONS = [
    { value: 'NOMINATIVA', label: 'Somente nome', detail: 'Protege a expressão escrita, sem identidade visual específica.' },
    { value: 'MISTA', label: 'Nome + logotipo', detail: 'Protege o conjunto formado pelo nome e sua identidade visual.' },
    { value: 'FIGURATIVA', label: 'Somente símbolo', detail: 'Protege apenas o desenho, ícone ou elemento visual.' },
    { value: 'TRIDIMENSIONAL', label: 'Forma tridimensional', detail: 'Para formas distintivas de produto ou embalagem.' }
];

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const newRequestId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `portal-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const NewTrademarkWizard: React.FC<Props> = ({ profileComplete, onCancel, onEditProfile }) => {
    const [step, setStep] = useState(0);
    const [plans, setPlans] = useState<PortalPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [requestId] = useState(newRequestId);
    const [draft, setDraft] = useState({
        brandName: '',
        presentation: 'MISTA',
        brandType: '',
        holders: '',
        nature: '',
        goodsServices: '',
        nclClasses: '',
        nclSpecification: '',
        planId: ''
    });
    const [logo, setLogo] = useState<File | null>(null);
    const [documents, setDocuments] = useState<File[]>([]);

    useEffect(() => {
        let active = true;
        api.get('/asterysko/portal/new-trademark/options')
            .then(response => {
                if (!active) return;
                const available = Array.isArray(response.data?.plans) ? response.data.plans : [];
                setPlans(available);
                if (available.length === 1) setDraft(current => ({ ...current, planId: available[0].id }));
            })
            .catch(error => active && setFeedback(error.response?.data?.error || 'Não foi possível carregar os planos disponíveis.'))
            .finally(() => active && setLoadingPlans(false));
        return () => { active = false; };
    }, []);

    const selectedPlan = plans.find(plan => plan.id === draft.planId);
    const needsLogo = draft.presentation === 'MISTA' || draft.presentation === 'FIGURATIVA';
    const steps = ['Marca', 'Atuação', 'Plano', 'Revisão'];
    const canContinue = useMemo(() => {
        if (step === 0) return draft.brandName.trim().length >= 2 && (!needsLogo || Boolean(logo));
        if (step === 1) return draft.goodsServices.trim().length >= 10;
        if (step === 2) return Boolean(draft.planId);
        return profileComplete && Boolean(selectedPlan);
    }, [draft.brandName, draft.goodsServices, draft.planId, logo, needsLogo, profileComplete, selectedPlan, step]);

    const goNext = () => {
        setFeedback('');
        if (canContinue) setStep(current => Math.min(current + 1, steps.length - 1));
    };

    const submit = async () => {
        if (!canContinue || submitting) return;
        try {
            setSubmitting(true);
            setFeedback('');
            const payload = new FormData();
            Object.entries({ ...draft, requestId }).forEach(([key, value]) => payload.append(key, value));
            const normalizedClasses = draft.nclClasses.split(',').map(item => item.replace(/\D/g, '')).filter(Boolean);
            payload.set('nclClasses', JSON.stringify(normalizedClasses));
            if (logo) payload.append('logo', logo);
            documents.forEach(file => payload.append('documents', file));
            const response = await api.post('/asterysko/portal/new-trademark', payload);
            const contractUrl = response.data?.contractUrl;
            if (!contractUrl) throw new Error('CONTRACT_NOT_CREATED');
            window.location.assign(contractUrl);
        } catch (error: any) {
            setFeedback(error.response?.data?.message || 'Não foi possível concluir a solicitação. Revise os dados e tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="ast-intake" aria-labelledby="ast-intake-title">
            <header className="ast-intake__header">
                <button type="button" onClick={step === 0 ? onCancel : () => setStep(current => current - 1)} aria-label="Voltar">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <small>Novo processo</small>
                    <h1 id="ast-intake-title">Registrar uma nova marca</h1>
                    <p>Preencha as informações para gerarmos seu contrato e iniciarmos o atendimento.</p>
                </div>
            </header>

            <ol className="ast-intake__progress" aria-label="Etapas do formulário">
                {steps.map((label, index) => (
                    <li className={index === step ? 'ast-intake__progress-item--active' : index < step ? 'ast-intake__progress-item--done' : ''} key={label}>
                        <span>{index < step ? <Check size={13} /> : index + 1}</span><small>{label}</small>
                    </li>
                ))}
            </ol>

            <div className="ast-intake__layout">
                <form className="ast-intake__card" onSubmit={event => { event.preventDefault(); step === 3 ? void submit() : goNext(); }}>
                    {step === 0 && (
                        <div className="ast-intake__step">
                            <div className="ast-intake__step-heading"><small>Etapa 1 de 4</small><h2>Como é a sua marca?</h2><p>Informe o nome e a forma como ela será apresentada ao público.</p></div>
                            <label className="ast-intake__field"><span>Nome da marca *</span><input autoFocus required maxLength={160} value={draft.brandName} onChange={event => setDraft(current => ({ ...current, brandName: event.target.value }))} placeholder="Ex.: Asterysko" /></label>
                            <fieldset className="ast-intake__choices"><legend>Apresentação da marca *</legend>{PRESENTATIONS.map(item => <label className={draft.presentation === item.value ? 'ast-intake__choice--selected' : ''} key={item.value}><input type="radio" name="presentation" value={item.value} checked={draft.presentation === item.value} onChange={() => setDraft(current => ({ ...current, presentation: item.value }))} /><span><strong>{item.label}</strong><small>{item.detail}</small></span><i>{draft.presentation === item.value && <Check size={14} />}</i></label>)}</fieldset>
                            <label className="ast-intake__field"><span>Tipo ou segmento da marca</span><input maxLength={80} value={draft.brandType} onChange={event => setDraft(current => ({ ...current, brandType: event.target.value }))} placeholder="Ex.: tecnologia, vestuário, alimentação" /></label>
                            <label className="ast-intake__upload"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setLogo(event.target.files?.[0] || null)} /><Upload size={20} /><span><strong>{logo ? logo.name : 'Enviar logotipo'}</strong><small>{needsLogo ? 'Obrigatório para esta apresentação · PNG, JPG ou WebP · até 10 MB' : 'Opcional · PNG, JPG ou WebP · até 10 MB'}</small></span></label>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="ast-intake__step">
                            <div className="ast-intake__step-heading"><small>Etapa 2 de 4</small><h2>O que a marca identifica?</h2><p>Esta descrição ajuda nosso time a definir e validar as classes do INPI.</p></div>
                            <label className="ast-intake__field"><span>Produtos e serviços oferecidos *</span><textarea autoFocus required minLength={10} maxLength={4000} rows={6} value={draft.goodsServices} onChange={event => setDraft(current => ({ ...current, goodsServices: event.target.value }))} placeholder="Descreva o que sua empresa vende ou presta, para quem e como a marca será usada." /></label>
                            <div className="ast-intake__field-row"><label className="ast-intake__field"><span>Classes NCL que você já conhece</span><input value={draft.nclClasses} onChange={event => setDraft(current => ({ ...current, nclClasses: event.target.value }))} placeholder="Ex.: 35, 41" /><small>Opcional. Nossa equipe fará a conferência.</small></label><label className="ast-intake__field"><span>Titular da marca</span><input value={draft.holders} onChange={event => setDraft(current => ({ ...current, holders: event.target.value }))} placeholder="Se diferente do titular do cadastro" /></label></div>
                            <label className="ast-intake__field"><span>Observações sobre a especificação</span><textarea rows={3} maxLength={4000} value={draft.nclSpecification} onChange={event => setDraft(current => ({ ...current, nclSpecification: event.target.value }))} placeholder="Produtos específicos, área de atuação, público ou outros detalhes relevantes." /></label>
                            <label className="ast-intake__upload"><input type="file" multiple accept="application/pdf,image/png,image/jpeg" onChange={event => setDocuments(Array.from(event.target.files || []).slice(0, 6))} /><FileText size={20} /><span><strong>{documents.length ? `${documents.length} arquivo(s) selecionado(s)` : 'Anexar documentos de apoio'}</strong><small>Opcional · PDF, PNG ou JPG · até 6 arquivos</small></span></label>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="ast-intake__step">
                            <div className="ast-intake__step-heading"><small>Etapa 3 de 4</small><h2>Escolha o plano</h2><p>Os valores abaixo vêm diretamente da configuração comercial da Asterysko.</p></div>
                            {loadingPlans && <p className="ast-intake__notice">Carregando planos...</p>}
                            {!loadingPlans && !plans.length && <p className="ast-intake__notice ast-intake__notice--error">Nenhum plano está disponível. Fale com a Asterysko para continuar.</p>}
                            <div className="ast-intake__plans">{plans.map(plan => <label className={draft.planId === plan.id ? 'ast-intake__plan--selected' : ''} key={plan.id}><input type="radio" name="plan" value={plan.id} checked={draft.planId === plan.id} onChange={() => setDraft(current => ({ ...current, planId: plan.id }))} /><span><small>{plan.billingMode === 'SUBSCRIPTION' ? 'Plano mensal' : 'Pagamento único'}</small><strong>{plan.name}</strong><p>{plan.description || 'Serviço de registro e acompanhamento de marca.'}</p></span><b>{formatCurrency(plan.value)}{plan.billingMode === 'SUBSCRIPTION' && <small>/mês</small>}</b></label>)}</div>
                            <p className="ast-intake__legal-note">A cobrança será liberada somente após a assinatura do contrato. Taxas oficiais seguem a regra indicada no contrato do plano selecionado.</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="ast-intake__step">
                            <div className="ast-intake__step-heading"><small>Etapa 4 de 4</small><h2>Revise antes de continuar</h2><p>Ao concluir, o processo entra no CRM e seu contrato será aberto para assinatura.</p></div>
                            {!profileComplete && <div className="ast-intake__profile-warning"><strong>Complete seus dados cadastrais</strong><p>Nome, CPF/CNPJ e endereço completo são necessários para gerar o contrato e a procuração.</p><button type="button" onClick={onEditProfile}>Ir para Meus dados</button></div>}
                            <dl className="ast-intake__review"><div><dt>Marca</dt><dd>{draft.brandName}</dd></div><div><dt>Apresentação</dt><dd>{PRESENTATIONS.find(item => item.value === draft.presentation)?.label}</dd></div><div><dt>Atuação</dt><dd>{draft.goodsServices}</dd></div><div><dt>Plano</dt><dd>{selectedPlan ? `${selectedPlan.name} · ${formatCurrency(selectedPlan.value)}${selectedPlan.billingMode === 'SUBSCRIPTION' ? '/mês' : ''}` : 'Não selecionado'}</dd></div><div><dt>Arquivos</dt><dd>{[logo ? 'logotipo' : '', documents.length ? `${documents.length} documento(s)` : ''].filter(Boolean).join(' e ') || 'Nenhum arquivo'}</dd></div></dl>
                            <div className="ast-intake__automation"><ShieldCheck size={24} /><span><strong>O que acontece agora</strong><small>Contrato e procuração preenchidos · criação no CRM · cobrança após assinatura · documentos disponíveis para o time operacional.</small></span></div>
                        </div>
                    )}

                    {feedback && <p className="ast-intake__notice ast-intake__notice--error" role="alert">{feedback}</p>}
                    <footer className="ast-intake__footer"><button type="button" onClick={step === 0 ? onCancel : () => setStep(current => current - 1)} disabled={submitting}>Voltar</button><button className="ast-intake__primary" type="submit" disabled={!canContinue || submitting || (step === 2 && loadingPlans)}>{submitting ? 'Criando seu processo...' : step === 3 ? 'Gerar contrato e continuar' : <>Continuar <ChevronRight size={17} /></>}</button></footer>
                </form>

                <aside className="ast-intake__aside"><ShieldCheck size={27} /><strong>Fluxo seguro e acompanhado</strong><p>Seu pedido será criado no CRM com todas as informações anexadas. A equipe Asterysko acompanhará as próximas etapas até o protocolo no INPI.</p><ol><li><span>1</span>Contrato digital</li><li><span>2</span>Pagamento</li><li><span>3</span>Procuração</li><li><span>4</span>Preparação e INPI</li></ol></aside>
            </div>
        </section>
    );
};

export default NewTrademarkWizard;
