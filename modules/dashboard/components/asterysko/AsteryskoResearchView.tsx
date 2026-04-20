import React, { useState, useEffect } from 'react';
import { 
    Search, 
    AlertTriangle, 
    CheckCircle2, 
    Zap, 
    LayoutGrid, 
    Info, 
    Activity, 
    Shield, 
    Sparkles, 
    Filter,
    ChevronDown,
    Scale,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { api } from '../../../../services/api';
import { nclClasses, NclClass } from './data/nclClasses';
import DashboardPage from '../../../../components/DashboardPage';

const AsteryskoResearchView = () => {
    const [searchName, setSearchName] = useState('');
    const [nclQuery, setNclQuery] = useState('');
    const [selectedNcl, setSelectedNcl] = useState<NclClass | null>(nclClasses.find(c => c.id === '41') || null);
    const [isNclOpen, setIsNclOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        if (selectedNcl) {
            setNclQuery(`Classe ${selectedNcl.id} - ${selectedNcl.description.substring(0, 30)}...`);
        }
    }, [selectedNcl]);

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
            case 'HIGH': return 'bg-rose-500 text-white';
            case 'MEDIUM': return 'bg-amber-500 text-white';
            case 'LOW': return 'bg-emerald-500 text-white';
            default: return 'bg-docka-300 text-white';
        }
    };

    return (
        <DashboardPage
            title="Pesquisa e Viabilidade"
            subtitle="Inteligência instantânea para descoberta de novos ativos INPI."
            actions={
                <div className="flex gap-2">
                    <button className="p-2.5 bg-white dark:bg-zinc-800 border border-docka-50 dark:border-zinc-700 rounded-xl text-docka-400 hover:text-docka-900 transition-all shadow-sm">
                        <Filter size={18} />
                    </button>
                    <button className="p-2.5 bg-white dark:bg-zinc-800 border border-docka-50 dark:border-zinc-700 rounded-xl text-docka-400 hover:text-docka-900 transition-all shadow-sm">
                        <LayoutGrid size={18} />
                    </button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-4" onClick={() => setIsNclOpen(false)}>
                
                {/* HERO SEARCH AREA DS 3.0 */}
                <div className="relative mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="absolute inset-0 bg-docka-900/5 dark:bg-zinc-100/5 blur-[100px] -z-10 rounded-full scale-150" />
                                        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl p-2 rounded-xl shadow-sm border border-docka-100 dark:border-zinc-800 flex flex-col lg:flex-row items-center gap-2 group transition-all">
                        
                        <div className="flex-1 flex items-center w-full px-4 group/input">
                            <Search size={20} className="text-docka-300 group-hover/input:text-docka-900 dark:group-hover/input:text-zinc-100 transition-colors" />
                            <input
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Nome da marca ou ativo empresarial..."
                                className="w-full bg-transparent border-none outline-none text-lg font-bold text-docka-900 dark:text-zinc-100 placeholder:text-docka-200 dark:placeholder:text-zinc-700 h-14 px-4"
                            />
                        </div>

                        <div className="h-8 w-px bg-docka-100 dark:bg-zinc-800 hidden lg:block" />

                        <div className="relative w-full lg:w-[320px]" onClick={(e) => e.stopPropagation()}>
                            <div 
                                onClick={() => setIsNclOpen(!isNclOpen)}
                                className="w-full h-14 px-5 bg-docka-50/50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-between cursor-pointer border border-transparent hover:border-docka-100 dark:hover:border-zinc-700 transition-all group/select"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-docka-400">Ramo de Atividade</span>
                                    <span className="text-xs font-bold text-docka-700 dark:text-zinc-300 truncate max-w-[240px]">
                                        {selectedNcl ? `Classe ${selectedNcl.id} - ${selectedNcl.description.substring(0, 30)}...` : 'Selecione a Classe NCL'}
                                    </span>
                                </div>
                                <ChevronDown size={16} className={`text-docka-300 transition-transform duration-300 ${isNclOpen ? 'rotate-180' : ''}`} />
                            </div>


                            {isNclOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 shadow-xl border border-docka-100 dark:border-zinc-800 z-[100] rounded-xl animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-2 mb-1">
                                        <input 
                                            autoFocus
                                            placeholder="Filtrar categorias..."
                                            value={nclQuery}
                                            onChange={(e) => setNclQuery(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border-none rounded-lg text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1">
                                        {filteredNcl.map(ncl => (
                                            <button
                                                key={ncl.id}
                                                onClick={() => {
                                                    setSelectedNcl(ncl);
                                                    setIsNclOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex flex-col gap-1 border ${selectedNcl?.id === ncl.id ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 text-white' : 'bg-transparent border-transparent hover:bg-docka-50 dark:hover:bg-zinc-800'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedNcl?.id === ncl.id ? 'text-white' : 'text-docka-900 dark:text-zinc-100'}`}>Classe {ncl.id}</span>
                                                    {selectedNcl?.id === ncl.id && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                                <span className={`text-[11px] font-medium leading-relaxed ${selectedNcl?.id === ncl.id ? 'text-white/80' : 'text-docka-500 dark:text-zinc-400'}`}>
                                                    {ncl.description}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleSearch()}
                            disabled={isLoading || !selectedNcl || !searchName.trim()}
                            className="w-full lg:w-auto px-10 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-bold text-[11px] uppercase tracking-[0.2em] shadow-sm hover:bg-blue-700 transition-all disabled:opacity-30 flex items-center justify-center gap-3 shrink-0"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                            Analisar Ativo
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        
                        <div className="lg:col-span-5 space-y-6">
                            <div className={`p-10 rounded-xl border shadow-sm relative overflow-hidden flex flex-col items-center text-center transition-all ${
                                result.riskLevel === 'HIGH' ? 'bg-rose-50/30 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20' : 
                                result.riskLevel === 'MEDIUM' ? 'bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20' : 
                                'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20'
                            }`}>
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Sparkles size={120} />
                                </div>

                                <div className="relative w-56 h-56 flex items-center justify-center mb-8">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-black/5 dark:text-white/5" />
                                        <circle
                                            cx="112" cy="112" r="100"
                                            stroke="currentColor" strokeWidth="16"
                                            fill="transparent"
                                            strokeDasharray={628}
                                            strokeDashoffset={628 - (628 * result.score) / 100}
                                            strokeLinecap="round"
                                            className={`${result.riskLevel === 'HIGH' ? 'text-rose-500' : result.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-docka-300 mb-1">Score de Viabilidade</span>
                                        <span className={`text-6xl font-bold ${result.riskLevel === 'HIGH' ? 'text-rose-600' : result.riskLevel === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {result.score}%
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] ${getRiskColor(result.riskLevel)}`}>
                                        {result.riskLevel === 'HIGH' ? 'Alto Risco' : result.riskLevel === 'MEDIUM' ? 'Atenção' : 'Excelente'}
                                    </div>
                                    <h3 className="text-xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">
                                        {result.riskLevel === 'HIGH' ? 'Registro Altamente Obstruído' : result.riskLevel === 'MEDIUM' ? 'Requer Estratégia de Defesa' : 'Caminho Livre para Registro'}
                                    </h3>
                                    <p className="text-[13px] font-medium text-docka-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                                        {result.summary}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-docka-100 dark:border-zinc-800 shadow-sm">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-docka-400 mb-6 ml-1">Próximos Passos Sugeridos</h4>
                                <div className="space-y-3">
                                    <button className="w-full p-4 bg-docka-50 dark:bg-zinc-800 rounded-lg flex items-center justify-between group hover:bg-docka-100 dark:hover:bg-zinc-700 transition-all border border-transparent hover:border-docka-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center font-bold">1</div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-docka-900 dark:text-zinc-200">Gerar Dossier PDF</span>
                                        </div>
                                        <ChevronDown size={14} className="-rotate-90 text-docka-200 group-hover:text-blue-600" />
                                    </button>
                                    <button className="w-full p-4 bg-docka-50 dark:bg-zinc-800 rounded-lg flex items-center justify-between group hover:bg-docka-100 dark:hover:bg-zinc-700 transition-all border border-transparent hover:border-docka-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center font-bold">2</div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-docka-900 dark:text-zinc-200">Iniciar Protocolo</span>
                                        </div>
                                        <ChevronDown size={14} className="-rotate-90 text-docka-200 group-hover:text-emerald-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-docka-50 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg"><AlertCircle size={20} /></div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-docka-900 dark:text-zinc-100">Registros Colidentes</h3>
                                            <p className="text-[10px] font-bold text-docka-400 uppercase tracking-widest">{result.conflicts?.length || 0} marcas encontradas no INPI</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                    {result.conflicts?.map((conflict: any, idx: number) => (
                                        <div key={idx} className="p-6 flex flex-col md:flex-row items-center justify-between hover:bg-docka-50/50 dark:hover:bg-zinc-800/30 transition-all group">
                                            <div className="flex items-center gap-6 w-full md:w-auto">
                                                <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border ${conflict.type === 'EXACT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {conflict.nclClass}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-sm font-bold uppercase tracking-widest text-docka-900 dark:text-zinc-100 group-hover:translate-x-1 transition-transform">{conflict.brandName}</div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        <span className="text-[10px] font-bold text-docka-400 uppercase tracking-wider flex items-center gap-1.5"><Scale size={12} /> {conflict.processNumber}</span>
                                                        <span className="text-[10px] font-bold text-docka-400 uppercase tracking-wider flex items-center gap-1.5"><Info size={12} /> {conflict.ownerName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 md:mt-0 flex items-center gap-3 w-full md:w-auto justify-end">
                                                <div className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm ${
                                                    conflict.status?.toLowerCase().includes('arquivado') || conflict.status?.toLowerCase().includes('extinto')
                                                    ? 'bg-white dark:bg-zinc-800 text-docka-200 border-docka-100 dark:border-zinc-700'
                                                    : 'bg-rose-600 text-white border-rose-600 shadow-rose-900/10'
                                                }`}>
                                                    {conflict.status || 'Desconhecido'}
                                                </div>
                                                <button className="p-2.5 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-docka-400 hover:text-docka-900 dark:hover:text-zinc-100 transition-all shadow-sm">
                                                    <Info size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </DashboardPage>
    );
};

export default AsteryskoResearchView;
