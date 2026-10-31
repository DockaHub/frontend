import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import api from '../../../../../services/api';
import { AsteryskoOpportunity, DuplicateWarning, getApiErrorMessage } from './asteryskoApiTypes';

interface Props {
    isOpen: boolean;
    organizationId?: string;
    onClose: () => void;
    onCreated: (contact: AsteryskoOpportunity) => void;
}

const emptyForm = {
    contactName: '', contactRole: '', contactEmail: '', contactPhone: '',
    brandName: '', companyName: '', website: '',
    sourceType: 'prospeccao_ativa', internalNotes: '',
};

export const AsteryskoNewOpportunityModal: React.FC<Props> = ({ isOpen, organizationId, onClose, onCreated }) => {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
    const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);

    useEffect(() => {
        if (isOpen) { setForm(emptyForm); setDuplicateWarning(null); }
    }, [isOpen]);

    if (!isOpen) return null;

    const updateField = (field: keyof typeof emptyForm, value: string) => {
        setForm(current => ({ ...current, [field]: value }));
    };

    const checkDuplicate = async () => {
        if (!organizationId || !form.brandName.trim()) return;
        setCheckingDuplicate(true);
        try {
            const { data } = await api.post<DuplicateWarning>('/asterysko/opportunities/check-duplicate', {
                brandName: form.brandName.trim(), website: form.website.trim() || undefined,
            }, { headers: { 'x-organization-id': organizationId } });
            setDuplicateWarning(data?.hasDuplicates ? data : null);
        } catch { setDuplicateWarning(null); }
        finally { setCheckingDuplicate(false); }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!organizationId || !form.contactName.trim() || !form.brandName.trim()) return;
        setLoading(true);
        try {
            const { data } = await api.post<AsteryskoOpportunity>('/asterysko/opportunities', {
                ...form,
                contactName: form.contactName.trim(),
                contactRole: form.contactRole.trim() || undefined,
                contactEmail: form.contactEmail.trim() || undefined,
                contactPhone: form.contactPhone.trim() || undefined,
                brandName: form.brandName.trim(),
                companyName: form.companyName.trim() || undefined,
                website: form.website.trim() || undefined,
                internalNotes: form.internalNotes.trim() || undefined,
                status: 'review', sourceName: 'Prospecção ativa',
            }, { headers: { 'x-organization-id': organizationId } });
            onCreated(data);
            onClose();
        } catch (error: unknown) {
            window.alert(getApiErrorMessage(error, 'Não foi possível salvar o contato.'));
        } finally { setLoading(false); }
    };

    const inputClass = 'w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-[#0412dd] focus:ring-2 focus:ring-[#0412dd]/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-start justify-between border-b border-zinc-100 p-5 dark:border-zinc-800 sm:p-6">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#0412dd] dark:text-[#3b48ff]">Prospecção ativa</p>
                        <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">Novo contato</h2>
                        <p className="mt-1 text-xs text-zinc-500">Cadastre somente o necessário. O contato ainda não será um lead comercial.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800" aria-label="Fechar"><X size={19} /></button>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto p-5 sm:p-6">
                    {duplicateWarning?.hasDuplicates && (
                        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                            <div><p className="font-bold">Possível cadastro duplicado</p>{duplicateWarning.warnings.map((warning, index) => <p key={index} className="mt-1">{warning.message}</p>)}</div>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="sm:col-span-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nome do contato <span className="text-rose-500">*</span><input required value={form.contactName} onChange={event => updateField('contactName', event.target.value)} placeholder="Nome e sobrenome" className={`${inputClass} mt-1.5`} autoFocus /></label>
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Cargo<input value={form.contactRole} onChange={event => updateField('contactRole', event.target.value)} placeholder="Ex.: Sócio, diretora" className={`${inputClass} mt-1.5`} /></label>
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Telefone / WhatsApp<input value={form.contactPhone} onChange={event => updateField('contactPhone', event.target.value)} placeholder="(85) 99999-9999" className={`${inputClass} mt-1.5`} /></label>
                        <label className="sm:col-span-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">E-mail<input type="email" value={form.contactEmail} onChange={event => updateField('contactEmail', event.target.value)} placeholder="contato@empresa.com.br" className={`${inputClass} mt-1.5`} /></label>
                    </div>

                    <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="sm:col-span-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Empresa ou marca <span className="text-rose-500">*</span><div className="relative mt-1.5"><input required value={form.brandName} onChange={event => updateField('brandName', event.target.value)} onBlur={checkDuplicate} placeholder="Nome usado comercialmente" className={inputClass} />{checkingDuplicate && <Loader2 size={15} className="absolute right-3 top-3 animate-spin text-zinc-400" />}</div></label>
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Razão social<input value={form.companyName} onChange={event => updateField('companyName', event.target.value)} placeholder="Opcional" className={`${inputClass} mt-1.5`} /></label>
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Origem<select value={form.sourceType} onChange={event => updateField('sourceType', event.target.value)} className={`${inputClass} mt-1.5`}><option value="prospeccao_ativa">Prospecção ativa</option><option value="indicacao">Indicação</option><option value="importacao">Importação manual</option><option value="outro">Outro</option></select></label>
                            <label className="sm:col-span-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Site<input type="url" value={form.website} onChange={event => updateField('website', event.target.value)} onBlur={checkDuplicate} placeholder="https://empresa.com.br" className={`${inputClass} mt-1.5`} /></label>
                            <label className="sm:col-span-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Observações<textarea rows={3} value={form.internalNotes} onChange={event => updateField('internalNotes', event.target.value)} placeholder="Contexto útil para a abordagem" className={`${inputClass} mt-1.5 resize-none`} /></label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                        <button type="button" onClick={onClose} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">Cancelar</button>
                        <button type="submit" disabled={loading || !organizationId} className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-[#0412dd] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-[#3b48ff]">{loading && <Loader2 size={15} className="animate-spin" />}Salvar contato</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
