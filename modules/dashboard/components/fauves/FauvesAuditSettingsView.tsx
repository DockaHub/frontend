import React, { useEffect, useState } from 'react';
import { CheckCircle2, Database, KeyRound, Loader2, RefreshCw, ServerCog, ShieldCheck } from 'lucide-react';
import { fauvesService } from '../../../../services/fauvesService';
import { PageHeader, Panel, SecondaryButton } from './FauvesUI';

const FauvesAuditSettingsView: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'operational' | 'offline'>('loading');
    const [checkedAt, setCheckedAt] = useState<Date | null>(null);

    const checkConnection = async () => {
        setStatus('loading');
        try {
            await fauvesService.getManagementData('users', 1, 1);
            setStatus('operational');
        } catch {
            setStatus('offline');
        } finally {
            setCheckedAt(new Date());
        }
    };

    useEffect(() => { void checkConnection(); }, []);

    return <div className="animate-in fade-in duration-500">
        <PageHeader eyebrow="Integrações" title="Configurações da Fauves" description="Saúde e segurança da conexão administrativa entre ManySpace e Fauves." actions={<SecondaryButton onClick={() => void checkConnection()} disabled={status === 'loading'}><RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} /> Testar conexão</SecondaryButton>} />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <Panel className="p-6">
                <div className="flex items-start justify-between gap-5"><div className="flex items-start gap-3"><div className={`rounded-xl p-3 ${status === 'operational' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : status === 'offline' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800'}`}>{status === 'loading' ? <Loader2 size={20} className="animate-spin" /> : status === 'operational' ? <CheckCircle2 size={20} /> : <ServerCog size={20} />}</div><div><h2 className="text-sm font-bold text-slate-900 dark:text-white">API administrativa</h2><p className="mt-1 text-xs leading-5 text-slate-500">{status === 'loading' ? 'Validando autenticação e leitura de dados…' : status === 'operational' ? 'Conexão autenticada e acesso aos dados confirmado.' : 'A conexão não respondeu com uma credencial administrativa válida.'}</p></div></div><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${status === 'operational' ? 'bg-emerald-100 text-emerald-700' : status === 'offline' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>{status === 'operational' ? 'Operacional' : status === 'offline' ? 'Indisponível' : 'Testando'}</span></div>
                {checkedAt && <p className="mt-6 border-t border-slate-100 pt-4 text-[10px] text-slate-400 dark:border-zinc-800">Última verificação: {checkedAt.toLocaleString('pt-BR')}</p>}
            </Panel>
            <div className="space-y-6">
                <Panel className="p-6"><ShieldCheck size={21} className="text-teal-600" /><h2 className="mt-5 text-sm font-bold text-slate-900 dark:text-white">Credencial protegida</h2><p className="mt-2 text-xs leading-6 text-slate-500">A chave Fauves agora permanece no backend. O navegador envia apenas a sessão autenticada do ManySpace.</p></Panel>
                <Panel className="p-6"><div className="flex gap-3 text-slate-400"><Database size={19} /><KeyRound size={19} /></div><h2 className="mt-5 text-sm font-bold text-slate-900 dark:text-white">Audit Trail</h2><p className="mt-2 text-xs leading-6 text-slate-500">A área foi ocultada enquanto a API Fauves não expõe um endpoint global de auditoria. Ela poderá ser reativada quando o contrato estiver disponível.</p></Panel>
            </div>
        </div>
    </div>;
};

export default FauvesAuditSettingsView;
