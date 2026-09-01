import React, { useEffect, useMemo, useState } from 'react';
import { Check, Eye, ImageIcon, Landmark, Loader2, Tags, Trash2, Upload, X } from 'lucide-react';
import api, { getBackendUrl } from '../../../../services/api';

interface Process {
    id: string;
    inpiProcessNumber?: string;
    status: string;
    procurator?: string;
    filingDate?: string;
    concessionDate?: string;
    expirationDate?: string;
    certificateDate?: string;
    brand?: {
        name?: string;
        type?: string;
        presentation?: string;
        nature?: string;
        brandType?: string;
        holders?: string;
        nclClasses?: string[];
        nclSpecification?: string;
        logoUrl?: string;
    };
}

interface Props {
    isOpen: boolean;
    process: Process | null;
    onClose: () => void;
    onSuccess: () => void;
}

const STATUS_OPTIONS = [
    { value: 'WAITING_CONTRACT', label: 'Aguardando contrato' },
    { value: 'WAITING_PAYMENT', label: 'Aguardando pagamento do serviço' },
    { value: 'NEW', label: 'Em preparação' },
    { value: 'READY_TO_FILE', label: 'Pronto para protocolar' },
    { value: 'FILED', label: 'Protocolado no INPI' },
    { value: 'EXAMINATION', label: 'Exame de mérito' },
    { value: 'OPPOSITION', label: 'Oposição / exigência' },
    { value: 'GRANTED', label: 'Deferido' },
    { value: 'WON', label: 'Concluído' },
    { value: 'ARCHIVED', label: 'Arquivado' },
    { value: 'CANCELLED', label: 'Cancelado' }
];

const PRESENTATION_OPTIONS = [
    { value: 'NOMINATIVA', label: 'Nominativa — somente o nome' },
    { value: 'MISTA', label: 'Mista — nome e logotipo' },
    { value: 'FIGURATIVA', label: 'Figurativa — somente imagem' },
    { value: 'TRIDIMENSIONAL', label: 'Tridimensional' },
    { value: 'POSICAO', label: 'De posição' },
    { value: 'PADRAO_ORNAMENTAL', label: 'Padrão ornamental' }
];

const inputClass = 'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#0412dd] focus:ring-2 focus:ring-[#0412dd]/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-blue-500';

