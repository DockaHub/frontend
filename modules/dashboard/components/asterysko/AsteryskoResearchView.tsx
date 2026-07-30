import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, ChevronLeft } from 'lucide-react';
import api from '../../../../services/api';
import { AsteryskoTrademarkGovernanceArea } from './AsteryskoTrademarkGovernanceArea';

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
        <div className="bg-white dark:bg-zinc-950 min-h-full font-sans relative flex flex-col z-0 overflow-x-hidden">
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
            <div className="pt-8 px-10 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {results && (
                        <button onClick={resetSearch} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-black dark:text-white">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <span className="font-season text-[22px] font-[420] text-black dark:text-white">
                        Radar da marca
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col ${!results ? 'items-center justify-center -mt-32' : 'px-10 py-8'}`}>
                
                {isLoading ? (
                    /* Radar Animation State */
                    <div className="relative flex flex-col items-center justify-center w-[600px] h-[600px]">
                        <div className="absolute inset-0 rounded-full animate-[spin_3s_linear_infinite]" 
                             style={{
                                 background: 'conic-gradient(from 90deg at 50% 50%, rgba(4, 18, 221, 0) 0%, rgba(4, 18, 221, 0.02) 60%, rgba(4, 18, 221, 0.15) 100%)',
                                 borderRight: '2px solid rgba(4, 18, 221, 0.5)'
                             }}
                        />
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-sm font-semibold text-[#0412dd] dark:text-[#3b48ff] mb-2 animate-pulse">
                                Buscando colidências...
                            </span>
                            <h2 className="font-season text-5xl text-black dark:text-white tracking-tight">
                                {searchName}
                            </h2>
                        </div>
                    </div>
                ) : !results ? (
                    /* Default Search Box State */
                    <div className="w-[600px] bg-white dark:bg-zinc-900 rounded-[16px] shadow-[0_4px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.4)] border border-[#0412dd]/20 dark:border-[#3b48ff]/20 p-6 flex flex-col justify-between relative z-10 transition-all duration-300">
                        <input
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Nome da marca..."
                            className="w-full h-12 bg-transparent border-none outline-none font-sans text-xl font-medium text-black dark:text-zinc-100 placeholder:text-[#9f9f9f] mb-6"
                        />
                        
                        <div className="flex justify-between items-center relative">
                            <div className="w-2/3 relative">
                                <button 
                                    onClick={() => setShowNclDropdown(!showNclDropdown)}
                                    className="h-[36px] px-4 bg-[#f0f0f0] dark:bg-zinc-800 rounded-full flex items-center justify-between text-xs font-semibold text-[#666] dark:text-[#ccc] transition-colors hover:bg-[#e5e5e5] dark:hover:bg-zinc-700 w-full"
                                >
                                    <span className="truncate pr-2">
                                        {selectedNcl ? `NCL ${selectedNcl.number} - ${selectedNcl.description}` : 'Selecione o ramo de atividade'}
                                    </span>
                                </button>
                                
                                {showNclDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNclDropdown(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-[400px] max-h-[300px] overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-xl shadow-xl z-50">
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
                                className="h-[36px] px-6 bg-[#0412dd] dark:bg-[#3b48ff] text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-[#0412dd]"
                            >
                                Analisar marca
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Results State */
                    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in-up">
                        {/* Summary Header */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-[#e5e5e5] dark:border-zinc-800 shadow-sm">
                                <h2 className="font-season text-3xl font-[420] text-black dark:text-white mb-2">
                                    {searchName}
                                </h2>
                                <p className="text-sm font-semibold text-[#666] dark:text-[#aaa] mb-6">
                                    Classe NCL {selectedNcl?.number} — {selectedNcl?.description}
                                </p>
                                
                                <div className="text-[13px] leading-relaxed text-black dark:text-zinc-200">
                                    {results.summary}
                                </div>
                            </div>
                            
                            <div className={`w-full md:w-[320px] p-8 rounded-2xl border flex flex-col items-center justify-center text-center shadow-sm ${
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
                            <div className="px-8 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 flex justify-between items-center bg-[#fafafa] dark:bg-zinc-900/50">
                                <h3 className="font-semibold text-black dark:text-white">Colidências encontradas no INPI</h3>
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
                                    <div className="grid grid-cols-12 px-8 py-4 border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
                                        <div className="col-span-4 text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider">Marca Impeditiva</div>
                                        <div className="col-span-2 text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider">NCL</div>
                                        <div className="col-span-2 text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider">Processo</div>
                                        <div className="col-span-4 text-[11px] font-bold text-[#9f9f9f] uppercase tracking-wider pl-4">Status</div>
                                    </div>
                                    <div className="flex flex-col">
                                        {results.conflicts.map((conflict, i) => (
                                            <div key={i} className="grid grid-cols-12 px-8 py-4 border-b border-[#e5e5e5] dark:border-zinc-800 items-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                <div className="col-span-4 text-[13px] font-bold text-black dark:text-white pr-4 truncate">
                                                    {conflict.brandName}
                                                </div>
                                                <div className="col-span-2 text-[13px] font-semibold text-[#666] dark:text-[#ccc]">
                                                    {conflict.nclClass}
                                                </div>
                                                <div className="col-span-2 text-[13px] font-medium font-mono text-[#666] dark:text-[#ccc]">
                                                    {conflict.processNumber || 'N/A'}
                                                </div>
                                                <div className="col-span-4 pl-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                        {conflict.status}
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

                {/* Área Administrativa de Governança da Base Marcária */}
                <div className="w-full max-w-5xl mx-auto mt-8 pb-12">
                    <AsteryskoTrademarkGovernanceArea />
                </div>
            </div>
            
        </div>
    );
};

export default AsteryskoResearchView;
