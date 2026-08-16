import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Hash, Loader2, Lock, MessageSquare, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { Organization } from '../../../../types';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';

type SlackEventType = 'NEW_LEAD' | 'LEAD_ASSIGNED' | 'CONTRACT_SIGNED' | 'PAYMENT_CONFIRMED' | 'PROCESS_UPDATED';

interface SlackEventDefinition {
    id: SlackEventType;
    label: string;
    description: string;
}

interface SlackChannel {
    id: string;
    name: string;
    isPrivate: boolean;
    isMember: boolean;
}

interface SlackSettingsResponse {
    enabled: boolean;
    channelId: string;
    channelName: string;
    events: Record<SlackEventType, boolean>;
    tokenConfigured: boolean;
    connection: {
        ok: boolean;
        workspace?: string;
        botName?: string;
        error?: string;
    };
    eventDefinitions: SlackEventDefinition[];
}

const SlackMark = () => (
    <div className="grid grid-cols-2 gap-0.5 rotate-6" aria-hidden="true">
        <span className="w-2.5 h-4 bg-[#36C5F0] rounded-full" />
        <span className="w-4 h-2.5 mt-1.5 bg-[#2EB67D] rounded-full" />
        <span className="w-4 h-2.5 ml-[-0.35rem] bg-[#E01E5A] rounded-full" />
        <span className="w-2.5 h-4 mt-[-0.35rem] bg-[#ECB22E] rounded-full" />
    </div>
);

