import React, { useState } from 'react';
import { X, Loader2, AlertTriangle, Building2, Globe, Tag } from 'lucide-react';
import api from '../../../../../services/api';
import {
    AsteryskoOpportunity,
    DuplicateWarning,
    getApiErrorMessage
} from './asteryskoApiTypes';

interface Props {
    isOpen: boolean;
    organizationId?: string;
    onClose: () => void;
    onCreated: (newOpp: AsteryskoOpportunity) => void;
}



export const AsteryskoNewOpportunityModal: React.FC<Props> = ({ isOpen, organizationId, onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
    const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

    const [brandName, setBrandName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [tradeName, setTradeName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [segment, setSegment] = useState('');
    const [website, setWebsite] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [priority, setPriority] = useState('medium');
    const [summary, setSummary] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [sourceType, setSourceType] = useState('manual');

    if (!isOpen) return null;

    const handleCheckDuplicate = async () => {
        if (!organizationId || (!brandName.trim() && !cnpj.trim() && !website.trim())) return;
        setCheckingDuplicate(true);
        try {
            const { data } = await api.post<DuplicateWarning>('/asterysko/opportunities/check-duplicate', {
                brandName,
                cnpj,
                website
            }, {
                headers: { 'x-organization-id': organizationId }
            });
            if (data?.hasDuplicates) {
                setDuplicateWarning(data);
            } else {
                setDuplicateWarning(null);
            }
        } catch (err) {
            console.error('Failed to check duplicate', err);
        } finally {
            setCheckingDuplicate(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandName.trim()) {
            alert('Por favor, informe o nome da marca.');
            return;
        }
        if (!organizationId) {
            alert('Selecione a organização antes de criar uma oportunidade.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post<AsteryskoOpportunity>('/asterysko/opportunities', {
                brandName: brandName.trim(),
                companyName: companyName.trim() || undefined,
                tradeName: tradeName.trim() || undefined,
                cnpj: cnpj.trim() || undefined,
                segment: segment.trim() || undefined,
                website: website.trim() || undefined,
                city: city.trim() || undefined,
                state: state.trim().toUpperCase() || undefined,
                priority,
                summary: summary.trim() || undefined,
                internalNotes: internalNotes.trim() || undefined,
                sourceType
            }, {
                headers: { 'x-organization-id': organizationId }
            });

            alert(`Oportunidade ${data.code} criada com sucesso em "Para analisar"!`);
            onCreated(data);
            onClose();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Falha ao criar oportunidade.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0412dd] dark:text-[#3b48ff]">
                            Cadastrar Oportunidade Manual
                        </span>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
                            Nova Oportunidade de Prospecção
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Este formulário cria um registro no status <span className="font-semibold text-amber-600 dark:text-amber-400">Para analisar</span>. Não cria lead ou cliente no CRM.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Alerta de duplicidade */}
                    {duplicateWarning?.hasDuplicates && (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
                            <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                                <p className="font-bold">Possível duplicidade identificada:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    {duplicateWarning.warnings.map((warning: any, idx: number) => (
                                        <li key={idx}>{warning.message}</li>
                                    ))}
                                </ul>
                                <p className="mt-2 font-medium text-[11px]">Você pode ajustar os dados ou prosseguir caso trate-se de uma oportunidade diferente.</p>
                            </div>
                        </div>
                    )}

                    {/* Bloco Marca & Identificação Principal */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                            <Building2 size={14} /> Identificação Principal
                        </h3>
                        
                        <div>
                            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                Nome da Marca <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                onBlur={handleCheckDuplicate}
                                placeholder="Ex: Asterysko, Nexus Tech..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd] transition-all"
                            />
                            {checkingDuplicate && (
                                <p className="mt-1 text-[11px] text-zinc-500 flex items-center gap-1">
                                    <Loader2 size={11} className="animate-spin" /> Verificando duplicidade...
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                    Razão Social
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Ex: Nexus Tecnologia LTDA"
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                    Nome Fantasia
                                </label>
                                <input
                                    type="text"
                                    value={tradeName}
                                    onChange={(e) => setTradeName(e.target.value)}
                                    placeholder="Ex: Nexus Soluções"
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                    CNPJ (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(e.target.value)}
                                    onBlur={handleCheckDuplicate}
                                    placeholder="00.000.000/0000-00"
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                    Segmento / Ramo de Atuação
                                </label>
                                <input
                                    type="text"
                                    value={segment}
                                    onChange={(e) => setSegment(e.target.value)}
                                    placeholder="Ex: Software SaaS, Vestuário, Saúde..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Presença Digital & Localização */}
                    <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                            <Globe size={14} /> Presença Digital & Localização
                        </h3>

                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                Website / Domínio
                            </label>
                            <input
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                onBlur={handleCheckDuplicate}
                                placeholder="https://empresa.com.br"
                                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                    Cidade
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Ex: São Paulo"
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                    Estado (UF)
                                </label>
                                <input
                                    type="text"
                                    maxLength={2}
                                    value={state}
                                    onChange={(e) => setState(e.target.value.toUpperCase())}
                                    placeholder="SP"
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold uppercase text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Classificação e Notas */}
                    <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                            <Tag size={14} /> Classificação & Observações
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                    Prioridade
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                                >
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                    Tipo da Origem
                                </label>
                                <select
                                    value={sourceType}
                                    onChange={(e) => setSourceType(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                                >
                                    <option value="manual">Manual</option>
                                    <option value="importacao">Importação</option>
                                    <option value="indicacao">Indicação</option>
                                    <option value="motor">Motor de Captação (Reservado)</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                Resumo / Contexto da Oportunidade
                            </label>
                            <textarea
                                rows={2}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Breve contexto explicativo..."
                                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                Notas internas
                            </label>
                            <textarea
                                rows={2}
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                placeholder="Observações restritas à equipe interna..."
                                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                            />
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-[#0412dd] dark:bg-[#3b48ff] text-white text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                            Salvar Oportunidade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
