import { useState } from 'react';
import { Search, ExternalLink, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import ClientRegistrationForm from './ClientRegistrationForm';

const INPI_URL = "https://busca.inpi.gov.br/pePI/jsp/marcas/Pesquisa_classe_basica.jsp";

interface SearchAssistantProps {
    onNext?: () => void;
    organizationId?: string;
}

export default function SearchAssistant({ onNext, organizationId }: SearchAssistantProps) {
    const [step, setStep] = useState<'intro' | 'searching' | 'result' | 'registration'>('intro');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [status, setStatus] = useState<'available' | 'unavailable' | null>(null);

    const handleStartSearch = () => {
        if (!searchTerm.trim()) return;
        setStep('searching');
        setIsSearching(true);
        // Simulate API or manual check delay
        setTimeout(() => {
            setIsSearching(false);
            // For now, we don't automatically determine status, we ask the user based on what they see on INPI
        }, 2000);
    };

    const handleResultSelection = (result: 'available' | 'unavailable') => {
        setStatus(result);
        setStep('result');
    };

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Busca e Viabilidade</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Verifique a disponibilidade de marcas no INPI com auxílio de IA.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Search size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">15</div>
                            <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Buscas Hoje</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">8</div>
                            <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Marcas Disponíveis</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><XCircle size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">7</div>
                            <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Marcas Indisponíveis</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card - Wizard */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    {/* Card Header */}
                    <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                            {step === 'registration' ? 'Cadastro de Cliente' : 'Nova Pesquisa'}
                        </h3>
                    </div>

                    {/* Card Body */}
                    <div className="p-8">
                        {step === 'registration' ? (
                            <ClientRegistrationForm
                                onCancel={() => setStep('result')}
                                organizationId={organizationId}
                                onSuccess={() => {
                                    // Handle success (e.g., show toast, redirect, or reset)
                                    alert("Cliente cadastrado com sucesso! Email de boas-vindas enviado.");
                                    setStep('intro');
                                    setSearchTerm('');
                                    if (onNext) onNext();
                                }}
                                initialData={{ brandName: searchTerm }}
                            />
                        ) : (
                            <>
                                {step === 'intro' && (
                                    <div className="space-y-8 max-w-3xl mx-auto">

                                        {/* Intro Text */}
                                        <div className="text-center max-w-lg mx-auto">
                                            <h2 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-2">Vamos verificar a disponibilidade</h2>
                                            <p className="text-docka-500 dark:text-zinc-400">
                                                Antes de registrar, precisamos garantir que sua marca é única.
                                            </p>
                                        </div>

                                        {/* INPI Step */}
                                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                                                    <ExternalLink size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Passo 1: Consulte o INPI</h3>
                                                    <p className="text-sm text-docka-500 dark:text-zinc-400 mt-1 max-w-sm">
                                                        Acesse a base oficial e mantenha a aba aberta para conferência.
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={INPI_URL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="whitespace-nowrap px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 rounded-lg text-sm font-bold transition-all shadow-sm"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                Abrir Busca INPI
                                            </a>
                                        </div>

                                        {/* Search Input */}
                                        <div className="space-y-3 pt-2">
                                            <label className="block text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest text-center">
                                                Passo 2: Qual o nome da marca?
                                            </label>
                                            <div className="flex gap-0 shadow-sm rounded-xl overflow-hidden border border-docka-300 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                                <input
                                                    type="text"
                                                    placeholder="Digite o nome da marca..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="flex-1 px-5 py-4 bg-white dark:bg-zinc-950 border-none outline-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 text-lg"
                                                />
                                                <button
                                                    onClick={handleStartSearch}
                                                    disabled={!searchTerm.trim()}
                                                    className="px-8 bg-docka-900 dark:bg-zinc-100 hover:bg-docka-800 dark:hover:bg-white/90 text-white dark:text-zinc-900 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Search size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 'searching' && (
                                    <div className="text-center py-8 space-y-4 max-w-3xl mx-auto">
                                        {isSearching ? (
                                            <>
                                                <Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-600" />
                                                <p className="text-docka-600 dark:text-zinc-400 font-medium">Preparando assistente...</p>
                                            </>
                                        ) : (
                                            <div className="space-y-6">
                                                <p className="font-medium text-docka-800 dark:text-zinc-200">
                                                    Você realizou a busca no site do INPI para <span className="font-bold">"{searchTerm}"</span>?
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => handleResultSelection('available')}
                                                        className="p-4 border border-docka-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition-all text-left group"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CheckCircle className="text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                                                            <span className="font-bold text-docka-900 dark:text-zinc-100">Disponível</span>
                                                        </div>
                                                        <p className="text-sm text-docka-500 dark:text-zinc-400">
                                                            Não encontrei nenhuma marca igual ou muito parecida registrada na mesma classe.
                                                        </p>
                                                    </button>

                                                    <button
                                                        onClick={() => handleResultSelection('unavailable')}
                                                        className="p-4 border border-docka-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:border-red-500 dark:hover:border-red-500 hover:ring-1 hover:ring-red-500 transition-all text-left group"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <XCircle className="text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform" />
                                                            <span className="font-bold text-docka-900 dark:text-zinc-100">Indisponível</span>
                                                        </div>
                                                        <p className="text-sm text-docka-500 dark:text-zinc-400">
                                                            Encontrei marcas idênticas ou muito similares já registradas.
                                                        </p>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {step === 'result' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-3xl mx-auto">
                                        <div className={`p-4 rounded-xl border ${status === 'available'
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800'
                                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                                            }`}>
                                            <h3 className={`font-bold flex items-center gap-2 ${status === 'available' ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'
                                                }`}>
                                                {status === 'available' ? (
                                                    <><CheckCircle size={20} /> Marca Aparentemente Disponível</>
                                                ) : (
                                                    <><XCircle size={20} /> Atenção: Risco Alto</>
                                                )}
                                            </h3>
                                            <p className={`mt-2 text-sm ${status === 'available' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                                                }`}>
                                                {status === 'available'
                                                    ? "Ótimo! O próximo passo é iniciar o cadastro do cliente e coletar a documentação necessária."
                                                    : "Recomendamos tentar variações do nome ou realizar uma análise de viabilidade mais profunda antes de prosseguir."}
                                            </p>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setStep('intro')}
                                                className="px-4 py-2 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors font-medium text-sm"
                                            >
                                                Tentar outro nome
                                            </button>
                                            {status === 'available' && (
                                                <button
                                                    onClick={() => setStep('registration')}
                                                    className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors flex items-center gap-2 text-sm shadow-sm"
                                                >
                                                    Iniciar Cadastro <ArrowRight size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
