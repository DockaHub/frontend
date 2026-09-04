import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    Bot,
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileText,
    Globe,
    HelpCircle,
    Layers,
    Loader2,
    MapPin,
    Play,
    Plus,
    RotateCcw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import api from '../../../../../services/api';
import { getApiErrorMessage, ScoutSearchProfile, ScoutStatus } from './asteryskoApiTypes';

const CITY_PRESETS = [
    { city: 'Fortaleza', state: 'CE' },
    { city: 'São Paulo', state: 'SP' },
    { city: 'Rio de Janeiro', state: 'RJ' },
    { city: 'Belo Horizonte', state: 'MG' },
    { city: 'Curitiba', state: 'PR' },
    { city: 'Porto Alegre', state: 'RS' },
    { city: 'Salvador', state: 'BA' },
    { city: 'Recife', state: 'PE' },
    { city: 'Brasília', state: 'DF' },
    { city: 'Goiânia', state: 'GO' },
    { city: 'Campinas', state: 'SP' },
    { city: 'Florianópolis', state: 'SC' },
];

const DEFAULT_SEGMENTS = [
    'Clínicas e Saúde',
    'Startups e Tecnologia',
    'Moda e Vestuário',
    'Alimentos e Bebidas',
    'Cosméticos e Beleza',
    'Educação e Treinamentos',
    'Engenharia e Arquitetura',
    'Consultoria e Serviços',
    'E-commerce e D2C',
    'Restaurantes e Gastronomia',
    'Academias e Fitness',
    'Energia Solar e Sustentabilidade',
    'Pet Shops e Veterinária',
    'Imobiliárias e Construção',
    'Entretenimento e Eventos',
    'Logística e Transportes',
    'Turismo e Hotelaria',
    'Joias e Acessórios',
    'Decoração e Mobiliário',
    'Finanças e Fintechs',
    'Marketing e Agências',
    'Advocacia e Jurídico',
    'Artesanato e Design',
];

const DEFAULT_EXCLUDED_BRANDS = [
    "McDonald's", "Burguer King", "Subway", "Boticário", "Natura", "Cacau Show",
    "Nubank", "Itaú", "Bradesco", "Banco do Brasil", "Santander", "Ambev",
    "Coca-Cola", "Nestlé", "Smart Fit", "Bluefit", "Hering", "Renner", "Riachuelo",
    "C&A", "Zara", "Magalu", "Americanas", "Casas Bahia", "Carrefour", "Assaí",
    "Pão de Açúcar", "Droga Raia", "Drogasil", "Pague Menos", "Hapvida", "Unimed"
];

