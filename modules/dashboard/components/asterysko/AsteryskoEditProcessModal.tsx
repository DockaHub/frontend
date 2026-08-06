import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../../../services/api';

interface Process {
    id: string;
    inpiProcessNumber?: string;
    status: string;
    procurator?: string;
    filingDate?: string;
    concessionDate?: string;
    expirationDate?: string;
    brand?: {
        name?: string;
        nclClasses?: string[];
    };
}

interface Props {
    isOpen: boolean;
    process: Process | null;
    onClose: () => void;
    onSuccess: () => void;
}

const STATUS_OPTIONS = [
    { value: 'NEW', label: 'Novo' },
    { value: 'WAITING_PAYMENT', label: 'Aguardando Pagamento' },
    { value: 'PAID', label: 'Pago' },
    { value: 'FILED', label: 'Protocolado (RPI)' },
    { value: 'EXAMINATION', label: 'Exame de Mérito' },
    { value: 'OPPOSITION', label: 'Oposição / Exigência' },
    { value: 'GRANTED', label: 'Deferido' },
    { value: 'ARCHIVED', label: 'Arquivado' },
    { value: 'CANCELLED', label: 'Cancelado' }
];

const AsteryskoEditProcessModal: React.FC<Props> = ({ isOpen, process, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        brandName: '',
        inpiProcessNumber: '',
        status: 'NEW',
        nclClass: '1',
        procurator: '',
        filingDate: '',
        concessionDate: '',
        expirationDate: ''
    });

    useEffect(() => {
        if (process) {
            setFormData({
                brandName: process.brand?.name || '',
                inpiProcessNumber: process.inpiProcessNumber || '',
                status: process.status || 'NEW',
                nclClass: process.brand?.nclClasses?.[0] || '1',
                procurator: process.procurator || '',
                filingDate: process.filingDate ? new Date(process.filingDate).toISOString().substring(0, 10) : '',
                concessionDate: process.concessionDate ? new Date(process.concessionDate).toISOString().substring(0, 10) : '',
                expirationDate: process.expirationDate ? new Date(process.expirationDate).toISOString().substring(0, 10) : ''
            });
        }
    }, [process]);

    if (!isOpen || !process) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.put(`/asterysko/processes/${process.id}`, {
                brandName: formData.brandName,
                inpiProcessNumber: formData.inpiProcessNumber || null,
                status: formData.status,
                nclClass: formData.nclClass,
                procurator: formData.procurator || null,
                filingDate: formData.filingDate || null,
                concessionDate: formData.concessionDate || null,
                expirationDate: formData.expirationDate || null
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update process', error);
            alert('Erro ao atualizar dados do processo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-season text-lg font-semibold text-zinc-900 dark:text-white">
                        Editar Processo
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                    <div>
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                            Nome da Marca
                        </label>
                        <input
                            type="text"
                            value={formData.brandName}
                            onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none focus:border-[#0412dd] dark:focus:border-blue-500 transition-colors"
                            placeholder="Ex: Asterysko Tech"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                                Número INPI
                            </label>
                            <input
                                type="text"
                                value={formData.inpiProcessNumber}
                                onChange={(e) => setFormData({ ...formData, inpiProcessNumber: e.target.value })}
                                className="w-full px-3 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none focus:border-[#0412dd] dark:focus:border-blue-500 transition-colors"
                                placeholder="928374610"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                                Classe de Nice (NCL)
                            </label>
                            <select
                                value={formData.nclClass}
                                onChange={(e) => setFormData({ ...formData, nclClass: e.target.value })}
                                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none focus:border-[#0412dd] dark:focus:border-blue-500 transition-colors"
                            >
                                {Array.from({ length: 45 }, (_, i) => (
                                    <option key={i + 1} value={`${i + 1}`}>
                                        NCL {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                            Status do Processo
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 text-sm font-semibold bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none focus:border-[#0412dd] dark:focus:border-blue-500 transition-colors"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                            Procurador Responsável
                        </label>
                        <input
                            type="text"
                            value={formData.procurator}
                            onChange={(e) => setFormData({ ...formData, procurator: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none focus:border-[#0412dd] dark:focus:border-blue-500 transition-colors"
                            placeholder="Nome do procurador / advogado"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                                Data Depósito
                            </label>
                            <input
                                type="date"
                                value={formData.filingDate}
                                onChange={(e) => setFormData({ ...formData, filingDate: e.target.value })}
                                className="w-full px-2 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                                Data Concessão
                            </label>
                            <input
                                type="date"
                                value={formData.concessionDate}
                                onChange={(e) => setFormData({ ...formData, concessionDate: e.target.value })}
                                className="w-full px-2 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                                Data Expiração
                            </label>
                            <input
                                type="date"
                                value={formData.expirationDate}
                                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                className="w-full px-2 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-[#0412dd] dark:bg-[#3b48ff] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isLoading && <Loader2 size={14} className="animate-spin" />}
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AsteryskoEditProcessModal;
