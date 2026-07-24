import React, { useState } from 'react';
import { X, AlertOctagon, Loader2 } from 'lucide-react';
import api from '../../../../../services/api';

interface Props {
    isOpen: boolean;
    opportunityId: string | null;
    brandName?: string;
    onClose: () => void;
    onDiscarded: () => void;
}

const DISCARD_REASONS = [
    { id: 'marca_ja_protegida', label: 'Marca já protegida' },
    { id: 'conflito_relevante', label: 'Conflito relevante no INPI' },
    { id: 'marca_generica', label: 'Marca genérica / descritiva' },
    { id: 'empresa_inativa', label: 'Empresa inativa / baixada' },
    { id: 'empresa_duplicada', label: 'Empresa duplicada' },
    { id: 'contato_nao_encontrado', label: 'Contato não encontrado' },
    { id: 'baixo_potencial_comercial', label: 'Baixo potencial comercial' },
    { id: 'segmento_nao_atendido', label: 'Segmento não atendido' },
    { id: 'ja_e_cliente', label: 'Já é cliente Asterysko' },
    { id: 'ja_existe_lead', label: 'Já existe lead no CRM' },
    { id: 'nao_abordar', label: 'Solicitação de Não Contatar' },
    { id: 'outro', label: 'Outro motivo' }
];

export const AsteryskoDiscardModal: React.FC<Props> = ({ isOpen, opportunityId, brandName, onClose, onDiscarded }) => {
    const [reason, setReason] = useState(DISCARD_REASONS[0].id);
    const [notes, setNotes] = useState('');
    const [setDoNotContact, setSetDoNotContact] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !opportunityId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/asterysko/opportunities/${opportunityId}/discard`, {
                reason,
                notes: notes.trim() || undefined,
                setDoNotContact
            });
            alert('Oportunidade descartada com sucesso.');
            onDiscarded();
            onClose();
        } catch (error: any) {
            console.error('Failed to discard opportunity', error);
            alert(error.response?.data?.error || 'Falha ao descartar oportunidade.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <AlertOctagon size={22} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                Descartar Oportunidade
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                {brandName || 'Oportunidade selecionada'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                            Motivo do Descarte <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                            {DISCARD_REASONS.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                            Observações do Descarte (Opcional)
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Detalhes explicativos sobre a razão do descarte..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="doNotContactCheck"
                            checked={setDoNotContact}
                            onChange={(e) => setSetDoNotContact(e.target.checked)}
                            className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="doNotContactCheck" className="text-xs text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer">
                            <span className="font-bold block text-zinc-900 dark:text-white">Marcar como "Não Contatar"</span>
                            Bloqueia o envio ao CRM e protege a oportunidade contra abordagens futuras.
                        </label>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                            Confirmar Descarte
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