export const AsteryskoScoutAiTab: React.FC<{ organizationId?: string }> = ({ organizationId }) => {
    const [status, setStatus] = useState<ScoutStatus | null>(null);
    const [profile, setProfile] = useState<ScoutSearchProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [promotingId, setPromotingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Sub-sections toggles & inputs
    const [showPromptEditor, setShowPromptEditor] = useState(false);
    const [newCityInput, setNewCityInput] = useState('');
    const [newStateInput, setNewStateInput] = useState('');
    const [newSegmentInput, setNewSegmentInput] = useState('');
    const [newExcludedInput, setNewExcludedInput] = useState('');

    const headers = useMemo(() => (
        organizationId ? { 'x-organization-id': organizationId } : undefined
    ), [organizationId]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<ScoutStatus>('/asterysko/scout-ai/status', { headers });
            setStatus(response.data);
            const loadedProfile: ScoutSearchProfile = response.data.profile || {
                cities: ['Fortaleza'],
                states: ['CE'],
                segments: ['Clínicas e Saúde', 'Startups e Tecnologia'],
                excludedCompanies: [...DEFAULT_EXCLUDED_BRANDS],
                desiredSignals: [],
                exclusions: [],
                customInstructions: '',
                minConfidence: 65,
                maxCompaniesPerRun: 10,
            };
            // Ensure excludedCompanies has defaults if empty
            if (!loadedProfile.excludedCompanies || loadedProfile.excludedCompanies.length === 0) {
                loadedProfile.excludedCompanies = [...DEFAULT_EXCLUDED_BRANDS];
            }
            if (!Array.isArray(loadedProfile.desiredSignals)) {
                loadedProfile.desiredSignals = [];
            }
            if (!Array.isArray(loadedProfile.exclusions)) {
                loadedProfile.exclusions = [];
            }
            setProfile(loadedProfile);
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError, 'Não foi possível carregar o Scout AI.'));
        } finally {
            setLoading(false);
        }
    }, [headers]);

    useEffect(() => { void load(); }, [load]);

    const run = async () => {
        if (!profile) return;
        setRunning(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const payload = {
                profile: {
                    ...profile,
                    desiredSignals: Array.isArray(profile.desiredSignals) ? profile.desiredSignals : [],
                    exclusions: Array.isArray(profile.exclusions) ? profile.exclusions : [],
                },
            };
            const res = await api.post('/asterysko/scout-ai/run', payload, { headers });
            setSuccessMsg(res.data?.message || 'Execução do Scout AI concluída com sucesso!');
            await load();
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError, 'Falha ao executar o Scout AI.'));
        } finally {
            setRunning(false);
        }
    };

    const promoteToReview = async (sourceItemId: string) => {
        setPromotingId(sourceItemId);
        setError(null);
        try {
            await api.post(`/asterysko/scout-ai/source-items/${sourceItemId}/promote-review`, {}, { headers });
            await load();
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError, 'SourceItem ainda não pode ser promovido para revisão.'));
        } finally {
            setPromotingId(null);
        }
    };

    if (loading && !status) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-[#0412dd]" size={32} />
                <p className="text-xs text-zinc-500 font-medium">Carregando motor Scout AI...</p>
            </div>
        );
    }

    if (!status || !profile) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                {error || 'Scout AI indisponível no momento.'}
            </div>
        );
    }

    // City helpers
    const addCity = (city: string, state?: string) => {
        const trimmedCity = city.trim();
        if (!trimmedCity) return;
        const currentCities = profile.cities || [];
        if (!currentCities.some(c => c.toLowerCase() === trimmedCity.toLowerCase())) {
            const nextCities = [...currentCities, trimmedCity];
            let nextStates = profile.states || [];
            if (state && !nextStates.some(s => s.toUpperCase() === state.toUpperCase())) {
                nextStates = [...nextStates, state.toUpperCase()];
            }
            setProfile({ ...profile, cities: nextCities, states: nextStates });
        }
        setNewCityInput('');
        setNewStateInput('');
    };

    const removeCity = (cityToRemove: string) => {
        setProfile({
            ...profile,
            cities: profile.cities.filter(c => c.toLowerCase() !== cityToRemove.toLowerCase()),
        });
    };

    // Segment helpers
    const toggleSegment = (segment: string) => {
        const current = profile.segments || [];
        const exists = current.includes(segment);
        if (exists && current.length === 1) return; // keep at least 1
        setProfile({
            ...profile,
            segments: exists ? current.filter(s => s !== segment) : [...current, segment],
        });
    };

    const addCustomSegment = () => {
        const trimmed = newSegmentInput.trim();
        if (!trimmed) return;
        if (!profile.segments.includes(trimmed)) {
            setProfile({
                ...profile,
                segments: [...profile.segments, trimmed],
            });
        }
        setNewSegmentInput('');
    };

    // Brand Exclusions helpers
    const addExcludedBrand = () => {
        const trimmed = newExcludedInput.trim();
        if (!trimmed) return;
        const current = profile.excludedCompanies || [];
        if (!current.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
            setProfile({
                ...profile,
                excludedCompanies: [...current, trimmed],
            });
        }
        setNewExcludedInput('');
    };

    const removeExcludedBrand = (brandToRemove: string) => {
        setProfile({
            ...profile,
            excludedCompanies: (profile.excludedCompanies || []).filter(
                b => b.toLowerCase() !== brandToRemove.toLowerCase()
            ),
        });
    };

    const resetExcludedBrands = () => {
        setProfile({
            ...profile,
            excludedCompanies: [...DEFAULT_EXCLUDED_BRANDS],
        });
    };

    // Prompt helpers
    const resetPromptToDefault = () => {
        setProfile({
            ...profile,
            customPrompt: status.defaultPrompt || null,
        });
    };

    const isCustomPromptActive = Boolean(profile.customPrompt && profile.customPrompt.trim());

    return (
        <div className="space-y-6">
            {/* Top Bar: Status, Model & Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center gap-3.5">
                    <div className="relative flex h-3 w-3 items-center justify-center">
                        <span className={`absolute h-full w-full animate-ping rounded-full opacity-75 ${status.enabled ? 'bg-emerald-400' : 'bg-zinc-400'}`} />
                        <span className={`relative h-2.5 w-2.5 rounded-full ${status.enabled ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                Scout AI Lead Generator
                            </h2>
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                status.enabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                                {status.enabled ? 'Ativo' : 'Desativado'}
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                            {status.provider.toUpperCase()} · Modelo: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{status.model}</span> · Até <span className="font-semibold text-blue-600 dark:text-blue-400">{status.limits.companiesPerRun} leads</span> por demanda
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => void run()}
                        disabled={!status.enabled || running}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0412dd] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        {running ? 'Captando Leads...' : 'Disparar Scout Agora'}
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {!status.enabled && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                    <AlertTriangle size={18} className="shrink-0 text-amber-600" />
                    <span>A flag <code>ASTERYNSKO_SCOUT_AI_ENABLED</code> está desligada no servidor. Nenhuma busca externa será acionada.</span>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                    <AlertTriangle size={18} className="shrink-0 text-rose-600" />
                    <span>{error}</span>
                </div>
            )}
            {successMsg && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                    { label: 'Analisadas', value: status.metrics.analyzed, color: 'text-zinc-900 dark:text-white' },
                    { label: 'Oportunidades Criadas', value: status.metrics.created, color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Em Revisão', value: status.metrics.reviews, color: 'text-amber-600 dark:text-amber-400' },
                    { label: 'Duplicadas Evitadas', value: status.metrics.duplicates, color: 'text-purple-600 dark:text-purple-400' },
                    { label: 'Descartadas / Bloqueadas', value: status.metrics.rejected, color: 'text-rose-600 dark:text-rose-400' },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{stat.label}</p>
                        <p className={`mt-1 text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* MAIN CONFIGURATION CARD */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <Sparkles size={18} className="text-[#0412dd]" />
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                            Configuração de Demanda & Autonomia do Scout
                        </h3>
                    </div>

                    {/* Auto-CRM Switch */}
                    <label className="flex items-center gap-3 cursor-pointer bg-blue-50/70 dark:bg-blue-950/30 px-3.5 py-2 rounded-xl border border-blue-100 dark:border-blue-900/40">
                        <input
                            type="checkbox"
                            checked={Boolean(profile.autoCrm)}
                            onChange={(e) => setProfile({ ...profile, autoCrm: e.target.checked })}
                            className="h-4 w-4 rounded accent-[#0412dd] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300 select-none">
                            Enviar leads aprovados automaticamente para o CRM
                        </span>
                    </label>
                </div>

                {/* Section 1: Lead Quantity & Volume Target */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
                        1. Quantidade de Leads por Demanda (Capacidade diária: até {status.limits.companiesPerDay} leads/dia)
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                        {[10, 25, 50, 100].map((vol) => (
                            <button
                                key={vol}
                                type="button"
                                onClick={() => setProfile({ ...profile, maxCompanies: vol })}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    profile.maxCompanies === vol
                                        ? 'bg-[#0412dd] text-white shadow-sm ring-2 ring-blue-500/20'
                                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                                }`}
                            >
                                {vol} Leads
                            </button>
                        ))}
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs text-zinc-500 font-medium">Personalizado:</span>
                            <input
                                type="number"
                                min={1}
                                max={Math.max(status.limits.companiesPerRun, 100)}
                                value={profile.maxCompanies}
                                onChange={(e) => setProfile({ ...profile, maxCompanies: Math.min(Math.max(status.limits.companiesPerRun, 100), Math.max(1, Number(e.target.value))) })}
                                className="w-20 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-center text-zinc-800 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                            />
                            <span className="text-[11px] text-zinc-400">máx. {Math.max(status.limits.companiesPerRun, 100)}</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Cities & States Selection */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-500">
                            <MapPin size={14} className="text-rose-500" />
                            2. Cidades e Regiões Alvo ({profile.cities.length} selecionadas)
                        </label>
                    </div>

                    {/* City Presets Pills */}
                    <div className="mb-3">
                        <span className="text-[11px] text-zinc-400 block mb-1.5">Adicionar capitais e polos comerciais rapidamente:</span>
                        <div className="flex flex-wrap gap-1.5">
                            {CITY_PRESETS.map(({ city, state }) => {
                                const isAdded = profile.cities.some(c => c.toLowerCase() === city.toLowerCase());
                                return (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => isAdded ? removeCity(city) : addCity(city, state)}
                                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                                            isAdded
                                                ? 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}
                                    >
                                        {isAdded && <Check size={12} />}
                                        {city}, {state}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Cities Tags */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex flex-wrap items-center gap-2">
                            {profile.cities.map((city) => (
                                <span
                                    key={city}
                                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                                >
                                    {city}
                                    <button
                                        type="button"
                                        onClick={() => removeCity(city)}
                                        className="text-zinc-400 hover:text-rose-500"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}

                            {/* Add Custom City Input */}
                            <div className="flex items-center gap-1.5 mt-1">
                                <input
                                    type="text"
                                    placeholder="Outra cidade..."
                                    value={newCityInput}
                                    onChange={(e) => setNewCityInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCity(newCityInput, newStateInput);
                                        }
                                    }}
                                    className="w-32 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                                />
                                <input
                                    type="text"
                                    placeholder="UF"
                                    maxLength={2}
                                    value={newStateInput}
                                    onChange={(e) => setNewStateInput(e.target.value.toUpperCase())}
                                    className="w-12 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-center uppercase text-zinc-800 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => addCity(newCityInput, newStateInput)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-[#0412dd] px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-800"
                                >
                                    <Plus size={13} /> Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Expanded Niches / Segments */}
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-500">
                            <Layers size={14} className="text-purple-500" />
                            3. Nichos e Segmentos Alvo ({profile.segments.length} ativos)
                        </label>
                        <div className="flex items-center gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => setProfile({ ...profile, segments: [...DEFAULT_SEGMENTS] })}
                                className="text-blue-600 hover:underline text-[11px] font-semibold"
                            >
                                Selecionar todos os 23 nichos padrão
                            </button>
                        </div>
                    </div>

                    {/* Segments Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {DEFAULT_SEGMENTS.map((seg) => {
                            const isSelected = profile.segments.includes(seg);
                            return (
                                <button
                                    key={seg}
                                    type="button"
                                    onClick={() => toggleSegment(seg)}
                                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                        isSelected
                                            ? 'bg-purple-100 text-purple-900 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                                    }`}
                                >
                                    {isSelected ? '✓ ' : '+ '}{seg}
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Segment Input */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Criar novo nicho personalizado (ex: Dentistas Estéticos, Cafeterias Especiais)..."
                            value={newSegmentInput}
                            onChange={(e) => setNewSegmentInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomSegment();
                                }
                            }}
                            className="w-full max-w-md rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                        />
                        <button
                            type="button"
                            onClick={addCustomSegment}
                            className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
                        >
                            <Plus size={14} /> Adicionar Nicho
                        </button>
                    </div>
                </div>

                {/* Section 4: Anti-Giant Filter & Blocked Franchises */}
                <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 dark:border-rose-950/40 dark:bg-rose-950/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={16} className="text-rose-600" />
                            <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                                4. Filtro Anti-Grandes Marcas & Franquias Consolidadas
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={resetExcludedBrands}
                            className="text-[11px] font-semibold text-rose-600 hover:underline"
                        >
                            Restaurar lista padrão de exclusões
                        </button>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        O Scout AI bloqueia automaticamente redes multinacionais e grandes players já consolidados (que com certeza já têm marca registrada), priorizando empresas de médio e pequeno porte com alto potencial de conversão.
                    </p>

                    {/* Excluded Brands Chips */}
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-lg border border-rose-200 dark:bg-zinc-900 dark:border-rose-900/40">
                        {(profile.excludedCompanies || []).map((brand) => (
                            <span
                                key={brand}
                                className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60"
                            >
                                {brand}
                                <button
                                    type="button"
                                    onClick={() => removeExcludedBrand(brand)}
                                    className="text-rose-400 hover:text-rose-700"
                                >
                                    <X size={11} />
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Add Brand to Exclude */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Bloquear outra marca ou franquia gigante..."
                            value={newExcludedInput}
                            onChange={(e) => setNewExcludedInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addExcludedBrand();
                                }
                            }}
                            className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none focus:border-rose-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                        />
                        <button
                            type="button"
                            onClick={addExcludedBrand}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                        >
                            <Plus size={13} /> Bloquear
                        </button>
                    </div>
                </div>

                {/* Section 5: Transparent & Editable Prompt Instructions */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950">
                    <button
                        type="button"
                        onClick={() => setShowPromptEditor(!showPromptEditor)}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-100/60 dark:hover:bg-zinc-900"
                    >
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-[#0412dd]" />
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                5. Diretrizes & Prompt do Scout AI (Customizável)
                            </span>
                            {isCustomPromptActive && (
                                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    Prompt Customizado Ativo
                                </span>
                            )}
                        </div>
                        {showPromptEditor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showPromptEditor && (
                        <div className="border-t border-zinc-200 p-4 space-y-3 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] text-zinc-500">
                                    Instruções avançadas fornecidas ao agente de IA (Gemini/OpenAI) que comanda o planejamento de buscas e seleção dos leads.
                                </p>
                                <button
                                    type="button"
                                    onClick={resetPromptToDefault}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                                >
                                    <RotateCcw size={12} /> Restaurar Instruções Padrão
                                </button>
                            </div>
                            <textarea
                                rows={6}
                                value={profile.customPrompt ?? (status.defaultPrompt || '')}
                                onChange={(e) => setProfile({ ...profile, customPrompt: e.target.value })}
                                placeholder="Digite aqui instruções adicionais ou diretrizes para o Scout AI..."
                                className="w-full font-mono text-xs rounded-xl border border-zinc-200 bg-white p-3 text-zinc-800 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* SourceItems in Review */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                            SourceItems em revisão ({status.reviewItems.length})
                        </h3>
                    </div>
                </div>
                {status.reviewItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 py-8 text-center text-xs text-zinc-400 dark:border-zinc-700">
                        Nenhum SourceItem aguardando revisão.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {status.reviewItems.map(item => (
                            <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs dark:border-amber-900/50 dark:bg-amber-950/10">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-zinc-900 dark:text-white">{item.companyName || 'Empresa não identificada'}</p>
                                        {item.websiteCandidate && (
                                            <a href={item.websiteCandidate} target="_blank" rel="noreferrer" className="mt-1 block text-blue-600 hover:underline">
                                                {item.websiteCandidate}
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => void promoteToReview(item.id)}
                                        disabled={promotingId === item.id}
                                        className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-800 dark:bg-zinc-950 dark:text-amber-300"
                                    >
                                        {promotingId === item.id && <Loader2 size={13} className="animate-spin" />}
                                        Promover para oportunidade em revisão
                                    </button>
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                    <span>Empresa: <strong>{item.companyConfidence}%</strong></span>
                                    <span>Website: <strong>{item.websiteConfidence}%</strong></span>
                                    <span>Combinada: <strong>{item.combinedConfidence ?? 'pendente'}{item.combinedConfidence !== null && item.combinedConfidence !== undefined ? '%' : ''}</strong></span>
                                </div>
                                <p className="mt-2 text-amber-900 dark:text-amber-200"><strong>Motivo:</strong> {item.nonPromotionReason}</p>
                                <p className="mt-1 text-zinc-500"><strong>Etapa:</strong> {item.stage} · <strong>Ação:</strong> {item.recommendedAction}</p>
                                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                                    <strong>Canais:</strong> {item.channels.length > 0
                                        ? item.channels.map(channel => `${channel.type}: ${channel.value}`).join(' · ')
                                        : 'nenhum'}
                                </p>
                                <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                                    <strong>Possíveis decisores:</strong> {item.possibleDecisionMakers.length > 0
                                        ? item.possibleDecisionMakers.map(candidate => `${candidate.name || 'Função'}${candidate.role ? ` — ${candidate.role}` : ''}`).join(' · ')
                                        : 'nenhum'}
                                </p>
                                <p className="mt-1 text-zinc-500"><strong>Sinais ausentes:</strong> {item.missingSignals.join(' · ') || 'nenhum'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Executions History */}
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <Bot size={16} className="text-[#0412dd]" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Execuções Recentes</h3>
                </div>
                {status.recentRuns.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 py-10 text-center text-xs text-zinc-400 dark:border-zinc-700">
                        Nenhuma execução do Scout registrada recentemente.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {status.recentRuns.map(runItem => (
                            <div key={runItem.id} className="rounded-xl border border-zinc-200 p-3.5 text-xs bg-white dark:bg-zinc-900 dark:border-zinc-800">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-100">
                                        {runItem.status === 'completed' ? <CheckCircle2 size={15} className="text-emerald-500" /> : <AlertTriangle size={15} className="text-amber-500" />}
                                        {new Date(runItem.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                    <span className="text-zinc-500 font-medium">
                                        {runItem.itemsFetched ?? 0} analisadas · <strong className="text-emerald-600 dark:text-emerald-400">{runItem.opportunitiesCreated ?? 0} criadas</strong>
                                    </span>
                                </div>
                                {(runItem.metadata?.queries?.length ?? 0) > 0 && (
                                    <p className="mt-2 truncate text-zinc-500">
                                        <strong>Consultas executadas:</strong> {runItem.metadata?.queries?.join(' · ')}
                                    </p>
                                )}
                                <p className="mt-1 text-zinc-400 text-[11px]">
                                    Consumo: {runItem.metadata?.usage?.modelCalls ?? 0} chamadas de IA · {runItem.metadata?.usage?.totalTokens ?? 0} tokens
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
