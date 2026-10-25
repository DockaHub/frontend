import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, ChevronDown, Radar, Search, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../../../services/api';
import { INPI_CLASSES } from '../../dashboard/components/asterysko/AsteryskoResearchView';
import { formatStatusLabel } from '../../dashboard/components/asterysko/utils/statusPresentation';

type Conflict = {
    id: string;
    brandName: string;
    processNumber: string;
    nclClass: string;
    status: string;
    ownerName: string;
    active: boolean;
    similarity: number;
    textualSimilarity: number;
    phoneticSimilarity: number;
    classAffinity: number;
    riskContribution: 'low' | 'medium' | 'high';
    explanation: string;
};

type RadarResult = {
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INCONCLUSIVE';
    score: number;
    scoreLabel: string;
    confidence: number;
    summary: string;
    conflicts: Conflict[];
    recommendations: string[];
    nameSuggestions: string[];
    warnings: string[];
    base: { version: string; referenceDate: string; recordCount: number; source: string };
    disclaimer: string;
};

const riskContent = {
    LOW: { label: 'Cenário favorável', color: '#16a34a', soft: '#ecfdf3' },
    MEDIUM: { label: 'Atenção necessária', color: '#d97706', soft: '#fffbeb' },
    HIGH: { label: 'Risco elevado', color: '#dc2626', soft: '#fef2f2' },
    INCONCLUSIVE: { label: 'Análise inconclusiva', color: '#52525b', soft: '#f4f4f5' },
};

