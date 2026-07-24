import React, { useState } from 'react';
import { X, Send, Loader2, CheckCircle2, ExternalLink, ShieldCheck, Building2 } from 'lucide-react';
import api from '../../../../../services/api';

interface Props {
    isOpen: boolean;
    opportunity: any;
    onClose: () => void;
    onSentToCrm: (deal: any) => void;
}

export const AsteryskoSendToCrmModal: React.FC<Props> = ({ isOpen, opportunity, onClose, onSentToCrm }) => {
    const [loading, setLoading] = useState(false);
    const [createdDeal, setCreatedDeal] = useState<any>(null);

    if (!isOpen || !opportunity) return null;

    const handleSend = async () => {
        setLoading(true);
        try {
            const { data } = await api.post(`/asterysko/opportunities/${opportunity.id}/send-to-crm`);
            setCreatedDeal(data.deal);
            onSentToCrm(data.deal);
        } catch (error: any) {
            console.error('Failed to send opportunity to CRM', error);
            alert(error.response?.data?.error || 'Falha ao enviar oportunidade ao CRM.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0412dd] text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Send size={20} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0412dd] dark:text-[#3b48ff]">
                                Converter em Lead Comercial
                            </span>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                Enviar ao CRM
                            </h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {createdDeal ? (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Lead Criado com Sucesso!
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                                    A oportunidade <span className="font-bold text-zinc-800 dark:text-zinc-200">{opportunity.code}</span> foi convertida no lead comercial <span className="font-bold text-[#0412dd] dark:text-[#3b48ff]">{createdDeal.title}</span> na etapa <span className="font-bold">Novos Leads</span> com origem <span className="font-bold text-emerald-600">Radar</span>.
                                </p>
                            </div>
                            <div className="pt-2 flex items-center justify-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Fechar
                                </button>
                                <a
                                    href="/crm?view=commercial"
                                    className="px-5 py-2.5 rounded-xl bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    Abrir Lead no CRM <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                    <Building2 size={14} /> Resumo dos Dados Transferidos
                                </h4>
                                <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                                    <p><span className="font-semibold text-zinc-900 dark:text-white">Marca:</span> {opportunity.brandName}</p>
                                    {opportunity.companyName && <p><span className="font-semibold text-zinc-900 dark:text-white">Empresa:</span> {opportunity.companyName}</p>}
                                    {opportunity.cnpj && <p><span className="font-semibold text-zinc-900 dark:text-white">CNPJ:</span> {opportunity.cnpj}</p>}
                                    {opportunity.segment && <p><span className="font-semibold text-zinc-900 dark:text-white">Segmento:</span> {opportunity.segment}</p>}
                                    {opportunity.city && <p><span className="font-semibold text-zinc-900 dark:text-white">Localização:</span> {opportunity.city}/{opportunity.state}</p>}
                                    <p><span className="font-semibold text-zinc-900 dark:text-white">Etapa de Destino:</span> <span className="font-bold text-blue-600 dark:text-blue-400">Novos Leads</span> (Comercial)</p>
                                    <p><span className="font-semibold text-zinc-900 dark:text-white">Origem do Lead:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">Radar</span></p>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                                <ShieldCheck size={18} className="shrink-0 text-[#0412dd] dark:text-[#3b48ff] mt-0.5" />
                                <div>
                                    <p className="font-bold">Operação Idempotente & Segura</p>
                                    <p className="mt-0.5">Esta ação cria apenas o lead no CRM. Não gera cliente, processo no INPI, contrato ou fatura automaticamente.</p>
                                </div>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-xl bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                    Confirmar Envio ao CRM
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
