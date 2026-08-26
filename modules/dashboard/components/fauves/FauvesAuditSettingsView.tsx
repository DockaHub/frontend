import React, { useEffect, useMemo, useState } from 'react';
import { Database, KeyRound, Loader2, LockKeyhole, RefreshCw, Save, Settings2, ShieldAlert, UserRound } from 'lucide-react';
import { fauvesService } from '../../../../services/fauvesService';
import { ConfirmAction, dateTime, EmptyState, LoadingState, PageHeader, Panel, PrimaryButton, SearchInput, SecondaryButton, StatusBadge, useFauvesToast } from './FauvesUI';

type AuditLog = { id: string; action?: string; entityType?: string; entityId?: string; actor?: { name?: string; email?: string }; actorName?: string; actorEmail?: string; createdAt?: string; status?: string; ipAddress?: string; metadata?: unknown };

const FauvesAuditSettingsView: React.FC = () => {
    const notify = useFauvesToast();
    const [tab, setTab] = useState<'audit' | 'settings'>('audit');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const [maintenanceConfirm, setMaintenanceConfirm] = useState(false);
    const [settings, setSettings] = useState({ defaultPlatformFeePercent: 0, maintenanceMode: false, efiConfigured: false, resendConfigured: false, r2Configured: false, efiCredential: '', resendCredential: '', r2Credential: '' });

    const load = async () => {
        setLoading(true);
        if (tab === 'audit') {
            try { const response = await fauvesService.getAuditLogs(1, 100); setLogs(response.items as AuditLog[]); }
            catch { setLogs([]); notify('O endpoint de Audit Trail ainda não está disponível na API Fauves.', 'error'); }
        } else {
            try { const response = await fauvesService.getGlobalSettings(); const source = response.data || response.settings || response; setSettings((current) => ({ ...current, defaultPlatformFeePercent: Number(source.defaultPlatformFeePercent ?? source.platformFeePercent ?? 0), maintenanceMode: Boolean(source.maintenanceMode), efiConfigured: Boolean(source.efiConfigured ?? source.integrations?.efi), resendConfigured: Boolean(source.resendConfigured ?? source.integrations?.resend), r2Configured: Boolean(source.r2Configured ?? source.integrations?.r2) })); }
            catch { notify('Os parâmetros globais não foram retornados pela API Fauves.', 'error'); }
        }
        setLoading(false);
    };
    useEffect(() => { void load(); }, [tab]);

    const filtered = useMemo(() => logs.filter((log) => `${log.action} ${log.entityType} ${log.entityId} ${log.actor?.name} ${log.actor?.email} ${log.actorName} ${log.actorEmail}`.toLowerCase().includes(query.toLowerCase())), [logs, query]);

    const save = async (maintenanceMode = settings.maintenanceMode) => {
        setSaving(true);
        try {
            await fauvesService.updateGlobalSettings({ defaultPlatformFeePercent: settings.defaultPlatformFeePercent, maintenanceMode, credentials: { efi: settings.efiCredential || undefined, resend: settings.resendCredential || undefined, r2: settings.r2Credential || undefined } });
            setSettings((current) => ({ ...current, maintenanceMode, efiCredential: '', resendCredential: '', r2Credential: '' }));
            setMaintenanceConfirm(false); notify('Configurações globais atualizadas com registro de auditoria.');
        } catch { notify('A API Fauves recusou a atualização das configurações globais.', 'error'); }
        finally { setSaving(false); }
    };

    const toggleMaintenance = () => {
        if (!settings.maintenanceMode) setMaintenanceConfirm(true);
        else void save(false);
    };

    return <div className="animate-in fade-in duration-500">
        <PageHeader eyebrow="Governança" title="Auditoria & configurações" description="Rastreabilidade das ações internas e parâmetros críticos de toda a plataforma." actions={<SecondaryButton onClick={() => void load()}><RefreshCw size={14} /> Atualizar</SecondaryButton>} />
        <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-zinc-900"><button onClick={() => setTab('audit')} className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === 'audit' ? 'bg-white text-slate-950 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-slate-400'}`}>Audit Trail</button><button onClick={() => setTab('settings')} className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === 'settings' ? 'bg-white text-slate-950 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-slate-400'}`}>Parâmetros globais</button></div>
        {tab === 'audit' ? <Panel className="overflow-hidden"><div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-zinc-800"><SearchInput value={query} onChange={setQuery} placeholder="Buscar ação, entidade ou operador…" /><div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 sm:flex"><LockKeyhole size={14} /> Registro imutável</div></div>{loading ? <LoadingState label="Carregando trilha de auditoria…" /> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:bg-zinc-950/50"><tr><th className="px-5 py-3">Data</th><th className="px-5 py-3">Operador</th><th className="px-5 py-3">Ação</th><th className="px-5 py-3">Entidade</th><th className="px-5 py-3">IP</th><th className="px-5 py-3">Resultado</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-zinc-800">{filtered.map((log, index) => <tr key={log.id || index} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40"><td className="px-5 py-4 font-mono text-[10px] text-slate-500">{dateTime(log.createdAt)}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><div className="rounded-lg bg-slate-100 p-2 dark:bg-zinc-800"><UserRound size={13} /></div><div><strong className="block text-slate-900 dark:text-white">{log.actor?.name || log.actorName || 'Sistema'}</strong><span className="text-[10px] text-slate-400">{log.actor?.email || log.actorEmail}</span></div></div></td><td className="px-5 py-4 font-bold text-teal-700 dark:text-teal-400">{log.action || 'UNKNOWN'}</td><td className="px-5 py-4"><span className="font-semibold">{log.entityType || '—'}</span><span className="ml-2 font-mono text-[9px] text-slate-400">{log.entityId?.slice(0, 10)}</span></td><td className="px-5 py-4 font-mono text-[10px] text-slate-400">{log.ipAddress || '—'}</td><td className="px-5 py-4"><StatusBadge value={log.status || 'approved'} /></td></tr>)}</tbody></table></div> : <EmptyState title="Audit Trail indisponível" description="Nenhum evento de auditoria foi retornado pela API Fauves." />}</Panel> : <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
            <Panel className="p-6"><div className="mb-6 flex items-start gap-3"><Settings2 className="text-teal-500" size={20} /><div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Parâmetros comerciais</h2><p className="mt-1 text-xs text-slate-400">Aplicados quando a produtora não possui configuração individual.</p></div></div>{loading ? <LoadingState /> : <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300">Taxa padrão da plataforma (%)<input type="number" min="0" max="100" step="0.01" value={settings.defaultPlatformFeePercent} onChange={(event) => setSettings({ ...settings, defaultPlatformFeePercent: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950" /></label>}<div className="mt-6 border-t border-slate-100 pt-6 dark:border-zinc-800"><h3 className="text-xs font-bold text-slate-900 dark:text-white">Credenciais de serviços</h3><p className="mt-1 text-[10px] leading-5 text-slate-400">Valores atuais nunca são exibidos. Preencha apenas para substituir uma credencial.</p><div className="mt-4 space-y-3">{[{ key: 'efiCredential' as const, label: 'Efí Bank', configured: settings.efiConfigured }, { key: 'resendCredential' as const, label: 'Resend', configured: settings.resendConfigured }, { key: 'r2Credential' as const, label: 'Cloudflare R2', configured: settings.r2Configured }].map((item) => <label key={item.key} className="block text-xs font-bold"><span className="flex items-center justify-between"><span>{item.label}</span><StatusBadge value={item.configured ? 'verified' : 'pending'} /></span><div className="relative mt-2"><KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="password" value={settings[item.key]} onChange={(event) => setSettings({ ...settings, [item.key]: event.target.value })} placeholder="••••••••••••••••" autoComplete="new-password" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950" /></div></label>)}</div></div><div className="mt-6 flex justify-end"><PrimaryButton disabled={saving} onClick={() => void save()}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar configurações</PrimaryButton></div></Panel>
            <div className="space-y-6"><Panel className="p-6"><Database className="text-cyan-500" size={20} /><h2 className="mt-5 text-sm font-bold text-slate-900 dark:text-white">Segurança dos segredos</h2><p className="mt-2 text-xs leading-6 text-slate-500">As credenciais são enviadas ao backend e não ficam armazenadas no navegador. O formulário volta a ficar vazio após cada salvamento.</p></Panel><Panel className={`border-2 p-6 ${settings.maintenanceMode ? 'border-rose-400 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20' : 'border-slate-200 dark:border-zinc-800'}`}><ShieldAlert className={settings.maintenanceMode ? 'text-rose-500' : 'text-amber-500'} size={22} /><div className="mt-5 flex items-start justify-between gap-4"><div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Modo manutenção</h2><p className="mt-2 text-xs leading-5 text-slate-500">Suspende temporariamente as áreas públicas e operacionais definidas pela API.</p></div><button onClick={toggleMaintenance} disabled={saving} className={`relative h-7 w-12 shrink-0 rounded-full transition ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-200 dark:bg-zinc-700'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${settings.maintenanceMode ? 'left-6' : 'left-1'}`} /></button></div></Panel></div>
        </div>}
        <ConfirmAction open={maintenanceConfirm} onClose={() => setMaintenanceConfirm(false)} onConfirm={() => void save(true)} busy={saving} title="Ativar modo manutenção" description="Esta ação pode interromper vendas, acesso de produtores e experiências públicas, conforme a política configurada no backend." confirmationText="MANUTENÇÃO" />
    </div>;
};

export default FauvesAuditSettingsView;