const toDateInput = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const resolveAssetUrl = (rawUrl?: string) => {
    if (!rawUrl) return '';
    if (/^(https?:|data:|blob:)/.test(rawUrl)) return rawUrl;
    return `${getBackendUrl()}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
};

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">
        {children}
    </label>
);

const Section: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    portal?: boolean;
    children: React.ReactNode;
}> = ({ icon, title, description, portal, children }) => (
    <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0412dd]/8 text-[#0412dd] dark:bg-blue-500/10 dark:text-blue-400">
                    {icon}
                </span>
                <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</p>
                </div>
            </div>
            {portal && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Eye size={12} /> Portal do cliente
                </span>
            )}
        </header>
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">{children}</div>
    </section>
);

const AsteryskoEditProcessModal: React.FC<Props> = ({ isOpen, process, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const [formData, setFormData] = useState({
        brandName: '',
        presentation: '',
        nature: '',
        brandType: '',
        holders: '',
        nclClasses: [] as string[],
        nclSpecification: '',
        inpiProcessNumber: '',
        status: 'NEW',
        procurator: '',
        filingDate: '',
        concessionDate: '',
        expirationDate: '',
        certificateDate: ''
    });

    const selectedLogoPreview = useMemo(() => logoFile ? URL.createObjectURL(logoFile) : '', [logoFile]);

    useEffect(() => () => {
        if (selectedLogoPreview) URL.revokeObjectURL(selectedLogoPreview);
    }, [selectedLogoPreview]);

    useEffect(() => {
        if (!process) return;
        const legacyType = String(process.brand?.type || '').toUpperCase();
        const knownLegacyPresentation = PRESENTATION_OPTIONS.some(option => option.value === legacyType);
        const presentation = String(process.brand?.presentation || (knownLegacyPresentation ? legacyType : '')).toUpperCase();
        setFormData({
            brandName: process.brand?.name || '',
            presentation,
            nature: process.brand?.nature || '',
            brandType: process.brand?.brandType || (!knownLegacyPresentation ? process.brand?.type || '' : ''),
            holders: process.brand?.holders || '',
            nclClasses: [...new Set((process.brand?.nclClasses || []).map(item => String(item)))].sort((a, b) => Number(a) - Number(b)),
            nclSpecification: process.brand?.nclSpecification || '',
            inpiProcessNumber: process.inpiProcessNumber || '',
            status: process.status || 'NEW',
            procurator: process.procurator || '',
            filingDate: toDateInput(process.filingDate),
            concessionDate: toDateInput(process.concessionDate),
            expirationDate: toDateInput(process.expirationDate),
            certificateDate: toDateInput(process.certificateDate)
        });
        setLogoFile(null);
        setRemoveLogo(false);
        setError('');
    }, [process]);

    if (!isOpen || !process) return null;

    const toggleNclClass = (value: string) => {
        setFormData(current => ({
            ...current,
            nclClasses: current.nclClasses.includes(value)
                ? current.nclClasses.filter(item => item !== value)
                : [...current.nclClasses, value].sort((a, b) => Number(a) - Number(b))
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.put(`/asterysko/processes/${process.id}`, {
                brandName: formData.brandName,
                presentation: formData.presentation || null,
                nature: formData.nature || null,
                brandType: formData.brandType || null,
                holders: formData.holders || null,
                nclClasses: formData.nclClasses,
                nclSpecification: formData.nclSpecification || null,
                inpiProcessNumber: formData.inpiProcessNumber || null,
                status: formData.status,
                procurator: formData.procurator || null,
                filingDate: formData.filingDate || null,
                concessionDate: formData.concessionDate || null,
                expirationDate: formData.expirationDate || null,
                certificateDate: formData.certificateDate || null,
                ...(removeLogo ? { logoUrl: null } : {})
            });

            if (logoFile) {
                const logoPayload = new FormData();
                logoPayload.append('file', logoFile);
                await api.post(`/asterysko/processes/${process.id}/logo`, logoPayload);
            }

            await onSuccess();
            onClose();
        } catch (submitError: any) {
            console.error('Failed to update process', submitError);
            setError(submitError?.response?.data?.error || submitError?.response?.data?.message || 'Não foi possível atualizar o processo.');
        } finally {
            setIsLoading(false);
        }
    };

    const logoPreview = removeLogo ? '' : selectedLogoPreview || resolveAssetUrl(process.brand?.logoUrl);
    const presentationIsKnown = PRESENTATION_OPTIONS.some(option => option.value === formData.presentation);
    const statusIsKnown = STATUS_OPTIONS.some(option => option.value === formData.status);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-6">
            <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                <header className="flex shrink-0 items-start justify-between border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-950">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0412dd] dark:text-blue-400">Cadastro completo</span>
                        <h3 className="mt-1 font-season text-xl font-semibold text-zinc-900 dark:text-white">Editar processo</h3>
                        <p className="mt-1 text-xs text-zinc-500">Atualize os dados operacionais e as informações que aparecem para o cliente.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-white"
                        aria-label="Fechar"
                    >
                        <X size={19} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                        <Section
                            icon={<Eye size={17} />}
                            title="Marca e Portal do Cliente"
                            description="Estes dados identificam a marca e ficam visíveis nos detalhes do processo no portal."
                            portal
                        >
                            <div>
                                <FieldLabel>Nome da marca</FieldLabel>
                                <input
                                    required
                                    value={formData.brandName}
                                    onChange={event => setFormData(current => ({ ...current, brandName: event.target.value }))}
                                    className={inputClass}
                                    placeholder="Ex.: Asterysko"
                                />
                            </div>
                            <div>
                                <FieldLabel>Apresentação</FieldLabel>
                                <select
                                    value={formData.presentation}
                                    onChange={event => setFormData(current => ({ ...current, presentation: event.target.value }))}
                                    className={inputClass}
                                >
                                    <option value="">Não informada</option>
                                    {!presentationIsKnown && formData.presentation && <option value={formData.presentation}>{formData.presentation}</option>}
                                    {PRESENTATION_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <FieldLabel>Natureza</FieldLabel>
                                <input
                                    value={formData.nature}
                                    onChange={event => setFormData(current => ({ ...current, nature: event.target.value }))}
                                    className={inputClass}
                                    placeholder="Ex.: Marca de Produto/Serviço"
                                />
                            </div>
                            <div>
                                <FieldLabel>Segmento da marca</FieldLabel>
                                <input
                                    value={formData.brandType}
                                    onChange={event => setFormData(current => ({ ...current, brandType: event.target.value }))}
                                    className={inputClass}
                                    placeholder="Ex.: tecnologia, moda, alimentação"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FieldLabel>Titular do pedido</FieldLabel>
                                <input
                                    value={formData.holders}
                                    onChange={event => setFormData(current => ({ ...current, holders: event.target.value }))}
                                    className={inputClass}
                                    placeholder="Nome ou razão social do titular"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FieldLabel>Logotipo <span className="normal-case font-medium text-zinc-400">· quando aplicável</span></FieldLabel>
                                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
                                    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950">
                                        {logoPreview ? <img src={logoPreview} alt="Logotipo da marca" className="h-full w-full object-contain" /> : <ImageIcon size={20} />}
                                    </span>
                                    <div className="min-w-[180px] flex-1">
                                        <strong className="block truncate text-xs text-zinc-800 dark:text-zinc-200">
                                            {logoFile?.name || (logoPreview ? 'Logotipo atual' : 'Nenhum logotipo cadastrado')}
                                        </strong>
                                        <small className="mt-0.5 block text-[11px] text-zinc-500">PNG, JPG ou WEBP. O arquivo será substituído no portal.</small>
                                    </div>
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 transition-colors hover:border-[#0412dd] hover:text-[#0412dd] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                                        <Upload size={14} /> {logoPreview ? 'Trocar' : 'Anexar'}
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={event => {
                                                setLogoFile(event.target.files?.[0] || null);
                                                setRemoveLogo(false);
                                            }}
                                        />
                                    </label>
                                    {logoPreview && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLogoFile(null);
                                                setRemoveLogo(true);
                                            }}
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                        >
                                            <Trash2 size={14} /> Remover
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Section>

                        <Section
                            icon={<Tags size={17} />}
                            title="Classificação NCL"
                            description="Marque todas as classes protegidas e descreva os produtos ou serviços."
                            portal
                        >
                            <div className="md:col-span-2">
                                <FieldLabel>Classes de Nice <span className="normal-case font-medium text-zinc-400">· selecione uma ou mais</span></FieldLabel>
                                <div className="grid grid-cols-6 gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-9 dark:border-zinc-700 dark:bg-zinc-900">
                                    {Array.from({ length: 45 }, (_, index) => String(index + 1)).map(value => {
                                        const selected = formData.nclClasses.includes(value);
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => toggleNclClass(value)}
                                                aria-pressed={selected}
                                                className={`relative h-8 rounded-lg text-xs font-bold transition-colors ${selected
                                                    ? 'bg-[#0412dd] text-white shadow-sm dark:bg-blue-600'
                                                    : 'border border-zinc-200 bg-white text-zinc-600 hover:border-[#0412dd] hover:text-[#0412dd] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400'}`}
                                            >
                                                {selected && <Check size={10} className="absolute right-1 top-1" />}
                                                {value}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="mt-2 text-[11px] text-zinc-500">
                                    {formData.nclClasses.length ? `${formData.nclClasses.length} classe(s) selecionada(s): ${formData.nclClasses.join(', ')}` : 'Nenhuma classe informada.'}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <FieldLabel>Especificação de produtos e serviços</FieldLabel>
                                <textarea
                                    value={formData.nclSpecification}
                                    onChange={event => setFormData(current => ({ ...current, nclSpecification: event.target.value }))}
                                    className={`${inputClass} min-h-24 resize-y`}
                                    placeholder="Descreva exatamente os produtos e/ou serviços abrangidos pelo pedido."
                                />
                            </div>
                        </Section>

                        <Section
                            icon={<Landmark size={17} />}
                            title="Processo no INPI"
                            description="Informações operacionais, datas oficiais e situação atual do pedido."
                        >
                            <div>
                                <FieldLabel>Número do processo</FieldLabel>
                                <input
                                    value={formData.inpiProcessNumber}
                                    onChange={event => setFormData(current => ({ ...current, inpiProcessNumber: event.target.value }))}
                                    className={`${inputClass} font-mono`}
                                    placeholder="Ex.: 928374610"
                                />
                            </div>
                            <div>
                                <FieldLabel>Status atual</FieldLabel>
                                <select
                                    value={formData.status}
                                    onChange={event => setFormData(current => ({ ...current, status: event.target.value }))}
                                    className={inputClass}
                                >
                                    {!statusIsKnown && formData.status && <option value={formData.status}>{formData.status}</option>}
                                    {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <FieldLabel>Procurador responsável</FieldLabel>
                                <input
                                    value={formData.procurator}
                                    onChange={event => setFormData(current => ({ ...current, procurator: event.target.value }))}
                                    className={inputClass}
                                    placeholder="Nome do procurador ou escritório"
                                />
                            </div>
                            {[
                                ['filingDate', 'Data do depósito'],
                                ['concessionDate', 'Data da concessão'],
                                ['expirationDate', 'Vigência até'],
                                ['certificateDate', 'Data do certificado']
                            ].map(([field, label]) => (
                                <div key={field}>
                                    <FieldLabel>{label}</FieldLabel>
                                    <input
                                        type="date"
                                        value={formData[field as keyof typeof formData] as string}
                                        onChange={event => setFormData(current => ({ ...current, [field]: event.target.value }))}
                                        className={inputClass}
                                    />
                                </div>
                            ))}
                        </Section>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" role="alert">
                                {error}
                            </div>
                        )}
                    </div>

                    <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-zinc-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950">
                        <p className="flex items-center gap-2 text-[11px] text-zinc-500">
                            <Eye size={13} className="text-emerald-600" /> Alterações marcadas como Portal do Cliente aparecem após salvar.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex min-w-40 items-center justify-center gap-2 rounded-xl bg-[#0412dd] px-5 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-blue-600"
                            >
                                {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                {isLoading ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AsteryskoEditProcessModal;
