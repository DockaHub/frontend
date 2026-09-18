import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, ChevronLeft } from 'lucide-react';
import api from '../../../../services/api';
import { formatStatusLabel } from './utils/statusPresentation';

interface NclClass {
    number: number;
    description: string;
}

// Hardcoded standard NCL Classes (Classificação de Nice) for INPI
const INPI_CLASSES: NclClass[] = [
    // Produtos (1 a 34)
    { number: 1, description: 'Produtos químicos destinados à indústria, à ciência e à fotografia, bem como à agricultura, horticultura e silvicultura.' },
    { number: 2, description: 'Tintas, vernizes, lacas; preservativos contra ferrugem e contra deterioração da madeira.' },
    { number: 3, description: 'Preparações não medicinais para limpeza, polimento, desengorduramento e abrasão; sabões não medicinais; perfumaria.' },
    { number: 4, description: 'Óleos e graxas industriais; ceras; lubrificantes; composições para absorver, umedecer e ligar o pó.' },
    { number: 5, description: 'Produtos farmacêuticos, médicos e veterinários; preparações higiênicas para uso médico; alimentos dietéticos.' },
    { number: 6, description: 'Metais comuns e suas ligas; materiais de metal para construção; construções transportáveis de metal.' },
    { number: 7, description: 'Máquinas e máquinas-ferramentas; motores (exceto para veículos terrestres); engates e correias de transmissão.' },
    { number: 8, description: 'Ferramentas e implementos manuais; cutelaria; armas brancas; aparelhos de barbear.' },
    { number: 9, description: 'Aparelhos e instrumentos científicos, náuticos, geodésicos, fotográficos, cinematográficos, ópticos, de pesagem, de medida.' },
    { number: 10, description: 'Aparelhos e instrumentos cirúrgicos, médicos, odontológicos e veterinários, membros, olhos e dentes artificiais.' },
    { number: 11, description: 'Aparelhos de iluminação, aquecimento, produção de vapor, cozimento, refrigeração, secagem, ventilação.' },
    { number: 12, description: 'Veículos; aparelhos de locomoção por terra, ar ou água.' },
    { number: 13, description: 'Armas de fogo; munições e projéteis; explosivos; fogos de artifício.' },
    { number: 14, description: 'Metais preciosos e suas ligas; joalheria, bijuteria, pedras preciosas; relojoaria e instrumentos cronométricos.' },
    { number: 15, description: 'Instrumentos musicais.' },
    { number: 16, description: 'Papel, papelão e artigos destes materiais; material impresso; artigos para encadernação; fotografias; papelaria.' },
    { number: 17, description: 'Borracha, guta-percha, goma, amianto, mica e produtos em matérias plásticas extrudadas para uso em fabricação.' },
    { number: 18, description: 'Couro e imitações de couro; peles de animais; baús e malas de viagem; guarda-chuvas e guarda-sóis.' },
    { number: 19, description: 'Materiais de construção (não metálicos); tubos rígidos não metálicos para construção; asfalto, pez e betume.' },
    { number: 20, description: 'Móveis, espelhos, molduras; produtos não metálicos não compreendidos em outras classes.' },
    { number: 21, description: 'Utensílios e recipientes para a casa ou cozinha; pentes e esponjas; escovas; materiais para fabricação de escovas.' },
    { number: 22, description: 'Cordas, fios, redes, tendas, toldos, encerados, velas, sacos (não compreendidos em outras classes).' },
    { number: 23, description: 'Fios para uso têxtil.' },
    { number: 24, description: 'Tecidos e produtos têxteis não compreendidos em outras classes; roupas de cama e de mesa.' },
    { number: 25, description: 'Vestuário, calçados e chapelaria.' },
    { number: 26, description: 'Rendas e bordados, fitas e laços; botões, colchetes e ilhós, alfinetes e agulhas; flores artificiais.' },
    { number: 27, description: 'Tapeçarias, capachos, esteiras, linóleos e outros revestimentos de pisos; cortinas de parede não têxteis.' },
    { number: 28, description: 'Jogos e brinquedos; artigos para ginástica e esportes não compreendidos em outras classes; decorações de Natal.' },
    { number: 29, description: 'Carne, peixe, aves e caça; extratos de carne; frutas, legumes e verduras em conserva, congelados, secos ou cozidos.' },
    { number: 30, description: 'Café, chá, cacau, açúcar, arroz, tapioca, sagu, sucedâneos de café; farinhas e preparações feitas de cereais.' },
    { number: 31, description: 'Produtos agrícolas, hortícolas e florestais e grãos não compreendidos em outras classes; animais vivos.' },
    { number: 32, description: 'Cervejas; águas minerais e gasosas e outras bebidas não alcoólicas; bebidas de frutas e sucos de frutas.' },
    { number: 33, description: 'Bebidas alcoólicas (exceto cervejas).' },
    { number: 34, description: 'Tabaco; artigos para fumantes; fósforos.' },
    // Serviços (35 a 45)
    { number: 35, description: 'Propaganda; gestão de negócios; administração de negócios; funções de escritório (Marketing, Vendas, E-commerce).' },
    { number: 36, description: 'Seguros; negócios financeiros; negócios monetários; negócios imobiliários.' },
    { number: 37, description: 'Construção civil; consertos; serviços de instalação.' },
    { number: 38, description: 'Telecomunicações.' },
    { number: 39, description: 'Transporte; embalagem e armazenagem de produtos; organização de viagens.' },
    { number: 40, description: 'Tratamento de materiais.' },
    { number: 41, description: 'Educação; provimento de treinamento; entretenimento; atividades desportivas e culturais.' },
    { number: 42, description: 'Serviços científicos e tecnológicos, pesquisa e desenho relativos a estes; serviços de análise industrial e pesquisa; design e software.' },
    { number: 43, description: 'Serviços de fornecimento de comida e bebida; acomodação temporária (Restaurantes, Hotéis).' },
    { number: 44, description: 'Serviços médicos; serviços veterinários; cuidados com a higiene e beleza para seres humanos ou animais.' },
    { number: 45, description: 'Serviços jurídicos; serviços de segurança para proteção de bens e pessoas; serviços pessoais e sociais.' }
];

