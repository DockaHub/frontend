import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { api } from '../../../../services/api';
import { nclClasses, NclClass } from './data/nclClasses';

const BrandViability = () => {
    const [searchName, setSearchName] = useState('');
    const [nclQuery, setNclQuery] = useState(''); // Text in input
    const [selectedNcl, setSelectedNcl] = useState<NclClass | null>(nclClasses.find(c => c.id === '41') || null);
    const [isNclOpen, setIsNclOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Initial load effect
    useEffect(() => {
        if (selectedNcl) {
            setNclQuery(`Classe ${selectedNcl.id} - ${selectedNcl.description.substring(0, 30)}...`);
        }
    }, []);

    const filteredNcl = nclClasses.filter(ncl =>
        ncl.id.includes(nclQuery) ||
        ncl.description.toLowerCase().includes(nclQuery.toLowerCase()) ||
        ncl.keywords.some(k => k.toLowerCase().includes(nclQuery.toLowerCase()))
    );

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchName.trim() || !selectedNcl) return;

        setIsLoading(true);
        try {
            const response = await api.get('/asterysko/analysis/instant', {
                params: { name: searchName, ncl: selectedNcl.id }
            });
            setResult(response.data);
        } catch (error) {
            console.error('Analysis failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'HIGH': return 'bg-red-500 text-white';
            case 'MEDIUM': return 'bg-amber-500 text-white';
            case 'LOW': return 'bg-emerald-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getRiskBg = (level: string) => {
        switch (level) {
            case 'HIGH': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30';
            case 'MEDIUM': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30';
            case 'LOW': return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30';
            default: return 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800';
        }
    };

    // ... helper functions ...

    return (
        <div className="p-8 w-full min-h-screen custom-scrollbar overflow-y-auto" onClick={() => setIsNclOpen(false)}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 mb-2">Pesquisa e Viabilidade</h1>
                    <p className="text-docka-500 dark:text-zinc-400">Descubra em segundos se sua marca está disponível para registro.</p>
                </div>

                {/* Hero Search Box */}
                <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-xl border border-docka-100 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-2 max-w-4xl relative z-50">

                    {/* Brand Name Input */}
                    <div className="flex-1 flex items-center w-full">
                        <div className="pl-4 text-docka-400 dark:text-zinc-500">
                            <Search size={20} />
                        </div>
                        <input
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Nome da marca..."
                            className="w-full bg-transparent border-none outline-none text-lg text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 h-12 px-2"
                        />
                    </div>

                    <div className="h-8 w-px bg-docka-100 dark:bg-zinc-800 hidden md:block"></div>

                    {/* NCL Selector */}
                    <div className="relative w-full md:w-[350px]" onClick={(e) => e.stopPropagation()}>
                        <input
                            value={nclQuery}
                            onChange={(e) => {
                                setNclQuery(e.target.value);
                                setIsNclOpen(true);
                                if (selectedNcl && e.target.value === '') {
                                    setSelectedNcl(null); // Clear selection if text cleared
                                }
                            }}
                            onFocus={() => {
                                setNclQuery(''); // Clear formatted text on focus to let user type
                                setIsNclOpen(true);
                            }}
                            onBlur={() => {
                                // Restore formatted text if selection exists
                                if (selectedNcl) {
                                    setTimeout(() => setNclQuery(`Classe ${selectedNcl.id} - ${selectedNcl.description.substring(0, 30)}...`), 200);
                                }
                            }}
                            placeholder="Ramo de atividade (ex: Roupas)"
                            className="w-full h-10 px-3 bg-docka-50 dark:bg-zinc-800 rounded-lg text-sm font-medium text-docka-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-docka-200 dark:focus:ring-zinc-700 transition-all border-none"
                        />

                        {/* Dropdown Results */}
                        {isNclOpen && filteredNcl.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-docka-200 dark:border-zinc-800 z-50 animate-in fade-in zoom-in duration-100">
                                {filteredNcl.map(ncl => (
                                    <button
                                        key={ncl.id}
                                        onClick={() => {
                                            setSelectedNcl(ncl);
                                            setNclQuery(`Classe ${ncl.id} - ${ncl.description.substring(0, 30)}...`);
                                            setIsNclOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-docka-50 dark:bg-zinc-800 transition-colors border-b border-docka-50 dark:border-zinc-800 last:border-0 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Classe {ncl.id}</span>
                                            {selectedNcl?.id === ncl.id && <CheckCircle size={14} className="text-emerald-500" />}
                                        </div>
                                        <div className="text-xs text-docka-500 dark:text-zinc-400 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                                            {ncl.description}
                                        </div>
                                        <div className="text-[10px] text-docka-400 mt-1 flex gap-1 flex-wrap">
                                            {ncl.keywords.slice(0, 3).map(k => (
                                                <span key={k} className="bg-docka-100 dark:bg-zinc-800 px-1.5 rounded">{k}</span>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => handleSearch()}
                        disabled={isLoading || !selectedNcl}
                        className="w-full md:w-auto bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 h-10 px-6 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                    >
                        {isLoading ? <span className="animate-spin">⌛</span> : <Zap size={16} />}
                        Verificar
                    </button>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Traffic Light Card */}
                        <div className={`p-8 rounded-2xl border mb-8 flex flex-col md:flex-row items-center gap-8 ${getRiskBg(result.riskLevel)}`}>
                            {/* Gauge / Score */}
                            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-black/5 dark:text-white/5" />
                                    <circle
                                        cx="80" cy="80" r="70"
                                        stroke="currentColor" strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * result.score) / 100}
                                        className={`${result.riskLevel === 'HIGH' ? 'text-red-500' : result.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-4xl font-black ${result.riskLevel === 'HIGH' ? 'text-red-600' : result.riskLevel === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {result.score}%
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">Chance</span>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getRiskColor(result.riskLevel)}`}>
                                        {result.riskLevel === 'HIGH' ? 'ALTO RISCO' : result.riskLevel === 'MEDIUM' ? 'ATENÇÃO' : 'VIÁVEL'}
                                    </div>
                                </div>
                                <h2 className={`text-2xl font-bold mb-2 ${result.riskLevel === 'HIGH' ? 'text-red-700 dark:text-red-400' : result.riskLevel === 'MEDIUM' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                    {result.riskLevel === 'HIGH' ? 'Registro Obstruído' : result.riskLevel === 'MEDIUM' ? 'Requer Análise Detalhada' : 'Marca Disponível'}
                                </h2>
                                <p className="text-lg text-docka-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
                                    {result.summary}
                                </p>
                            </div>
                        </div>

                        {/* Conflicts Data */}
                        {result.conflicts?.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-docka-100 dark:border-zinc-800 overflow-hidden">
                                <div className="p-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50 dark:bg-zinc-800/50 flex justify-between items-center">
                                    <h3 className="font-bold text-docka-700 dark:text-zinc-300 flex items-center gap-2"><AlertTriangle size={16} /> Conflitos Encontrados</h3>
                                    <span className="text-xs font-medium text-docka-500 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md border border-docka-200 dark:border-zinc-700">
                                        {result.conflicts.length} registro(s)
                                    </span>
                                </div>
                                <div className="divide-y divide-docka-100 dark:divide-zinc-800">
                                    {result.conflicts.map((conflict: any, idx: number) => (
                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${conflict.type === 'EXACT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                    {conflict.nclClass}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-docka-900 dark:text-zinc-100">{conflict.brandName}</div>
                                                    <div className="text-xs text-docka-500 dark:text-zinc-400 flex items-center gap-2">
                                                        <span>{conflict.processNumber}</span>
                                                        <span>•</span>
                                                        <span>{conflict.ownerName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${conflict.status?.toLowerCase().includes('arquivado') || conflict.status?.toLowerCase().includes('extinto')
                                                    ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                                    : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                                                    }`}>
                                                    {conflict.status || 'Desconhecido'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandViability;