const SlackIntegrationSettings: React.FC<{ organization: Organization }> = ({ organization }) => {
    const { addToast } = useToast();
    const [settings, setSettings] = useState<SlackSettingsResponse | null>(null);
    const [channels, setChannels] = useState<SlackChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    const endpoint = `/slack/organizations/${organization.id}`;

    const errorMessage = (error: any, fallback: string) => error?.response?.data?.error || fallback;

    const loadChannels = async () => {
        setLoadingChannels(true);
        try {
            const response = await api.get<SlackChannel[]>(`${endpoint}/channels`);
            setChannels(response.data);
        } catch (error) {
            setChannels([]);
            addToast({ type: 'error', title: 'Canais indisponíveis', message: errorMessage(error, 'Não foi possível listar os canais do Slack.') });
        } finally {
            setLoadingChannels(false);
        }
    };

    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get<SlackSettingsResponse>(`${endpoint}/settings`);
            setSettings(response.data);
            if (response.data.tokenConfigured && response.data.connection.ok) {
                await loadChannels();
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Slack não carregado', message: errorMessage(error, 'Não foi possível carregar a configuração.') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadSettings();
    }, [organization.id]);

    const selectedChannel = useMemo(
        () => channels.find(channel => channel.id === settings?.channelId),
        [channels, settings?.channelId],
    );

    const setChannel = (channelId: string) => {
        const channel = channels.find(item => item.id === channelId);
        setSettings(current => current ? {
            ...current,
            channelId,
            channelName: channel?.name || '',
        } : current);
    };

    const toggleEvent = (event: SlackEventType) => {
        setSettings(current => current ? {
            ...current,
            events: { ...current.events, [event]: !current.events[event] },
        } : current);
    };

    const save = async () => {
        if (!settings) return;
        if (settings.enabled && !settings.channelId) {
            addToast({ type: 'warning', title: 'Selecione um canal', message: 'Escolha onde o Manyways Hub publicará as notificações.' });
            return;
        }
        setSaving(true);
        try {
            await api.put(`${endpoint}/settings`, {
                enabled: settings.enabled,
                channelId: settings.channelId,
                channelName: settings.channelName,
                events: settings.events,
            });
            addToast({ type: 'success', title: 'Integração salva', message: 'As regras de notificação do Slack foram atualizadas.' });
        } catch (error) {
            addToast({ type: 'error', title: 'Erro ao salvar', message: errorMessage(error, 'Não foi possível salvar a integração.') });
        } finally {
            setSaving(false);
        }
    };

    const test = async () => {
        if (!settings?.channelId) {
            addToast({ type: 'warning', title: 'Selecione um canal', message: 'Escolha o canal antes de enviar o teste.' });
            return;
        }
        setTesting(true);
        try {
            await api.post(`${endpoint}/test`, { channelId: settings.channelId });
            addToast({ type: 'success', title: 'Mensagem enviada', message: `Verifique o canal #${settings.channelName || selectedChannel?.name}.` });
        } catch (error) {
            addToast({ type: 'error', title: 'Teste não enviado', message: errorMessage(error, 'Confira se o bot foi convidado para o canal.') });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-8 flex items-center justify-center gap-3 text-sm text-docka-500 dark:text-zinc-400">
                <Loader2 size={18} className="animate-spin" /> Verificando conexão com o Slack...
            </div>
        );
    }

    if (!settings) return null;

    const connected = settings.tokenConfigured && settings.connection.ok;

    return (
        <section className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 sm:px-6 py-5 border-b border-docka-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-800/30">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-950 border border-docka-200 dark:border-zinc-700 shadow-sm flex items-center justify-center shrink-0">
                        <SlackMark />
                    </div>
                    <div>
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100">Slack da Manyways</h3>
                        <p className="text-xs text-docka-500 dark:text-zinc-400 mt-0.5">Notificações internas, sem expor dados de contato dos clientes.</p>
                    </div>
                </div>
                <div className={`w-fit inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${connected
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'}`}>
                    {connected ? <Check size={13} /> : <AlertTriangle size={13} />}
                    {connected ? `Conectado${settings.connection.workspace ? ` · ${settings.connection.workspace}` : ''}` : 'Aguardando token'}
                </div>
            </div>

            <div className="p-5 sm:p-7 space-y-7">
                {!connected && (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/20">
                        <Lock size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Finalize a variável protegida no Railway</p>
                            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                                Adicione o Bot User OAuth Token como <code className="font-mono font-bold">SLACK_BOT_TOKEN</code> no serviço do backend e aguarde o redeploy.
                            </p>
                            {settings.connection.error && <p className="text-xs text-amber-800 dark:text-amber-300 mt-2">{settings.connection.error}</p>}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-5 items-end">
                    <div>
                        <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase tracking-wider mb-2">Canal de destino</label>
                        <div className="relative">
                            <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500 pointer-events-none" />
                            <select
                                value={settings.channelId}
                                onChange={event => setChannel(event.target.value)}
                                disabled={!connected || loadingChannels}
                                className="w-full appearance-none pl-10 pr-4 py-3 bg-white dark:bg-zinc-950 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm text-docka-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 disabled:opacity-60"
                            >
                                <option value="">{loadingChannels ? 'Carregando canais...' : 'Selecione um canal'}</option>
                                {channels.map(channel => (
                                    <option key={channel.id} value={channel.id}>
                                        {channel.name}{channel.isPrivate ? ' · privado' : ''}{!channel.isMember ? ' · convide o bot' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => void loadChannels()}
                            disabled={!connected || loadingChannels}
                            className="px-4 py-3 rounded-xl border border-docka-200 dark:border-zinc-700 text-xs font-bold text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={15} className={loadingChannels ? 'animate-spin' : ''} /> Atualizar canais
                        </button>
                        <button
                            onClick={() => void test()}
                            disabled={!connected || !settings.channelId || testing}
                            className="px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {testing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Enviar teste
                        </button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                            <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Quais eventos devem chegar ao Slack?</h4>
                            <p className="text-xs text-docka-500 dark:text-zinc-400 mt-1">Os detalhes pessoais continuam disponíveis somente no CRM.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {settings.eventDefinitions.map(definition => {
                            const active = settings.events[definition.id];
                            return (
                                <button
                                    type="button"
                                    key={definition.id}
                                    onClick={() => toggleEvent(definition.id)}
                                    className={`text-left p-4 rounded-xl border transition-all ${active
                                        ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/20'
                                        : 'border-docka-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/30 hover:bg-docka-50 dark:hover:bg-zinc-800/50'}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{definition.label}</p>
                                            <p className="text-[11px] text-docka-500 dark:text-zinc-400 mt-1 leading-relaxed">{definition.description}</p>
                                        </div>
                                        <span className={`mt-0.5 w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${active ? 'bg-indigo-600' : 'bg-docka-200 dark:bg-zinc-700'}`}>
                                            <span className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-docka-100 dark:border-zinc-800">
                    <div className="flex items-start gap-2 text-xs text-docka-500 dark:text-zinc-400 max-w-2xl">
                        <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>O token não é exibido nem armazenado no navegador. Falhas no Slack não interrompem o CRM, pagamentos ou processos.</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-docka-700 dark:text-zinc-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enabled}
                                onChange={event => setSettings(current => current ? { ...current, enabled: event.target.checked } : current)}
                                disabled={!connected}
                                className="w-4 h-4 accent-indigo-600"
                            />
                            Integração ativa
                        </label>
                        <button
                            onClick={() => void save()}
                            disabled={!connected || saving}
                            className="px-5 py-2.5 rounded-xl bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:bg-docka-800 dark:hover:bg-white disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />} Salvar Slack
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SlackIntegrationSettings;