interface Conflict {
    id: string;
    brandName: string;
    processNumber: string;
    nclClass: string;
    status: string;
    ownerName: string;
    filingDate: string;
    type: string;
}

interface AnalysisResult {
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    score: number;
    summary: string;
    conflicts: Conflict[];
    warnings?: string[];
}

const AsteryskoResearchView: React.FC = () => {
    const [searchName, setSearchName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNcl, setSelectedNcl] = useState<NclClass | null>(null);
    const [showNclDropdown, setShowNclDropdown] = useState(false);
    
    const [results, setResults] = useState<AnalysisResult | null>(null);

    const handleSearch = async () => {
        if (!searchName.trim()) return;
        if (!selectedNcl) {
            alert('Por favor, selecione um ramo de atividade (classe NCL) para a pesquisa ser mais precisa.');
            return;
        }
        
        setIsLoading(true);
        setResults(null);
        try {
            const params: { name: string; ncl: number } = { name: searchName, ncl: selectedNcl.number };
            const response = await api.get('/asterysko/analysis/instant', { params });
            setResults(response.data);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetSearch = () => {
        setResults(null);
        setSearchName('');
    };

    return (
        <div className="relative z-0 flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto bg-white pb-[env(safe-area-inset-bottom)] font-sans dark:bg-zinc-950">
            <style>{`
                .grid-bg-overlay {
                    background-image: linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
                }
                .dark .grid-bg-overlay {
                    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
                }
            `}</style>

            {/* Grid Background */}
            <div 
                className="absolute inset-0 pointer-events-none z-[-1] grid-bg-overlay" 
                style={{
                    backgroundSize: '100px 100px',
                    opacity: 0.5
                }}
            />

            {/* Header */}
            <div className="relative z-10 flex min-h-[72px] shrink-0 items-center justify-between border-b border-[#e5e5e5] px-4 py-4 dark:border-zinc-800 sm:px-6 lg:border-b-0 lg:px-10 lg:pb-0 lg:pt-8">
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    {results && (
                        <button onClick={resetSearch} className="shrink-0 rounded-full p-2 text-black transition-colors hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800" aria-label="Voltar para uma nova pesquisa">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <span className="truncate font-season text-xl font-[420] text-black dark:text-white sm:text-[22px]">
                        Radar da marca
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex flex-1 flex-col ${!results ? 'items-center justify-center px-4 py-10 sm:px-6 sm:py-12' : 'px-4 py-6 sm:px-6 lg:px-10 lg:py-8'}`}>
                
                {isLoading ? (
                    /* Radar Animation State */
                    <div className="relative flex aspect-square w-full max-w-[600px] flex-col items-center justify-center">
                        <div className="absolute inset-0 rounded-full animate-[spin_3s_linear_infinite]" 
                             style={{
                                 background: 'conic-gradient(from 90deg at 50% 50%, rgba(4, 18, 221, 0) 0%, rgba(4, 18, 221, 0.02) 60%, rgba(4, 18, 221, 0.15) 100%)',
                                 borderRight: '2px solid rgba(4, 18, 221, 0.5)'
                             }}
                        />
                        <div className="relative z-10 flex max-w-[80%] flex-col items-center text-center">
                            <span className="mb-2 text-xs font-semibold text-[#0412dd] animate-pulse dark:text-[#3b48ff] sm:text-sm">
                                Buscando colidências...
                            </span>
                            <h2 className="max-w-full break-words font-season text-3xl tracking-tight text-black dark:text-white sm:text-5xl">
                                {searchName}
                            </h2>
                        </div>
                    </div>
                ) : !results ? (
                    /* Default Search Box State */
                    <div className="relative z-10 flex w-full max-w-[600px] flex-col justify-between rounded-2xl border border-[#0412dd]/20 bg-white p-4 shadow-[0_4px_40px_rgba(0,0,0,0.08)] transition-all duration-300 dark:border-[#3b48ff]/20 dark:bg-zinc-900 dark:shadow-[0_4px_40px_rgba(0,0,0,0.4)] sm:p-6">
                        <input
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Nome da marca..."
                            className="mb-4 h-12 w-full border-none bg-transparent font-sans text-lg font-medium text-black outline-none placeholder:text-[#9f9f9f] dark:text-zinc-100 sm:mb-6 sm:text-xl"
                        />
                        
                        <div className="relative flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:w-2/3">
                                <button 
                                    onClick={() => setShowNclDropdown(!showNclDropdown)}
                                    className="flex h-11 w-full items-center justify-between rounded-full bg-[#f0f0f0] px-4 text-xs font-semibold text-[#666] transition-colors hover:bg-[#e5e5e5] dark:bg-zinc-800 dark:text-[#ccc] dark:hover:bg-zinc-700 sm:h-[36px]"
                                >
                                    <span className="truncate pr-2">
                                        {selectedNcl ? `NCL ${selectedNcl.number} - ${selectedNcl.description}` : 'Selecione o ramo de atividade'}
                                    </span>
                                </button>
                                
                                {showNclDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNclDropdown(false)} />
                                        <div className="custom-scrollbar absolute left-0 top-full z-50 mt-2 max-h-[min(300px,50vh)] w-full overflow-y-auto rounded-xl border border-[#e5e5e5] bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:w-[400px] sm:max-w-[calc(100vw-3rem)]">
                                            {INPI_CLASSES.map((cls) => (
                                                <button 
                                                    key={cls.number}
                                                    className="w-full text-left px-4 py-3 text-xs text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-[#e5e5e5] dark:border-zinc-800 last:border-0"
                                                    onClick={() => { setSelectedNcl(cls); setShowNclDropdown(false); }}
                                                >
                                                    <span className="font-bold text-[#0412dd] dark:text-[#3b48ff] block mb-1">NCL {cls.number}</span>
                                                    <span className="text-[#666] dark:text-[#aaa] leading-relaxed block">{cls.description}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <button 
                                onClick={handleSearch}
                                disabled={!searchName.trim() || !selectedNcl}
                                className="flex h-11 w-full items-center justify-center rounded-full bg-[#0412dd] px-6 text-xs font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-[#0412dd] dark:bg-[#3b48ff] sm:h-[36px] sm:w-auto"
                            >
                                Analisar marca
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Results State */
                    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-8 animate-fade-in-up sm:gap-8 sm:pb-12">
                        {/* Summary Header */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="min-w-0 flex-1 rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
                                <h2 className="mb-2 break-words font-season text-2xl font-[420] text-black dark:text-white sm:text-3xl">
                                    {searchName}
                                </h2>
                                <p className="text-sm font-semibold text-[#666] dark:text-[#aaa] mb-6">
                                    Classe NCL {selectedNcl?.number} — {selectedNcl?.description}
                                </p>
                                
                                <div className="text-[13px] leading-relaxed text-black dark:text-zinc-200">
                                    {results.summary}
                                </div>
                            </div>
                            
                            <div className={`flex w-full flex-col items-center justify-center rounded-2xl border p-5 text-center shadow-sm sm:p-8 md:w-[320px] ${
                                results.riskLevel === 'HIGH' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' :
                                results.riskLevel === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30' :
                                'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                            }`}>
                                {results.riskLevel === 'HIGH' && <AlertTriangle size={48} className="text-red-500 mb-4" />}
                                {results.riskLevel === 'MEDIUM' && <Info size={48} className="text-amber-500 mb-4" />}
                                {results.riskLevel === 'LOW' && <CheckCircle size={48} className="text-green-500 mb-4" />}
                                
                                <div className={`text-4xl font-bold mb-2 ${
                                    results.riskLevel === 'HIGH' ? 'text-red-600 dark:text-red-400' :
                                    results.riskLevel === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' :
                                    'text-green-600 dark:text-green-400'
                                }`}>
                                    {results.score}%
                                </div>
                                <div className={`text-sm font-bold uppercase tracking-wide ${
                                    results.riskLevel === 'HIGH' ? 'text-red-600/70 dark:text-red-400/70' :
                                    results.riskLevel === 'MEDIUM' ? 'text-amber-600/70 dark:text-amber-400/70' :
                                    'text-green-600/70 dark:text-green-400/70'
                                }`}>
                                    Chances de sucesso
                                </div>
                            </div>
                        </div>

                        {/* Conflicts Table */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between gap-3 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-8 sm:py-5">
                                <h3 className="text-sm font-semibold text-black dark:text-white sm:text-base">Colidências encontradas no INPI</h3>
                                <span className="text-xs font-bold bg-[#f0f0f0] dark:bg-zinc-800 text-[#666] dark:text-[#aaa] px-3 py-1 rounded-full">
                                    {results.conflicts.length} registros
                                </span>
                            </div>
                            
                            {results.conflicts.length === 0 ? (
                                <div className="p-12 text-center text-sm font-semibold text-[#666] dark:text-[#aaa]">
                                    Nenhum registro impeditivo encontrado nesta classe.
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="hidden grid-cols-12 border-b border-[#e5e5e5] bg-white px-8 py-4 dark:border-zinc-800 dark:bg-zinc-900/30 md:grid">
                                        <div className="col-span-4 text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider">Marca Impeditiva</div>
                                        <div className="col-span-2 text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider">NCL</div>
                                        <div className="col-span-2 text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider">Processo</div>
                                        <div className="col-span-4 text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider pl-4">Status</div>
                                    </div>
                                    <div className="flex flex-col">
                                        {results.conflicts.map((conflict, i) => (
                                            <div key={i} className="grid grid-cols-2 items-start gap-x-4 gap-y-4 border-b border-[#e5e5e5] px-4 py-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 sm:px-6 md:grid-cols-12 md:items-center md:gap-0 md:px-8 md:py-4">
                                                <div className="col-span-2 min-w-0 pr-8 text-[13px] font-bold text-black dark:text-white md:col-span-4 md:pr-4">
                                                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[#9f9f9f] md:hidden">Marca impeditiva</span>
                                                    <span className="block truncate">
                                                    {conflict.brandName}
                                                    </span>
                                                </div>
                                                <div className="col-span-1 text-[13px] font-semibold text-[#666] dark:text-[#ccc] md:col-span-2">
                                                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[#9f9f9f] md:hidden">Classe</span>
                                                    {conflict.nclClass}
                                                </div>
                                                <div className="col-span-1 min-w-0 font-mono text-[13px] font-medium text-[#666] dark:text-[#ccc] md:col-span-2">
                                                    <span className="mb-1 block font-sans text-[9px] font-bold uppercase tracking-wider text-[#9f9f9f] md:hidden">Processo</span>
                                                    <span className="block truncate">
                                                    {conflict.processNumber || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 md:col-span-4 md:pl-4">
                                                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[#9f9f9f] md:hidden">Status</span>
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                        {formatStatusLabel(conflict.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                    </div>
                )}

            </div>
            
        </div>
    );
};

export default AsteryskoResearchView;