const PublicTrademarkRadarPage: React.FC = () => {
    const [brandName, setBrandName] = useState('');
    const [ncl, setNcl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<RadarResult | null>(null);
    const [onlyActive, setOnlyActive] = useState(true);

    const visibleConflicts = useMemo(() => (
        result?.conflicts.filter(conflict => !onlyActive || conflict.active) || []
    ), [result, onlyActive]);

    const runSearch = async () => {
        if (brandName.trim().length < 2 || !ncl) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const response = await api.get<RadarResult>('/asterysko/analysis/public', {
                params: { name: brandName.trim(), ncl },
            });
            setResult(response.data);
        } catch (requestError: any) {
            setError(requestError?.response?.data?.error || 'Não foi possível concluir a pesquisa agora.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const tone = riskContent[result?.riskLevel || 'LOW'];

    return (
        <div className="min-h-[100dvh] bg-[#f7f8fb] text-[#15171c]">
            <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <img src="/assets/asterysko/contract-wordmark.svg" alt="Asterysko" className="h-7 w-auto" />
                    <span className="rounded-full bg-[#eef0ff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0412dd]">Radar da marca</span>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
                {!result && !loading ? (
                    <>
                        <section className="mx-auto max-w-2xl text-center">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0412dd] text-white shadow-lg shadow-blue-700/20"><Radar size={27} /></div>
                            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0412dd]">Pesquisa preliminar no INPI</p>
                            <h1 className="font-season text-4xl leading-[1.05] tracking-tight sm:text-6xl">Seu nome pode virar uma marca protegida?</h1>
                            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">Descubra processos semelhantes, conflitos ativos e o índice estimado de viabilidade antes de investir no nome.</p>
                        </section>

                        <section className="mx-auto mt-8 max-w-xl rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_18px_60px_rgba(20,25,55,0.09)] sm:p-6">
                            <label className="mb-2 block text-xs font-bold text-zinc-700">Nome que deseja registrar</label>
                            <div className="flex h-14 items-center gap-3 rounded-2xl border border-zinc-200 px-4 focus-within:border-[#0412dd] focus-within:ring-4 focus-within:ring-blue-100">
                                <Search size={18} className="text-zinc-400" />
                                <input value={brandName} onChange={event => setBrandName(event.target.value)} onKeyDown={event => event.key === 'Enter' && void runSearch()} placeholder="Ex.: Asterysko" className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:font-normal placeholder:text-zinc-400" />
                            </div>

                            <label className="mb-2 mt-5 block text-xs font-bold text-zinc-700">Ramo de atividade</label>
                            <div className="relative">
                                <select value={ncl} onChange={event => setNcl(event.target.value)} className="h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 pr-11 text-sm font-medium outline-none focus:border-[#0412dd] focus:ring-4 focus:ring-blue-100">
                                    <option value="">Selecione a classe da atividade</option>
                                    {INPI_CLASSES.map(item => <option key={item.number} value={item.number}>NCL {item.number} — {item.description}</option>)}
                                </select>
                                <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            </div>

                            {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}
                            <button onClick={() => void runSearch()} disabled={brandName.trim().length < 2 || !ncl} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0412dd] text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-[#101fc5] disabled:cursor-not-allowed disabled:opacity-40">
                                <Radar size={18} /> Analisar disponibilidade
                            </button>
                            <p className="mt-4 text-center text-[10px] leading-4 text-zinc-400">Busca preliminar. O resultado não substitui uma análise jurídica completa.</p>
                        </section>
                    </>
                ) : loading ? (
                    <section className="flex min-h-[65vh] flex-col items-center justify-center text-center">
                        <div className="relative mb-8 h-36 w-36 rounded-full border border-blue-200">
                            <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-r-[#0412dd] border-t-[#0412dd]" />
                            <Radar className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0412dd]" size={32} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0412dd]">Cruzando a base marcária</p>
                        <h2 className="mt-3 max-w-md break-words font-season text-4xl">{brandName}</h2>
                        <p className="mt-3 text-sm text-zinc-500">Analisando grafia, fonética, classes e situação dos processos.</p>
                    </section>
                ) : result ? (
                    <div className="space-y-5">
                        <button onClick={reset} className="flex items-center gap-2 text-xs font-bold text-zinc-600"><ArrowLeft size={16} /> Nova pesquisa</button>

                        <section className="grid gap-4 lg:grid-cols-[1fr_300px]">
                            <div className="rounded-[26px] border border-black/5 bg-white p-5 shadow-sm sm:p-7">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Resultado para</p>
                                <h1 className="mt-2 break-words font-season text-4xl">{brandName}</h1>
                                <p className="mt-2 text-xs font-semibold text-zinc-500">Classe NCL {ncl}</p>
                                <p className="mt-5 text-sm leading-6 text-zinc-700">{result.summary}</p>
                            </div>
                            <div className="rounded-[26px] border p-6 text-center" style={{ backgroundColor: tone.soft, borderColor: `${tone.color}33` }}>
                                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full" style={{ background: `conic-gradient(${tone.color} ${result.score}%, #e5e7eb 0)` }}>
                                    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white text-3xl font-black" style={{ color: tone.color }}>{result.score}%</div>
                                </div>
                                <p className="mt-4 text-sm font-bold" style={{ color: tone.color }}>{tone.label}</p>
                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{result.scoreLabel}</p>
                                <p className="mt-3 text-[11px] text-zinc-500">Confiança da análise: {result.confidence}%</p>
                            </div>
                        </section>

                        {result.warnings?.length > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800"><AlertTriangle size={16} className="mb-2" />{result.warnings.join(' ')}</div>}

                        <section className="overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div><h2 className="font-bold">Coincidências encontradas</h2><p className="mt-1 text-xs text-zinc-500">Ordenadas pela relevância para sua pesquisa.</p></div>
                                <button onClick={() => setOnlyActive(value => !value)} className={`rounded-full px-3 py-2 text-[10px] font-bold ${onlyActive ? 'bg-[#0412dd] text-white' : 'bg-zinc-100 text-zinc-600'}`}>{onlyActive ? 'Somente ativos' : 'Todos os processos'}</button>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                {visibleConflicts.length === 0 ? (
                                    <div className="p-8 text-center"><Check className="mx-auto text-emerald-600" /><p className="mt-3 text-sm font-bold">Nenhum conflito ativo relevante nesta busca</p></div>
                                ) : visibleConflicts.map(conflict => (
                                    <details key={conflict.id} className="group p-5">
                                        <summary className="flex cursor-pointer list-none items-start gap-3">
                                            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${conflict.riskContribution === 'high' ? 'bg-red-500' : conflict.riskContribution === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                            <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{conflict.brandName}</strong><span className="mt-1 block text-[11px] text-zinc-500">Processo {conflict.processNumber} · NCL {conflict.nclClass || ncl}</span></span>
                                            <span className="text-sm font-black text-zinc-700">{conflict.similarity}%</span>
                                            <ChevronDown size={16} className="mt-0.5 text-zinc-400 transition group-open:rotate-180" />
                                        </summary>
                                        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-zinc-50 p-4 text-center">
                                            <Metric label="Grafia" value={conflict.textualSimilarity} /><Metric label="Fonética" value={conflict.phoneticSimilarity} /><Metric label="Classe" value={conflict.classAffinity} />
                                        </div>
                                        <div className="mt-3 space-y-1 text-xs leading-5 text-zinc-600"><p><strong>Status:</strong> {formatStatusLabel(conflict.status)} {conflict.active ? '· ativo' : '· inativo'}</p><p><strong>Titular:</strong> {conflict.ownerName}</p><p>{conflict.explanation}</p></div>
                                    </details>
                                ))}
                            </div>
                        </section>

                        <section className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-[26px] border border-black/5 bg-white p-5"><div className="flex items-center gap-2 font-bold"><ShieldCheck size={18} className="text-[#0412dd]" /> Próximos passos</div><ul className="mt-4 space-y-3">{result.recommendations.map(item => <li key={item} className="flex gap-2 text-xs leading-5 text-zinc-600"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />{item}</li>)}</ul></div>
                            <div className="rounded-[26px] border border-black/5 bg-white p-5"><div className="flex items-center gap-2 font-bold"><Sparkles size={18} className="text-[#0412dd]" /> Ideias para pesquisar</div><p className="mt-2 text-[11px] leading-5 text-zinc-500">Alternativas criativas ainda não validadas. Toque para fazer uma nova pesquisa.</p><div className="mt-4 flex flex-wrap gap-2">{result.nameSuggestions.map(name => <button key={name} onClick={() => { setBrandName(name); reset(); }} className="rounded-full bg-[#eef0ff] px-3 py-2 text-xs font-bold text-[#0412dd]">{name}</button>)}</div></div>
                        </section>

                        <footer className="rounded-2xl bg-zinc-100 p-4 text-center text-[10px] leading-5 text-zinc-500">Base {result.base.version} · referência {new Date(result.base.referenceDate).toLocaleDateString('pt-BR')} · {result.base.recordCount.toLocaleString('pt-BR')} registros.<br />{result.disclaimer}</footer>
                    </div>
                ) : null}
            </main>
        </div>
    );
};

const Metric = ({ label, value }: { label: string; value: number }) => <div><strong className="block text-sm text-zinc-800">{value}%</strong><span className="text-[9px] font-bold uppercase tracking-wide text-zinc-400">{label}</span></div>;

export default PublicTrademarkRadarPage;
