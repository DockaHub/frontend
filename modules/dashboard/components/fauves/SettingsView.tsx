
import React, { useState, useEffect } from 'react';
import { Save, Globe, Database, ShieldCheck, AlertCircle, RotateCw } from 'lucide-react';
import { Organization } from '../../../../types';
import OrganizationIconSettings from '../../../../components/OrganizationIconSettings';

interface SettingsViewProps {
    organization?: Organization;
}

const SettingsView: React.FC<SettingsViewProps> = ({ organization }) => {
    const [apiUrl, setApiUrl] = useState('');
    const [apiToken, setApiToken] = useState('');
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const savedUrl = localStorage.getItem('FAUVES_DYNAMIC_API_URL');
        const envUrl = import.meta.env.VITE_FAUVES_API_URL || '';

        // Only use the Vite ENV URL if there's nothing in localStorage AND it's not the stale one
        const initialUrl = savedUrl || (envUrl.includes('fauves-api-production') ? '' : envUrl);

        const savedToken = localStorage.getItem('FAUVES_DYNAMIC_API_TOKEN') || '';
        setApiUrl(initialUrl);
        setApiToken(savedToken);
    }, []);

    const handleSave = () => {
        if (apiUrl.trim()) {
            localStorage.setItem('FAUVES_DYNAMIC_API_URL', apiUrl.trim());
        } else {
            localStorage.removeItem('FAUVES_DYNAMIC_API_URL');
        }

        if (apiToken.trim()) {
            localStorage.setItem('FAUVES_DYNAMIC_API_TOKEN', apiToken.trim());
        } else {
            localStorage.removeItem('FAUVES_DYNAMIC_API_TOKEN');
        }

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
        // Reload to apply changes across components
        window.location.reload();
    };

    const testConnection = async () => {
        setIsTestLoading(true);
        setTestResult(null);
        try {
            let processedApiUrl = apiUrl.trim();
            if (processedApiUrl.endsWith('/')) processedApiUrl = processedApiUrl.slice(0, -1);
            if (!processedApiUrl.toLowerCase().endsWith('/api')) processedApiUrl += '/api';

            const response = await fetch(`${processedApiUrl}/events`, {
                headers: {
                    'Authorization': `Bearer ${apiToken || localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                setTestResult({ success: true, message: 'Conexão estabelecida com sucesso!' });
            } else {
                setTestResult({ success: false, message: `Erro na API: ${response.status} ${response.statusText}` });
            }
        } catch (error) {
            setTestResult({ success: false, message: 'Não foi possível alcançar o servidor. Verifique a URL e o CORS.' });
        } finally {
            setIsTestLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-300 max-w-4xl space-y-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Configurações da Plataforma</h1>
                <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie a identidade visual e a conexão com o servidor remoto do Fauves.</p>
            </div>

            <div className="space-y-8">
                {/* Organization Icon Settings */}
                {organization && (
                    <OrganizationIconSettings organization={organization} />
                )}

                {/* API Connection Card */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-docka-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-800/50">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100">Conexão com a API</h3>
                            <p className="text-xs text-docka-500 dark:text-zinc-500">Defina o endpoint principal e credenciais para busca de dados.</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">URL Base da API</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Database size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                    <input
                                        type="text"
                                        value={apiUrl}
                                        onChange={(e) => setApiUrl(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 text-docka-900 dark:text-zinc-100 transition-colors"
                                        placeholder="Deixe vazio para usar o Proxy (Recomendado)"
                                    />
                                </div>
                                <button
                                    onClick={testConnection}
                                    disabled={isTestLoading}
                                    className="px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {isTestLoading ? <RotateCw size={14} className="animate-spin" /> : 'Testar'}
                                </button>
                            </div>
                            <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-2 italic">
                                **Recomendação:** Deixe este campo vazio para usar o proxy do backend da Docka. Isso resolve problemas de CORS e URLs desatualizadas.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Token de Acesso Admin (Bearer)</label>
                            <div className="relative">
                                <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <input
                                    type="password"
                                    value={apiToken}
                                    onChange={(e) => setApiToken(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 text-docka-900 dark:text-zinc-100 transition-colors"
                                    placeholder="Cole aqui seu token JWT de longa duração"
                                />
                            </div>
                            <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-2 italic">
                                Este token é obrigatório para acessar dados protegidos (Usuários, Vendas, etc).
                            </p>
                        </div>

                        {testResult && (
                            <div className={`p-3 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${testResult.success ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20' : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/20'}`}>
                                {testResult.success ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                                <span className="text-xs font-medium">{testResult.message}</span>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-docka-50/50 dark:bg-zinc-800/50 border-t border-docka-100 dark:border-zinc-800 flex justify-end">
                        <button
                            onClick={handleSave}
                            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isSaved ? 'bg-emerald-500 text-white' : 'bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:bg-docka-800'}`}
                        >
                            <Save size={16} /> {isSaved ? 'Configurações Salvas!' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-4 flex gap-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg h-fit">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Atenção com o CORS</h4>
                        <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                            Para que a conexão funcione, o servidor da API deve permitir requisições originadas de <strong>http://localhost:5173</strong> (ou do seu domínio de produção). Certifique-se de configurar os cabeçalhos CORS no seu backend no Railway.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
